export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

export interface CommandOutput {
  summary: string;
  risk: RiskLevel;
  recommendation: string;
  detail?: string[];
  degradedMode?: boolean;
}

export function formatCommandOutput(output: CommandOutput): string {
  const lines = [
    `Summary: ${output.summary}`,
    `Risk: ${output.risk}`,
    `Recommendation: ${output.recommendation}`,
    "Detail:",
    ...(output.detail && output.detail.length > 0
      ? output.detail.map((item) => `- ${item}`)
      : ["- No additional detail."]),
  ];

  if (output.degradedMode) {
    lines.push(
      "- Degraded mode: AI or optional remote diagnostics unavailable.",
    );
  }

  return lines.join("\n");
}

export function writeOutput(
  output: CommandOutput,
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
): void {
  writer(`${formatCommandOutput(output)}\n`);
}
