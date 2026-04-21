import { runGit } from "./git.js";
import { createProvider } from "../ai/providers.js";
import { loadConfig, providerToBaseUrl, resolveCredential } from "./config.js";

export interface HunkSummary {
  summary: string;
  files: string[];
}

export async function summarizeHunks(
  cwd: string = process.cwd(),
): Promise<HunkSummary[]> {
  const stagedDiff = await runGit(["diff", "--cached"], cwd);
  const diffContent = stagedDiff.stdout;

  if (!diffContent.trim()) return [];

  const config = await loadConfig(cwd);
  const credential = resolveCredential(config);

  if (!credential.apiKey) {
    throw new Error("Missing API key for AI provider. Please configure it.");
  }

  const baseUrl = config.customBaseUrl ?? providerToBaseUrl(config.provider);
  const provider = createProvider({
    provider: config.provider,
    ...(baseUrl ? { baseUrl } : {}),
    apiKey: credential.apiKey,
  });

  const prompt = `Group the following changes into logical, distinct commits. For each group, provide a short summary and the list of affected files in JSON format:
[
  {
    "summary": "a short summary",
    "files": ["file1", "file2"]
  }
]

Diff:
${diffContent}`;

  try {
    const rawResponse = await provider.summarizeChangeSet(prompt);
    // Basic attempt to extract JSON if LLM added preamble
    const jsonMatch = rawResponse.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [{ summary: rawResponse, files: [] }];
  } catch {
    return [{ summary: "Fallback group", files: [] }];
  }
}
