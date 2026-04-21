import { describe, expect, it } from "vitest";
import { formatCommandOutput } from "../../src/core/output.js";

describe("ship contract", () => {
  it("surfaces resumable workflow status in standard output format", () => {
    const output = formatCommandOutput({
      summary: "Ship workflow handed off for background completion.",
      risk: "low",
      recommendation: "Use sg ship status.",
      detail: ["handoff: completed"],
    });

    expect(output).toContain("Summary:");
    expect(output).toContain("Risk:");
    expect(output).toContain("Recommendation:");
    expect(output).toContain("Detail:");
  });
});
