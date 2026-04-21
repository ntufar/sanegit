export type HostingProviderId = "github" | "gitlab" | "bitbucket" | "unknown";

export interface PullRequestState {
  number?: number;
  title?: string;
  status: "open" | "merged" | "closed" | "unknown";
  url?: string;
}

export interface CiState {
  status: "success" | "failure" | "pending" | "unknown";
  summary: string;
}

export interface MergeQueueState {
  supported: boolean;
  risky: boolean;
  summary: string;
}

export interface HostedContextSnapshot {
  provider: HostingProviderId;
  remoteAvailable: boolean;
  pullRequest: PullRequestState;
  ci: CiState;
  mergeQueue: MergeQueueState;
}

export interface HostedProvider {
  readonly id: HostingProviderId;
  getContext(cwd: string): Promise<HostedContextSnapshot>;
}

export function emptyHostedContext(
  provider: HostingProviderId = "unknown",
): HostedContextSnapshot {
  return {
    provider,
    remoteAvailable: false,
    pullRequest: { status: "unknown" },
    ci: { status: "unknown", summary: "CI status unavailable" },
    mergeQueue: {
      supported: false,
      risky: false,
      summary: "Merge queue unavailable",
    },
  };
}
