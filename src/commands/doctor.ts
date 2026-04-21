import { getRepositorySnapshot } from "../core/repositorySnapshot.js";
import { writeOutput } from "../core/output.js";

type DoctorRisk = "low" | "medium" | "high" | "critical";

export interface DoctorFinding {
  risk: DoctorRisk;
  title: string;
  recommendation: string;
}

const RISK_ORDER: Record<DoctorRisk, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function collectDoctorFindings(
  snapshot: Awaited<ReturnType<typeof getRepositorySnapshot>>,
): DoctorFinding[] {
  const findings: DoctorFinding[] = [];

  if (!snapshot.hasCommits) {
    findings.push({
      risk: "medium",
      title: "Repository has no commits yet.",
      recommendation: "Create an initial commit before relying on recovery or blame workflows.",
    });
  }

  if (snapshot.detachedHead) {
    findings.push({
      risk: "critical",
      title: "Repository is in detached HEAD state.",
      recommendation: "Create or switch to a branch before making additional commits.",
    });
  }

  if (snapshot.hasConflicts) {
    findings.push({
      risk: "high",
      title: "Conflicts detected in working tree.",
      recommendation: "Resolve conflicts before running delivery or recovery commands.",
    });
  }

  if (snapshot.behind > 0) {
    findings.push({
      risk: snapshot.behind >= 5 ? "high" : "medium",
      title: `Branch behind main by ${snapshot.behind} commit(s).`,
      recommendation: "Sync with the default branch before shipping or splitting changes.",
    });
  }

  if (snapshot.untracked >= 20) {
    findings.push({
      risk: "medium",
      title: "High untracked-file count may indicate hygiene drift.",
      recommendation: "Review ignored files and clean generated artifacts before committing.",
    });
  }

  if (snapshot.staged + snapshot.unstaged >= 40) {
    findings.push({
      risk: "medium",
      title: "Large working tree may hide unrelated changes.",
      recommendation: "Split or stash work to reduce review and recovery risk.",
    });
  }

  if (snapshot.looseObjects >= 200) {
    findings.push({
      risk: "low",
      title: `Repository has ${snapshot.looseObjects} loose git objects.`,
      recommendation: "Run git gc during a quiet period if repository performance feels degraded.",
    });
  }

  return findings.sort((left, right) => RISK_ORDER[right.risk] - RISK_ORDER[left.risk]);
}

export async function runDoctor(
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
): Promise<void> {
  const snapshot = await getRepositorySnapshot(cwd);
  const findings = collectDoctorFindings(snapshot);
  const highestRisk = findings[0]?.risk ?? "low";

  writeOutput({
    summary:
      findings.length > 0
        ? `Doctor found ${findings.length} prioritized health finding(s).`
        : "Doctor found no major repository health risks.",
    risk: highestRisk,
    recommendation:
      findings.length > 0
        ? "Address top risks in order of potential delivery impact."
        : "Maintain current hygiene and continue planned work.",
    detail:
      findings.length > 0
        ? findings.map(
            (finding) =>
              `[${finding.risk}] ${finding.title} Recommendation: ${finding.recommendation}`,
          )
        : [
            `Branch: ${snapshot.branch}`,
            `Ahead/behind: +${snapshot.ahead} / -${snapshot.behind}`,
            `Loose objects: ${snapshot.looseObjects}`,
            "No major health risks detected.",
          ],
  }, writer);
}
