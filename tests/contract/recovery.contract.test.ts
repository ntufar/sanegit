import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { buildFixPlan } from "../../src/core/resolver.js";
import { listUndoOptions } from "../../src/core/undoPlanner.js";
import { runTimeTravel } from "../../src/commands/time-travel.js";

describe("recovery contract", () => {
  it("returns fix and undo structures", async () => {
    const harness = await createRepoHarness();
    const fix = await buildFixPlan(harness.cwd);
    const undo = await listUndoOptions(harness.cwd);
    expect(fix.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(undo)).toBe(true);
  });

  it("supports advanced recovery command surfaces", async () => {
    const harness = await createRepoHarness();
    const chunks: string[] = [];
    await runTimeTravel("definitely-not-a-valid-ref", harness.cwd, (text) => {
      chunks.push(text);
    });
    expect(chunks.join("")).toContain(
      "Unable to resolve requested historical reference.",
    );
  });
});
