import { getHostedContext } from "../core/hostedContext.js";
import { writeOutput } from "../core/output.js";

export async function runQueueTeam(cwd: string = process.cwd()): Promise<void> {
  const hosted = await getHostedContext(cwd, "auto");

  writeOutput({
    summary: "Merge queue visibility prepared.",
    risk: hosted.mergeQueue.risky ? "high" : "low",
    recommendation: hosted.mergeQueue.risky
      ? "Delay queueing or reduce scope to lower expected conflict risk."
      : "Queue appears healthy for current branch state.",
    detail: [
      `Provider: ${hosted.provider}`,
      `Queue supported: ${hosted.mergeQueue.supported}`,
      hosted.mergeQueue.summary,
    ],
    hostedContextSource: hosted.remoteAvailable ? "remote" : "local",
    degradedMode: !hosted.remoteAvailable,
  });
}
