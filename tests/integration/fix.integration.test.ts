import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { buildFixPlan } from "../../src/core/resolver.js";

describe("fix integration", () => {
  it("returns fix recommendations", async () => {
    const harness = await createRepoHarness();
    const plan = await buildFixPlan(harness.cwd);
    expect(plan.summary.length).toBeGreaterThan(0);
  });
});
