import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runGit } from "../../src/core/git.js";
import { buildCommitPlan } from "../../src/core/commitPlanner.js";

describe("commit integration", () => {
  it("detects staged files in commit plan", async () => {
    const harness = await createRepoHarness();
    await writeFile(join(harness.cwd, "README.md"), "hello\n", "utf8");
    await runGit(["add", "README.md"], harness.cwd);
    const plan = await buildCommitPlan(harness.cwd);
    expect(plan.includedFiles).toContain("README.md");
  });
});
