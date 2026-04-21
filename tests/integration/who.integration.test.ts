import { describe, expect, it } from "vitest";
import { createRepoHarness } from "../helpers/repoHarness.js";
import { runWho } from "../../src/commands/who.js";

describe("who integration", () => {
  it("reports ownership distribution from local multi-author history", async () => {
    const harness = await createRepoHarness();
    await harness.commitFileAsAuthor(
      "README.md",
      "alpha\n",
      "docs: add alpha",
      "Alice Example",
      "alice@example.com",
    );
    await harness.commitFileAsAuthor(
      "README.md",
      "alpha\nbeta\n",
      "docs: add beta",
      "Alice Example",
      "alice@example.com",
    );
    await harness.commitFileAsAuthor(
      "README.md",
      "alpha\nbeta\ngamma\n",
      "docs: add gamma",
      "Bob Example",
      "bob@example.com",
    );

    const chunks: string[] = [];
    await runWho(harness.cwd, (text) => {
      chunks.push(text);
    });

    const output = chunks.join("");
    expect(output).toContain("Collaborator ownership context ready.");
    expect(output).toContain("Local ownership: Alice Example 66.7% (2 commits), Bob Example 33.3% (1 commit)");
    expect(output).toContain("Primary owner: Alice Example (66.7% of 3 local commits)");
    expect(output).toContain("Active collaborators: Bob Example, Alice Example");
  });

  it("reports file-scoped ownership from blamed lines", async () => {
    const harness = await createRepoHarness();
    await harness.commitFileAsAuthor(
      "README.md",
      "alpha\nbeta\n",
      "docs: add initial readme",
      "Alice Example",
      "alice@example.com",
    );
    await harness.commitFileAsAuthor(
      "README.md",
      "alpha\nbeta\ngamma\n",
      "docs: add gamma",
      "Bob Example",
      "bob@example.com",
    );

    const chunks: string[] = [];
    await runWho(harness.cwd, (text) => {
      chunks.push(text);
    }, { file: "README.md" });

    const output = chunks.join("");
    expect(output).toContain("File collaborator ownership context ready.");
    expect(output).toContain("Target file: README.md");
    expect(output).toContain("File ownership: Alice Example 66.7% (2 blamed lines), Bob Example 33.3% (1 blamed line)");
    expect(output).toContain("Primary file owner: Alice Example (66.7% of 3 blamed lines)");
  });

  it("aggregates ownership across tracked files when a directory is provided", async () => {
    const harness = await createRepoHarness();
    await harness.commitFileAsAuthor(
      "src/a.ts",
      "one\ntwo\n",
      "feat: add a",
      "Alice Example",
      "alice@example.com",
    );
    await harness.commitFileAsAuthor(
      "src/b.ts",
      "three\n",
      "feat: add b",
      "Bob Example",
      "bob@example.com",
    );

    const chunks: string[] = [];
    await runWho(
      harness.cwd,
      (text) => {
        chunks.push(text);
      },
      { file: "src" },
    );

    const output = chunks.join("");
    expect(output).toContain("Directory collaborator ownership context ready.");
    expect(output).toContain("Target directory: src (2 tracked files)");
    expect(output).toContain(
      "Directory ownership: Alice Example 66.7% (2 blamed lines), Bob Example 33.3% (1 blamed line)",
    );
    expect(output).toContain(
      "Primary directory owner: Alice Example (66.7% of 3 blamed lines)",
    );
  });
});