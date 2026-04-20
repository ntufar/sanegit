---
description: "Task list for SaneGit Command Assistant implementation"
---

# Tasks: SaneGit Command Assistant

**Input**: Design documents from `/specs/001-sanegit-cli/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Include unit, integration, contract, and performance tests needed to satisfy the constitution and spec success criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript CLI workspace and baseline developer tooling.

- [ ] T001 Create npm CLI package scaffold in package.json
- [ ] T002 Create TypeScript build configuration in tsconfig.json
- [ ] T003 [P] Configure Vitest test runner in vitest.config.ts
- [ ] T004 [P] Configure linting, formatting, and ignore rules in eslint.config.js and .gitignore
- [ ] T005 Create CLI bootstrap and bin wiring in src/cli.ts and package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 [P] Implement git process wrapper in src/core/git.ts
- [ ] T007 [P] Implement repository-local memory persistence in src/core/memory.ts
- [ ] T008 [P] Implement AI prompt catalog and provider adapters in src/ai/prompts.ts and src/ai/providers.ts
- [ ] T009 Implement configuration and credential resolution in src/core/config.ts
- [ ] T010 Implement shared output formatting and risk rendering in src/core/output.ts
- [ ] T011 Implement baseline prediction engine in src/core/predictor.ts
- [ ] T012 Implement telemetry and audit event helpers in src/core/telemetry.ts
- [ ] T013 Implement interactive AI configuration command in src/commands/ai-configure.ts and src/cli.ts
- [ ] T014 Create fixture repository harness in tests/helpers/repoHarness.ts and tests/integration/fixtures/.gitkeep

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Understand Repository State Quickly (Priority: P1) 🎯 MVP

**Goal**: Deliver plain-English repository state summaries and explanations with consistent output and degraded-mode handling.

**Independent Test**: Run `sg status` and `sg explain` against clean, dirty, diverged, and AI-unavailable fixture repos and confirm users receive summary, risk, recommendation, and detail output without reading raw git diagnostics.

### Tests for User Story 1

- [ ] T015 [P] [US1] Create status command contract test in tests/contract/status.contract.test.ts
- [ ] T016 [P] [US1] Create explain command contract and degraded-mode test in tests/contract/explain.contract.test.ts
- [ ] T017 [P] [US1] Create status integration scenarios in tests/integration/status.integration.test.ts
- [ ] T018 [P] [US1] Create explain integration scenarios in tests/integration/explain.integration.test.ts

### Implementation for User Story 1

- [ ] T019 [P] [US1] Implement repository snapshot assembly in src/core/repositorySnapshot.ts
- [ ] T020 [P] [US1] Implement status command in src/commands/status.ts
- [ ] T021 [P] [US1] Implement explain command with AI fallback in src/commands/explain.ts
- [ ] T022 [US1] Extend output formatting for summary/risk/recommendation/detail sections in src/core/output.ts
- [ ] T023 [US1] Add explanation service orchestration in src/core/explainer.ts
- [ ] T024 [US1] Wire status and explain commands into src/cli.ts
- [ ] T025 [US1] Emit telemetry for status and explain outcomes in src/core/telemetry.ts

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Commit and Push Safely (Priority: P2)

**Goal**: Deliver safe commit creation and predictive push workflows with confirmation, branch-risk analysis, and actionable warnings.

**Independent Test**: Run `sg commit` and `sg push` in staged, diverged, rejected, and AI-degraded fixture repos and confirm unsafe actions are previewed, blocked, or explicitly acknowledged before execution.

### Tests for User Story 2

- [ ] T026 [P] [US2] Create commit command contract test in tests/contract/commit.contract.test.ts
- [ ] T027 [P] [US2] Create push command contract test in tests/contract/push.contract.test.ts
- [ ] T028 [P] [US2] Create commit integration scenarios in tests/integration/commit.integration.test.ts
- [ ] T029 [P] [US2] Create push integration scenarios in tests/integration/push.integration.test.ts

### Implementation for User Story 2

- [ ] T030 [P] [US2] Implement commit planning service in src/core/commitPlanner.ts
- [ ] T031 [P] [US2] Implement commit command in src/commands/commit.ts
- [ ] T032 [P] [US2] Implement push command in src/commands/push.ts
- [ ] T033 [US2] Extend prediction engine for remote and merge-queue risk checks in src/core/predictor.ts
- [ ] T034 [US2] Add push safety orchestration in src/core/pushSafety.ts
- [ ] T035 [US2] Wire commit and push commands into src/cli.ts
- [ ] T036 [US2] Emit telemetry for commit and push decisions in src/core/telemetry.ts

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Recover from Problems Confidently (Priority: P3)

**Goal**: Deliver recovery-oriented check, fix, and undo flows that explain risk and allow safe rollback or resolution.

**Independent Test**: Run `sg check`, `sg fix`, and `sg undo` against fixture repos containing merge conflicts, rejected integration states, and recent undesirable actions and confirm recovery options are clearly explained and safely executed.

### Tests for User Story 3

- [ ] T037 [P] [US3] Create check command contract test in tests/contract/check.contract.test.ts
- [ ] T038 [P] [US3] Create fix and undo contract tests in tests/contract/recovery.contract.test.ts
- [ ] T039 [P] [US3] Create fix integration scenarios in tests/integration/fix.integration.test.ts
- [ ] T040 [P] [US3] Create undo integration scenarios in tests/integration/undo.integration.test.ts

### Implementation for User Story 3

- [ ] T041 [P] [US3] Implement check command in src/commands/check.ts
- [ ] T042 [P] [US3] Implement fix command in src/commands/fix.ts
- [ ] T043 [P] [US3] Implement undo command in src/commands/undo.ts
- [ ] T044 [US3] Implement recovery orchestration in src/core/resolver.ts
- [ ] T045 [US3] Add undo planning service in src/core/undoPlanner.ts
- [ ] T046 [US3] Wire check, fix, and undo commands into src/cli.ts
- [ ] T047 [US3] Emit telemetry for recovery workflows in src/core/telemetry.ts

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories.

- [ ] T048 [P] Update end-user documentation and install guidance in README.md and specs/001-sanegit-cli/quickstart.md
- [ ] T049 [P] Add benchmark and performance assertions in tests/integration/performance.integration.test.ts
- [ ] T050 [P] Add core unit coverage for predictor, config, and memory services in tests/unit/coreServices.test.ts
- [ ] T051 Harden credential redaction and insecure URL warnings in src/core/config.ts and src/core/telemetry.ts
- [ ] T052 Verify contract, quickstart, and command help consistency in specs/001-sanegit-cli/contracts/cli-contract.md and src/cli.ts
- [ ] T053 Run formatter, lint, typecheck, and full test scripts from package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all story work.
- **User Stories (Phases 3-5)**: Depend on Foundational completion.
- **Polish (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; independent MVP.
- **US2 (P2)**: Starts after Foundational; reuses shared predictor/output/config but remains independently testable.
- **US3 (P3)**: Starts after Foundational; reuses shared resolver/predictor/config but remains independently testable.

### Within Each User Story

- Contract and integration tests are written before implementation.
- Shared domain/service modules precede command wiring.
- Command wiring follows core orchestration changes.
- Telemetry updates land after command behavior is stable.

### Parallel Opportunities

- Setup tasks T003-T004 can run in parallel.
- Foundational tasks T006-T008 can run in parallel, then converge into T009-T013.
- All tests within a user story marked `[P]` can run in parallel.
- Command implementations within a story marked `[P]` can run in parallel when they touch separate files.

---

## Parallel Example: User Story 1

```bash
# Launch US1 tests together:
Task: "Create status command contract test in tests/contract/status.contract.test.ts"
Task: "Create explain command contract and degraded-mode test in tests/contract/explain.contract.test.ts"
Task: "Create status integration scenarios in tests/integration/status.integration.test.ts"
Task: "Create explain integration scenarios in tests/integration/explain.integration.test.ts"

