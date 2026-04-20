export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export interface CommandOutput {
  summary: string;
  risk: RiskLevel;
  recommendation: string;
  detail?: string[];
  degradedMode?: boolean;
}

interface OutputFormatOptions {
  color?: boolean;
}

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  blue: "\u001b[34m",
  cyan: "\u001b[36m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  magenta: "\u001b[35m",
} as const;

function colorize(text: string, codes: string[], enabled: boolean): string {
  if (!enabled) {
    return text;
  }

  return `${codes.join("")}${text}${ANSI.reset}`;
}

function riskColor(risk: RiskLevel): string[] {
  switch (risk) {
    case "none":
      return [ANSI.bold, ANSI.green];
    case "low":
      return [ANSI.green];
    case "medium":
      return [ANSI.yellow];
    case "high":
      return [ANSI.red];
    case "critical":
      return [ANSI.bold, ANSI.magenta];
    default:
      return [];
  }
}

function shouldColorizeOutput(): boolean {
  if (process.env.NO_COLOR !== undefined) {
    return false;
  }

  if (process.env.FORCE_COLOR !== undefined) {
    return process.env.FORCE_COLOR !== "0";
  }

  return Boolean(process.stdout.isTTY);
}

export function formatCommandOutput(
  output: CommandOutput,
  options: OutputFormatOptions = {},
): string {
  const colorEnabled = options.color ?? shouldColorizeOutput();
  const lines = [
    `${colorize("Summary:", [ANSI.bold, ANSI.cyan], colorEnabled)} ${output.summary}`,
    `${colorize("Risk:", [ANSI.bold, ANSI.blue], colorEnabled)} ${colorize(output.risk, riskColor(output.risk), colorEnabled)}`,
    `${colorize("Recommendation:", [ANSI.bold, ANSI.blue], colorEnabled)} ${output.recommendation}`,
    colorize("Detail:", [ANSI.bold, ANSI.blue], colorEnabled),
    ...(output.detail && output.detail.length > 0
      ? output.detail.map((item) => `- ${item}`)
      : ["- No additional detail."]),
  ];

  if (output.degradedMode) {
    lines.push(
      colorize(
        "- Degraded mode: AI or optional remote diagnostics unavailable.",
        [ANSI.dim, ANSI.yellow],
        colorEnabled,
      ),
    );
  }

  return lines.join("\n");
}

export function writeOutput(
  output: CommandOutput,
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
): void {
  const colorEnabled = shouldColorizeOutput();
  writer(`${formatCommandOutput(output, { color: colorEnabled })}\n`);
}
