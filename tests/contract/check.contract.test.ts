import { describe, expect, it } from "vitest";
import { buildCheckPlan } from "../../src/core/resolver.js";

describe("check contract", () => {
  it("returns structured plan", async () => {
    const plan = await buildCheckPlan(process.cwd());
    expect(plan.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(plan.detail)).toBe(true);
  });
});
