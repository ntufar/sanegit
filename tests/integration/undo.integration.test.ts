import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { listUndoOptions } from "../../src/core/undoPlanner.js";

describe("undo integration", () => {
  it("returns at least one undo option", async () => {
    const harness = await createRepoHarness();
    const options = await listUndoOptions(harness.cwd);
    expect(options.length).toBeGreaterThan(0);
  });
});
