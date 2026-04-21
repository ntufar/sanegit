import { writeOutput } from "../core/output.js";
import {
  completeWorkflowRun,
  getWorkflowRun,
  startWorkflowRun,
} from "../core/workflowState.js";

export async function runPairStart(cwd: string = process.cwd()): Promise<string> {
  const run = await startWorkflowRun("pair", ["start", "handoff"], cwd);
  writeOutput({
    summary: "Pair session started.",
    risk: "low",
    recommendation: "Share session context and continue implementation collaboratively.",
    detail: [`Session: ${run.id}`],
  });
  return run.id;
}

export async function runPairStatus(
  sessionId: string,
  cwd: string = process.cwd(),
): Promise<void> {
  const run = await getWorkflowRun(sessionId, cwd);
  if (!run) {
    writeOutput({
      summary: "Pair session not found.",
      risk: "medium",
      recommendation: "Start a new pair session with sg pair start.",
      detail: [`Session not found: ${sessionId}`],
    });
    return;
  }

  writeOutput({
    summary: `Pair session ${sessionId} is ${run.status}.`,
    risk: run.status === "failed" ? "high" : "low",
    recommendation:
      run.status === "failed"
        ? "Review errors and re-establish session context."
        : "Continue or handoff when ready.",
    detail: run.steps.map((step) => `${step.name}: ${step.status}`),
  });
}

export async function runPairHandoff(
  sessionId: string,
  cwd: string = process.cwd(),
): Promise<void> {
  const run = await completeWorkflowRun(sessionId, cwd);
  writeOutput({
    summary: run ? "Pair session handed off." : "Pair session not found.",
    risk: run ? "low" : "medium",
    recommendation: run
      ? "Next collaborator can resume from the saved session context."
      : "Use sg pair start to create a session before handoff.",
    detail: [sessionId],
  });
}
