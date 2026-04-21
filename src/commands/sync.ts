import { runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";
import {
  checkpointWorkflowRun,
  completeWorkflowRun,
  failWorkflowRun,
  startWorkflowRun,
} from "../core/workflowState.js";

export async function runSync(cwd: string = process.cwd()): Promise<void> {
  const run = await startWorkflowRun("sync", ["stash", "fetch", "rebase"], cwd);

  try {
    await checkpointWorkflowRun(run.id, "stash", "running", "Stashing local changes", cwd);
    const stash = await runGit(["stash", "push", "--include-untracked", "-m", "sg-sync"], cwd);
    await checkpointWorkflowRun(
      run.id,
      "stash",
      stash.exitCode === 0 ? "completed" : "failed",
      stash.stderr || stash.stdout,
      cwd,
    );

    await checkpointWorkflowRun(run.id, "fetch", "running", "Fetching origin", cwd);
    const fetch = await runGit(["fetch", "origin"], cwd);
    await checkpointWorkflowRun(
      run.id,
      "fetch",
      fetch.exitCode === 0 ? "completed" : "failed",
      fetch.stderr || fetch.stdout,
      cwd,
    );

    await checkpointWorkflowRun(run.id, "rebase", "running", "Rebasing on origin/main", cwd);
    const rebase = await runGit(["rebase", "origin/main"], cwd);
    await checkpointWorkflowRun(
      run.id,
      "rebase",
      rebase.exitCode === 0 ? "completed" : "failed",
      rebase.stderr || rebase.stdout,
      cwd,
    );

    if (stash.exitCode !== 0 || fetch.exitCode !== 0 || rebase.exitCode !== 0) {
      await failWorkflowRun(run.id, "One or more sync steps failed", cwd);
      writeOutput({
        summary: "Sync completed with issues.",
        risk: "high",
        recommendation:
          "Inspect sync workflow details and resolve fetch/rebase failures before continuing.",
        detail: [stash.stderr || stash.stdout, fetch.stderr || fetch.stdout, rebase.stderr || rebase.stdout].filter(Boolean),
      });
      return;
    }

    await completeWorkflowRun(run.id, cwd);
    writeOutput({
      summary: "Sync workflow completed.",
      risk: "low",
      recommendation: "Continue with your planned commit or ship workflow.",
      detail: ["Local work preserved and mainline updates applied."],
    });
  } catch (error) {
    await failWorkflowRun(
      run.id,
      error instanceof Error ? error.message : String(error),
      cwd,
    );
    throw error;
  }
}
