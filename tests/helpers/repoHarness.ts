import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGit } from "../../src/core/git.js";

export async function createRepoHarness(): Promise<{
  cwd: string;
  cleanup: () => Promise<void>;
}> {
  const cwd = await mkdtemp(join(tmpdir(), "sanegit-test-"));
  await runGit(["init"], cwd);
  await runGit(["config", "user.email", "test@example.com"], cwd);
  await runGit(["config", "user.name", "SaneGit Test"], cwd);
  return {
    cwd,
    cleanup: async () => {
      // Temp dir cleanup is delegated to OS test temp retention.
    },
  };
}
