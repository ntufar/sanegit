import { getHostedContext } from "../core/hostedContext.js";
import { writeOutput } from "../core/output.js";

export async function runWho(cwd: string = process.cwd()): Promise<void> {
  const hosted = await getHostedContext(cwd, "auto");
  const detail = [
    `Provider: ${hosted.provider}`,
    `Remote available: ${hosted.remoteAvailable}`,
    hosted.pullRequest.title
      ? `Current PR: #${hosted.pullRequest.number ?? "?"} ${hosted.pullRequest.title}`
      : "Current PR: unavailable",
  ];

  writeOutput({
    summary: "Collaborator ownership context ready.",
    risk: hosted.remoteAvailable ? "low" : "medium",
    recommendation: hosted.remoteAvailable
      ? "Coordinate with active collaborators before touching shared files."
      : "Remote context unavailable; rely on local history for ownership signals.",
    detail,
    hostedContextSource: hosted.remoteAvailable ? "remote" : "local",
    degradedMode: !hosted.remoteAvailable,
  });
}
