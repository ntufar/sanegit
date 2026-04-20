import { describe, expect, it } from "vitest";
import { formatCommandOutput } from "../../src/core/output.js";

describe("status contract", () => {
  it("uses summary/risk/recommendation/detail structure", () => {
    const output = formatCommandOutput({
      summary: "s",
      risk: "low",
      recommendation: "r",
      detail: ["d"],
    });
    expect(output).toContain("Summary:");
    expect(output).toContain("Risk:");
    expect(output).toContain("Recommendation:");
    expect(output).toContain("Detail:");
  });
});
