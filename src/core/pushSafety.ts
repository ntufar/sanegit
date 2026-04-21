import { predictPushRisk } from "./predictor.js";

export interface PushSafetyResult {
  allowed: boolean;
  risk: "none" | "low" | "medium" | "high" | "critical";
  reasons: string[];
  learnedWarningCount: number;
}

export async function evaluatePushSafety(
  cwd: string = process.cwd(),
): Promise<PushSafetyResult> {
  const prediction = await predictPushRisk(cwd);
  return {
    allowed:
      prediction.risk === "none" ||
      prediction.risk === "low" ||
      prediction.risk === "medium",
    risk: prediction.risk,
    reasons: prediction.reasons,
    learnedWarningCount: prediction.reasons.filter((reason) =>
      reason.startsWith("Learned warning"),
    ).length,
  };
}
