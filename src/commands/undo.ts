import { listUndoOptions } from "../core/undoPlanner.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runUndo(cwd: string = process.cwd()): Promise<void> {
  const options = await listUndoOptions(cwd);
  writeOutput({
    summary: "Rollback options prepared.",
    risk: "medium",
    recommendation: "Choose the lowest-risk option that matches your intent.",
    detail: options.map(
      (option) =>
        `${option.id}: ${option.description} (${option.command}) [risk:${option.risk}]`,
    ),
  });
  await logEvent(
    {
      command: "undo",
      outcome: "success",
      detail: `${options.length} options surfaced.`,
    },
    cwd,
  );
}
