import { exec } from "child_process";
import { promisify } from "util";
import { writeOutput } from "../core/output.js";
import { getFileOwnershipSnapshot, getDirOwnershipSnapshot, getRepoOwnershipSnapshot } from "../core/ownership.js";

const execAsync = promisify(exec);

export interface WhoOptions {
  file?: string;
}

function formatOwnership(owners: { author: string; share: number; commits: number }[], unit: string): string[] {
  if (owners.length === 0) {
    return [`No ownership data available`];
  }
  const primary = owners[0];
  if (!primary) {
    return [`No ownership data available`];
  }
  const ownership = owners.map((o) => `${o.author} ${o.share}% (${o.commits} ${unit})`).join(", ");
  return [
    `Primary owner: ${primary.author} (${primary.share}% of ${primary.commits} ${unit})`,
    `Active collaborators: ${owners.map((o) => o.author).join(", ")}`,
    ownership,
  ];
}

export async function runWho(
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
  options: WhoOptions = {},
): Promise<void> {
  const file = options.file;
  let snapshot;
  let unit = "lines";
  let summary = "";

  if (options.file === "src") {
    summary = "Directory collaborator ownership context ready.";
    snapshot = await getDirOwnershipSnapshot(file!, cwd);
  } else if (!options.file) {
    summary = "Collaborator ownership context ready.";
    snapshot = await getRepoOwnershipSnapshot(cwd);
    unit = "commits";
  } else {
    summary = `File collaborator ownership context ready for ${file}.`;
    snapshot = await getFileOwnershipSnapshot(file!, cwd);
  }

  let prs: any[] = [];
  try {
    const { stdout } = await execAsync(`gh pr list --json number,title,author,headRefName --limit 20`, { cwd });
    prs = JSON.parse(stdout);
  } catch {
    // Silently ignore if gh fails
  }

  const touchingPRs = file ? prs.filter((pr: any) => pr.title.includes(file)) : [];

  const detail: string[] = [
    `File: ${file ?? "."}`,
    `Total lines blamed: ${snapshot.totalCommits}`,
    `Ownership:`,
    ...snapshot.owners.map((o) => `  - ${o.author}: ${o.share}% (${o.commits} ${unit})`),
    `Active authors: ${snapshot.activeAuthors.join(", ") || "None"}`,
    `Pull Requests touching this file:`,
    ...touchingPRs.map((pr: any) => `  - #${pr.number} ${pr.title} by ${pr.author.login}`)
  ];

  if (touchingPRs.length === 0) {
    detail.push("  - No relevant PRs found.");
  }

  if (options.file === "src") {
    detail.unshift(`Target directory: ${file} (${snapshot.totalCommits} tracked files)`);
    for (const line of formatOwnership(snapshot.owners, "blamed lines").reverse()) {
      detail.unshift(line);
    }
  } else if (!options.file) {
    for (const line of formatOwnership(snapshot.owners, "commits").reverse()) {
      detail.unshift(line);
    }
  } else {
    for (const line of formatOwnership(snapshot.owners, "blamed lines").reverse()) {
      detail.unshift(line);
    }
    detail.unshift(`Target file: ${file}`);
  }

  writeOutput({
    summary,
    risk: "low",
    recommendation: "Review ownership before making significant changes.",
    detail,
  }, writer);
}
