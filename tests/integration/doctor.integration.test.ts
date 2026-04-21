import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runDoctor } from "../../src/commands/doctor.js";

describe("doctor integration", () => {
  it("runs repository audit without throwing", async () => {
    const harness = await createRepoHarness();
    await runDoctor(harness.cwd);
    expect(true).toBe(true);
  });
});
