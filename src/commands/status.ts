import { getRepositorySnapshot } from "../core/repositorySnapshot.js";
import { writeOutput } from "../core/output.js";
import { logEvent } from "../core/telemetry.js";

export async function runStatus(cwd: string = process.cwd()): Promise<void> {
  const snapshot = await getRepositorySnapshot(cwd);

  const risk = snapshot.hasConflicts
    ? "high"
    : snapshot.behind > 0
      ? "medium"
      : "low";
  const recommendation = snapshot.hasConflicts
    ? "Resolve conflicts before commit or push."
    : snapshot.behind > 0
      ? "Sync with origin/main before risky operations."
      : "Repository looks healthy. Continue with planned changes.";

  writeOutput({
    summary: `Branch ${snapshot.branch}: ${snapshot.staged} staged, ${snapshot.unstaged} unstaged, ${snapshot.untracked} untracked changes.`,
    risk,
    recommendation,
    detail: [
      `Ahead of origin/main by ${snapshot.ahead} commit(s).`,
      `Behind origin/main by ${snapshot.behind} commit(s).`,
      `Conflicts detected: ${snapshot.hasConflicts ? "yes" : "no"}.`,
    ],
  });

  await logEvent({ command: "status", outcome: "success", risk });
}
