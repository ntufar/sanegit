import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runTimeTravel } from "../../src/commands/time-travel.js";

describe("time-travel integration", () => {
  it("resolves known references without throwing", async () => {
    const harness = await createRepoHarness();
    await runTimeTravel("HEAD", harness.cwd);
    expect(true).toBe(true);
  });
});
