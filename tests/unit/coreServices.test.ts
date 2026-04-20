import { describe, expect, it } from "vitest";
import { redactSecrets } from "../../src/core/telemetry.js";
import { validateConfig } from "../../src/core/config.js";
import { predictPushRisk } from "../../src/core/predictor.js";

describe("core services", () => {
  it("redacts API key-like tokens", () => {
    const redacted = redactSecrets("api_key=secret-token");
    expect(redacted).toContain("[REDACTED]");
  });

  it("validates missing credential sources", () => {
    const validation = validateConfig({ provider: "openai" });
    expect(validation.valid).toBe(false);
  });

  it("returns predictor result shape", async () => {
    const result = await predictPushRisk(process.cwd());
    expect(Array.isArray(result.reasons)).toBe(true);
  });
});
