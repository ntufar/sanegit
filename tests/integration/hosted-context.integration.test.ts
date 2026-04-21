import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { getHostedContext } from "../../src/core/hostedContext.js";

describe("hosted context integration", () => {
  it("returns fallback hosted context when provider is unavailable", async () => {
    const harness = await createRepoHarness();
    const context = await getHostedContext(harness.cwd, "auto");
    expect(context.provider).toBeTruthy();
    expect(typeof context.remoteAvailable).toBe("boolean");
  });
});
