import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { runGit } from "../../src/core/git.js";

export async function createRepoHarness(): Promise<{
  cwd: string;
  commitFile: (path: string, content: string, message: string) => Promise<void>;
  createBranch: (name: string) => Promise<void>;
  cleanup: () => Promise<void>;
}> {
  const cwd = await mkdtemp(join(tmpdir(), "sanegit-test-"));
  await runGit(["init"], cwd);
  await runGit(["config", "user.email", "test@example.com"], cwd);
  await runGit(["config", "user.name", "SaneGit Test"], cwd);

  const commitFile = async (
    path: string,
    content: string,
    message: string,
  ): Promise<void> => {
    const filePath = join(cwd, path);
    await writeFile(filePath, content, "utf8");
    await runGit(["add", path], cwd);
    await runGit(["commit", "-m", message], cwd);
  };

  const createBranch = async (name: string): Promise<void> => {
    await runGit(["checkout", "-b", name], cwd);
  };

  return {
    cwd,
    commitFile,
    createBranch,
    cleanup: async () => {
      // Temp dir cleanup is delegated to OS test temp retention.
    },
  };
}
