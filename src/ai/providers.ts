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

// Providers that use the OpenAI chat completions API format
const OPENAI_COMPAT_PROVIDERS: ProviderId[] = ["openai", "mistral", "custom"];

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  mistral: "https://api.mistral.ai/v1",
};

const PROVIDER_DEFAULT_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  mistral: "mistral-small-latest",
  anthropic: "claude-3-haiku-20240307",
  google: "gemini-1.5-flash",
};

class OpenAiCompatProvider implements AiProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: AiProviderConfig) {
    this.baseUrl = config.baseUrl ?? PROVIDER_BASE_URLS[config.provider] ?? "";
    this.apiKey = config.apiKey ?? "";
    this.model = PROVIDER_DEFAULT_MODELS[config.provider] ?? "mistral-small-latest";
  }

  private async chat(systemPrompt: string, userContent: string): Promise<string> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        max_tokens: 512,
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`AI provider error ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content?.trim() ?? "";
  }

  async summarizeChangeSet(input: string): Promise<string> {
    return this.chat(
      "You are a git assistant. Summarize the following diff in 1-3 sentences for a developer. Be concise and focus on what changed and why it matters.",
      input,
    );
  }

  async suggestCommitMessage(input: string): Promise<string> {
    return this.chat(
      "You are a git assistant. Generate a single conventional commit message (e.g. feat: ..., fix: ..., chore: ...) for the following diff. Output only the commit message, nothing else.",
      input,
    );
  }

  async diagnoseFailure(input: string): Promise<string> {
    return this.chat(
      "You are a git assistant. Diagnose the following git or CI failure and suggest a concrete next step to resolve it. Be concise.",
      input,
    );
  }
}

class AnthropicProvider implements AiProvider {
  private apiKey: string;
  private model: string;

  constructor(config: AiProviderConfig) {
    this.apiKey = config.apiKey ?? "";
    this.model = PROVIDER_DEFAULT_MODELS["anthropic"]!;
  }

  private async chat(systemPrompt: string, userContent: string): Promise<string> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Anthropic error ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content.find((b) => b.type === "text")?.text?.trim() ?? "";
  }

  async summarizeChangeSet(input: string): Promise<string> {
    return this.chat(
      "You are a git assistant. Summarize the following diff in 1-3 sentences. Be concise.",
      input,
    );
  }

  async suggestCommitMessage(input: string): Promise<string> {
    return this.chat(
      "Generate a single conventional commit message for the following diff. Output only the commit message.",
      input,
    );
  }

  async diagnoseFailure(input: string): Promise<string> {
    return this.chat(
      "Diagnose the following git or CI failure and suggest a concrete next step. Be concise.",
      input,
    );
  }
}

class GoogleProvider implements AiProvider {
  private apiKey: string;
  private model: string;

  constructor(config: AiProviderConfig) {
    this.apiKey = config.apiKey ?? "";
    this.model = PROVIDER_DEFAULT_MODELS["google"]!;
  }

  private async generate(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`Google AI error ${res.status}: ${text}`);
    }
    const data = (await res.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    return data.candidates[0]?.content?.parts[0]?.text?.trim() ?? "";
  }

  async summarizeChangeSet(input: string): Promise<string> {
    return this.generate(
      `You are a git assistant. Summarize the following diff in 1-3 sentences:\n\n${input}`,
    );
  }

  async suggestCommitMessage(input: string): Promise<string> {
    return this.generate(
      `Generate a single conventional commit message for the following diff. Output only the commit message:\n\n${input}`,
    );
  }

  async diagnoseFailure(input: string): Promise<string> {
    return this.generate(
      `Diagnose the following git or CI failure and suggest a concrete next step:\n\n${input}`,
    );
  }
}

export function createProvider(config: AiProviderConfig): AiProvider {
  if (!config.apiKey) {
    return new FallbackProvider();
  }
  if (config.provider === "anthropic") {
    return new AnthropicProvider(config);
  }
  if (config.provider === "google") {
    return new GoogleProvider(config);
  }
  if (OPENAI_COMPAT_PROVIDERS.includes(config.provider)) {
    return new OpenAiCompatProvider(config);
  }
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
