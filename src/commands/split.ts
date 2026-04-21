import { buildCommitPlan } from "../core/commitPlanner.js";
import { writeOutput } from "../core/output.js";

export interface SplitGroup {
  label: string;
  files: string[];
}

export async function runSplit(cwd: string = process.cwd()): Promise<SplitGroup[]> {
  const plan = await buildCommitPlan(cwd);
  const groups = plan.includedFiles.map((file) => ({
    label: `group:${file}`,
    files: [file],
  }));

  writeOutput({
    summary: groups.length > 0 ? `Proposed ${groups.length} commit group(s).` : "No staged changes to split.",
    risk: groups.length > 0 ? "low" : "none",
    recommendation:
      groups.length > 0
        ? "Review proposed groups and confirm commit sequence."
        : "Stage changes first, then run sg split.",
    detail: groups.length > 0 ? groups.map((group) => `${group.label}: ${group.files.join(", ")}`) : ["No staged files found."],
    degradedMode: plan.degradedMode,
  });

  return groups;
}
