import { writeOutput } from "./output.js";
import { loadConfig, resolveCredential } from "./config.js";

export async function checkAIConfigured(
  cwd: string = process.cwd(),
  command: string = "this command",
): Promise<boolean> {
  const config = await loadConfig(cwd);
  const credential = resolveCredential(config);

  if (!credential.apiKey) {
    writeOutput({
      summary: `AI provider not configured for ${command}.`,
      risk: "medium",
      recommendation:
        'Run "sg ai-configure" to set up an AI provider (OpenAI, Anthropic, Google, Mistral, or custom endpoint).',
      detail: [
        `Provider: ${config.provider}`,
        `Credential ref: ${config.credentialRef || "(not set)"}`,
        "",
        "Without AI configuration, SaneGit falls back to rule-based analysis (degraded mode).",
        'Set the credential reference to an environment variable or OS keychain entry and run "sg ai-configure" again.',
      ],
    });
    return false;
  }

  return true;
}
