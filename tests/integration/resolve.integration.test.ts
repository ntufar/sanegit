import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runGit } from "../../src/core/git.js";
import { getConflictedFiles } from "../../src/core/forensics.js";
import { parseConflictFile } from "../../src/core/conflictParser.js";
import { resolveConflictFile } from "../../src/core/conflictResolver.js";
import type { AiProvider } from "../../src/ai/providers.js";

function createMockProvider(resolution: string): AiProvider {
  return {
    async summarizeChangeSet() { return "summary"; },
    async suggestCommitMessage() { return "chore: update"; },
    async resolveConflict() {
      return `RESOLUTION:\n\`\`\`\n${resolution}\n\`\`\`\n\nEXPLANATION: Mock resolution.\n\nCONFIDENCE: high`;
    },
  };
}

async function createConflictRepo() {
  const harness = await createRepoHarness({ withRemote: true });

  await harness.commitFile("shared.ts", "const x = 1;\n", "base version");

  await harness.createBranch("feature");
  await harness.commitFile("shared.ts", "const x = 2;\n", "feature change");

  await runGit(["checkout", "main"], harness.cwd);
  await harness.commitFile("shared.ts", "const x = 3;\n", "main change");

  await runGit(["merge", "feature", "--no-commit"], harness.cwd).catch(() => {});

  return harness;
}

describe("resolve integration", () => {
  it("detects conflicted files after a merge", async () => {
    const harness = await createConflictRepo();
    const files = await getConflictedFiles(harness.cwd);
    expect(files).toContain("shared.ts");
  });

  it("parses conflict markers from a real merge conflict", async () => {
    const harness = await createConflictRepo();
    const conflict = await parseConflictFile("shared.ts", harness.cwd);
    expect(conflict.hunks.length).toBeGreaterThanOrEqual(1);
    expect(conflict.hunks[0]!.oursContent.length).toBeGreaterThan(0);
    expect(conflict.hunks[0]!.theirsContent.length).toBeGreaterThan(0);
  });

  it("resolves a conflict using a mock AI provider", async () => {
    const harness = await createConflictRepo();
    const provider = createMockProvider("const x = 4;");

    const result = await resolveConflictFile("shared.ts", provider, harness.cwd);

    expect(result.confidence).toBe("high");
    expect(result.resolvedContent).toContain("const x = 4;");
    expect(result.resolvedContent).not.toContain("<<<<<<<");
    expect(result.explanation).toContain("Mock resolution");
  });
});
