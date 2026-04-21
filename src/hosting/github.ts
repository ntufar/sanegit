import { promisify } from "node:util";
import { execFile } from "node:child_process";
import {
  emptyHostedContext,
  type HostedContextSnapshot,
  type HostedProvider,
} from "./provider.js";

const execFileAsync = promisify(execFile);

export class GitHubHostedProvider implements HostedProvider {
  public readonly id = "github" as const;

  async getContext(cwd: string): Promise<HostedContextSnapshot> {
    const fallback = emptyHostedContext(this.id);

    try {
      const { stdout } = await execFileAsync(
        "gh",
        ["repo", "view", "--json", "nameWithOwner,defaultBranchRef"],
        { cwd },
      );
      const parsed = JSON.parse(stdout) as {
        nameWithOwner?: string;
        defaultBranchRef?: { name?: string };
      };
      fallback.remoteAvailable = true;
      fallback.repository = {
        ...(parsed.nameWithOwner
          ? { nameWithOwner: parsed.nameWithOwner }
          : {}),
        ...(parsed.defaultBranchRef?.name
          ? { defaultBranch: parsed.defaultBranchRef.name }
          : {}),
      };
    } catch {
      // Keep fallback values when gh cannot access the repository.
    }

    try {
      const { stdout } = await execFileAsync(
        "gh",
        ["pr", "view", "--json", "number,title,url,state"],
        { cwd },
      );
      const parsed = JSON.parse(stdout) as {
        number?: number;
        title?: string;
        url?: string;
        state?: string;
      };
      fallback.pullRequest = {
        ...(parsed.number !== undefined ? { number: parsed.number } : {}),
        ...(parsed.title !== undefined ? { title: parsed.title } : {}),
        status:
          parsed.state === "OPEN"
            ? "open"
            : parsed.state === "MERGED"
              ? "merged"
              : parsed.state === "CLOSED"
                ? "closed"
                : "unknown",
        ...(parsed.url !== undefined ? { url: parsed.url } : {}),
      };
    } catch {
      // Keep fallback PR values when no PR exists for the current branch.
    }

    try {
      const { stdout } = await execFileAsync(
        "gh",
        ["pr", "list", "--limit", "5", "--json", "author"],
        { cwd },
      );
      const parsed = JSON.parse(stdout) as Array<{
        author?: { login?: string };
      }>;
      fallback.recentPullRequestAuthors = Array.from(
        new Set(
          parsed
            .map((pr) => pr.author?.login)
            .filter((author): author is string => Boolean(author)),
        ),
      );
    } catch {
      // Keep fallback author list when recent PRs cannot be queried.
    }

    try {
      const { stdout } = await execFileAsync(
        "gh",
        ["run", "list", "--limit", "1", "--json", "conclusion,status"],
        { cwd },
      );
      const parsed = JSON.parse(stdout) as Array<{
        conclusion?: "success" | "failure";
        status?: "queued" | "in_progress" | "completed";
      }>;
      const latest = parsed[0];
      if (!latest) {
        return fallback;
      }
      if (latest.status === "in_progress" || latest.status === "queued") {
        fallback.ci = {
          status: "pending",
          summary: "Latest CI run is still in progress",
        };
      } else if (latest.conclusion === "success") {
        fallback.ci = { status: "success", summary: "Latest CI run succeeded" };
      } else if (latest.conclusion === "failure") {
        fallback.ci = { status: "failure", summary: "Latest CI run failed" };
      }
    } catch {
      // Keep fallback values when CI state cannot be queried.
    }

    return fallback;
  }
}
