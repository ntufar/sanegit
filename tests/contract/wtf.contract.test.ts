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
});
