import { predictPushRisk } from "./predictor.js";

export interface PushSafetyResult {
  allowed: boolean;
  risk: "none" | "low" | "medium" | "high" | "critical";
  reasons: string[];
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
  };
}
