import { describe, expect, it } from "vitest";
import { validateConfig } from "../../src/core/config.js";

describe("ai-configure contract", () => {
  it("requires custom URL for custom provider", () => {
    const validation = validateConfig({ provider: "custom" });
    expect(validation.valid).toBe(false);
    expect(validation.errors.join(" ")).toContain("customBaseUrl");
  });
});
