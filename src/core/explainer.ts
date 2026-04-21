import { PROMPTS } from "../ai/prompts.js";
import { buildAiContextPayload, createProvider } from "../ai/providers.js";
import { loadConfig, providerToBaseUrl, resolveCredential } from "./config.js";
import { runGit } from "./git.js";

export interface ExplainResult {
  text: string;
  degradedMode: boolean;
}

export async function explainChanges(
  changeSummary: string,
  cwd: string = process.cwd(),
): Promise<ExplainResult> {
  const config = await loadConfig(cwd);
  const credential = await resolveCredential(config);

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

export async function diagnoseCiFailure(
  cwd: string = process.cwd(),
): Promise<ExplainResult & { truncated: boolean }> {
  const config = await loadConfig(cwd);
  const credential = await resolveCredential(config);
  const diff = await runGit(["diff", "--staged"], cwd);
  const payload = buildAiContextPayload({
    command: "wtf --fix-ci",
    diff: diff.stdout,
    referencedFiles: [],
    maxPayloadBytes: config.aiContext.maxPayloadBytes,
  });

  if (!credential.apiKey) {
    return {
      text: `${PROMPTS.diagnoseCiFailure} (fallback)`,
      degradedMode: true,
      truncated: payload.truncated,
    };
  }

  const baseUrl = config.customBaseUrl ?? providerToBaseUrl(config.provider);

  const provider = createProvider({
    provider: config.provider,
    ...(baseUrl ? { baseUrl } : {}),
    apiKey: credential.apiKey,
  });

  const diagnosis = provider.diagnoseFailure
    ? await provider.diagnoseFailure(`${PROMPTS.diagnoseCiFailure}\n${payload.diff}`)
    : await provider.summarizeChangeSet(`${PROMPTS.diagnoseCiFailure}\n${payload.diff}`);

  return { text: diagnosis, degradedMode: false, truncated: payload.truncated };
}
