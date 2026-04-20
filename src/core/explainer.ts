import { PROMPTS } from "../ai/prompts.js";
import { createProvider } from "../ai/providers.js";
import { loadConfig, providerToBaseUrl, resolveCredential } from "./config.js";

export interface ExplainResult {
  text: string;
  degradedMode: boolean;
}

export async function explainChanges(
  changeSummary: string,
  cwd: string = process.cwd(),
): Promise<ExplainResult> {
  const config = await loadConfig(cwd);
  const credential = resolveCredential(config);

  if (!credential.apiKey) {
    return {
      text: `Unable to contact AI provider. ${PROMPTS.explainChanges} ${changeSummary}`,
      degradedMode: true,
    };
  }

  const baseUrl = config.customBaseUrl ?? providerToBaseUrl(config.provider);
  const provider = createProvider({
    provider: config.provider,
    ...(baseUrl ? { baseUrl } : {}),
    apiKey: credential.apiKey,
  });

  const text = await provider.summarizeChangeSet(changeSummary);
  return { text, degradedMode: false };
}
