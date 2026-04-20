import { describe, expect, it } from "vitest";
import { explainChanges } from "../../src/core/explainer.js";

describe("explain contract", () => {
  it("supports degraded mode when credentials are missing", async () => {
    const result = await explainChanges("M file.ts", process.cwd());
    expect(typeof result.text).toBe("string");
    expect(typeof result.degradedMode).toBe("boolean");
  });
});
