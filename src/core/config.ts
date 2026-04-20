import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { ProviderId } from "../ai/providers.js";

const configSchema = z.object({
  provider: z
    .enum(["openai", "anthropic", "google", "mistral", "custom"])
    .default("openai"),
  customBaseUrl: z.string().optional(),
  credentialRef: z.string().optional(),
});

export type SaneGitConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG: SaneGitConfig = {
  provider: "openai",
};

export async function loadConfig(
  cwd: string = process.cwd(),
): Promise<SaneGitConfig> {
  const path = join(cwd, ".sanegit", "config.json");
  try {
    const content = await readFile(path, "utf8");
    return configSchema.parse(JSON.parse(content));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(
  config: SaneGitConfig,
  cwd: string = process.cwd(),
): Promise<void> {
  const dir = join(cwd, ".sanegit");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "config.json"),
    JSON.stringify(configSchema.parse(config), null, 2),
    "utf8",
  );
}

export function providerToBaseUrl(provider: ProviderId): string | undefined {
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1";
    case "anthropic":
      return "https://api.anthropic.com";
    case "google":
      return "https://generativelanguage.googleapis.com";
    case "mistral":
      return "https://api.mistral.ai/v1";
    case "custom":
      return undefined;
  }
}

export function resolveCredential(
  config: SaneGitConfig,
  env: NodeJS.ProcessEnv = process.env,
): { apiKey?: string; source: string } {
  if (env.SANEGIT_AI_API_KEY) {
    return { apiKey: env.SANEGIT_AI_API_KEY, source: "env:SANEGIT_AI_API_KEY" };
  }

  if (config.credentialRef) {
    return { source: `keychain:${config.credentialRef}` };
  }

  return { source: "none" };
}

export function validateConfig(config: SaneGitConfig): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (config.provider === "custom" && !config.customBaseUrl) {
    errors.push("Custom provider requires customBaseUrl.");
  }

  if (config.customBaseUrl?.startsWith("http://")) {
    warnings.push(
      "Non-HTTPS AI API URL configured. This is insecure and should be used only in trusted environments.",
    );
  }

  if (!config.credentialRef && !process.env.SANEGIT_AI_API_KEY) {
    errors.push(
      "No credential source found. Set SANEGIT_AI_API_KEY or configure a keychain credential reference.",
    );
  }

  return { valid: errors.length === 0, warnings, errors };
}
