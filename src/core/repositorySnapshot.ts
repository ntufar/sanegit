import { runGit } from "./git.js";

export interface RepositorySnapshot {
  branch: string;
  ahead: number;
  behind: number;
  staged: number;
  unstaged: number;
  untracked: number;
  hasConflicts: boolean;
  hostedProvider?: "github" | "gitlab" | "bitbucket" | "unknown";
  aiContextEligible?: boolean;
}

export async function getRepositorySnapshot(
  cwd: string = process.cwd(),
): Promise<RepositorySnapshot> {
  const branchResult = await runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
  const branch =
    branchResult.exitCode === 0 ? branchResult.stdout.trim() : "unknown";

  const aheadBehindResult = await runGit(
    ["rev-list", "--left-right", "--count", "origin/main...HEAD"],
    cwd,
  );
  let behind = 0;
  let ahead = 0;
  if (aheadBehindResult.exitCode === 0) {
    const [b, a] = aheadBehindResult.stdout.trim().split(/\s+/);
    behind = Number.parseInt(b ?? "0", 10) || 0;
    ahead = Number.parseInt(a ?? "0", 10) || 0;
  }

  const statusResult = await runGit(["status", "--porcelain"], cwd);
  const lines = statusResult.stdout.split("\n").filter(Boolean);
  let staged = 0;
  let unstaged = 0;
  let untracked = 0;

  for (const line of lines) {
    const x = line[0] ?? " ";
    const y = line[1] ?? " ";
    if (x !== " " && x !== "?") staged += 1;
    if (y !== " ") unstaged += 1;
    if (x === "?" && y === "?") untracked += 1;
  }

  const conflicts = await runGit(
    ["diff", "--name-only", "--diff-filter=U"],
    cwd,
  );

  return {
    branch,
    ahead,
    behind,
    staged,
    unstaged,
    untracked,
    hasConflicts: Boolean(conflicts.stdout.trim()),
    hostedProvider: "unknown",
    aiContextEligible: true,
  };
}
