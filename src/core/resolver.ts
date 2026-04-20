import { runGit } from "./git.js";

export interface RecoveryPlan {
  summary: string;
  risk: "none" | "low" | "medium" | "high" | "critical";
  recommendation: string;
  detail: string[];
}

export async function buildCheckPlan(
  cwd: string = process.cwd(),
): Promise<RecoveryPlan> {
  const conflict = await runGit(
    ["diff", "--name-only", "--diff-filter=U"],
    cwd,
  );
  const hasConflicts = Boolean(conflict.stdout.trim());
  if (hasConflicts) {
    return {
      summary: "Conflicts detected before integration.",
      risk: "high",
      recommendation:
        "Resolve conflicts before opening or updating integration work.",
      detail: conflict.stdout
        .split("\n")
        .filter(Boolean)
        .map((file) => `Conflicted: ${file}`),
    };
  }

  return {
    summary: "No immediate integration blockers found.",
    risk: "low",
    recommendation: "Proceed with integration checks.",
    detail: ["No unresolved conflicts in index."],
  };
}

export async function buildFixPlan(
  cwd: string = process.cwd(),
): Promise<RecoveryPlan> {
  const mergeState = await runGit(
    ["rev-parse", "-q", "--verify", "MERGE_HEAD"],
    cwd,
  );
  if (mergeState.exitCode === 0) {
    return {
      summary: "Merge in progress.",
      risk: "critical",
      recommendation:
        "Complete conflict resolution, then run git merge --continue.",
      detail: ["Repository is currently in merge state."],
    };
  }

  return {
    summary: "No automatic fix required.",
    risk: "none",
    recommendation: "Use check for additional diagnostics.",
    detail: ["No merge markers found."],
  };
}
