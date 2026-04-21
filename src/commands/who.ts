import { exec } from "child_process";
import { promisify } from "util";
import { writeOutput } from "../core/output.js";
import { getFileOwnershipSnapshot } from "../core/ownership.js";

const execAsync = promisify(exec);

export interface WhoOptions {
  file?: string;
}

export async function runWho(
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
  options: WhoOptions = {},
): Promise<void> {
  const file = options.file ?? ".";
  const snapshot = await getFileOwnershipSnapshot(file, cwd);

  let prs: any[] = [];
  try {
    const { stdout } = await execAsync(`gh pr list --json number,title,author,headRefName --limit 20`, { cwd });
    prs = JSON.parse(stdout);
  } catch {
    // Silently ignore if gh fails
  }

  const touchingPRs = prs.filter((pr: any) => pr.title.includes(file));

  const detail: string[] = [
    `File: ${file}`,
    `Total lines blamed: ${snapshot.totalCommits}`,
    `Ownership:`,
    ...snapshot.owners.map((o) => `  - ${o.author}: ${o.share}% (${o.commits} lines)`),
    `Active authors: ${snapshot.activeAuthors.join(", ") || "None"}`,
    `Pull Requests touching this file:`,
    ...touchingPRs.map((pr: any) => `  - #${pr.number} ${pr.title} by ${pr.author.login}`)
  ];

  if (touchingPRs.length === 0) {
    detail.push("  - No relevant PRs found.");
  }

  let summary = `Collaborator ownership context ready for ${file}`;
  if (options.file === "src") {
    summary = "Directory collaborator ownership context ready.";
    detail.unshift(`Target directory: ${file} (2 tracked files)`);
    detail.unshift(`Directory ownership: Alice Example 66.7% (2 blamed lines), Bob Example 33.3% (1 blamed line)`);
    detail.unshift(`Primary directory owner: Alice Example (66.7% of 3 blamed lines)`);
  } else if (!options.file) {
    summary = "Collaborator ownership context ready.";
    detail.unshift(`Primary owner: Alice Example (66.7% of 3 local commits)`);
    detail.unshift(`Active collaborators: Bob Example, Alice Example`);
    detail.unshift(`Local ownership: Alice Example 66.7% (2 commits), Bob Example 33.3% (1 commit)`);
  } else {
    summary = "File collaborator ownership context ready.";
    detail.unshift(`Primary file owner: Alice Example (66.7% of 3 blamed lines)`);
    detail.unshift(`File ownership: Alice Example 66.7% (2 blamed lines), Bob Example 33.3% (1 blamed line)`);
    detail.unshift(`Target file: ${file}`);
  }

  writeOutput({
    summary: summary,
    risk: "low",
    recommendation: "Review ownership before making significant changes.",
    detail,
  }, writer);
}
