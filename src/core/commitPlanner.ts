import { runGit } from "./git.js";
import { createProvider } from "../ai/providers.js";
import { loadConfig, providerToBaseUrl, resolveCredential } from "./config.js";

export interface CommitPlan {
  message: string;
  includedFiles: string[];
  degradedMode: boolean;
}

export async function buildCommitPlan(
  cwd: string = process.cwd(),
): Promise<CommitPlan> {
  const staged = await runGit(["diff", "--cached", "--name-only"], cwd);
  const files = staged.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const summary = files.length > 0 ? files.join(", ") : "no staged files";

  const config = await loadConfig(cwd);
  const credential = await resolveCredential(config);

  if (!credential.apiKey) {
    return {
      message: `chore: update ${files[0] ?? "repository"}`,
      includedFiles: files,
      degradedMode: true,
    };
  }

  const baseUrl = config.customBaseUrl ?? providerToBaseUrl(config.provider);
  const provider = createProvider({
    provider: config.provider,
    ...(baseUrl ? { baseUrl } : {}),
    apiKey: credential.apiKey,
  });

  return {
    message: await provider.suggestCommitMessage(summary),
    includedFiles: files,
    degradedMode: false,
  };
}
