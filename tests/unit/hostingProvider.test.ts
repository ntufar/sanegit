import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { createHostingProvider } from "../../src/hosting/index.js";
import { deriveMergeQueueState } from "../../src/hosting/github.js";
import { resolveTimeTravelReference } from "../../src/commands/time-travel.js";

describe("hosting provider", () => {
  it("creates a provider using auto-detection", async () => {
    const harness = await createRepoHarness();
    const provider = await createHostingProvider(harness.cwd, "auto");
    expect(provider.id).toBeTruthy();
  });

  it("derives queue position and risk for current branch", () => {
    const queue = deriveMergeQueueState(
      [
        { number: 101, headRefName: "feature/a", mergeStateStatus: "CLEAN" },
        { number: 102, headRefName: "feature/b", mergeStateStatus: "DIRTY" },
      ],
      "feature/b",
      "success",
    );

    expect(queue.supported).toBe(true);
    expect(queue.risky).toBe(true);
    expect(queue.summary).toContain("position 2");
  });

  it("maps natural-language time references to git selectors", () => {
    expect(resolveTimeTravelReference("last commit").gitReference).toBe("HEAD~1");
    expect(resolveTimeTravelReference("2 days ago").gitReference).toBe(
      "HEAD@{2 days ago}",
    );
    expect(resolveTimeTravelReference("HEAD").viaNaturalLanguage).toBe(false);
  });
});
