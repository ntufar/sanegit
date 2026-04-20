import { runGit } from "../core/git.js";
import { buildCommitPlan } from "../core/commitPlanner.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runCommit(
  cwd: string = process.cwd(),
  confirm: (message: string) => Promise<boolean> = async () => false,
): Promise<void> {
  const plan = await buildCommitPlan(cwd);

  writeOutput({
    summary: "Prepared commit plan.",
    risk: plan.includedFiles.length === 0 ? "medium" : "low",
    recommendation:
      "Confirm commit message and included files before writing commit.",
    detail: [
      `Proposed message: ${plan.message}`,
      `Included files: ${plan.includedFiles.join(", ") || "none"}`,
    ],
    degradedMode: plan.degradedMode,
  });

  const approved = await confirm("Create commit with proposed message?");
  if (!approved) {
    await logEvent(
      {
        command: "commit",
        outcome: "failure",
        detail: "User declined commit creation.",
      },
      cwd,
    );
    return;
  }

  const result = await runGit(["commit", "-m", plan.message], cwd);
  await logEvent(
    {
      command: "commit",
      outcome: result.exitCode === 0 ? "success" : "failure",
      detail: result.stderr || result.stdout,
    },
    cwd,
  );
}
