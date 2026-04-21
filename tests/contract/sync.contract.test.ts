import { describe, expect, it } from "vitest";
import { formatCommandOutput } from "../../src/core/output.js";

describe("sync contract", () => {
  it("follows standard output envelope", () => {
    const output = formatCommandOutput({
      summary: "Sync workflow completed.",
      risk: "low",
      recommendation: "Continue with delivery workflow.",
      detail: ["fetch: completed"],
    });

    expect(output).toContain("Summary:");
    expect(output).toContain("Risk:");
    expect(output).toContain("Recommendation:");
    expect(output).toContain("Detail:");
  });
});
