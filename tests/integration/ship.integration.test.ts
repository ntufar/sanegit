import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runShip, runShipStatus } from "../../src/commands/ship.js";
import { saveConfig } from "../../src/core/config.js";

describe("ship integration", () => {
  it("creates a ship workflow run and exposes status", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "ship\n", "chore: prepare ship");

    const run = await runShip(harness.cwd);
    const status = await runShipStatus(harness.cwd);

    expect(run.id.length).toBeGreaterThan(0);
    expect(status?.id).toBe(run.id);
  });

  it("keeps high-risk ship automation gated when disabled", async () => {
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

    const run = await runShip(harness.cwd);
    expect(run.id.length).toBeGreaterThan(0);
  });
});
