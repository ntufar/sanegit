import { runGit } from "../core/git.js";
import { explainChanges } from "../core/explainer.js";
import { writeOutput } from "../core/output.js";
import { checkAIConfigured } from "../core/aiCheck.js";
import { logEvent } from "../core/telemetry.js";

export async function runExplain(cwd: string = process.cwd()): Promise<void> {
  // Check AI configuration first and exit early if not configured
  const aiConfigured = await checkAIConfigured(cwd, "explain");
  if (!aiConfigured) {
    await logEvent(
      {
        command: "explain",
        outcome: "degraded",
        detail: "AI provider not configured",
      },
      cwd,
    );
    return;
  }

  const diff = await runGit(["diff", "--stat"], cwd);
  const summary =
    diff.exitCode === 0 ? diff.stdout.trim() : "Unable to read git diff stats.";

  const explanation = await explainChanges(summary, cwd);

  writeOutput({
    summary: "Change explanation generated.",
    risk: "low",
    recommendation:
      "Review explanation and proceed with commit when intent matches.",
    detail: [explanation.text],
    degradedMode: explanation.degradedMode,
  });

  await logEvent(
    {
      command: "explain",
      outcome: explanation.degradedMode ? "degraded" : "success",
      detail: summary,
    },
    cwd,
  );
}
