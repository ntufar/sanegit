import { runGit } from "./git.js";

export interface OwnershipEntry {
  author: string;
  email?: string;
  commits: number;
  share: number;
}

export interface OwnershipSnapshot {
  totalCommits: number;
  owners: OwnershipEntry[];
  activeAuthors: string[];
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

export async function getFileOwnershipSnapshot(
  filePath: string,
  cwd: string = process.cwd(),
): Promise<OwnershipSnapshot> {
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

export async function getDirOwnershipSnapshot(
  dirPath: string = "src",
  cwd: string = process.cwd(),
): Promise<OwnershipSnapshot> {
  const trackedFiles = await runGit(["ls-files", dirPath], cwd);
  const files = trackedFiles.exitCode === 0
    ? trackedFiles.stdout.split("\n").map((f) => f.trim()).filter(Boolean)
    : [];

  const blameOwners = new Map<string, { commits: number; email?: string }>();
  const recentAuthors = new Set<string>();

  for (const file of files) {
    const blame = await runGit(["blame", "--line-porcelain", file], cwd, { throw: false });
    if (blame.exitCode === 0) {
      const fileOwners = parseBlameOwnership(blame.stdout);
      for (const owner of fileOwners) {
        const existing = blameOwners.get(owner.author);
        blameOwners.set(owner.author, {
          commits: (existing?.commits ?? 0) + owner.commits,
          ...(owner.email ? { email: owner.email } : existing?.email ? { email: existing.email } : {}),
        });
      }
    }

    const log = await runGit(["log", "--since=90.days", "--format=%aN", "--", file], cwd, { throw: false });
    if (log.exitCode === 0) {
      for (const author of log.stdout.split("\n").map((a) => a.trim()).filter(Boolean)) {
        recentAuthors.add(author);
      }
    }
  }

  const totalCommits = Array.from(blameOwners.values()).reduce((sum, o) => sum + o.commits, 0);
  const owners: OwnershipEntry[] = Array.from(blameOwners.entries())
    .map(([author, data]) => ({
      author,
      ...(data.email ? { email: data.email } : {}),
      commits: data.commits,
      share: totalCommits > 0 ? Number(((data.commits / totalCommits) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.commits - a.commits || a.author.localeCompare(b.author));

  return {
    totalCommits,
    owners,
    activeAuthors: Array.from(recentAuthors).slice(0, 5),
  };
}

export async function getRepoOwnershipSnapshot(
  cwd: string = process.cwd(),
): Promise<OwnershipSnapshot> {
  const log = await runGit(["log", "--since=90.days", "--format=%aN %aE", "--all"], cwd);
  const authorCounts = new Map<string, { commits: number; email?: string }>();

  if (log.exitCode === 0) {
    for (const line of log.stdout.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const parts = line.split(" ");
      const email = parts[parts.length - 1];
      const author = parts.slice(0, -1).join(" ");
      if (author) {
        const existing = authorCounts.get(author);
        authorCounts.set(author, {
          commits: (existing?.commits ?? 0) + 1,
          ...(email !== author ? { email } : {}),
        });
      }
    }
  }

  const totalCommits = Array.from(authorCounts.values()).reduce((sum, o) => sum + o.commits, 0);
  const owners: OwnershipEntry[] = Array.from(authorCounts.entries())
    .map(([author, data]) => ({
      author,
      ...(data.email ? { email: data.email } : {}),
      commits: data.commits,
      share: totalCommits > 0 ? Number(((data.commits / totalCommits) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.commits - a.commits || a.author.localeCompare(b.author));

  const recentAuthors = await runGit(["log", "--since=90.days", "--format=%aN", "--all"], cwd, { throw: false });
  const activeAuthors = recentAuthors.exitCode === 0
    ? Array.from(new Set(recentAuthors.stdout.split("\n").map((a) => a.trim()).filter(Boolean))).slice(0, 5)
    : [];

  return {
    totalCommits,
    owners,
    activeAuthors,
  };
}
