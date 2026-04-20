import { execa } from "execa";

export interface GitResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function runGit(
  args: string[],
  cwd: string = process.cwd(),
): Promise<GitResult> {
  try {
    const result = await execa("git", args, { cwd });
    return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
  } catch (error) {
    const failed = error as {
      stdout?: string;
      stderr?: string;
      exitCode?: number;
    };
    return {
      stdout: failed.stdout ?? "",
      stderr: failed.stderr ?? "",
      exitCode: failed.exitCode ?? 1,
    };
  }
}

export async function assertGitRepo(
  cwd: string = process.cwd(),
): Promise<boolean> {
  const result = await runGit(["rev-parse", "--is-inside-work-tree"], cwd);
  return result.exitCode === 0 && result.stdout.trim() === "true";
}
