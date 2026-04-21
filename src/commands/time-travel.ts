import { runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";

interface ResolvedTimeReference {
  gitReference: string;
  normalizedInput: string;
  viaNaturalLanguage: boolean;
}

export function resolveTimeTravelReference(input: string): ResolvedTimeReference {
  const normalized = input.trim();
  const lower = normalized.toLowerCase();

  const commitsAgoMatch = lower.match(/^(\d+)\s+commits?\s+ago$/);
  if (commitsAgoMatch) {
    const commits = Number.parseInt(commitsAgoMatch[1] ?? "0", 10);
    const offset = Number.isNaN(commits) ? 0 : Math.max(0, commits);
    return {
      gitReference: offset === 0 ? "HEAD" : `HEAD~${offset}`,
      normalizedInput: normalized,
      viaNaturalLanguage: true,
    };
  }

  const daysAgoMatch = lower.match(/^(\d+)\s+days?\s+ago$/);
  if (daysAgoMatch) {
    const days = Number.parseInt(daysAgoMatch[1] ?? "0", 10);
    const offset = Number.isNaN(days) ? 0 : Math.max(0, days);
    return {
      gitReference: offset === 0 ? "HEAD" : `HEAD@{${offset} days ago}`,
      normalizedInput: normalized,
      viaNaturalLanguage: true,
    };
  }

  if (lower === "yesterday") {
    return {
      gitReference: "HEAD@{yesterday}",
      normalizedInput: normalized,
      viaNaturalLanguage: true,
    };
  }

  if (lower === "last week") {
    return {
      gitReference: "HEAD@{1 week ago}",
      normalizedInput: normalized,
      viaNaturalLanguage: true,
    };
  }

  if (lower === "last commit" || lower === "previous commit") {
    return {
      gitReference: "HEAD~1",
      normalizedInput: normalized,
      viaNaturalLanguage: true,
    };
  }

  return {
    gitReference: normalized,
    normalizedInput: normalized,
    viaNaturalLanguage: false,
  };
}

export async function runTimeTravel(
  reference: string,
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
): Promise<void> {
  const resolved = resolveTimeTravelReference(reference);
  const rev = await runGit(["rev-parse", "--verify", resolved.gitReference], cwd, { throw: false });
  if (rev.exitCode !== 0) {
    writeOutput({
      summary: "Unable to resolve requested historical reference.",
      risk: "medium",
      recommendation: "Use a valid commit, tag, or branch reference.",
      detail: [
        `Input: ${resolved.normalizedInput}`,
        `Resolved reference: ${resolved.gitReference}`,
        rev.stderr || rev.stdout || `Reference not found: ${resolved.gitReference}`,
      ],
    }, writer);
    return;
  }

  const shortSha = rev.stdout.trim().slice(0, 12);

  writeOutput({
    summary: "Historical reference resolved.",
    risk: "low",
    recommendation:
      "Create an exploration branch from this reference before modifying files.",
    detail: [
      `Input: ${resolved.normalizedInput}`,
      `Reference ${resolved.gitReference} => ${rev.stdout.trim()}`,
      resolved.viaNaturalLanguage
        ? `Natural-language mapping applied. Suggested branch: time-travel/${shortSha}`
        : `Suggested branch: time-travel/${shortSha}`,
    ],
  }, writer);
}
