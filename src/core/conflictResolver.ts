import { extname } from "node:path";
import type { AiProvider } from "../ai/providers.js";
import { getBlameForLine } from "./forensics.js";
import {
  parseConflictFile,
  reconstructFile,
  extractContextLines,
  type ConflictHunk,
  type ConflictFile,
} from "./conflictParser.js";

export interface ResolutionResult {
  file: string;
  originalContent: string;
  resolvedContent: string;
  explanation: string;
  confidence: "high" | "medium" | "low";
}

export async function resolveConflictFile(
  file: string,
  provider: AiProvider,
  cwd: string,
): Promise<ResolutionResult> {
  const conflictFile = await parseConflictFile(file, cwd);

  if (conflictFile.hunks.length === 0) {
    return {
      file,
      originalContent: conflictFile.fullContent,
      resolvedContent: conflictFile.fullContent,
      explanation: "No conflict markers found.",
      confidence: "high",
    };
  }

  const resolvedHunks: string[] = [];
  const explanations: string[] = [];
  let lowestConfidence: ResolutionResult["confidence"] = "high";

  for (let i = 0; i < conflictFile.hunks.length; i++) {
    const hunk = conflictFile.hunks[i]!;
    const prompt = await buildHunkPrompt(file, hunk, conflictFile, cwd);

    const response = provider.resolveConflict
      ? await provider.resolveConflict(prompt)
      : await provider.summarizeChangeSet(prompt);

    const parsed = parseResolutionResponse(response);
    resolvedHunks.push(parsed.resolution);
    explanations.push(`Hunk ${i + 1}: ${parsed.explanation}`);

    if (parsed.confidence === "low" || (parsed.confidence === "medium" && lowestConfidence === "high")) {
      lowestConfidence = parsed.confidence;
    }
  }

  return {
    file,
    originalContent: conflictFile.fullContent,
    resolvedContent: reconstructFile(conflictFile, resolvedHunks),
    explanation: explanations.join(" "),
    confidence: lowestConfidence,
  };
}

async function buildHunkPrompt(
  file: string,
  hunk: ConflictHunk,
  conflictFile: ConflictFile,
  cwd: string,
): Promise<string> {
  const lang = extname(file).replace(".", "") || "text";
  const oursBlame = await getBlameForLine(file, hunk.startLine + 1, cwd).catch(() => null);
  const theirsBlame = await getBlameForLine(file, hunk.endLine - 1, cwd).catch(() => null);
  const before = extractContextLines(conflictFile.fullContent, hunk.startLine, -5);
  const after = extractContextLines(conflictFile.fullContent, hunk.endLine, 5);

  const oursInfo = oursBlame ? `by ${oursBlame.author}: ${oursBlame.summary}` : "(unknown)";
  const theirsInfo = theirsBlame ? `by ${theirsBlame.author}: ${theirsBlame.summary}` : "(unknown)";

  return [
    `FILE: ${file}`,
    `LANGUAGE: ${lang}`,
    "",
    "BEFORE CONFLICT:",
    before.join("\n"),
    "",
    `<<<<<<< ${hunk.oursLabel} (${oursInfo})`,
    hunk.oursContent.join("\n"),
    "=======",
    hunk.theirsContent.join("\n"),
    `>>>>>>> ${hunk.theirsLabel} (${theirsInfo})`,
    "",
    "AFTER CONFLICT:",
    after.join("\n"),
  ].join("\n");
}

interface ParsedResolution {
  resolution: string;
  explanation: string;
  confidence: ResolutionResult["confidence"];
}

export function parseResolutionResponse(response: string): ParsedResolution {
  const codeBlockMatch = response.match(/RESOLUTION:\s*```[^\n]*\n([\s\S]*?)```/);
  const resolution = codeBlockMatch?.[1]?.replace(/\n$/, "") ?? "";

  const explanationMatch = response.match(/EXPLANATION:\s*(.+)/);
  const explanation = explanationMatch?.[1]?.trim() ?? "No explanation provided.";

  const confidenceMatch = response.match(/CONFIDENCE:\s*(high|medium|low)/i);
  const rawConfidence = confidenceMatch?.[1]?.toLowerCase() ?? "low";
  const confidence = (["high", "medium", "low"].includes(rawConfidence) ? rawConfidence : "low") as ParsedResolution["confidence"];

  return { resolution, explanation, confidence };
}

export function generateDiffPreview(original: string, resolved: string): string[] {
  const origLines = original.split("\n");
  const resLines = resolved.split("\n");
  const output: string[] = [];

  let oi = 0;
  let ri = 0;
  while (oi < origLines.length || ri < resLines.length) {
    const ol = origLines[oi];
    const rl = resLines[ri];

    if (ol === rl) {
      output.push(`  ${ol}`);
      oi++;
      ri++;
    } else if (ol !== undefined && (rl === undefined || ol.startsWith("<<<<<<<") || ol.startsWith("=======") || ol.startsWith(">>>>>>>"))) {
      output.push(`- ${ol}`);
      oi++;
    } else if (rl !== undefined) {
      output.push(`+ ${rl}`);
      ri++;
    }
  }

  return output;
}
