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
      recommendation: "proceed with ship",
      detail: [],
    });
    vi.spyOn(resolver, "buildFixPlan").mockResolvedValue({
      risk: "none",
      summary: "no fixes needed",
      recommendation: "proceed with ship",
      detail: [],
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
      recommendation: "resolve conflicts before proceeding",
      detail: ["Conflicted: file.ts"],
    });

    let errorThrown = false;
    try {
      await runShip(cwd);
    } catch (error) {
      errorThrown = true;
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("Check failed");
    }
    expect(errorThrown).toBe(true);

    // Check status via workflow journal
    const journalPath = path.join(cwd, ".sanegit", "workflows.json");
    const journal = JSON.parse(await fs.readFile(journalPath, "utf8"));
    const runs = Object.values(journal.runs) as any[];
    // Get the most recent run
    const run = runs
      .filter((r: any) => r.command === "ship")
      .sort((a: any, b: any) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0];
    expect(run).toBeDefined();
    expect(run.status).toBe("failed");
    expect(run.steps.find((s: any) => s.name === "check")?.status).toBe(
      "failed",
    );
  });

  it("emits workflow checkpoint updates within cadence budget", async () => {
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
      recommendation: "proceed with ship",
      detail: [],
    });
    vi.spyOn(resolver, "buildFixPlan").mockResolvedValue({
      risk: "none",
      summary: "no fixes needed",
      recommendation: "proceed with ship",
      detail: [],
    });

    await runShip(cwd);

    const journalPath = path.join(cwd, ".sanegit", "workflows.json");
    const journal = JSON.parse(await fs.readFile(journalPath, "utf8"));
    const run = Object.values(journal.runs).find(
      (entry: any) => entry.command === "ship",
    );
    expect(run).toBeDefined();
    if (!run) {
      return;
    }
    for (let index = 1; index < (run as any).steps.length; index += 1) {
      const prev = Date.parse(
        (run as any).steps[index - 1]?.at ?? (run as any).startedAt,
      );
      const current = Date.parse(
        (run as any).steps[index]?.at ?? (run as any).updatedAt,
      );
      expect(current - prev).toBeLessThanOrEqual(10_000);
    }
  });
});
