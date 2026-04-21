import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runPairHandoff, runPairStart } from "../../src/commands/pair.js";

describe("pair integration", () => {
  it("starts and hands off pair sessions", async () => {
    const harness = await createRepoHarness();
    const session = await runPairStart(harness.cwd);
    await runPairHandoff(session, harness.cwd);
    expect(session.length).toBeGreaterThan(0);
  });
});
