import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { createHostingProvider } from "../../src/hosting/index.js";

describe("hosting provider", () => {
  it("creates a provider using auto-detection", async () => {
    const harness = await createRepoHarness();
    const provider = await createHostingProvider(harness.cwd, "auto");
    expect(provider.id).toBeTruthy();
  });
});
