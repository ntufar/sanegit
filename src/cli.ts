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
import { runSync } from "./commands/sync.js";
import { runShip, runShipStatus } from "./commands/ship.js";
import { runSplit } from "./commands/split.js";
import { runWho } from "./commands/who.js";
import { runQueueTeam } from "./commands/queue.js";
import { runBlameExplain } from "./commands/blame.js";
import { runTimeTravel } from "./commands/time-travel.js";
import { runPairHandoff, runPairStart, runPairStatus } from "./commands/pair.js";
import { runDoctor } from "./commands/doctor.js";

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
  .option("--learn", "Record qualifying local fault signals")
  .option("--fix-ci", "Run CI-focused diagnosis and remediation handoff")
  .action(async (options: { learn?: boolean; fixCi?: boolean }) => {
    await runWtfCommand({
      predictor: { check: predictMergeQueueRisk },
      learnMode: options.learn ?? false,
      fixCiMode: options.fixCi ?? false,
    });
  });

program
  .command("ai-configure")
  .description("Configure AI provider, endpoint, and credential reference")
  .option(
    "--provider <provider>",
    "Provider: openai|anthropic|google|mistral|custom",
  )
  .option("--url <customBaseUrl>", "Custom provider URL")
  .option("--credential-ref <ref>", "Keychain credential reference")
  .action(
    async (options: {
      provider?: "openai" | "anthropic" | "google" | "mistral" | "custom";
      url?: string;
      credentialRef?: string;
    }) => {
      let provider = options.provider;
      if (!provider) {
        const readline = await import("readline");
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        provider = await new Promise<
          "openai" | "anthropic" | "google" | "mistral" | "custom"
        >((resolve) => {
          rl.question(
            "Provider? (openai | anthropic | google | mistral | custom): ",
            (answer) => {
              rl.close();
              resolve(
                answer.trim() as
                  | "openai"
                  | "anthropic"
                  | "google"
                  | "mistral"
                  | "custom",
              );
            },
          );
        });
      }
      if (
        !["openai", "anthropic", "google", "mistral", "custom"].includes(
          provider,
        )
      ) {
        console.error(
          `Invalid provider "${provider}". Choose one of: openai, anthropic, google, mistral, custom`,
        );
        process.exit(1);
      }
      let credentialRef = options.credentialRef;
      let apiKey = "";
      if (!credentialRef) {
        const readline2 = await import("readline");
        const rl2 = readline2.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const answer = await new Promise<string>((resolve) => {
          rl2.question(
            "API key or env var name (e.g. MISTRAL_API_KEY or paste key directly): ",
            (a) => {
              rl2.close();
              resolve(a.trim());
            },
          );
        });
        if (answer) {
          // If the answer looks like a key, use a generic reference and store it
          if (answer.length > 20) {
            credentialRef = `SANEGIT_${provider.toUpperCase()}_KEY`;
            apiKey = answer;
          } else {
            credentialRef = answer;
          }
        }
      }
      const input: any = {
        provider,
        ...(options.url ? { customBaseUrl: options.url } : {}),
        ...(credentialRef ? { credentialRef } : {}),
        ...(apiKey ? { apiKey } : {}),
      };
      await runAiConfigure(input);
    },
  );

program
  .command("sync")
  .description("Safely preserve local work and sync with mainline")
  .action(async () => {
    await runSync();
  });

program
  .command("ship")
  .description("Run one-command delivery flow with tracked background handoff")
  .option("--status", "Show current ship workflow status")
  .action(async (options: { status?: boolean }) => {
    if (options.status) {
      await runShipStatus();
      return;
    }
    await runShip();
  });

program
  .command("split")
  .description("Propose logical commit groups from staged changes")
  .action(async () => {
    await runSplit();
  });

program
  .command("who")
  .description("Show collaborator and ownership context")
  .option("--file <file>", "Show ownership context for a specific file")
  .action(async (options: { file?: string }) => {
    await runWho(
      process.cwd(),
      undefined,
      options.file ? { file: options.file } : {},
    );
  });

program
  .command("queue")
  .description("Inspect merge queue state")
  .option("--team", "Show team queue impact details")
  .action(async (options: { team?: boolean }) => {
    if (options.team) {
      await runQueueTeam();
    }
  });

program
  .command("blame")
  .description("Explain line-level history with hosted context")
  .requiredOption("--file <file>", "File path")
  .requiredOption("--line <line>", "Line number")
  .option("--explain", "Return explanation mode")
  .action(async (options: { file: string; line: string; explain?: boolean }) => {
    if (options.explain) {
      await runBlameExplain(options.file, Number.parseInt(options.line, 10));
    }
  });

program
  .command("time-travel")
  .description("Resolve natural-language or revision references safely")
  .requiredOption("--to <reference>", "Reference to resolve")
  .action(async (options: { to: string }) => {
    await runTimeTravel(options.to);
  });

program
  .command("pair")
  .description("Manage lightweight pair programming sessions")
  .requiredOption("--action <action>", "start|status|handoff")
  .option("--session <sessionId>", "Pair session ID for status/handoff")
  .action(async (options: { action: string; session?: string }) => {
    if (options.action === "start") {
      await runPairStart();
      return;
    }
    if (options.action === "status" && options.session) {
      await runPairStatus(options.session);
      return;
    }
    if (options.action === "handoff" && options.session) {
      await runPairHandoff(options.session);
    }
  });

program
  .command("doctor")
  .description("Run deep repository health diagnostics")
  .action(async () => {
    await runDoctor();
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
