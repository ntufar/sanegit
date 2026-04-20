import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { explainChanges } from "../../src/core/explainer.js";

describe("explain integration", () => {
  it("returns explanation text for a repository context", async () => {
    const harness = await createRepoHarness();
    const result = await explainChanges("M src/file.ts", harness.cwd);
    expect(result.text.length).toBeGreaterThan(0);
  });
});
