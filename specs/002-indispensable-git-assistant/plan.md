# Implementation Plan: Indispensable Git Assistant

**Branch**: `002-create-feature-branch` | **Date**: 2026-04-21 | **Spec**: `/specs/002-indispensable-git-assistant/spec.md`
**Input**: Feature specification from `/specs/002-indispensable-git-assistant/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Extend the existing TypeScript CLI into a broader git workflow assistant by adding local learning for `sg wtf`, resumable multi-step delivery flows (`sg sync`, `sg ship`, `sg split`), host-agnostic collaboration integrations, and advanced recovery commands. The technical approach keeps the current single-package CLI structure and adds four major capabilities: repository-scoped workflow persistence, host-agnostic provider adapters, richer local memory for learned patterns, and explicit AI-context transparency while preserving degraded local-only behavior.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 22 LTS  
**Primary Dependencies**: `commander` (CLI parsing), `execa` (process execution), `zod` (schema validation), provider SDK adapters for hosting and AI integrations  
**Storage**: Local files in `.sanegit/config.json`, `.sanegit/memory.json`, `.sanegit/workflows.json`, and `.sanegit/audit.log`  
**Testing**: Vitest unit, integration, and contract tests with fixture repositories and mocked hosting/AI integrations  
**Target Platform**: macOS, Linux, and Windows terminals with Git installed  
**Project Type**: CLI application package  
**Performance Goals**: Initial actionable output for `sg wtf`, `sg sync`, and `sg split` within 2 seconds on repositories up to 5k tracked files; progress updates for long-running hosted workflows at least every 10 seconds; no more than 15% median runtime regression for existing `status`, `wtf`, and `check` commands  
**Constraints**: Local-first operation, graceful degradation when AI or hosting services are unavailable, learned state bounded under 10 MB per repository, automatic full-context AI use once enabled, and consistent Summary/Risk/Recommendation/Detail output across all commands  
**Scale/Scope**: Single CLI package expanded with 8+ new workflow/collaboration commands, repository-scoped learned pattern storage, resumable background workflows, and host-agnostic support for at least one fully implemented hosting provider plus a common adapter contract

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Code Quality Gate**: PASS. Continue enforcing TypeScript strict mode, ESLint, typecheck, and build checks locally and in CI. New provider/workflow modules stay cohesive by separating commands, core orchestration, hosting adapters, and persistence models.
- **Testing Gate**: PASS. Feature requires unit tests for learning/workflow/provider services, integration tests with fixture repos for `wtf`, `sync`, `ship`, and `split`, and contract tests for new command surfaces and output structure. Bug fixes within these flows must add regression tests.
- **UX Consistency Gate**: PASS. All new commands must keep the existing `Summary -> Risk -> Recommendation -> Detail` format, concise prompts, keyboard-only usability, and explicit degraded-mode or AI-enhanced markers.
- **Performance Gate**: PASS. Planning preserves spec budgets by using local cached state, staged remote polling, bounded pattern memory, and timing assertions for critical command paths.
- **Observability Gate**: PASS. Extend structured audit logging for workflow phase transitions, degraded-mode events, AI-enhanced runs, and hosted integration fallbacks. Rollout can gate high-risk remote automation behind explicit command flags/config until stable.

### Post-Design Constitution Re-check

- **Code Quality**: PASS. Design keeps responsibilities separated into `commands`, `core`, `ai`, and a new `hosting` layer rather than embedding provider-specific logic in commands.
- **Tests Define Done**: PASS. Data model, contracts, and quickstart scenarios define concrete command and persistence behaviors that can be covered by unit, integration, and contract tests.
- **UX Consistency**: PASS. Design explicitly preserves shared output sections, reversible prompts for destructive local actions, and status visibility for background `sg ship` workflows.
- **Performance Budgets**: PASS. Local-first storage, repository-scoped learning, and checkpointed remote polling support the response-time and storage budgets in the spec.
- **Safe Delivery/Observability**: PASS. Workflow state persistence and audit events provide the required post-release verification surface without requiring external telemetry infrastructure.

## Project Structure

### Documentation (this feature)

```text
specs/002-indispensable-git-assistant/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── ai/
│   ├── prompts.ts
│   └── providers.ts
├── commands/
│   ├── existing command modules
│   ├── ship.ts
│   ├── sync.ts
│   ├── split.ts
│   ├── who.ts
│   ├── queue.ts
│   ├── blame.ts
│   ├── pair.ts
│   ├── doctor.ts
│   └── time-travel.ts
├── core/
│   ├── config.ts
│   ├── output.ts
│   ├── memory.ts
│   ├── telemetry.ts
│   ├── workflowState.ts
│   ├── patternLearner.ts
│   ├── hostedContext.ts
│   └── command orchestration modules
├── hosting/
│   ├── provider.ts
│   ├── index.ts
│   └── github.ts
└── cli.ts

.sanegit/
├── config.json
├── memory.json
├── workflows.json
└── audit.log

tests/
├── contract/
│   ├── cli-output.contract.test.ts
│   ├── hosting.contract.test.ts
│   └── ship.contract.test.ts
├── integration/
│   ├── wtf-learning.integration.test.ts
│   ├── ship.integration.test.ts
│   ├── sync.integration.test.ts
│   ├── split.integration.test.ts
│   └── hosted-context.integration.test.ts
└── unit/
    ├── patternLearner.test.ts
    ├── workflowState.test.ts
    └── hostingProvider.test.ts
```

**Structure Decision**: Single-package CLI structure remains the right fit. The feature adds new command modules and two internal layers (`core` orchestration and `hosting` adapters) without splitting the repo into separate services or packages.

## Complexity Tracking

No constitution violations required justification in this plan.

