import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runWtfCommand } from "../../src/commands/wtf.js";

describe("wtf integration", () => {
  it("runs diagnostics and returns checks", async () => {
    const harness = await createRepoHarness();
    const diagnosis = await runWtfCommand({
      cwd: harness.cwd,
      io: { write: () => undefined },
      predictor: {
        check: async () => ({ risky: false, summary: "ok", severity: "low" }),
      },
    });
    expect(diagnosis.checks.length).toBe(7);
  });
});
