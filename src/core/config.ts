import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { ProviderId } from "../ai/providers.js";

const aiContextSchema = z.object({
  includeFullDiff: z.boolean().default(true),
  includeReferencedFiles: z.boolean().default(true),
  showUsageMarker: z.boolean().default(true),
  sensitivePathGlobs: z.array(z.string()).default(["**/.env*", "**/*.pem"]),
  maxPayloadBytes: z.number().int().positive().default(200_000),
});

const commandDefaultsSchema = z.object({
  confirmDestructiveLocalActions: z.boolean().default(true),
  autoRunRemoteSafeSteps: z.boolean().default(true),
  enableHighRiskShipAutomation: z.boolean().default(false),
  enableFixCiAutomation: z.boolean().default(false),
});

const hostingSchema = z.object({
  providerMode: z.enum(["auto", "github", "gitlab", "bitbucket"]).default("auto"),
  allowLocalFallback: z.boolean().default(true),
});

const configSchema = z.object({
  provider: z
    .enum(["openai", "anthropic", "google", "mistral", "custom"])
    .default("openai"),
  customBaseUrl: z.string().optional(),
  credentialRef: z.string().optional(),
  aiContext: aiContextSchema.default({
    includeFullDiff: true,
    includeReferencedFiles: true,
    showUsageMarker: true,
    sensitivePathGlobs: ["**/.env*", "**/*.pem"],
    maxPayloadBytes: 200_000,
  }),
  commandDefaults: commandDefaultsSchema.default({
    confirmDestructiveLocalActions: true,
    autoRunRemoteSafeSteps: true,
    enableHighRiskShipAutomation: false,
    enableFixCiAutomation: false,
  }),
  hosting: hostingSchema.default({
    providerMode: "auto",
    allowLocalFallback: true,
  }),
});

export type SaneGitConfig = z.infer<typeof configSchema>;

const DEFAULT_CONFIG: SaneGitConfig = {
  provider: "openai",
  aiContext: {
    includeFullDiff: true,
    includeReferencedFiles: true,
    showUsageMarker: true,
    sensitivePathGlobs: ["**/.env*", "**/*.pem"],
    maxPayloadBytes: 200_000,
  },
  commandDefaults: {
    confirmDestructiveLocalActions: true,
    autoRunRemoteSafeSteps: true,
    enableHighRiskShipAutomation: false,
    enableFixCiAutomation: false,
  },
  hosting: {
    providerMode: "auto",
    allowLocalFallback: true,
  },
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

import { getCredential } from "./keychain.js";
// ...

export async function resolveCredential(
  config: SaneGitConfig,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ apiKey?: string; source: string }> {
  if (env.SANEGIT_AI_API_KEY) {
    return { apiKey: env.SANEGIT_AI_API_KEY, source: "env:SANEGIT_AI_API_KEY" };
  }

  if (config.credentialRef) {
    const apiKey = await getCredential(config.credentialRef);
    if (apiKey) {
      return { apiKey, source: "keychain" };
    }
    
    // Fallback for env var referenced in credentialRef
    const isEnvVar = /^[A-Z][A-Z0-9_]*$/.test(config.credentialRef);
    if (isEnvVar) {
      const apiKey = env[config.credentialRef];
      if (apiKey) {
        return { apiKey, source: `env:${config.credentialRef}` };
      }
    }
  }

  return { source: "none" };
}

export function validateConfig(config: Partial<SaneGitConfig>): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} {
  const normalized = configSchema.parse({
    ...DEFAULT_CONFIG,
    ...config,
    aiContext: { ...DEFAULT_CONFIG.aiContext, ...config.aiContext },
    commandDefaults: {
      ...DEFAULT_CONFIG.commandDefaults,
      ...config.commandDefaults,
    },
    hosting: { ...DEFAULT_CONFIG.hosting, ...config.hosting },
  });

  const warnings: string[] = [];
  const errors: string[] = [];

  if (normalized.provider === "custom" && !normalized.customBaseUrl) {
    errors.push("Custom provider requires customBaseUrl.");
  }

  if (normalized.aiContext.maxPayloadBytes < 50_000) {
    warnings.push(
      "AI context maxPayloadBytes is very small and may over-truncate diagnostic payloads.",
    );
  }

  if (!normalized.commandDefaults.confirmDestructiveLocalActions) {
    warnings.push(
      "Destructive local action confirmation is disabled. This may increase risk.",
    );
  }

  if (normalized.customBaseUrl?.startsWith("http://")) {
    warnings.push(
      "Non-HTTPS AI API URL configured. This is insecure and should be used only in trusted environments.",
    );
  }

  if (!normalized.credentialRef && !process.env.SANEGIT_AI_API_KEY) {
    errors.push(
      "No credential source found. Set SANEGIT_AI_API_KEY or configure a keychain credential reference.",
    );
  }

  return { valid: errors.length === 0, warnings, errors };
}
