import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runSplit } from "../../src/commands/split.js";
import { runGit } from "../../src/core/git.js";

describe("split integration", () => {
  it("proposes commit groups for staged files", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "base\n", "chore: base");
    await runGit(["checkout", "-b", "feature/split"], harness.cwd);
    await runGit(["status"], harness.cwd);

    const groups = await runSplit(harness.cwd);
    expect(Array.isArray(groups)).toBe(true);
  });
});
