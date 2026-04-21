import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { runGit } from "../../src/core/git.js";

export async function createRepoHarness(): Promise<{
  cwd: string;
  commitFile: (path: string, content: string, message: string) => Promise<void>;
  commitFileAsAuthor: (
    path: string,
    content: string,
    message: string,
    authorName: string,
    authorEmail: string,
  ) => Promise<void>;
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
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
    await runGit(["add", path], cwd);
    await runGit(["commit", "-m", message], cwd);
  };

  const commitFileAsAuthor = async (
    path: string,
    content: string,
    message: string,
    authorName: string,
    authorEmail: string,
  ): Promise<void> => {
    const filePath = join(cwd, path);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
    await runGit(["add", path], cwd);
    await runGit(
      [
        "-c",
        `user.name=${authorName}`,
        "-c",
        `user.email=${authorEmail}`,
        "commit",
        "--author",
        `${authorName} <${authorEmail}>`,
        "-m",
        message,
      ],
      cwd,
    );
  };

  const createBranch = async (name: string): Promise<void> => {
    await runGit(["checkout", "-b", name], cwd);
  };

  return {
    cwd,
    commitFile,
    commitFileAsAuthor,
    createBranch,
    cleanup: async () => {
      // Temp dir cleanup is delegated to OS test temp retention.
    },
  };
}
