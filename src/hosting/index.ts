import { detectHostingProviderFromGit } from "../core/git.js";
import { GitHubHostedProvider } from "./github.js";
import {
  emptyHostedContext,
  type HostedContextSnapshot,
  type HostedProvider,
  type HostingProviderId,
} from "./provider.js";

class UnknownHostedProvider implements HostedProvider {
  public readonly id = "unknown" as const;

  async getContext(): Promise<HostedContextSnapshot> {
    return emptyHostedContext(this.id);
  }
}

export async function createHostingProvider(
  cwd: string,
  requested: HostingProviderId | "auto" = "auto",
): Promise<HostedProvider> {
  const resolved =
    requested === "auto" ? await detectHostingProviderFromGit(cwd) : requested;

  if (resolved === "github") {
    return new GitHubHostedProvider();
  }

  return new UnknownHostedProvider();
}
