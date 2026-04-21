import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runBlameExplain } from "../../src/commands/blame.js";

describe("blame integration", () => {
  it("returns parsed author and rationale details for a real line", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile(
      "README.md",
      "first line\nsecond line\n",
      "docs: add readme guidance",
    );

    const chunks: string[] = [];
    await runBlameExplain("README.md", 1, harness.cwd, (text) => {
      chunks.push(text);
    });

    const output = chunks.join("");
    expect(output).toContain("Blame explanation prepared.");
    expect(output).toContain("Author: SaneGit Test");
    expect(output).toContain("Rationale:");
    expect(output).toContain("Intent: docs: add readme guidance");
  });
});