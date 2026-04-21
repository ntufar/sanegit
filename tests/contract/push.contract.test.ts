import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { evaluatePushSafety } from "../../src/core/pushSafety.js";

describe("push contract", () => {
  it("returns allowed flag and risk", async () => {
    const harness = await createRepoHarness({ withRemote: true });
    const result = await evaluatePushSafety(harness.cwd);
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.risk).toBe("string");
  });
});
