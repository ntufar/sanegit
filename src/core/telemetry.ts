import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export interface TelemetryEvent {
  command: string;
  outcome: "success" | "failure" | "degraded";
  detail?: string;
  risk?: string;
  timestamp?: string;
}

export interface WorkflowAuditEvent {
  workflowId: string;
  step: string;
  status: "running" | "completed" | "failed";
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

export async function logWorkflowEvent(
  command: string,
  workflow: WorkflowAuditEvent,
  cwd: string = process.cwd(),
): Promise<void> {
  await logEvent(
    {
      command,
      outcome: workflow.status === "failed" ? "failure" : "success",
      detail: `workflow:${workflow.workflowId}:${workflow.step}:${workflow.status}`,
    },
    cwd,
  );
}
