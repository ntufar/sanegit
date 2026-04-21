import { getRemoteUrl, runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";
import { buildCheckPlan, buildFixPlan } from "../core/resolver.js";
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
  const run = await startWorkflowRun("ship", ["check", "fix", "push", "pr", "merge"], cwd);

  try {
    // 1. Check
    await checkpointWorkflowRun(run.id, "check", "running", "Checking for conflicts", cwd);
    const checkPlan = await buildCheckPlan(cwd);
    await checkpointWorkflowRun(
      run.id,
      "check",
      checkPlan.risk === "none" || checkPlan.risk === "low" ? "completed" : "failed",
      checkPlan.summary,
      cwd,
    );
    if (checkPlan.risk !== "none" && checkPlan.risk !== "low") {
      await failWorkflowRun(run.id, "Check failed: " + checkPlan.summary, cwd);
      return run;
    }

    // 2. Fix
    await checkpointWorkflowRun(run.id, "fix", "running", "Fixing issues", cwd);
    const fixPlan = await buildFixPlan(cwd);
    await checkpointWorkflowRun(
      run.id,
      "fix",
      fixPlan.risk === "none" ? "completed" : "failed",
      fixPlan.summary,
      cwd,
    );
    if (fixPlan.risk !== "none") {
      await failWorkflowRun(run.id, "Fix failed: " + fixPlan.summary, cwd);
      return run;
    }

    // 3. Push
    await checkpointWorkflowRun(run.id, "push", "running", "Pushing branch", cwd);
    const remote = await getRemoteUrl(cwd);
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
      await checkpointWorkflowRun(run.id, "push", "completed", "No remote configured", cwd);
    }

    // 4. PR (using gh CLI)
    await checkpointWorkflowRun(run.id, "pr", "running", "Creating Pull Request", cwd);
    const pr = await runGit(["gh", "pr", "create", "--fill"], cwd); // Assuming gh is configured
    await checkpointWorkflowRun(
      run.id,
      "pr",
      pr.exitCode === 0 ? "completed" : "failed",
      pr.stderr || pr.stdout,
      cwd,
    );
    if (pr.exitCode !== 0) {
      await failWorkflowRun(run.id, "PR creation failed", cwd);
      return run;
    }

    // 5. Merge (using gh CLI)
    await checkpointWorkflowRun(run.id, "merge", "running", "Merging Pull Request", cwd);
    const merge = await runGit(["gh", "pr", "merge", "--merge", "--auto"], cwd);
    await checkpointWorkflowRun(
      run.id,
      "merge",
      merge.exitCode === 0 ? "completed" : "failed",
      merge.stderr || merge.stdout,
      cwd,
    );
    if (merge.exitCode !== 0) {
      await failWorkflowRun(run.id, "Merge failed", cwd);
      return run;
    }

    await completeWorkflowRun(run.id, cwd);
    writeOutput({ summary: "Ship workflow completed successfully." });

    return run;
  } catch (error) {
    await failWorkflowRun(run.id, error instanceof Error ? error.message : String(error), cwd);
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
