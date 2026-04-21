import { evaluatePushSafety } from "../core/pushSafety.js";
import { getRemoteUrl, runGit } from "../core/git.js";
import { loadConfig } from "../core/config.js";
import { writeOutput } from "../core/output.js";
import {
  checkpointWorkflowRun,
  completeWorkflowRun,
  failWorkflowRun,
  loadWorkflowJournal,
  startWorkflowRun,
  type WorkflowRun,
} from "../core/workflowState.js";

function summarizeWorkflow(run: WorkflowRun): string[] {
  return run.steps.map((step) => `${step.name}: ${step.status}`);
}

export async function runShip(cwd: string = process.cwd()): Promise<WorkflowRun> {
  const run = await startWorkflowRun("ship", ["preflight", "push", "handoff"], cwd);
  const config = await loadConfig(cwd);

  try {
    await checkpointWorkflowRun(run.id, "preflight", "running", "Running push safety checks", cwd);
    const safety = await evaluatePushSafety(cwd);
    await checkpointWorkflowRun(
      run.id,
      "preflight",
      safety.allowed ? "completed" : "failed",
      safety.reasons.join(" "),
      cwd,
    );

    if (!safety.allowed) {
      await failWorkflowRun(run.id, "Preflight failed", cwd);
      writeOutput({
        summary: "Ship preflight failed.",
        risk: safety.risk,
        recommendation: "Resolve high-risk findings before shipping.",
        detail: safety.reasons,
      });
      return run;
    }

    const remote = await getRemoteUrl(cwd);
    await checkpointWorkflowRun(run.id, "push", "running", "Pushing branch", cwd);
    if (remote) {
      const pushed = await runGit(["push"], cwd);
      await checkpointWorkflowRun(
        run.id,
        "push",
        pushed.exitCode === 0 ? "completed" : "failed",
        pushed.stderr || pushed.stdout,
        cwd,
      );
      if (pushed.exitCode !== 0) {
        await failWorkflowRun(run.id, "Push failed", cwd);
        return run;
      }
    } else {
      await checkpointWorkflowRun(
        run.id,
        "push",
        "completed",
        "No remote configured; push step skipped in local mode",
        cwd,
      );
    }

    if (config.commandDefaults.enableHighRiskShipAutomation) {
      await checkpointWorkflowRun(
        run.id,
        "handoff",
        "completed",
        "Background monitoring handoff initialized",
        cwd,
      );
    } else {
      await checkpointWorkflowRun(
        run.id,
        "handoff",
        "completed",
        "High-risk ship automation disabled by rollout controls",
        cwd,
      );
    }
    await completeWorkflowRun(run.id, cwd);

    writeOutput({
      summary: "Ship workflow handed off for background completion.",
      risk: config.commandDefaults.enableHighRiskShipAutomation ? "low" : "medium",
      recommendation: "Use sg ship status to monitor CI/merge completion.",
      detail: [
        "Synchronous setup complete; background tracking active.",
        ...(config.commandDefaults.enableHighRiskShipAutomation
          ? []
          : ["High-risk automation remains disabled by rollout controls."]),
      ],
      hostedContextSource: remote ? "remote" : "local",
    });

    return run;
  } catch (error) {
    await failWorkflowRun(
      run.id,
      error instanceof Error ? error.message : String(error),
      cwd,
    );
    throw error;
  }
}

export async function runShipStatus(
  cwd: string = process.cwd(),
): Promise<WorkflowRun | undefined> {
  const journal = await loadWorkflowJournal(cwd);
  const latest = Object.values(journal.runs)
    .filter((run) => run.command === "ship")
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];

  if (!latest) {
    writeOutput({
      summary: "No ship workflow found.",
      risk: "low",
      recommendation: "Run sg ship to start a delivery workflow.",
      detail: ["No persisted ship workflow state available."],
    });
    return undefined;
  }

  writeOutput({
    summary: `Ship workflow ${latest.id} is ${latest.status}.`,
    risk: latest.status === "failed" ? "high" : "low",
    recommendation:
      latest.status === "failed"
        ? "Inspect failed steps and retry the workflow."
        : "Continue monitoring until remote completion.",
    detail: summarizeWorkflow(latest),
  });

  return latest;
}
