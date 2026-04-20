import { buildCheckPlan } from "../core/resolver.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runCheck(cwd: string = process.cwd()): Promise<void> {
  const plan = await buildCheckPlan(cwd);
  writeOutput(plan);
  await logEvent(
    {
      command: "check",
      outcome: "success",
      risk: plan.risk,
      detail: plan.detail.join("; "),
    },
    cwd,
  );
}
