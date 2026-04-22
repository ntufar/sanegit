import { evaluatePushSafety } from "../core/pushSafety.js";
import { runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";
import { getPredictiveWarnings } from "../core/patternLearner.js";
import type { RiskLevel } from "../core/output.js";

function escalateRisk(current: RiskLevel, predictive: RiskLevel): RiskLevel {
  const levels: RiskLevel[] = ["none", "low", "medium", "high", "critical"];
  const currentIdx = levels.indexOf(current);
  const predictiveIdx = levels.indexOf(predictive);
  return levels[Math.max(currentIdx, predictiveIdx)] ?? current;
}

export async function runPush(
  cwd: string = process.cwd(),
  acknowledgeRisk: (message: string) => Promise<boolean> = async () => false,
): Promise<void> {
  const safety = await evaluatePushSafety(cwd);
  const warnings = await getPredictiveWarnings(cwd);

  const predictiveDetails = warnings.map(
    (w) => `${w.warning} (confidence: ${w.confidence}%, observations: ${w.observations})`,
  );

  let effectiveRisk = safety.risk;
  let combinedDetail = safety.reasons;

  if (warnings.length > 0) {
    const predictiveRisk: RiskLevel =
      warnings.some((w) => w.confidence >= 80) && warnings.some((w) => w.observations >= 20)
        ? "high"
        : warnings.some((w) => w.confidence >= 60)
          ? "medium"
          : "low";
    effectiveRisk = escalateRisk(safety.risk, predictiveRisk);
    combinedDetail = [...safety.reasons, ...predictiveDetails];
  }

  writeOutput({
    summary: "Push safety check complete.",
    risk: effectiveRisk,
    recommendation: safety.allowed
      ? "Push is considered safe for current branch state."
      : "Resolve high-risk findings before push, or explicitly acknowledge risk.",
    detail: combinedDetail,
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
