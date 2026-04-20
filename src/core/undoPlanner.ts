import { runGit } from "./git.js";

export interface UndoOption {
  id: string;
  description: string;
  command: string;
  risk: "low" | "medium" | "high";
}

export async function listUndoOptions(
  cwd: string = process.cwd(),
): Promise<UndoOption[]> {
  const hasUncommitted = await runGit(["status", "--porcelain"], cwd);
  const options: UndoOption[] = [
    {
      id: "soft-head",
      description: "Undo last commit but keep changes staged",
      command: "git reset --soft HEAD~1",
      risk: "medium",
    },
    {
      id: "revert-head",
      description: "Create a new commit that reverts the last commit",
      command: "git revert HEAD",
      risk: "low",
    },
  ];

  if (hasUncommitted.stdout.trim()) {
    options.push({
      id: "stash",
      description: "Stash uncommitted changes",
      command: "git stash push",
      risk: "low",
    });
  }

  return options;
}
