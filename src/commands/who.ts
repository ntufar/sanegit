import { runGit } from "../core/git.js";
import { getHostedContext } from "../core/hostedContext.js";
import { writeOutput } from "../core/output.js";

export interface OwnershipEntry {
  author: string;
  email?: string;
  commits: number;
  share: number;
}

export interface LocalOwnershipSnapshot {
  totalCommits: number;
  owners: OwnershipEntry[];
  activeAuthors: string[];
}

export interface WhoScopeOptions {
  file?: string;
}

interface ResolvedWhoScope {
  kind: "repository" | "file" | "directory";
  label: string;
  ownershipLabel: string;
  primaryOwnerLabel: string;
  unitLabel: string;
  totalUnitLabel: string;
  summary: string;
}

export function parseShortlogOutput(output: string): OwnershipEntry[] {
  const rows = output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+)\s+(.+?)(?:\s+<([^>]+)>)?$/);
      if (!match) {
        return undefined;
      }

      return {
        author: (match[2] ?? "unknown").trim(),
        ...(match[3] ? { email: match[3].trim() } : {}),
        commits: Number.parseInt(match[1] ?? "0", 10) || 0,
        share: 0,
      } satisfies OwnershipEntry;
    })
    .filter((row): row is OwnershipEntry => Boolean(row));

  const totalCommits = rows.reduce((sum, row) => sum + row.commits, 0);
  if (totalCommits === 0) {
    return [];
  }

  return rows.map((row) => ({
    ...row,
    share: Number(((row.commits / totalCommits) * 100).toFixed(1)),
  }));
}

export function parseBlameOwnership(output: string): OwnershipEntry[] {
  const counts = new Map<string, number>();
  const emails = new Map<string, string>();

  let currentAuthor = "unknown";
  let currentEmail: string | undefined;
  for (const rawLine of output.split("\n")) {
    const line = rawLine.trimEnd();
    if (line.startsWith("author ")) {
      currentAuthor = line.slice("author ".length).trim() || "unknown";
      continue;
    }
    if (line.startsWith("author-mail ")) {
      const value = line.slice("author-mail ".length).trim();
      currentEmail = value.replace(/^</, "").replace(/>$/, "");
      continue;
    }
    if (line.startsWith("\t")) {
      counts.set(currentAuthor, (counts.get(currentAuthor) ?? 0) + 1);
      if (currentEmail) {
        emails.set(currentAuthor, currentEmail);
      }
    }
  }

  const totalLines = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  if (totalLines === 0) {
    return [];
  }

  return Array.from(counts.entries())
    .map(([author, commits]) => {
      const email = emails.get(author);

      return {
        author,
        ...(email ? { email } : {}),
        commits,
        share: Number(((commits / totalLines) * 100).toFixed(1)),
      } satisfies OwnershipEntry;
    })
    .sort((left, right) => right.commits - left.commits || left.author.localeCompare(right.author));
}

function aggregateOwnership(entries: OwnershipEntry[]): OwnershipEntry[] {
  const counts = new Map<string, { commits: number; email?: string }>();
  for (const entry of entries) {
    const existing = counts.get(entry.author);
    const mergedEmail = existing?.email ?? entry.email;
    counts.set(entry.author, {
      commits: (existing?.commits ?? 0) + entry.commits,
      ...(mergedEmail ? { email: mergedEmail } : {}),
    });
  }

  const total = Array.from(counts.values()).reduce(
    (sum, value) => sum + value.commits,
    0,
  );
  if (total === 0) {
    return [];
  }

  return Array.from(counts.entries())
    .map(([author, value]) => ({
      author,
      ...(value.email ? { email: value.email } : {}),
      commits: value.commits,
      share: Number(((value.commits / total) * 100).toFixed(1)),
    }))
    .sort(
      (left, right) =>
        right.commits - left.commits || left.author.localeCompare(right.author),
    );
}

