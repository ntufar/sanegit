import { runGit } from "./git";

export interface Hunk {
  header: string;
  lines: string[];
  startLine: number;
  lineCount: number;
}

export async function getDiffHunks(filePath: string, cwd: string = process.cwd()): Promise<Hunk[]> {
  const result = await runGit(["diff", "-U0", "--", filePath], cwd);
  if (result.exitCode !== 0) {
    throw new Error(`Failed to get git diff: ${result.stderr}`);
  }
  return parseDiffOutput(result.stdout);
}

export function parseDiffOutput(diff: string): Hunk[] {
  const hunks: Hunk[] = [];
  const lines = diff.split("\n");
  let currentHunk: Hunk | null = null;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        currentHunk = {
          header: line,
          lines: [],
          startLine: parseInt(match[2], 10),
          lineCount: 0,
        };
        hunks.push(currentHunk);
      }
    } else if (currentHunk && (line.startsWith("+") || line.startsWith("-") || line.startsWith(" "))) {
      currentHunk.lines.push(line);
      currentHunk.lineCount++;
    }
  }

  return hunks;
}
