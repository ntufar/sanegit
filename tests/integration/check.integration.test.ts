import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { buildCheckPlan } from "../../src/core/resolver.js";

describe("check integration", () => {
  it("generates check plan from repo", async () => {
    const harness = await createRepoHarness();
    const plan = await buildCheckPlan(harness.cwd);
    expect(plan.recommendation.length).toBeGreaterThan(0);
  });
});
