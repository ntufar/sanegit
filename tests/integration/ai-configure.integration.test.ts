import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runAiConfigure } from "../../src/commands/ai-configure.js";

describe("ai-configure integration", () => {
  it("writes config with provider and custom URL", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "sanegit-config-"));
    await runAiConfigure({
      provider: "custom",
      customBaseUrl: "http://localhost:8080",
      credentialRef: "local.dev",
      cwd,
    });
    const config = await readFile(join(cwd, ".sanegit", "config.json"), "utf8");
    expect(config).toContain("custom");
    expect(config).toContain("http://localhost:8080");
  });
});
