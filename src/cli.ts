#!/usr/bin/env node
import { Command } from "commander";
import { runStatus } from "./commands/status.js";
import { runExplain } from "./commands/explain.js";
import { runCommit } from "./commands/commit.js";
import { runPush } from "./commands/push.js";
import { runCheck } from "./commands/check.js";
import { runFix } from "./commands/fix.js";
import { runUndo } from "./commands/undo.js";
import { runWtfCommand } from "./commands/wtf.js";
import { predictMergeQueueRisk } from "./core/predictor.js";
import { runAiConfigure } from "./commands/ai-configure.js";

const program = new Command();

program.name("sg").description("SaneGit command assistant").version("0.1.0");

program
  .command("status")
  .description("Summarize repository state in plain English")
  .action(async () => {
    await runStatus();
  });

program
  .command("explain")
  .description("Explain current changes in plain English")
  .action(async () => {
    await runExplain();
  });

program
  .command("commit")
  .description("Create a safe guided commit")
  .action(async () => {
    await runCommit(process.cwd(), async () => true);
  });

program
  .command("push")
  .description("Run predictive checks and push safely")
  .action(async () => {
    await runPush(process.cwd(), async () => false);
  });

program
  .command("check")
  .description("Check integration and merge readiness")
  .action(async () => {
    await runCheck();
  });

program
  .command("fix")
  .description("Suggest safe fixes for common git failures")
  .action(async () => {
    await runFix();
  });

program
  .command("undo")
  .description("Offer reversible rollback options")
  .action(async () => {
    await runUndo();
  });

program
  .command("wtf")
  .description("Diagnose urgent repository problems")
  .action(async () => {
    await runWtfCommand({ predictor: { check: predictMergeQueueRisk } });
  });

program
  .command("ai-configure")
  .description("Configure AI provider, endpoint, and credential reference")
  .requiredOption(
    "--provider <provider>",
    "Provider: openai|anthropic|google|mistral|custom",
  )
  .option("--url <customBaseUrl>", "Custom provider URL")
  .option("--credential-ref <ref>", "Keychain credential reference")
  .action(
    async (options: {
      provider: "openai" | "anthropic" | "google" | "mistral" | "custom";
      url?: string;
      credentialRef?: string;
    }) => {
      const input = {
        provider: options.provider,
        ...(options.url ? { customBaseUrl: options.url } : {}),
        ...(options.credentialRef
          ? { credentialRef: options.credentialRef }
          : {}),
      };
      await runAiConfigure(input);
    },
  );

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
