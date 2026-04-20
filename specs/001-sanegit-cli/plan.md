# Implementation Plan: SaneGit Command Assistant

**Branch**: `001-build-sanegit-cli` | **Date**: 2026-04-21 | **Spec**: `/specs/001-sanegit-cli/spec.md`
**Input**: Feature specification from `/specs/001-sanegit-cli/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build an npm CLI package (`sanegit`) with executable `sg` that makes git workflows safer and
easier using plain-English guidance, predictive checks, assisted recovery, and optional AI-backed
explanations. The implementation will use a TypeScript CLI architecture with command modules,
core git orchestration, AI provider abstraction, repository-local memory, and secure credential
references.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x on Node.js 22 LTS  
**Primary Dependencies**: `commander` (CLI parsing), `execa` (git process wrapper), provider SDKs via
an adapter layer, `zod` (configuration validation)  
**Storage**: Local files in `.sanegit/config.json` and `.sanegit/memory.json`, OS keychain and/or env var
for API secrets  
**Testing**: Vitest for unit/integration, command-contract tests via fixture repositories  
**Target Platform**: macOS, Linux, and Windows terminals with Git installed  
**Project Type**: CLI application package  
**Performance Goals**: `status`, `explain`, `check` p95 under 2s on repositories up to 10k tracked files;
preview responses under 1s for common `commit`/`fix`/`undo` flows  
**Constraints**: Must degrade gracefully when AI is unavailable; must allow custom AI URLs including HTTP
with explicit warning; must not store plaintext API keys in repo config  
**Scale/Scope**: Single package CLI with 7 top-level commands, one local config/memory namespace, initial
provider set of OpenAI, Anthropic, Google (Gemini), and Mistral

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality Gate**: PASS. Enforce TypeScript strict mode, ESLint, and formatter checks in local
  developer workflow and CI pipeline; no merge on failing quality checks.
- **Testing Gate**: PASS. Require unit tests for core modules, integration tests with fixture git repos,
  and contract tests for command output/arguments. Bug fixes must include regression tests.
- **UX Consistency Gate**: PASS. Every command output follows `summary -> risk -> recommendation -> detail`
  structure using plain-English wording and consistent command help conventions.
- **Performance Gate**: PASS. Benchmarks and integration timing assertions validate p95 and preview latency
  targets from spec success criteria.
- **Observability Gate**: PASS. Structured command outcome logs and degraded-mode markers for AI fallback are
  included from initial release.

### Post-Design Constitution Re-check

- **Code Quality**: PASS. Proposed module boundaries (`commands`, `core`, `ai`) keep responsibilities
  cohesive and testable.
- **Tests Define Done**: PASS. Design includes dedicated test layers and fixture-based behavior validation.
- **UX Consistency**: PASS. Contracts and quickstart encode uniform output behavior and setup flows.
- **Performance Budgets**: PASS. Research decisions include timeout, fallback, and benchmark strategy.
- **Safe Delivery/Observability**: PASS. Design captures warning/degraded states and command audit events.

## Project Structure

### Documentation (this feature)

```text
specs/001-sanegit-cli/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── cli.ts
├── commands/
│   ├── ai-configure.ts
│   ├── status.ts
│   ├── commit.ts
│   ├── push.ts
│   ├── check.ts
│   ├── fix.ts
│   ├── undo.ts
│   ├── explain.ts
│   └── wtf.ts
├── core/
│   ├── git.ts
│   ├── config.ts
│   ├── output.ts
│   ├── predictor.ts
│   ├── telemetry.ts
│   ├── repositorySnapshot.ts
│   ├── explainer.ts
│   ├── commitPlanner.ts
│   ├── pushSafety.ts
│   ├── resolver.ts
│   ├── undoPlanner.ts
│   └── memory.ts
└── ai/
│   ├── prompts.ts
│   └── providers.ts

.sanegit/
├── config.json
└── memory.json

tests/
├── contract/
│   ├── ai-configure.contract.test.ts
│   ├── status.contract.test.ts
│   ├── explain.contract.test.ts
│   ├── commit.contract.test.ts
│   ├── push.contract.test.ts
│   ├── check.contract.test.ts
│   ├── recovery.contract.test.ts
│   └── wtf.contract.test.ts
├── integration/
│   ├── ai-configure.integration.test.ts
│   ├── status.integration.test.ts
│   ├── explain.integration.test.ts
│   ├── commit.integration.test.ts
│   ├── push.integration.test.ts
│   ├── check.integration.test.ts
│   ├── fix.integration.test.ts
│   ├── undo.integration.test.ts
│   ├── wtf.integration.test.ts
│   └── performance.integration.test.ts
├── unit/
│   └── coreServices.test.ts
└── helpers/
    └── repoHarness.ts
```

**Structure Decision**: Single-project CLI layout selected to match the PRD command-oriented
architecture and keep command, orchestration, and AI concerns isolated but close for fast iteration.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations required justification in this plan.
