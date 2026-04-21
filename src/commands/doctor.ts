import { getRepositorySnapshot } from "../core/repositorySnapshot.js";
import { writeOutput } from "../core/output.js";

export async function runDoctor(cwd: string = process.cwd()): Promise<void> {
  const snapshot = await getRepositorySnapshot(cwd);
  const issues: string[] = [];

  if (snapshot.hasConflicts) {
    issues.push("Conflicts detected in working tree.");
  }
  if (snapshot.behind > 0) {
    issues.push(`Branch behind main by ${snapshot.behind} commit(s).`);
  }
  if (snapshot.untracked > 20) {
    issues.push("High untracked-file count may indicate hygiene drift.");
  }

  writeOutput({
    summary:
      issues.length > 0
        ? `Doctor found ${issues.length} health risk(s).`
        : "Doctor found no major repository health risks.",
    risk: issues.length > 0 ? "medium" : "low",
    recommendation:
      issues.length > 0
        ? "Address top risks in order of potential delivery impact."
        : "Maintain current hygiene and continue planned work.",
    detail: issues.length > 0 ? issues : ["No major health risks detected."],
  });
}
