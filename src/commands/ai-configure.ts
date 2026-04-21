import {
  loadConfig,
  saveConfig,
  validateConfig,
  type SaneGitConfig,
} from "../core/config.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export interface AiConfigureInput {
  provider: SaneGitConfig["provider"];
  customBaseUrl?: string;
  credentialRef?: string;
  cwd?: string;
}

export async function runAiConfigure(
  input: AiConfigureInput,
): Promise<{ ok: boolean; warnings: string[]; errors: string[] }> {
  const cwd = input.cwd ?? process.cwd();
  const existing = await loadConfig(cwd);
  const config: SaneGitConfig = {
    provider: input.provider,
    customBaseUrl: input.customBaseUrl,
    credentialRef: input.credentialRef,
    aiContext: existing.aiContext,
    commandDefaults: existing.commandDefaults,
    hosting: existing.hosting,
  };

  const validation = validateConfig(config);

  await saveConfig(config, cwd);
  await logEvent(
    {
      command: "ai-configure",
      outcome: validation.valid ? "success" : "failure",
      detail: validation.errors.join("; "),
    },
    cwd,
  );

  writeOutput({
    summary: validation.valid
      ? "AI configuration saved."
      : "AI configuration saved with validation errors.",
    risk: validation.valid ? "low" : "high",
    recommendation: validation.valid
      ? "Run `sg status` to verify runtime behavior."
      : "Fix configuration errors before relying on AI-assisted commands.",
    detail: [
      `Provider: ${config.provider}`,
      ...(config.customBaseUrl ? [`Custom URL: ${config.customBaseUrl}`] : []),
      `Credential reference: ${config.credentialRef ?? "none"}`,
      ...validation.warnings,
      ...validation.errors,
    ],
    degradedMode: !validation.valid,
  });

  return {
    ok: validation.valid,
    warnings: validation.warnings,
    errors: validation.errors,
  };
}
