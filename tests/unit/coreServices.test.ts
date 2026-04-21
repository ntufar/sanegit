import { describe, expect, it } from "vitest";
import { redactSecrets } from "../../src/core/telemetry.js";
import { validateConfig } from "../../src/core/config.js";
import { predictPushRisk } from "../../src/core/predictor.js";
import { getRepositorySnapshot } from "../../src/core/repositorySnapshot.js";
import { collectDoctorFindings } from "../../src/commands/doctor.js";
import {
  buildBlameRationale,
  parseBlamePorcelain,
} from "../../src/commands/blame.js";
import { createRepoHarness } from "../helpers/repoHarness.js";

describe("core services", () => {
  it("redacts API key-like tokens", () => {
    const redacted = redactSecrets("api_key=secret-token");
    expect(redacted).toContain("[REDACTED]");
  });

  it("validates missing credential sources", () => {
    const validation = validateConfig({ provider: "openai" });
    expect(validation.valid).toBe(false);
  });

  it("returns predictor result shape", async () => {
    const harness = await createRepoHarness();
    const result = await predictPushRisk(harness.cwd);
    expect(Array.isArray(result.reasons)).toBe(true);
  });

  it("returns repository snapshot shape for doctor command", async () => {
    const harness = await createRepoHarness();
    const snapshot = await getRepositorySnapshot(harness.cwd);
    expect(snapshot.branch.length).toBeGreaterThan(0);
  });

  it("prioritizes detached head and conflict findings for doctor", () => {
    const findings = collectDoctorFindings({
      branch: "HEAD",
      ahead: 0,
      behind: 6,
      staged: 2,
      unstaged: 1,
      untracked: 30,
      hasConflicts: true,
      detachedHead: true,
      hasCommits: true,
      looseObjects: 250,
      packedObjects: 10,
      hostedProvider: "unknown",
      aiContextEligible: true,
    });

    expect(findings[0]?.risk).toBe("critical");
    expect(findings.some((finding) => finding.title.includes("Conflicts detected"))).toBe(true);
  });

  it("parses porcelain blame and synthesizes rationale", () => {
    const parsed = parseBlamePorcelain([
      "abc123 1 1 1",
      "author Nicolai",
      "summary add sync guard",
      "\tif (dirty) return;",
    ].join("\n"));

    expect(parsed?.author).toBe("Nicolai");
    expect(parsed?.summary).toBe("add sync guard");
    expect(
      buildBlameRationale(parsed!, "Protect the workflow from dirty state failures."),
    ).toContain("Protect the workflow");
  });
});
