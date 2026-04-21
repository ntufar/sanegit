# Tasks: Indispensable Git Assistant

**Input**: Design documents from `/specs/002-indispensable-git-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md, contracts/cli-contract.md

**Tests**: Automated tests are required by the constitution and this plan. Each user story includes contract, integration, and unit coverage tasks where relevant.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align the package, folders, and shared test scaffolding with the implementation plan.

- [ ] T001 Update package metadata and scripts for hosted integrations and new command coverage in package.json
- [ ] T002 [P] Create hosting adapter scaffolding in src/hosting/provider.ts, src/hosting/index.ts, and src/hosting/github.ts
- [ ] T003 [P] Create workflow and hosted-context scaffolding in src/core/workflowState.ts and src/core/hostedContext.ts
- [ ] T004 [P] Extend shared repo-fixture support for new workflow scenarios in tests/helpers/repoHarness.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared persistence, config, output, and provider foundations required by all user stories.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Expand configuration schemas for hosting providers, AI context signaling, and command defaults in src/core/config.ts and src/commands/ai-configure.ts
- [ ] T006 Implement repository-local learned-pattern persistence and pruning primitives in src/core/memory.ts and src/core/patternLearner.ts
- [ ] T007 Implement workflow journal primitives and audit hooks in src/core/workflowState.ts and src/core/telemetry.ts
- [ ] T008 [P] Extend shared output and repository snapshot structures for hosted context and AI markers in src/core/output.ts and src/core/repositorySnapshot.ts
- [ ] T009 [P] Implement hosting provider detection and factory wiring in src/hosting/provider.ts, src/hosting/index.ts, and src/core/git.ts

**Checkpoint**: Shared storage, provider detection, output contracts, and workflow primitives are ready for story work.

---

## Phase 3: User Story 1 - Predictive Fault Intelligence (Priority: P1) 🎯 MVP

**Goal**: Teach `sg wtf` to learn recurring failures, surface proactive warnings, and explain conflict or CI issues with transparent AI-assisted context.

**Independent Test**: Run `sg wtf --learn` repeatedly in a fixture repository, verify warnings only activate after 10 qualifying runs, and confirm `sg wtf --fix-ci` returns actionable diagnosis with or without AI.

### Tests for User Story 1

- [ ] T010 [P] [US1] Add command contract coverage for `sg wtf --learn` and `sg wtf --fix-ci` in tests/contract/wtf.contract.test.ts
- [ ] T011 [P] [US1] Add learned-warning and CI-diagnosis integration coverage in tests/integration/wtf.integration.test.ts
- [ ] T012 [P] [US1] Add unit coverage for pattern thresholds, pruning, and AI markers in tests/unit/patternLearner.test.ts

### Implementation for User Story 1

- [ ] T013 [US1] Implement learned-pattern activation thresholds and pruning behavior in src/core/patternLearner.ts and src/core/memory.ts
- [ ] T014 [US1] Implement AI-context payload creation and provider-backed diagnosis prompts in src/ai/prompts.ts, src/ai/providers.ts, and src/core/explainer.ts
- [ ] T015 [US1] Extend panic-button diagnosis for `--learn` and `--fix-ci` modes in src/commands/wtf.ts and src/core/output.ts
- [ ] T016 [US1] Surface learned pre-push warnings through shared predictive checks in src/core/predictor.ts and src/core/pushSafety.ts
- [ ] T049 [US1] Implement direct remediation handoff actions from conflict/CI diagnostics in src/commands/wtf.ts and src/core/resolver.ts

**Checkpoint**: `sg wtf` learns locally, explains CI/conflict failures, and stays independently testable as the MVP slice.

---

## Phase 4: User Story 2 - One-Command Delivery Flow (Priority: P1)

**Goal**: Deliver safe one-command sync, ship, and split workflows with resumable background handoff for long-running remote delivery steps.

**Independent Test**: In a fixture repository with local changes and a mocked hosted PR flow, verify `sg sync`, `sg ship`, `sg ship status`, and `sg split` complete with correct checkpoints and confirmation behavior.

### Tests for User Story 2

- [ ] T017 [P] [US2] Add contract coverage for `sg sync`, `sg ship`, and `sg ship status` in tests/contract/sync.contract.test.ts and tests/contract/ship.contract.test.ts
- [ ] T018 [P] [US2] Add integration coverage for sync, ship handoff, and split grouping in tests/integration/sync.integration.test.ts, tests/integration/ship.integration.test.ts, and tests/integration/split.integration.test.ts
- [ ] T019 [P] [US2] Add unit coverage for workflow checkpoints and split planning in tests/unit/workflowState.test.ts and tests/unit/coreServices.test.ts

### Implementation for User Story 2

- [ ] T020 [US2] Finalize resumable workflow persistence and checkpoint recovery in src/core/workflowState.ts and src/core/telemetry.ts
- [ ] T021 [US2] Implement safe sync orchestration with local-work preservation in src/commands/sync.ts, src/core/git.ts, and src/core/resolver.ts
- [ ] T022 [US2] Implement ship execution and status inspection with background handoff in src/commands/ship.ts, src/core/pushSafety.ts, and src/core/workflowState.ts
- [ ] T023 [US2] Implement mixed-intent split planning and confirmation flow in src/commands/split.ts, src/core/commitPlanner.ts, and src/core/output.ts
- [ ] T024 [US2] Register sync, ship, ship-status, and split command surfaces in src/cli.ts

**Checkpoint**: `sg sync`, `sg ship`, and `sg split` are independently functional with persisted workflow state and contract-tested output.

---

## Phase 5: User Story 3 - Team Change Awareness (Priority: P2)

**Goal**: Add hosted collaboration awareness for ownership, blame explanation, and merge queue timing while preserving useful local fallbacks.

**Independent Test**: In a fixture repository with mocked hosting responses and a local-only fallback case, verify `sg who`, `sg blame --explain`, and `sg queue --team` all return actionable output.

### Tests for User Story 3

- [ ] T025 [P] [US3] Add contract coverage for `sg who`, `sg blame --explain`, and `sg queue --team` in tests/contract/hosting.contract.test.ts and tests/contract/cli-output.contract.test.ts
- [ ] T026 [P] [US3] Add integration coverage for hosted context success and fallback modes in tests/integration/hosted-context.integration.test.ts and tests/integration/status.integration.test.ts
- [ ] T027 [P] [US3] Add unit coverage for provider detection and normalization in tests/unit/hostingProvider.test.ts

### Implementation for User Story 3

- [ ] T028 [US3] Implement provider-specific hosted queries and normalization in src/hosting/github.ts, src/hosting/index.ts, and src/hosting/provider.ts
- [ ] T029 [US3] Implement hosted context aggregation and config-driven fallback behavior in src/core/hostedContext.ts, src/core/repositorySnapshot.ts, and src/core/config.ts
- [ ] T030 [US3] Implement collaborator ownership and queue timing commands in src/commands/who.ts and src/commands/queue.ts
- [ ] T031 [US3] Implement blame explanation with hosted rationale enrichment in src/commands/blame.ts, src/core/explainer.ts, and src/core/output.ts
- [ ] T032 [US3] Register collaboration-aware command surfaces in src/cli.ts

**Checkpoint**: Team-awareness commands work independently with host-agnostic provider wiring and local fallback behavior.

---

## Phase 6: User Story 4 - Advanced Recovery and Collaboration Modes (Priority: P3)

**Goal**: Add natural-language time travel, pair-session lifecycle support, and a full repository doctor audit for advanced recovery scenarios.

**Independent Test**: In isolation, verify `sg time-travel`, `sg pair start|status|handoff`, and `sg doctor` complete with safe navigation, auditable session state, and prioritized health findings.

### Tests for User Story 4

- [ ] T033 [P] [US4] Add contract coverage for `sg time-travel`, `sg pair`, and `sg doctor` in tests/contract/recovery.contract.test.ts and tests/contract/cli-output.contract.test.ts
- [ ] T034 [P] [US4] Add integration coverage for advanced recovery flows in tests/integration/time-travel.integration.test.ts, tests/integration/pair.integration.test.ts, and tests/integration/doctor.integration.test.ts
- [ ] T035 [P] [US4] Add unit coverage for pair-session state and doctor findings in tests/unit/coreServices.test.ts and tests/unit/workflowState.test.ts

### Implementation for User Story 4

- [ ] T036 [US4] Implement safe temporal navigation flow in src/commands/time-travel.ts, src/core/git.ts, and src/core/resolver.ts
- [ ] T037 [US4] Implement pair-session lifecycle persistence and audit events in src/commands/pair.ts, src/core/workflowState.ts, and src/core/telemetry.ts
- [ ] T038 [US4] Implement doctor health audit and prioritized reporting in src/commands/doctor.ts, src/core/repositorySnapshot.ts, and src/core/output.ts
- [ ] T039 [US4] Register advanced recovery command surfaces in src/cli.ts

**Checkpoint**: Advanced recovery and collaboration modes are independently functional and reversible where required.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finish documentation, regressions, and release-quality verification across all stories.

- [ ] T040 [P] Update feature and product documentation for new workflows in README.md, docs/index.html, and specs/002-indispensable-git-assistant/quickstart.md
- [ ] T041 Verify performance budgets and long-running progress cadence in tests/integration/performance.integration.test.ts
- [ ] T042 [P] Add cross-command output consistency regressions in tests/contract/cli-output.contract.test.ts and tests/contract/wtf.contract.test.ts
- [ ] T043 Harden provider/config security and warning paths in src/core/config.ts, src/commands/ai-configure.ts, and src/hosting/index.ts
- [ ] T044 Run quickstart validation and align examples with shipped command behavior in specs/002-indispensable-git-assistant/quickstart.md
- [ ] T045 Run full quality gates via package.json (`build`, `lint`, `typecheck`, `test`) and fix any remaining issues referenced by package.json
- [ ] T046 Implement rollout controls for high-risk automation paths in src/core/config.ts, src/commands/ship.ts, and src/commands/wtf.ts
- [ ] T047 Add rollout-control verification coverage in tests/integration/ship.integration.test.ts and tests/integration/wtf.integration.test.ts
- [ ] T048 Implement AI context scoping, redaction, and size-limit policy in src/core/config.ts, src/ai/providers.ts, and src/core/output.ts
- [ ] T050 Define and execute post-release rollout-signal verification checklist (owner, signal set, pass/fail thresholds, rollback triggers, and verification window) in specs/002-indispensable-git-assistant/quickstart.md and specs/002-indispensable-git-assistant/checklists/safety.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup** starts immediately.
- **Phase 2: Foundational** depends on Setup and blocks all user story work.
- **Phase 3: US1** and **Phase 4: US2** can start after Foundational is complete.
- **Phase 5: US3** can start after Foundational is complete and may run in parallel with US1/US2 if staffing allows.
- **Phase 6: US4** can start after Foundational is complete, but is lowest priority and is best sequenced after the P1/P2 work unless extra capacity exists.
- **Phase 7: Polish** depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other user stories; recommended MVP.
- **US2 (P1)**: No dependency on US1 once foundational workflow and config support is ready.
- **US3 (P2)**: No hard dependency on US1 or US2, but benefits from the shared hosting/provider foundation created earlier.
- **US4 (P3)**: No hard dependency on other stories, but should follow the earlier stories for delivery priority.

### Recommended Delivery Order

1. Complete Setup and Foundational phases.
2. Deliver **US1** as the MVP slice and validate `sg wtf` learning independently.
3. Deliver **US2** for daily workflow automation.
4. Deliver **US3** for hosted collaboration awareness.
5. Deliver **US4** for advanced recovery and collaboration modes.
6. Finish with Polish and full quality gates.

## Parallel Opportunities

### User Story 1

```text
T010, T011, and T012 can run in parallel because they touch different test files.
T013 and T014 can proceed in parallel after T012 if the team splits persistence and AI-context work.
```

### User Story 2

```text
T017, T018, and T019 can run in parallel as separate contract, integration, and unit layers.
T021 and T023 can run in parallel after T020 because sync and split touch different command flows.
```

### User Story 3

```text
T025, T026, and T027 can run in parallel across contract, integration, and unit coverage.
T030 and T031 can run in parallel after T028 and T029 establish shared hosting behavior.
```

### User Story 4

```text
T033, T034, and T035 can run in parallel as separate test layers.
T036, T037, and T038 can run in parallel after foundational work because they target distinct commands.
```

## Implementation Strategy

### MVP First

1. Finish Setup and Foundational phases.
2. Complete User Story 1.
3. Validate `sg wtf --learn` and `sg wtf --fix-ci` independently.
4. Stop for review before expanding the command surface further.

### Incremental Delivery

1. Ship US1 for immediate diagnostic value.
2. Add US2 for daily workflow automation.
3. Add US3 for collaboration awareness.
4. Add US4 for advanced recovery and pairing.

### Parallel Team Strategy

1. One developer finishes shared persistence/config/provider foundations.
2. After Phase 2, split ownership by story:
   - Developer A: US1 diagnostics and learning.
   - Developer B: US2 delivery workflows.
   - Developer C: US3 hosted collaboration.
3. Fold US4 and Polish back into the shared queue once the P1/P2 stories stabilize.

## Notes

- Every task follows the required `- [ ] T### ...` checklist format.
- `[P]` markers are used only where tasks touch different files and can proceed independently.
- User story labels are applied only to story-phase tasks.
- Each story includes standalone tests so it can be validated independently before moving on.