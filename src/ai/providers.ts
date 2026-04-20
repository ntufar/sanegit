export type ProviderId =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "custom";

export interface AiProviderConfig {
  provider: ProviderId;
  baseUrl?: string;
  apiKey?: string;
}

export interface AiProvider {
  summarizeChangeSet(input: string): Promise<string>;
  suggestCommitMessage(input: string): Promise<string>;
}

class FallbackProvider implements AiProvider {
  async summarizeChangeSet(input: string): Promise<string> {
    return `Non-AI fallback: ${input.slice(0, 180) || "No change summary available."}`;
  }

  async suggestCommitMessage(input: string): Promise<string> {
    const head = input.split("\n").find(Boolean) ?? "update repository changes";
    return `chore: ${head.slice(0, 60)}`;
  }
}

export function createProvider(_config: AiProviderConfig): AiProvider {
  // Initial implementation intentionally falls back to deterministic output.
  return new FallbackProvider();
}
