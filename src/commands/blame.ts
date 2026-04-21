import { runGit } from "../core/git.js";
import { getHostedContext } from "../core/hostedContext.js";
import { writeOutput } from "../core/output.js";

export async function runBlameExplain(
  filePath: string,
  line: number,
  cwd: string = process.cwd(),
): Promise<void> {
  const blame = await runGit(["blame", "-L", `${line},${line}`, filePath], cwd);
  const hosted = await getHostedContext(cwd, "auto");

  writeOutput({
    summary: "Blame explanation prepared.",
    risk: "low",
    recommendation:
      "Use this context to coordinate with the original change author before modifying behavior.",
    detail: [
      `Target: ${filePath}:${line}`,
      `Blame: ${blame.stdout.trim() || "Unavailable"}`,
      hosted.pullRequest.title
        ? `Related PR context: ${hosted.pullRequest.title}`
        : "Related PR context unavailable",
    ],
    hostedContextSource: hosted.remoteAvailable ? "mixed" : "local",
    degradedMode: blame.exitCode !== 0,
  });
}
