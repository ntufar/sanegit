import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface ConflictHunk {
  startLine: number;
  endLine: number;
  oursLabel: string;
  oursContent: string[];
  theirsLabel: string;
  theirsContent: string[];
}

export interface ConflictFile {
  path: string;
  hunks: ConflictHunk[];
  fullContent: string;
}

type ParserState = "normal" | "ours" | "theirs";

export async function parseConflictFile(
  filePath: string,
  cwd: string = process.cwd(),
): Promise<ConflictFile> {
  const content = await readFile(join(cwd, filePath), "utf8");
  return { path: filePath, hunks: parseConflictMarkers(content), fullContent: content };
}

export function parseConflictMarkers(content: string): ConflictHunk[] {
  const lines = content.split("\n");
  const hunks: ConflictHunk[] = [];

  let state: ParserState = "normal";
  let startLine = 0;
  let oursLabel = "";
  let oursContent: string[] = [];
  let theirsContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (state === "normal" && line.startsWith("<<<<<<<")) {
      state = "ours";
      startLine = i + 1;
      oursLabel = line.slice(7).trim();
      oursContent = [];
      theirsContent = [];
    } else if (state === "ours" && line.startsWith("=======")) {
      state = "theirs";
    } else if (state === "theirs" && line.startsWith(">>>>>>>")) {
      hunks.push({
        startLine,
        endLine: i + 1,
        oursLabel,
        oursContent,
        theirsLabel: line.slice(7).trim(),
        theirsContent,
      });
      state = "normal";
    } else if (state === "ours") {
      oursContent.push(line);
    } else if (state === "theirs") {
      theirsContent.push(line);
    }
  }

  return hunks;
}

export function reconstructFile(
  conflict: ConflictFile,
  resolvedHunks: string[],
): string {
  const lines = conflict.fullContent.split("\n");
  const result: string[] = [];
  let lineIdx = 0;

  for (let i = 0; i < conflict.hunks.length; i++) {
    const hunk = conflict.hunks[i]!;
    const zeroStart = hunk.startLine - 1;
    const zeroEnd = hunk.endLine;

    while (lineIdx < zeroStart) {
      result.push(lines[lineIdx]!);
      lineIdx++;
    }

    result.push(resolvedHunks[i] ?? "");
    lineIdx = zeroEnd;
  }

  while (lineIdx < lines.length) {
    result.push(lines[lineIdx]!);
    lineIdx++;
  }

  return result.join("\n");
}

export function extractContextLines(
  content: string,
  lineNum: number,
  count: number,
): string[] {
  const lines = content.split("\n");
  const zeroLine = lineNum - 1;
  if (count < 0) {
    const start = Math.max(0, zeroLine + count);
    return lines.slice(start, zeroLine);
  }
  return lines.slice(zeroLine + 1, zeroLine + 1 + count);
}
