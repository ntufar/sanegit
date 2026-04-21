import { describe, expect, it } from "vitest";
import { buildFixPlan } from "../../src/core/resolver.js";
import { listUndoOptions } from "../../src/core/undoPlanner.js";
import { runTimeTravel } from "../../src/commands/time-travel.js";

describe("recovery contract", () => {
  it("returns fix and undo structures", async () => {
    const fix = await buildFixPlan(process.cwd());
    const undo = await listUndoOptions(process.cwd());
    expect(fix.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(undo)).toBe(true);
  });

  it("supports advanced recovery command surfaces", async () => {
    const chunks: string[] = [];
    await runTimeTravel("definitely-not-a-valid-ref", process.cwd(), (text) => {
      chunks.push(text);
    });
    expect(chunks.join("")).toContain(
      "Unable to resolve requested historical reference.",
    );
  });
});
