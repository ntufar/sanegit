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
