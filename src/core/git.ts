import { execa } from "execa";

export interface GitResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunGitOptions {
  throw?: boolean;
}

export async function runGit(
  args: string[],
  cwd: string = process.cwd(),
  options?: RunGitOptions,
): Promise<GitResult> {
  const throwOnError = options?.throw ?? true;
  try {
    const result = await execa("git", args, { cwd });
    return { stdout: result.stdout, stderr: result.stderr, exitCode: 0 };
  } catch (error) {
    if (!throwOnError) {
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
    throw error;
  }
}

export async function assertGitRepo(
  cwd: string = process.cwd(),
): Promise<boolean> {
  const result = await runGit(["rev-parse", "--is-inside-work-tree"], cwd);
  return result.exitCode === 0 && result.stdout.trim() === "true";
}

export async function getRemoteUrl(
  cwd: string = process.cwd(),
): Promise<string | undefined> {
  const result = await runGit(["remote", "get-url", "origin"], cwd);
  if (result.exitCode !== 0) {
    return undefined;
  }
  const url = result.stdout.trim();
  return url.length > 0 ? url : undefined;
}

export async function detectHostingProviderFromGit(
  cwd: string = process.cwd(),
): Promise<"github" | "gitlab" | "bitbucket" | "unknown"> {
  const remote = await getRemoteUrl(cwd);
  if (!remote) {
    return "unknown";
  }
  if (remote.includes("github.com")) {
    return "github";
  }
  if (remote.includes("gitlab.com")) {
    return "gitlab";
  }
  if (remote.includes("bitbucket.org")) {
    return "bitbucket";
  }
  return "unknown";
}
