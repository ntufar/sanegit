import type { RiskLevel } from "./output.js";
import { runGit } from "./git.js";

export interface PredictionResult {
  risk: RiskLevel;
  reasons: string[];
}

export async function predictPushRisk(
  cwd: string = process.cwd(),
): Promise<PredictionResult> {
  const reasons: string[] = [];
  let risk: RiskLevel = "low";

  const behind = await runGit(
    ["rev-list", "--count", "HEAD..origin/main"],
    cwd,
  );
  if (behind.exitCode === 0) {
    const count = Number.parseInt(behind.stdout.trim() || "0", 10);
    if (count > 0) {
      risk = "high";
      reasons.push(`Branch is ${count} commit(s) behind origin/main.`);
    }
  }

  const dirty = await runGit(["status", "--porcelain"], cwd);
  if (dirty.exitCode === 0 && dirty.stdout.trim()) {
    risk = risk === "high" ? "high" : "medium";
    reasons.push("Working tree has uncommitted changes.");
  }

  if (reasons.length === 0) {
    reasons.push("No immediate push risk indicators found.");
    risk = "none";
  }

  return { risk, reasons };
}

export async function predictMergeQueueRisk(
  cwd: string = process.cwd(),
): Promise<{
  risky: boolean;
  summary: string;
  severity: "low" | "medium" | "high";
}> {
  const prediction = await predictPushRisk(cwd);
  const severity =
    prediction.risk === "none"
      ? "low"
      : prediction.risk === "critical"
        ? "high"
        : prediction.risk;
  return {
    risky: prediction.risk === "high" || prediction.risk === "critical",
    summary: prediction.reasons.join(" "),
    severity,
  };
}
