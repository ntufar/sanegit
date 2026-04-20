import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { getRepositorySnapshot } from "../../src/core/repositorySnapshot.js";

describe("status integration", () => {
  it("collects repository snapshot from a real git repo", async () => {
    const harness = await createRepoHarness();
    const snapshot = await getRepositorySnapshot(harness.cwd);
    expect(snapshot.branch.length).toBeGreaterThan(0);
  });
});
