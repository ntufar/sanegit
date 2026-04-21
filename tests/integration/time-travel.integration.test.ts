import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runTimeTravel } from "../../src/commands/time-travel.js";

describe("time-travel integration", () => {
  it("resolves known references and reports a suggested branch", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "one\n", "chore: seed history");
    const chunks: string[] = [];
    await runTimeTravel("HEAD", harness.cwd, (text) => {
      chunks.push(text);
    });

    const output = chunks.join("");
    expect(output).toContain("Historical reference resolved.");
    expect(output).toContain("Suggested branch: time-travel/");
  });

  it("maps natural-language references to git-compatible selectors", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "one\n", "chore: seed history");
    await harness.commitFile("README.md", "two\n", "chore: add follow-up");
    const chunks: string[] = [];

    await runTimeTravel("1 commits ago", harness.cwd, (text) => {
      chunks.push(text);
    });

    const output = chunks.join("");
    expect(output).toContain("Natural-language mapping applied");
    expect(output).toContain("Reference HEAD~1 =>");
  });
});