export async function getLocalOwnershipSnapshot(
  cwd: string = process.cwd(),
): Promise<LocalOwnershipSnapshot> {
  const shortlog = await runGit(["shortlog", "-sne", "HEAD"], cwd);
  const recentAuthors = await runGit(
    ["log", "--since=90.days", "--format=%aN", "HEAD"],
    cwd,
  );

  const owners = shortlog.exitCode === 0 ? parseShortlogOutput(shortlog.stdout) : [];
  const activeAuthors =
    recentAuthors.exitCode === 0
      ? Array.from(
          new Set(
            recentAuthors.stdout
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ),
        ).slice(0, 5)
      : [];

  return {
    totalCommits: owners.reduce((sum, owner) => sum + owner.commits, 0),
    owners,
    activeAuthors,
  };
}

export async function getFileOwnershipSnapshot(
  filePath: string,
  cwd: string = process.cwd(),
): Promise<LocalOwnershipSnapshot> {
  const blame = await runGit(["blame", "--line-porcelain", filePath], cwd);
  const recentAuthors = await runGit(
    ["log", "--since=90.days", "--format=%aN", "--", filePath],
    cwd,
  );

  const owners = blame.exitCode === 0 ? parseBlameOwnership(blame.stdout) : [];
  const activeAuthors =
    recentAuthors.exitCode === 0
      ? Array.from(
          new Set(
            recentAuthors.stdout
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ),
        ).slice(0, 5)
      : [];

  return {
    totalCommits: owners.reduce((sum, owner) => sum + owner.commits, 0),
    owners,
    activeAuthors,
  };
}

async function getDirectoryOwnershipSnapshot(
  path: string,
  trackedFiles: string[],
  cwd: string = process.cwd(),
): Promise<LocalOwnershipSnapshot> {
  const fileOwnership: OwnershipEntry[] = [];
  for (const trackedFile of trackedFiles) {
    const blame = await runGit(["blame", "--line-porcelain", trackedFile], cwd);
    if (blame.exitCode !== 0) {
      continue;
    }
    fileOwnership.push(...parseBlameOwnership(blame.stdout));
  }

  const recentAuthors = await runGit(
    ["log", "--since=90.days", "--format=%aN", "--", path],
    cwd,
  );
  const activeAuthors =
    recentAuthors.exitCode === 0
      ? Array.from(
          new Set(
            recentAuthors.stdout
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          ),
        ).slice(0, 5)
      : [];

  const owners = aggregateOwnership(fileOwnership);
  return {
    totalCommits: owners.reduce((sum, owner) => sum + owner.commits, 0),
    owners,
    activeAuthors,
  };
}

async function resolvePathOwnershipSnapshot(
  path: string,
  cwd: string,
): Promise<{ snapshot: LocalOwnershipSnapshot; scope: ResolvedWhoScope }> {
  const exactFile = await runGit(["ls-files", "--error-unmatch", "--", path], cwd);
  const exactMatches = exactFile.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (exactFile.exitCode === 0 && exactMatches.length === 1 && exactMatches[0] === path) {
    return {
      snapshot: await getFileOwnershipSnapshot(path, cwd),
      scope: {
        kind: "file",
        label: `Target file: ${path}`,
        ownershipLabel: "File ownership",
        primaryOwnerLabel: "Primary file owner",
        unitLabel: "blamed line",
        totalUnitLabel: "blamed lines",
        summary: "File collaborator ownership context ready.",
      },
    };
  }

  const trackedFilesResult = await runGit(["ls-files", "--", path], cwd);
  const trackedFiles = trackedFilesResult.stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (trackedFiles.length > 0) {
    return {
      snapshot: await getDirectoryOwnershipSnapshot(path, trackedFiles, cwd),
      scope: {
        kind: "directory",
        label: `Target directory: ${path} (${trackedFiles.length} tracked file${trackedFiles.length === 1 ? "" : "s"})`,
        ownershipLabel: "Directory ownership",
        primaryOwnerLabel: "Primary directory owner",
        unitLabel: "blamed line",
        totalUnitLabel: "blamed lines",
        summary: "Directory collaborator ownership context ready.",
      },
    };
  }

  return {
    snapshot: await getFileOwnershipSnapshot(path, cwd),
    scope: {
      kind: "file",
      label: `Target file: ${path}`,
      ownershipLabel: "File ownership",
      primaryOwnerLabel: "Primary file owner",
      unitLabel: "blamed line",
      totalUnitLabel: "blamed lines",
      summary: "File collaborator ownership context ready.",
    },
  };
}

