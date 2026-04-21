import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logEvent } from "./telemetry.js";

export type WorkflowStatus = "running" | "completed" | "failed";

export interface WorkflowStep {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  detail?: string;
  at: string;
}

export interface WorkflowRun {
  id: string;
  command: string;
  status: WorkflowStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  steps: WorkflowStep[];
  lastError?: string;
}

interface WorkflowJournal {
  runs: Record<string, WorkflowRun>;
}

const EMPTY_JOURNAL: WorkflowJournal = { runs: {} };

function workflowPath(cwd: string): string {
  return join(cwd, ".sanegit", "workflows.json");
}

export async function loadWorkflowJournal(
  cwd: string = process.cwd(),
): Promise<WorkflowJournal> {
  try {
    const content = await readFile(workflowPath(cwd), "utf8");
    const parsed = JSON.parse(content) as WorkflowJournal;
    return {
      runs: parsed.runs ?? {},
    };
  } catch {
    return EMPTY_JOURNAL;
  }
}

export async function saveWorkflowJournal(
  journal: WorkflowJournal,
  cwd: string = process.cwd(),
): Promise<void> {
  const dir = join(cwd, ".sanegit");
  await mkdir(dir, { recursive: true });
  await writeFile(workflowPath(cwd), JSON.stringify(journal, null, 2), "utf8");
}

export async function startWorkflowRun(
  command: string,
  steps: string[],
  cwd: string = process.cwd(),
): Promise<WorkflowRun> {
  const now = new Date().toISOString();
  const id = `${command}-${Date.now()}`;
  const run: WorkflowRun = {
    id,
    command,
    status: "running",
    startedAt: now,
    updatedAt: now,
    steps: steps.map((name) => ({
      name,
      status: "pending",
      at: now,
    })),
  };

  const journal = await loadWorkflowJournal(cwd);
  journal.runs[id] = run;
  await saveWorkflowJournal(journal, cwd);
  await logEvent({ command, outcome: "success", detail: `workflow.start:${id}` }, cwd);
  return run;
}

export async function checkpointWorkflowRun(
  runId: string,
  stepName: string,
  status: WorkflowStep["status"],
  detail: string | undefined,
  cwd: string = process.cwd(),
): Promise<WorkflowRun | undefined> {
  const journal = await loadWorkflowJournal(cwd);
  const run = journal.runs[runId];
  if (!run) {
    return undefined;
  }

  const now = new Date().toISOString();
  const step = run.steps.find((entry) => entry.name === stepName);
  if (step) {
    step.status = status;
    step.at = now;
    if (detail !== undefined) {
      step.detail = detail;
    } else {
      delete step.detail;
    }
  } else {
    run.steps.push({
      name: stepName,
      status,
      ...(detail !== undefined ? { detail } : {}),
      at: now,
    });
  }

  run.updatedAt = now;
  await saveWorkflowJournal(journal, cwd);
  await logEvent(
    {
      command: run.command,
      outcome: status === "failed" ? "failure" : "success",
      detail: `workflow.step:${run.id}:${stepName}:${status}`,
    },
    cwd,
  );

  return run;
}

export async function completeWorkflowRun(
  runId: string,
  cwd: string = process.cwd(),
): Promise<WorkflowRun | undefined> {
  const journal = await loadWorkflowJournal(cwd);
  const run = journal.runs[runId];
  if (!run) {
    return undefined;
  }
  const now = new Date().toISOString();
  run.status = "completed";
  run.updatedAt = now;
  run.completedAt = now;
  await saveWorkflowJournal(journal, cwd);
  await logEvent(
    { command: run.command, outcome: "success", detail: `workflow.complete:${run.id}` },
    cwd,
  );
  return run;
}

export async function failWorkflowRun(
  runId: string,
  error: string,
  cwd: string = process.cwd(),
): Promise<WorkflowRun | undefined> {
  const journal = await loadWorkflowJournal(cwd);
  const run = journal.runs[runId];
  if (!run) {
    return undefined;
  }
  const now = new Date().toISOString();
  run.status = "failed";
  run.lastError = error;
  run.updatedAt = now;
  run.completedAt = now;
  await saveWorkflowJournal(journal, cwd);
  await logEvent(
    { command: run.command, outcome: "failure", detail: `workflow.fail:${run.id}:${error}` },
    cwd,
  );
  return run;
}

export async function getWorkflowRun(
  runId: string,
  cwd: string = process.cwd(),
): Promise<WorkflowRun | undefined> {
  const journal = await loadWorkflowJournal(cwd);
  return journal.runs[runId];
}
