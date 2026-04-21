import { runGit } from "./git.js";

/**
 * Conflict Forensics
 * 
 * 1. Get conflicted files using: git diff --name-only --diff-filter=U
 * 2. Read conflicted regions, identify lines.
 * 3. Use `git blame -L <start>,<end> <file>` to find the commit that introduced the conflict.
 * 4. Get PR info from GitHub API or `gh` CLI.
 */

export interface ConflictOrigin {
  file: string;
  line: number;
  commitHash: string;
  author: string;
  summary: string;
  pr?: {
    number: number;
    title: string;
  };
}

export async function getConflictedFiles(cwd: string = process.cwd()): Promise<string[]> {
  const result = await runGit(["diff", "--name-only", "--diff-filter=U"], cwd);
  if (result.exitCode !== 0) return [];
  return result.stdout.split("\n").filter(Boolean);
}

export async function getBlameForLine(
  file: string,
  line: number,
  cwd: string = process.cwd(),
): Promise<{ commitHash: string; author: string; summary: string } | null> {
  const result = await runGit(
    ["blame", "-L", `${line},${line}`, "--porcelain", file],
    cwd,
  );
  if (result.exitCode !== 0) return null;

  const lines = result.stdout.split("\n");
  const firstLine = lines[0];
  if (!firstLine) return null;
  const commitHash = firstLine.split(" ")[0] ?? "";
  let author = "";
  let summary = "";

  for (const line of lines) {
    if (line.startsWith("author ")) author = line.substring(7);
    if (line.startsWith("summary ")) summary = line.substring(8);
  }

  return { commitHash, author, summary };
}

export async function getPrInfo(
  commitHash: string,
  cwd: string = process.cwd(),
): Promise<{ number: number; title: string } | null> {
  // Try to find the PR associated with this commit
  const result = await runGit(
    ["gh", "pr", "list", "--search", commitHash, "--json", "number,title"],
    cwd,
  );
  if (result.exitCode !== 0) return null;

  try {
    const prs = JSON.parse(result.stdout) as Array<{ number: number; title: string }>;
    return prs[0] ?? null;
  } catch {
    return null;
  }
}
