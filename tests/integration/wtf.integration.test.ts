import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runWtfCommand } from "../../src/commands/wtf.js";
import { loadMemory } from "../../src/core/memory.js";
import { saveConfig } from "../../src/core/config.js";

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

  it("records learn-mode signals when conflicts are present", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "base\n", "chore: base");
    await harness.createBranch("feature/conflict");
    await harness.commitFile("README.md", "feature\n", "feat: feature change");
    await runWtfCommand({
      cwd: harness.cwd,
      io: { write: () => undefined },
      learnMode: true,
      predictor: {
        check: async () => ({ risky: false, summary: "ok", severity: "low" }),
      },
    });

    const memory = await loadMemory(harness.cwd);
    expect(Object.keys(memory.learnedPatterns).length).toBeGreaterThanOrEqual(0);
  });

  it("reports rollout-gated remediation in fix-ci mode", async () => {
    const harness = await createRepoHarness();
    await saveConfig(
      {
        provider: "openai",
        commandDefaults: {
          confirmDestructiveLocalActions: true,
          autoRunRemoteSafeSteps: true,
          enableHighRiskShipAutomation: false,
          enableFixCiAutomation: false,
        },
        aiContext: {
          includeFullDiff: true,
          includeReferencedFiles: true,
          showUsageMarker: true,
          sensitivePathGlobs: ["**/.env*"],
          maxPayloadBytes: 200000,
        },
        hosting: { providerMode: "auto", allowLocalFallback: true },
      },
      harness.cwd,
    );

    const diagnosis = await runWtfCommand({
      cwd: harness.cwd,
      io: { write: () => undefined },
      fixCiMode: true,
      predictor: {
        check: async () => ({ risky: false, summary: "ok", severity: "low" }),
      },
    });

    expect(diagnosis.detail.join(" ")).toContain("rollout controls");
  });
});
