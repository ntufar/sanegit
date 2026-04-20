import { evaluatePushSafety } from "../core/pushSafety.js";
import { runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runPush(
  cwd: string = process.cwd(),
  acknowledgeRisk: (message: string) => Promise<boolean> = async () => false,
): Promise<void> {
  const safety = await evaluatePushSafety(cwd);

  writeOutput({
    summary: "Push safety check complete.",
    risk: safety.risk,
    recommendation: safety.allowed
      ? "Push is considered safe for current branch state."
      : "Resolve high-risk findings before push, or explicitly acknowledge risk.",
    detail: safety.reasons,
  });

  if (!safety.allowed) {
    const approved = await acknowledgeRisk(
      "High-risk push detected. Continue anyway?",
    );
    if (!approved) {
      await logEvent(
        {
          command: "push",
          outcome: "failure",
          risk: safety.risk,
          detail: "User rejected high-risk push.",
        },
        cwd,
      );
      return;
    }
  }

  const result = await runGit(["push"], cwd);
  await logEvent(
    {
      command: "push",
      outcome: result.exitCode === 0 ? "success" : "failure",
      risk: safety.risk,
      detail: result.stderr || result.stdout,
    },
    cwd,
  );
}
