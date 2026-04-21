import { describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { getRepositorySnapshot } from "../../src/core/repositorySnapshot.js";
import { runShip } from "../../src/commands/ship.js";
import { loadWorkflowJournal } from "../../src/core/workflowState.js";

describe("performance integration", () => {
  it("collects repository snapshot quickly for small repos", async () => {
    const harness = await createRepoHarness();
    const start = performance.now();
    await getRepositorySnapshot(harness.cwd);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });

  it("emits ship workflow checkpoint updates within cadence budget", async () => {
    const harness = await createRepoHarness();
    await runShip(harness.cwd);
    const journal = await loadWorkflowJournal(harness.cwd);
    const run = Object.values(journal.runs).find((entry) => entry.command === "ship");
    expect(run).toBeDefined();
    if (!run) {
      return;
    }
    for (let index = 1; index < run.steps.length; index += 1) {
      const prev = Date.parse(run.steps[index - 1]?.at ?? run.startedAt);
      const current = Date.parse(run.steps[index]?.at ?? run.updatedAt);
      expect(current - prev).toBeLessThanOrEqual(10_000);
    }
  });
});
