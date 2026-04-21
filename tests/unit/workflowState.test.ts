import { describe, expect, it } from "vitest";
import {
  checkpointWorkflowRun,
  completeWorkflowRun,
  getWorkflowRun,
  startWorkflowRun,
} from "../../src/core/workflowState.js";
import { createRepoHarness } from "../helpers/repoHarness.js";

describe("workflow state", () => {
  it("creates checkpoints and completes runs", async () => {
    const harness = await createRepoHarness();
    const run = await startWorkflowRun("ship", ["preflight"], harness.cwd);
    await checkpointWorkflowRun(run.id, "preflight", "completed", "ok", harness.cwd);
    await completeWorkflowRun(run.id, harness.cwd);

    const stored = await getWorkflowRun(run.id, harness.cwd);
    expect(stored?.status).toBe("completed");
  });
});
