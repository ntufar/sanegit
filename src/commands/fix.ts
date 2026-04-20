import { buildFixPlan } from "../core/resolver.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runFix(cwd: string = process.cwd()): Promise<void> {
  const plan = await buildFixPlan(cwd);
  writeOutput(plan);
  await logEvent(
    {
      command: "fix",
      outcome: "success",
      risk: plan.risk,
      detail: plan.detail.join("; "),
    },
    cwd,
  );
}
