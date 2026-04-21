import { summarizeHunks } from "../core/hunkSummarizer.js";
import { writeOutput } from "../core/output.js";

export interface SplitGroup {
  label: string;
  files: string[];
}

export async function runSplit(cwd: string = process.cwd()): Promise<SplitGroup[]> {
  const groups = await summarizeHunks(cwd);
  
  const mappedGroups = groups.map((g) => ({
    label: g.summary,
    files: g.files,
  }));

  writeOutput({
    summary: mappedGroups.length > 0 ? `Proposed ${mappedGroups.length} commit group(s) based on AI analysis.` : "No staged changes to split.",
    risk: mappedGroups.length > 0 ? "low" : "none",
    recommendation:
      mappedGroups.length > 0
        ? "Review proposed groups and confirm commit sequence."
        : "Stage changes first, then run sg split.",
    detail: mappedGroups.length > 0 ? mappedGroups.map((group) => `${group.label}: ${group.files.join(", ")}`) : ["No staged files found."],
    degradedMode: false,
  });

  return mappedGroups;
}
