import { describe, expect, it } from "vitest";
import { emptyHostedContext } from "../../src/hosting/provider.js";

describe("hosting contract", () => {
  it("returns normalized hosted context shape", () => {
    const context = emptyHostedContext("unknown");
    expect(context.provider).toBe("unknown");
    expect(typeof context.remoteAvailable).toBe("boolean");
    expect(Array.isArray(context.recentPullRequestAuthors)).toBe(true);
    expect(typeof context.repository).toBe("object");
    expect(context.ci.status).toBeTruthy();
  });
});
