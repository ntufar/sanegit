import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { getConflictedFiles } from "../core/forensics.js";
import { resolveConflictFile, generateDiffPreview } from "../core/conflictResolver.js";
import { createProvider } from "../ai/providers.js";
import { loadConfig, providerToBaseUrl, resolveCredential } from "../core/config.js";
import { writeOutput } from "../core/output.js";
import { runGit } from "../core/git.js";
import { logEvent } from "../core/telemetry.js";

export async function runResolve(
  cwd: string = process.cwd(),
  options: {
    file?: string | undefined;
    confirm?: ((message: string) => Promise<boolean>) | undefined;
  } = {},
): Promise<void> {
  const conflictedFiles = await getConflictedFiles(cwd);

  if (conflictedFiles.length === 0) {
    writeOutput({
      summary: "No merge conflicts found.",
      risk: "none",
      recommendation: "Nothing to resolve.",
      detail: [],
    });
    return;
  }

  const filesToResolve = options.file
    ? conflictedFiles.filter((f) => f === options.file)
    : conflictedFiles;

  if (filesToResolve.length === 0) {
    writeOutput({
      summary: `File "${options.file}" is not in conflict.`,
      risk: "low",
      recommendation: "Check the file path.",
      detail: [`Conflicted files: ${conflictedFiles.join(", ")}`],
    });
    return;
  }

  const config = await loadConfig(cwd);
  const credential = await resolveCredential(config);

  if (!credential.apiKey) {
    writeOutput({
      summary: `${conflictedFiles.length} conflicted file(s) found but AI is not configured.`,
      risk: "high",
      recommendation: 'Run "sg ai-configure" to enable AI-assisted resolution, or resolve conflicts manually.',
      detail: [
        ...conflictedFiles.map((f) => `  - ${f}`),
        "",
        "Manual resolution steps:",
        "1. Open each file and find <<<<<<< / ======= / >>>>>>> markers",
        "2. Choose which changes to keep and remove the markers",
        "3. Run: git add <file>",
        "4. Run: git merge --continue (or git rebase --continue)",
      ],
      degradedMode: true,
    });
    return;
  }

  const baseUrl = config.customBaseUrl ?? providerToBaseUrl(config.provider);
  const provider = createProvider({
    provider: config.provider,
    ...(baseUrl ? { baseUrl } : {}),
    apiKey: credential.apiKey,
  });

  const confirm = options.confirm ?? defaultConfirm;
  const resolvedFiles: string[] = [];
  const skippedFiles: string[] = [];

  for (const file of filesToResolve) {
    try {
      const result = await resolveConflictFile(file, provider, cwd);
      const diffLines = generateDiffPreview(result.originalContent, result.resolvedContent);

      writeOutput({
        summary: `Proposed resolution for ${file}`,
        risk: result.confidence === "low" ? "medium" : "low",
        recommendation: result.explanation,
        detail: [
          `Confidence: ${result.confidence}`,
          "",
          ...diffLines,
        ],
        aiBacked: true,
      });

      const approved = await confirm(`Apply resolution to ${file}?`);

      if (!approved) {
        skippedFiles.push(file);
        continue;
      }

      await writeFile(join(cwd, file), result.resolvedContent, "utf8");
      await runGit(["add", file], cwd);
      resolvedFiles.push(file);

      await logEvent({
        command: "resolve",
        outcome: "success",
        risk: "low",
        detail: `Resolved ${file} (confidence: ${result.confidence})`,
      }, cwd);
    } catch (error) {
      skippedFiles.push(file);
      await logEvent({
        command: "resolve",
        outcome: "failure",
        risk: "medium",
        detail: `Failed to resolve ${file}: ${(error as Error).message}`,
      }, cwd);
    }
  }

  const nextStep = await detectContinueCommand(cwd);

  writeOutput({
    summary: `Resolved ${resolvedFiles.length}/${filesToResolve.length} conflicted file(s).`,
    risk: skippedFiles.length > 0 ? "medium" : "low",
    recommendation: resolvedFiles.length > 0
      ? `Run "${nextStep}" to continue.`
      : "Resolve remaining conflicts manually.",
    detail: [
      ...(resolvedFiles.length > 0 ? [`Resolved: ${resolvedFiles.join(", ")}`] : []),
      ...(skippedFiles.length > 0 ? [`Skipped: ${skippedFiles.join(", ")}`] : []),
    ],
  });
}

async function detectContinueCommand(cwd: string): Promise<string> {
  const rebase = await runGit(["rev-parse", "--verify", "REBASE_HEAD"], cwd);
  if (rebase.exitCode === 0) return "git rebase --continue";
  return "git merge --continue";
}

async function defaultConfirm(message: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${message} (y/n) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().startsWith("y"));
    });
  });
}
