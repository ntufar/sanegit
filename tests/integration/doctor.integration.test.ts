import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runDoctor } from "../../src/commands/doctor.js";

describe("doctor integration", () => {
  it("reports prioritized findings for risky repository states", async () => {
    const harness = await createRepoHarness();
    await harness.commitFile("README.md", "base\n", "chore: seed history");
    await harness.createBranch("feature/doctor");

    const chunks: string[] = [];
    await runDoctor(harness.cwd, (text) => {
      chunks.push(text);
    });

    const output = chunks.join("");
    expect(output).toContain("Doctor found");
    expect(output).toContain("Branch:");
  });
});
