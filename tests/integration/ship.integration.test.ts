import { describe, it, expect, vi, beforeEach } from "vitest";
import { runShip } from "../../src/commands/ship.js";
import * as resolver from "../../src/core/resolver.js";
import * as git from "../../src/core/git.js";
import { createRepoHarness } from "../helpers/repoHarness.js";
import fs from "fs/promises";
import path from "path";

vi.mock("../../src/core/git.js", async () => {
  const actual = await vi.importActual("../../src/core/git.js");
  return {
    ...actual,
    runGit: vi.fn(),
    getRemoteUrl: vi.fn(),
  };
});

describe("ship integration", () => {
  let cwd: string;

  beforeEach(async () => {
    const harness = await createRepoHarness();
    cwd = harness.cwd;
  });

  it("should run full delivery pipeline successfully", async () => {
    vi.mocked(git.getRemoteUrl).mockResolvedValue(
      "git@github.com:user/repo.git",
    );
    vi.mocked(git.runGit).mockImplementation(async (args) => {
      if (args[0] === "push")
        return { exitCode: 0, stdout: "pushed", stderr: "" };
      if (args[0] === "gh")
        return { exitCode: 0, stdout: "success", stderr: "" };
      return { exitCode: 0, stdout: "", stderr: "" };
    });

    vi.spyOn(resolver, "buildCheckPlan").mockResolvedValue({
      risk: "none",
      summary: "all good",
    });
    vi.spyOn(resolver, "buildFixPlan").mockResolvedValue({
      risk: "none",
      summary: "no fixes needed",
    });

    const run = await runShip(cwd);
    expect(run.status).toBe("completed");
    expect(run.steps.map((s) => s.name)).toEqual([
      "check",
      "fix",
      "push",
      "pr",
      "merge",
    ]);
    expect(run.steps.every((s) => s.status === "completed")).toBe(true);
  });

  it("should fail when check step fails", async () => {
    vi.spyOn(resolver, "buildCheckPlan").mockResolvedValue({
      risk: "high",
      summary: "conflict detected",
    });

    await expect(runShip(cwd)).rejects.toThrow();

    // Check status via workflow journal
    const journalPath = path.join(cwd, ".sanegit", "workflow-journal.json");
    const journal = JSON.parse(await fs.readFile(journalPath, "utf8"));
    const run = Object.values(journal.runs)[0] as any;
    expect(run.status).toBe("failed");
    expect(run.steps.find((s: any) => s.name === "check")?.status).toBe(
      "failed",
    );
  });
});
