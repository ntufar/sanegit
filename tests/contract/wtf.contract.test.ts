import { describe, expect, it } from "vitest";
import { runWtfCommand } from "../../src/commands/wtf.js";

describe("wtf contract", () => {
  it("returns diagnosis with standard fields", async () => {
    const diagnosis = await runWtfCommand({
      io: { write: () => undefined },
      predictor: {
        check: async () => ({ risky: false, summary: "ok", severity: "low" }),
      },
    });
    expect(diagnosis.summary.length).toBeGreaterThan(0);
    expect(Array.isArray(diagnosis.detail)).toBe(true);
  });

  it("supports learn mode and fix-ci mode options", async () => {
    const diagnosis = await runWtfCommand({
      io: { write: () => undefined },
      learnMode: true,
      fixCiMode: true,
      predictor: {
        check: async () => ({ risky: false, summary: "ok", severity: "low" }),
      },
    });

    expect(diagnosis.summary.length).toBeGreaterThan(0);
    expect(diagnosis.detail.join(" ")).toContain("CI diagnosis");
  });
});
