import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type IssueSeverity = "critical" | "high" | "medium" | "low";
type CheckStatus = "pass" | "fail" | "unknown";

export interface MergeQueueRiskResult {
  risky: boolean;
  summary?: string;
  severity?: Exclude<IssueSeverity, "critical">;
}

export interface WtfIssue {
  key:
    | "behind-main"
    | "dirty-working-tree"
    | "in-progress-operation"
    | "unresolved-conflicts"
    | "last-ci-failed"
    | "merge-queue-risk"
    | "detached-head";
  title: string;
  severity: IssueSeverity;
  detail: string;
  fixHint: string;
  autoFixable: boolean;
}

export interface WtfCheckResult {
  name: string;
  status: CheckStatus;
  summary: string;
  issue?: WtfIssue;
}

export interface WtfDiagnosis {
  summary: string;
  risk: IssueSeverity | "none";
  recommendation: string;
  detail: string[];
  issues: WtfIssue[];
  checks: WtfCheckResult[];
}

export interface WtfCommandOptions {
  cwd?: string;
  io?: {
    write(text: string): void;
    confirm?(prompt: string): Promise<boolean>;
  };
  predictor?: {
    check(cwd: string): Promise<MergeQueueRiskResult>;
  };
  applyFixes?(diagnosis: WtfDiagnosis): Promise<void>;
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

// "wtf" means "What's the Fault" here; the joke stays in code comments, not user output.
export async function runWtfCommand(options: WtfCommandOptions = {}): Promise<WtfDiagnosis> {
  const cwd = options.cwd ?? process.cwd();

  const diagnosis = await collectDiagnosis(cwd, options);
  const output = formatWtfDiagnosis(diagnosis);

  (options.io ?? { write: (text: string) => process.stdout.write(text) }).write(`${output}\n`);

  if (diagnosis.issues.length > 0 && options.applyFixes) {
    const confirm = options.io?.confirm;
    const shouldApply = confirm
      ? await confirm("Apply suggested fixes now?")
      : false;

    if (shouldApply) {
      await options.applyFixes(diagnosis);
    }
  }

  return diagnosis;
}

export function formatWtfDiagnosis(diagnosis: WtfDiagnosis): string {
  const lines = [
    `Summary: ${diagnosis.summary}`,
    `Risk: ${diagnosis.risk}`,
    `Recommendation: ${diagnosis.recommendation}`,
    "Detail:",
    ...diagnosis.detail.map((line) => `- ${line}`),
  ];

  return lines.join("\n");
}

async function collectDiagnosis(cwd: string, options: WtfCommandOptions): Promise<WtfDiagnosis> {
  const checks = await Promise.all([
    checkBehindMain(cwd),
    checkDirtyWorkingTree(cwd),
    checkInProgressOperation(cwd),
    checkUnresolvedConflicts(cwd),
    checkLastCiFailed(cwd),
    checkMergeQueueRisk(cwd, options.predictor),
    checkDetachedHead(cwd),
  ]);

  const issues = checks
    .map((check) => check.issue)
    .filter((issue): issue is WtfIssue => Boolean(issue))
    .sort((left, right) => severityWeight(right.severity) - severityWeight(left.severity));

  const summary = issues.length
    ? `Found ${issues.length} issue${issues.length === 1 ? "" : "s"} across repository state and delivery signals.`
    : "No active repository faults detected.";

  const recommendation = issues.length
    ? `Start with ${issues[0].title.toLowerCase()}: ${issues[0].fixHint}`
    : "Repository looks healthy. Continue with your next planned git action.";

  const detail = checks.map((check) => `${check.name}: ${check.summary}`);

  return {
    summary,
    risk: issues[0]?.severity ?? "none",
    recommendation,
    detail,
    issues,
    checks,
  };
}

async function checkBehindMain(cwd: string): Promise<WtfCheckResult> {
  const result = await runCommand("git", ["rev-list", "--count", "HEAD..origin/main"], cwd);

  if (result.exitCode !== 0) {
    return unknownCheck("Behind main", "Could not compare HEAD against origin/main.");
  }

  const count = Number.parseInt(result.stdout.trim() || "0", 10);
  if (count > 0) {
    return failCheck("Behind main", {
      key: "behind-main",
      title: "Branch is behind main",
      severity: "high",
      detail: `Current branch is ${count} commit(s) behind origin/main.`,
      fixHint: "pull or rebase onto origin/main before stacking more changes",
      autoFixable: false,
    });
  }

  return passCheck("Behind main", "Branch is up to date with origin/main.");
}

async function checkDirtyWorkingTree(cwd: string): Promise<WtfCheckResult> {
  const result = await runCommand("git", ["status", "--porcelain"], cwd);
  if (result.exitCode !== 0) {
    return unknownCheck("Dirty working tree", "Could not inspect working tree state.");
  }

  const entries = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (entries.length > 0) {
    return failCheck("Dirty working tree", {
      key: "dirty-working-tree",
      title: "Working tree is dirty",
      severity: "medium",
      detail: `${entries.length} file change(s) are staged, unstaged, or untracked.`,
      fixHint: "review, commit, stash, or discard pending changes before risky operations",
      autoFixable: false,
    });
  }

  return passCheck("Dirty working tree", "Working tree is clean.");
}

async function checkInProgressOperation(cwd: string): Promise<WtfCheckResult> {
  const gitDirResult = await runCommand("git", ["rev-parse", "--git-dir"], cwd);
  if (gitDirResult.exitCode !== 0) {
    return unknownCheck("Merge or rebase in progress", "Could not resolve .git directory.");
  }

  const gitDir = gitDirResult.stdout.trim();
  const mergeHead = await pathExists(resolve(cwd, gitDir, "MERGE_HEAD"));
  const rebaseMerge = await pathExists(resolve(cwd, gitDir, "rebase-merge"));

  if (mergeHead || rebaseMerge) {
    return failCheck("Merge or rebase in progress", {
      key: "in-progress-operation",
      title: "Repository is mid-operation",
      severity: "critical",
      detail: mergeHead ? "Merge state detected." : "Rebase state detected.",
      fixHint: "complete or abort the in-progress merge/rebase before other commands",
      autoFixable: true,
    });
  }

  return passCheck("Merge or rebase in progress", "No merge or rebase markers detected.");
}

async function checkUnresolvedConflicts(cwd: string): Promise<WtfCheckResult> {
  const result = await runCommand("git", ["diff", "--name-only", "--diff-filter=U"], cwd);
  if (result.exitCode !== 0) {
    return unknownCheck("Unresolved conflicts", "Could not inspect unresolved conflicts.");
  }

  const conflictedFiles = result.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (conflictedFiles.length > 0) {
    return failCheck("Unresolved conflicts", {
      key: "unresolved-conflicts",
      title: "Unresolved conflicts detected",
      severity: "critical",
      detail: `${conflictedFiles.length} conflicted file(s) still need resolution.`,
      fixHint: "resolve conflicts or run sg fix before continuing",
      autoFixable: true,
    });
  }

  return passCheck("Unresolved conflicts", "No unresolved conflicts found.");
}

async function checkLastCiFailed(cwd: string): Promise<WtfCheckResult> {
  const result = await runCommand("gh", ["run", "list", "--limit", "1", "--json", "conclusion"], cwd);
  if (result.exitCode !== 0) {
    return unknownCheck("Last CI failed", "GitHub CLI unavailable or CI status could not be retrieved.");
  }

  try {
    const runs = JSON.parse(result.stdout) as Array<{ conclusion?: string }>;
    const conclusion = runs[0]?.conclusion ?? "unknown";

    if (conclusion === "failure") {
      return failCheck("Last CI failed", {
        key: "last-ci-failed",
        title: "Latest CI run failed",
        severity: "high",
        detail: "The latest GitHub Actions run finished with a failure conclusion.",
        fixHint: "inspect the failing workflow before merging or pushing more changes",
        autoFixable: false,
      });
    }

    return passCheck("Last CI failed", `Latest CI conclusion: ${conclusion}.`);
  } catch {
    return unknownCheck("Last CI failed", "CI response was not parseable.");
  }
}

async function checkMergeQueueRisk(
  cwd: string,
  predictor: WtfCommandOptions["predictor"],
): Promise<WtfCheckResult> {
  if (!predictor) {
    return unknownCheck("Merge queue risky", "Predictor not wired yet; merge queue risk check skipped.");
  }

  try {
    const result = await predictor.check(cwd);
    if (result.risky) {
      return failCheck("Merge queue risky", {
        key: "merge-queue-risk",
        title: "Merge queue risk detected",
        severity: result.severity ?? "medium",
        detail: result.summary ?? "Predictor reported elevated merge queue risk.",
        fixHint: "run sg check or reduce risky changes before queueing",
        autoFixable: false,
      });
    }

    return passCheck("Merge queue risky", result.summary ?? "Predictor reports acceptable merge queue risk.");
  } catch {
    return unknownCheck("Merge queue risky", "Predictor check failed unexpectedly.");
  }
}

async function checkDetachedHead(cwd: string): Promise<WtfCheckResult> {
  const result = await runCommand("git", ["symbolic-ref", "HEAD"], cwd);
  if (result.exitCode !== 0) {
    return failCheck("Detached HEAD", {
      key: "detached-head",
      title: "Repository is on detached HEAD",
      severity: "high",
      detail: "HEAD does not point to a named branch.",
      fixHint: "switch back to a branch before making more commits",
      autoFixable: false,
    });
  }

  return passCheck("Detached HEAD", `HEAD points to ${result.stdout.trim()}.`);
}

async function runCommand(command: string, args: string[], cwd: string): Promise<CommandResult> {
  try {
    const result = await execFileAsync(command, args, { cwd });
    return {
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
      exitCode: 0,
    };
  } catch (error) {
    const failed = error as {
      stdout?: string;
      stderr?: string;
      code?: number | string;
    };

    return {
      stdout: failed.stdout ?? "",
      stderr: failed.stderr ?? "",
      exitCode: typeof failed.code === "number" ? failed.code : 1,
    };
  }
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function passCheck(name: string, summary: string): WtfCheckResult {
  return { name, status: "pass", summary };
}

function failCheck(name: string, issue: WtfIssue): WtfCheckResult {
  return { name, status: "fail", summary: issue.detail, issue };
}

function unknownCheck(name: string, summary: string): WtfCheckResult {
  return { name, status: "unknown", summary };
}

function severityWeight(severity: IssueSeverity): number {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}