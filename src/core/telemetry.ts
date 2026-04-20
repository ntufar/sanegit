import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export interface TelemetryEvent {
  command: string;
  outcome: "success" | "failure" | "degraded";
  detail?: string;
  risk?: string;
  timestamp?: string;
}

export function redactSecrets(text: string): string {
  return text
    .replace(/(api[_-]?key\s*[=:]\s*)([^\s]+)/gi, "$1[REDACTED]")
    .replace(/(authorization:\s*bearer\s+)([^\s]+)/gi, "$1[REDACTED]");
}

export async function logEvent(
  event: TelemetryEvent,
  cwd: string = process.cwd(),
): Promise<void> {
  const dir = join(cwd, ".sanegit");
  await mkdir(dir, { recursive: true });
  const line = JSON.stringify({
    ...event,
    detail: event.detail ? redactSecrets(event.detail) : undefined,
    timestamp: event.timestamp ?? new Date().toISOString(),
  });
  await appendFile(join(dir, "audit.log"), `${line}\n`, "utf8");
}
