import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { evaluatePushSafety } from "../../src/core/pushSafety.js";

describe("push integration", () => {
  it("computes a risk evaluation without crashing", async () => {
    const harness = await createRepoHarness();
    const result = await evaluatePushSafety(harness.cwd);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
