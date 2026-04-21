import { describe, expect, it } from "vitest";
import { formatCommandOutput } from "../../src/core/output.js";

describe("cli output contract", () => {
  it("supports hosted and ai markers in standard envelope", () => {
    const output = formatCommandOutput({
      summary: "s",
      risk: "low",
      recommendation: "r",
      detail: ["d"],
      aiBacked: true,
      hostedContextSource: "mixed",
    });
    expect(output).toContain("Summary:");
    expect(output).toContain("Hosted context source");
    expect(output).toContain("AI-assisted analysis enabled");
  });
});
