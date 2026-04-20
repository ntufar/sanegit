import { describe, expect, it } from "vitest";
import { buildCommitPlan } from "../../src/core/commitPlanner.js";

describe("commit contract", () => {
  it("returns message and included file list", async () => {
    const plan = await buildCommitPlan(process.cwd());
    expect(typeof plan.message).toBe("string");
    expect(Array.isArray(plan.includedFiles)).toBe(true);
  });
});
