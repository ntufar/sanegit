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

export async function runWtfRemediation(
  issueKey: "unresolved-conflicts" | "last-ci-failed",
  cwd: string = process.cwd(),
): Promise<RecoveryPlan> {
  if (issueKey === "unresolved-conflicts") {
    return buildFixPlan(cwd);
  }

  if (issueKey === "last-ci-failed") {
    const status = await runGit(["status", "--short"], cwd);
    return {
      summary: "Prepared CI remediation handoff.",
      risk: "medium",
      recommendation:
        "Reproduce the failing test locally and apply the smallest corrective change before re-running CI.",
      detail: [
        "Collected local repository state for CI remediation.",
        `Working tree entries: ${status.stdout.split("\n").filter(Boolean).length}`,
      ],
    };
  }

  return {
    summary: "No remediation available for this issue.",
    risk: "low",
    recommendation: "Use sg check for additional diagnostics.",
    detail: ["Selected issue type has no mapped remediation path."],
  };
}
