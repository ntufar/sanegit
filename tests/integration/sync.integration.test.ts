import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runSync } from "../../src/commands/sync.js";
import { loadWorkflowJournal } from "../../src/core/workflowState.js";

describe("sync integration", () => {
  it("persists workflow checkpoints for sync runs", async () => {
    const harness = await createRepoHarness();
    await runSync(harness.cwd);

    const journal = await loadWorkflowJournal(harness.cwd);
    const run = Object.values(journal.runs).find((entry) => entry.command === "sync");
    expect(run).toBeDefined();
    expect(run?.steps.length).toBeGreaterThan(0);
  });
});
