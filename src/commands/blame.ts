import { runGit } from "../core/git.js";
import { getHostedContext } from "../core/hostedContext.js";
import { writeOutput } from "../core/output.js";

export interface ParsedBlameLine {
  commit: string;
  author: string;
  summary: string;
  lineText: string;
}

export function parseBlamePorcelain(output: string): ParsedBlameLine | undefined {
  const trimmed = output.trim();
  if (!trimmed) {
    return undefined;
  }

  const lines = trimmed.split("\n");
  const header = lines[0]?.split(" ")[0]?.trim() ?? "";
  const author =
    lines.find((line) => line.startsWith("author "))?.slice("author ".length) ??
    "unknown";
  const summary =
    lines.find((line) => line.startsWith("summary "))?.slice("summary ".length) ??
    "Change reason unavailable";
  const lineText = lines.find((line) => line.startsWith("\t"))?.slice(1) ?? "";

  return {
    commit: header,
    author,
    summary,
    lineText,
  };
}

export function buildBlameRationale(
  parsed: ParsedBlameLine,
  commitBody: string,
): string {
  const normalizedBody = commitBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

  if (normalizedBody.length > 0) {
    return `${parsed.author} likely introduced this line while ${normalizedBody}`;
  }

  return `${parsed.author} likely introduced this line as part of: ${parsed.summary}`;
}

export async function runBlameExplain(
  filePath: string,
  line: number,
  cwd: string = process.cwd(),
  writer: (text: string) => void = process.stdout.write.bind(process.stdout),
): Promise<void> {
  const blame = await runGit(
    ["blame", "--line-porcelain", "-L", `${line},${line}`, filePath],
    cwd,
  );
  const hosted = await getHostedContext(cwd, "auto");

  if (blame.exitCode !== 0) {
    writeOutput(
      {
        summary: "Unable to prepare blame explanation.",
        risk: "medium",
        recommendation: "Check that the file and line exist in the current repository state.",
        detail: [
          `Target: ${filePath}:${line}`,
          blame.stderr.trim() || blame.stdout.trim() || "Blame output unavailable",
        ],
        hostedContextSource: hosted.remoteAvailable ? "mixed" : "local",
        degradedMode: true,
      },
      writer,
    );
    return;
  }

  const parsed = parseBlamePorcelain(blame.stdout);
  const commitDetails = parsed
    ? await runGit(["show", "-s", "--format=%s%n%b", parsed.commit], cwd)
    : undefined;
  const rationale =
    parsed && commitDetails
      ? buildBlameRationale(parsed, commitDetails.stdout)
      : "Historical rationale unavailable.";
  const collaboratorHint =
    parsed && hosted.recentPullRequestAuthors.includes(parsed.author)
      ? `${parsed.author} is active in recent pull requests; coordinate before changing this behavior.`
      : "Coordinate with the original author or reviewer before changing this behavior.";

  writeOutput(
    {
      summary: "Blame explanation prepared.",
      risk: "low",
      recommendation: collaboratorHint,
      detail: parsed
        ? [
            `Target: ${filePath}:${line}`,
            `Author: ${parsed.author}`,
            `Commit: ${parsed.commit}`,
            `Intent: ${parsed.summary}`,
            `Line: ${parsed.lineText || "Unavailable"}`,
            `Rationale: ${rationale}`,
            hosted.pullRequest.title
              ? `Related PR context: ${hosted.pullRequest.title}`
              : "Related PR context unavailable",
          ]
        : [
            `Target: ${filePath}:${line}`,
            "Historical rationale unavailable.",
          ],
      hostedContextSource: hosted.remoteAvailable ? "mixed" : "local",
      degradedMode: false,
    },
    writer,
  );
}
