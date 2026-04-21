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
  diagnoseFailure?(input: string): Promise<string>;
}

export interface AiContextPayload {
  command: string;
  diff: string;
  referencedFiles: Array<{ path: string; content: string }>;
  truncated: boolean;
}

class FallbackProvider implements AiProvider {
  async summarizeChangeSet(input: string): Promise<string> {
    return `Non-AI fallback: ${input.slice(0, 180) || "No change summary available."}`;
  }

  async suggestCommitMessage(input: string): Promise<string> {
    const head = input.split("\n").find(Boolean) ?? "update repository changes";
    return `chore: ${head.slice(0, 60)}`;
  }

  async diagnoseFailure(input: string): Promise<string> {
    return `Probable cause: ${input.slice(0, 120) || "insufficient data"}. Next step: inspect failing test output and rerun locally.`;
  }
}

export function createProvider(_config: AiProviderConfig): AiProvider {
  // Initial implementation intentionally falls back to deterministic output.
  return new FallbackProvider();
}

export function buildAiContextPayload(input: {
  command: string;
  diff: string;
  referencedFiles: Array<{ path: string; content: string }>;
  maxPayloadBytes: number;
}): AiContextPayload {
  const payloadBase = {
    command: input.command,
    diff: input.diff,
    referencedFiles: input.referencedFiles,
  };
  const serialized = JSON.stringify(payloadBase);
  if (Buffer.byteLength(serialized, "utf8") <= input.maxPayloadBytes) {
    return { ...payloadBase, truncated: false };
  }

  // Deterministic truncation by reducing diff first, then file contents in order.
  let diff = input.diff.slice(0, Math.max(0, Math.floor(input.maxPayloadBytes / 4)));
  const files = input.referencedFiles.map((file) => ({ ...file }));
  for (const file of files) {
    if (Buffer.byteLength(JSON.stringify({ command: input.command, diff, referencedFiles: files }), "utf8") <= input.maxPayloadBytes) {
      break;
    }
    file.content = file.content.slice(0, 512);
  }

  while (
    Buffer.byteLength(
      JSON.stringify({ command: input.command, diff, referencedFiles: files }),
      "utf8",
    ) > input.maxPayloadBytes &&
    diff.length > 0
  ) {
    diff = diff.slice(0, Math.floor(diff.length * 0.9));
  }

  return {
    command: input.command,
    diff,
    referencedFiles: files,
    truncated: true,
  };
}