function buildOwnershipSummary(
  snapshot: LocalOwnershipSnapshot,
  unitLabel: string,
): string {
  if (snapshot.owners.length === 0) {
    return "Local ownership unavailable";
  }

  return snapshot.owners
    .slice(0, 3)
    .map((owner) => `${owner.author} ${owner.share}% (${owner.commits} ${unitLabel}${owner.commits === 1 ? "" : "s"})`)
    .join(", ");
}

export async function runWho(
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
  options: WhoScopeOptions = {},
): Promise<void> {
  const hosted = await getHostedContext(cwd, "auto");
  const resolvedScope = options.file
    ? await resolvePathOwnershipSnapshot(options.file, cwd)
    : {
        snapshot: await getLocalOwnershipSnapshot(cwd),
        scope: {
          kind: "repository" as const,
          label: "Target scope: repository",
          ownershipLabel: "Local ownership",
          primaryOwnerLabel: "Primary owner",
          unitLabel: "commit",
          totalUnitLabel: "local commits",
          summary: "Collaborator ownership context ready.",
        },
      };
  const localOwnership = resolvedScope.snapshot;
  const topOwner = localOwnership.owners[0];
  const sharedOwnership = localOwnership.owners.length > 1;
  const activeCollaborators = Array.from(
    new Set([
      ...localOwnership.activeAuthors,
      ...hosted.recentPullRequestAuthors,
    ]),
  );

  const risk = sharedOwnership || activeCollaborators.length > 1 ? "medium" : "low";
  const recommendation = topOwner
    ? sharedOwnership
      ? `Coordinate with ${topOwner.author} and other active contributors before changing shared behavior.`
      : `Primary ownership appears concentrated with ${topOwner.author}; confirm intent before broad changes.`
    : hosted.remoteAvailable
      ? "Use hosted context to identify active collaborators before changing shared areas."
      : "Ownership signals are thin; inspect recent history before changing shared areas.";

  const ownershipLabel = resolvedScope.scope.ownershipLabel;
  const primaryOwnerLabel = resolvedScope.scope.primaryOwnerLabel;
  const scopeLabel = resolvedScope.scope.label;
  const ownershipUnitLabel = resolvedScope.scope.unitLabel;
  const ownershipTotalUnitLabel = resolvedScope.scope.totalUnitLabel;

  const detail = [
    `Provider: ${hosted.provider}`,
    `Remote available: ${hosted.remoteAvailable}`,
    scopeLabel,
    `${ownershipLabel}: ${buildOwnershipSummary(localOwnership, ownershipUnitLabel)}`,
    topOwner
      ? `${primaryOwnerLabel}: ${topOwner.author} (${topOwner.share}% of ${localOwnership.totalCommits} ${ownershipTotalUnitLabel})`
      : `${primaryOwnerLabel}: unavailable`,
    activeCollaborators.length > 0
      ? `Active collaborators: ${activeCollaborators.join(", ")}`
      : "Active collaborators: unavailable",
    hosted.repository.nameWithOwner
      ? `Repository: ${hosted.repository.nameWithOwner}`
      : "Repository: unavailable",
    hosted.repository.defaultBranch
      ? `Default branch: ${hosted.repository.defaultBranch}`
      : "Default branch: unavailable",
    hosted.pullRequest.title
      ? `Current PR: #${hosted.pullRequest.number ?? "?"} ${hosted.pullRequest.title}`
      : "Current PR: unavailable",
    hosted.recentPullRequestAuthors.length > 0
      ? `Recent PR authors: ${hosted.recentPullRequestAuthors.join(", ")}`
      : "Recent PR authors: unavailable",
  ];

  writeOutput({
    summary: resolvedScope.scope.summary,
    risk,
    recommendation,
    detail,
    hostedContextSource: hosted.remoteAvailable ? "mixed" : "local",
    degradedMode: !hosted.remoteAvailable,
  }, writer);
}
