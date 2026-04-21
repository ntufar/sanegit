import { runGit } from "../core/git.js";
import { writeOutput } from "../core/output.js";

export async function runTimeTravel(
  reference: string,
  cwd: string = process.cwd(),
): Promise<void> {
  const rev = await runGit(["rev-parse", "--verify", reference], cwd);
  if (rev.exitCode !== 0) {
    writeOutput({
      summary: "Unable to resolve requested historical reference.",
      risk: "medium",
      recommendation: "Use a valid commit, tag, or branch reference.",
      detail: [rev.stderr || rev.stdout || `Reference not found: ${reference}`],
    });
    return;
  }

  writeOutput({
    summary: "Historical reference resolved.",
    risk: "low",
    recommendation:
      "Create an exploration branch from this reference before modifying files.",
    detail: [`Reference ${reference} => ${rev.stdout.trim()}`],
  });
}
