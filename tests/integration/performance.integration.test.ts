import { describe, expect, it } from "vitest";
import { performance } from "node:perf_hooks";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { getRepositorySnapshot } from "../../src/core/repositorySnapshot.js";

describe("performance integration", () => {
  it("collects repository snapshot quickly for small repos", async () => {
    const harness = await createRepoHarness();
    const start = performance.now();
    await getRepositorySnapshot(harness.cwd);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
