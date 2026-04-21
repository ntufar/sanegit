import { describe, expect, it } from "vitest";
import { addPatternObservation, pruneLearnedPatterns } from "../../src/core/memory.js";
import {
  LEARN_ACTIVATION_THRESHOLD,
  getPredictiveWarnings,
  learnFromSignals,
} from "../../src/core/patternLearner.js";
import { createRepoHarness } from "../helpers/repoHarness.js";
import type { MemoryProfile } from "../../src/core/memory.js";

describe("pattern learner", () => {
  it("tracks observations and prunes old entries", () => {
    const memory: MemoryProfile = {
      frequentFiles: [],
      previousRecommendations: [],
      learnedPatterns: {},
      updatedAt: new Date(0).toISOString(),
    };

    addPatternObservation(memory, "last-ci-failed", new Date().toISOString());
    expect(memory.learnedPatterns["last-ci-failed"]?.observations).toBe(1);

    for (let index = 0; index < 300; index += 1) {
      addPatternObservation(memory, `key-${index}`, new Date().toISOString());
    }
    pruneLearnedPatterns(memory, 64);
    expect(Object.keys(memory.learnedPatterns).length).toBeLessThanOrEqual(64);
  });

  it("activates predictive warnings after threshold", async () => {
    const harness = await createRepoHarness();
    const start = Date.now();
    for (let index = 0; index < LEARN_ACTIVATION_THRESHOLD; index += 1) {
      await learnFromSignals(
        ["last-ci-failed"],
        harness.cwd,
        new Date(start + index * 11 * 60 * 1000).toISOString(),
      );
    }

    const warnings = await getPredictiveWarnings(harness.cwd);
    expect(warnings.some((warning) => warning.key === "last-ci-failed")).toBe(
      true,
    );
  });
});
