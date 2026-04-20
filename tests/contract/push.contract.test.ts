import { describe, expect, it } from "vitest";
import { evaluatePushSafety } from "../../src/core/pushSafety.js";

describe("push contract", () => {
  it("returns allowed flag and risk", async () => {
    const result = await evaluatePushSafety(process.cwd());
    expect(typeof result.allowed).toBe("boolean");
    expect(typeof result.risk).toBe("string");
  });
});
