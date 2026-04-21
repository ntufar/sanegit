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
        ["pr", "status", "--json", "currentBranch"],
        { cwd },
      );
      const parsed = JSON.parse(stdout) as {
        currentBranch?: { number?: number; title?: string; url?: string };
      };
      const branch = parsed.currentBranch;
      fallback.remoteAvailable = true;
      fallback.pullRequest = {
        ...(branch?.number !== undefined ? { number: branch.number } : {}),
        ...(branch?.title !== undefined ? { title: branch.title } : {}),
        status: branch ? "open" : "unknown",
        ...(branch?.url !== undefined ? { url: branch.url } : {}),
      };
    } catch {
      // Keep fallback values when gh is not available or unauthenticated.
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