# Launch US1 implementations together:
Task: "Implement repository snapshot assembly in src/core/repositorySnapshot.ts"
Task: "Implement status command in src/commands/status.ts"
Task: "Implement explain command with AI fallback in src/commands/explain.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch US2 tests together:
Task: "Create commit command contract test in tests/contract/commit.contract.test.ts"
Task: "Create push command contract test in tests/contract/push.contract.test.ts"
Task: "Create commit integration scenarios in tests/integration/commit.integration.test.ts"
Task: "Create push integration scenarios in tests/integration/push.integration.test.ts"

# Launch US2 implementations together:
Task: "Implement commit planning service in src/core/commitPlanner.ts"
Task: "Implement commit command in src/commands/commit.ts"
Task: "Implement push command in src/commands/push.ts"
```

---

## Parallel Example: User Story 3

```bash
# Launch US3 tests together:
Task: "Create check command contract test in tests/contract/check.contract.test.ts"
Task: "Create fix and undo contract tests in tests/contract/recovery.contract.test.ts"
Task: "Create fix integration scenarios in tests/integration/fix.integration.test.ts"
Task: "Create undo integration scenarios in tests/integration/undo.integration.test.ts"

# Launch US3 implementations together:
Task: "Implement check command in src/commands/check.ts"
Task: "Implement fix command in src/commands/fix.ts"
Task: "Implement undo command in src/commands/undo.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Validate `sg status` and `sg explain` against fixture repositories.
5. Demo the plain-English repository assistant before expanding to commit/push/recovery.

### Incremental Delivery

1. Setup + Foundational establish the CLI, config, AI provider abstraction, and fixture harness.
2. US1 delivers the first usable assistant experience.
3. US2 adds commit and push safety without regressing US1.
4. US3 adds recovery workflows and integration checks.
5. Polish aligns performance, docs, and quality gates before implementation rollout.

### Parallel Team Strategy

1. One developer owns setup/foundational CLI plumbing.
2. Once foundational work lands:
   - Developer A: US1 (`status`, `explain`)
   - Developer B: US2 (`commit`, `push`)
   - Developer C: US3 (`check`, `fix`, `undo`)
3. Shared review focuses on predictor/output/config contracts to prevent drift.

---

## Notes

- `[P]` tasks touch different files and can be safely parallelized.
- `[US1]`, `[US2]`, `[US3]` labels provide direct traceability back to independently testable user stories.
- Contract tests enforce command surface and output consistency.
- Integration tests use fixture repositories to avoid mutating developer working copies.
- Performance validation is required, not optional, because the constitution defines performance budgets as product requirements.
