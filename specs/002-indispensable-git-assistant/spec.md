# Feature Specification: Indispensable Git Assistant

**Feature Branch**: `002-create-feature-branch`  
**Created**: 2026-04-21  
**Status**: Draft  
**Input**: User description: "@file:prd-mvp2.md"

## Clarifications

### Session 2026-04-21

- Q: What should the default confirmation model be for risky automation in `sg sync`, `sg ship`, and `sg wtf --fix-ci`? → A: Hybrid: confirm only for destructive local changes, auto-run remote-safe actions.
- Q: After how many qualifying runs should learned warnings become active for `sg wtf --learn`? → A: Activate learned warnings after 10 qualifying runs per repository.
- Q: Should advanced team/CI/queue/ship integrations be GitHub-only or host-agnostic in v1? → A: Make all advanced integrations host-agnostic from the start.
- Q: How should `sg ship` handle long-running CI and merge completion by default? → A: Run synchronously through setup, then hand off CI waiting and auto-merge to a tracked background workflow.
- Q: How much repository content may be sent to external AI providers once AI is enabled? → A: Allow full diff and file context automatically whenever AI is enabled.


## User Scenarios & Testing *(mandatory)*

### User Story 1 - Predictive Fault Intelligence (Priority: P1)

As a developer, I want `sg wtf` to learn from recurring repository issues and explain conflict/CI failures with actionable context so I can prevent failures before pushing and recover quickly when they happen.

**Why this priority**: This directly upgrades the most trusted recovery command and gives immediate daily value with lower workflow disruption than introducing new commands.

**Independent Test**: Run `sg wtf` repeatedly in a repository with repeated conflict/CI patterns and verify that the command surfaces learned warnings, forensic context, and concrete remediation suggestions without requiring any cloud service.

**Acceptance Scenarios**:

1. **Given** repeated patterns in local repository incidents, **When** the user runs the learning mode enough times, **Then** `sg wtf` warns about likely upcoming failures before push.
2. **Given** a merge conflict, **When** the user runs `sg wtf`, **Then** the output includes line-level context, recent related contributor change intent, and a proposed resolution direction.
3. **Given** a failed CI run, **When** the user runs `sg wtf` with CI-fix mode, **Then** the output identifies likely failing test root cause and offers a safe fix handoff to recovery flow.

---

### User Story 2 - One-Command Delivery Flow (Priority: P1)

As a developer, I want one-command workflows for sync, shipping, and intent-based commit splitting so routine git steps no longer require repetitive manual command sequences.

**Why this priority**: This removes high-frequency friction and converts SaneGit from diagnostic tooling into a daily execution workflow.

**Independent Test**: In a repository with uncommitted work and an open pull request workflow, run each command (`sg sync`, `sg ship`, `sg split`) independently and verify each command completes its full workflow with explicit checkpoints, tracked background continuation for long-running remote steps, and user confirmations where risk exists.

**Acceptance Scenarios**:

1. **Given** local divergence from the main branch, **When** the user runs `sg sync`, **Then** work is safely preserved and branch updates are applied in the correct order with conflict handling guidance.
2. **Given** code ready to deliver, **When** the user runs `sg ship`, **Then** preflight checks, remediation steps, push, and PR handling run immediately, and any CI waiting or merge completion continues as a tracked background workflow with resumable status.
3. **Given** mixed-intent changes in one working set, **When** the user runs `sg split`, **Then** SaneGit proposes logical commit groups and allows the user to confirm grouped commit creation.

---

### User Story 3 - Team Change Awareness (Priority: P2)

As a developer, I want team-aware ownership and merge queue context so I can avoid stepping into active changes and reduce preventable conflicts.

**Why this priority**: Team intelligence creates multiplicative value for collaborative repositories after core single-developer workflow improvements are in place.

**Independent Test**: In a repository with multi-author history and active pull requests, run `sg who`, `sg blame --explain`, and `sg queue --team` and verify each command provides contributor context and proactive coordination guidance.

**Acceptance Scenarios**:

1. **Given** a target file with multi-author history, **When** the user runs `sg who`, **Then** ownership distribution and active collaborator signals are presented with suggested coordination action.
2. **Given** a changed line, **When** the user runs `sg blame --explain`, **Then** the output includes human-readable reason context for the historical change.
3. **Given** an active merge queue, **When** the user runs `sg queue --team`, **Then** queue order, estimated wait impact, and likely conflict risk are shown with recommended timing.

---

### User Story 4 - Advanced Recovery and Collaboration Modes (Priority: P3)

As a developer, I want natural-language historical navigation, lightweight pair session support, and deep repository diagnostics so I can recover from complex states and coordinate difficult work quickly.

**Why this priority**: These features are differentiators that increase long-term stickiness after core workflows and team awareness are stable.

**Independent Test**: Execute `sg time-travel`, `sg pair`, and `sg doctor` in isolation and verify each command completes its promised flow with clear safeguards and reversible actions where applicable.

**Acceptance Scenarios**:

1. **Given** a temporal reference request, **When** the user runs `sg time-travel`, **Then** SaneGit resolves that reference to a valid project state and places the user in a safe working branch.
2. **Given** a pair programming session start request, **When** the user runs `sg pair start` and handoff commands, **Then** shared session state transitions are clear and auditable.
3. **Given** a repository health audit request, **When** the user runs `sg doctor`, **Then** the command reports prioritized health risks across performance, reliability, hygiene, and security dimensions.

### Edge Cases

- What happens when learning history is insufficient, noisy, or contradictory across recent runs?
- How does the system behave when repository metadata (CI, PRs, queue data) is unavailable or partially stale?
- How are destructive multi-step actions handled when one intermediate step succeeds and a later step fails?
- How does `sg ship` recover if the CLI exits after handoff but before CI or merge completion finishes?
- What guardrails apply when full repository diff or file context is automatically sent to an external AI provider?
- What happens when change grouping confidence is low for `sg split` and no safe grouping is obvious?
- How does team intelligence behave in single-author repositories or forks without collaboration signals?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a learn mode for `sg wtf` that records recurring repository failure patterns locally and updates confidence over time.
- **FR-002**: System MUST keep learned warnings inactive until a repository has accumulated 10 qualifying learn-mode runs for the relevant pattern set.
- **FR-003**: System MUST retain learned patterns in local SaneGit state with no mandatory cloud dependency.
- **FR-004**: System MUST surface pre-push warnings when learned patterns indicate elevated probability of conflict or test failure.
- **FR-005**: System MUST provide conflict forensics that explain what changed, why it likely conflicts, and what remediation path is recommended.
- **FR-006**: System MUST provide CI-failure diagnosis mode that identifies probable failing root cause and suggests next corrective action.
- **FR-007**: System MUST allow users to trigger safe remediation flow directly from CI and conflict diagnostics.
- **FR-008**: System MUST provide `sg sync` as a single guided operation that preserves local work while updating branch state against mainline.
- **FR-009**: System MUST provide `sg ship` as an orchestrated command that runs synchronously through preflight validation, remediation, push, and pull request setup before handing long-running remote steps to a tracked background workflow.
- **FR-010**: System MUST persist `sg ship` workflow state so users can inspect status, resume monitoring, and recover from CLI interruption during CI wait or merge completion.
- **FR-011**: System MUST provide `sg split` to propose and confirm multiple logical commits from mixed-intent local changes.
- **FR-012**: System MUST provide `sg who` file-level collaborator context including ownership distribution and recent activity indicators.
- **FR-013**: System MUST provide `sg blame --explain` line-level historical change context with plain-language rationale.
- **FR-014**: System MUST provide `sg queue --team` queue visibility with estimated sequencing impact and conflict risk hints.
- **FR-015**: System MUST support advanced hosted integrations through a host-agnostic interface rather than a provider-specific implementation.
- **FR-016**: System MUST provide `sg time-travel` to resolve natural-language temporal references into safe repository navigation actions.
- **FR-017**: System MUST provide `sg pair` session lifecycle actions for start, status, and handoff.
- **FR-018**: System MUST provide `sg doctor` full repository health report with prioritized issues and remediation guidance.
- **FR-019**: System MUST require confirmation before destructive local changes and other irreversible local actions.
- **FR-020**: System MUST auto-run remote-safe workflow steps by default when they do not discard local work or create irreversible local state changes.
- **FR-021**: System MUST ensure all new commands provide output in the existing Summary/Risk/Recommendation/Detail structure.
- **FR-022**: System MUST gracefully degrade when optional external signals are unavailable and still provide actionable local guidance.
- **FR-023**: System MUST automatically permit full diff and file context to be sent to the configured external AI provider whenever AI-powered analysis is enabled for a command.
- **FR-024**: System MUST clearly indicate when a command may use external AI analysis so users can distinguish local-only behavior from provider-backed behavior.

### User Experience Consistency Requirements *(mandatory for user-facing changes)*

- **UX-001**: Feature MUST reuse existing command output structure and risk terminology across all new commands and modes.
- **UX-002**: Feature MUST preserve keyboard-only usability and readable output in both colorized and non-colorized terminals.
- **UX-003**: Any new prompt or confirmation pattern MUST remain concise, reversible where possible, and consistent with existing SaneGit interaction style.

### Performance Requirements *(mandatory)*

- **PR-001**: Primary command responses (`sg wtf`, `sg sync`, `sg split`) MUST return initial actionable output within 2 seconds for typical repositories (up to 5k tracked files) excluding external network latency.
- **PR-002**: Commands with external dependencies (`sg ship`, `sg queue --team`, CI-aware flows) MUST provide progress updates at least every 10 seconds until completion.
- **PR-003**: Regression in median runtime for existing commands (`status`, `wtf`, `check`) MUST not exceed 15% versus current baseline under equivalent repository conditions.
- **PR-004**: Learned pattern storage MUST remain bounded so local SaneGit state growth stays under 10 MB per repository without manual cleanup.

### Key Entities *(include if feature involves data)*

- **Learned Pattern**: A local record of recurring repository behavior including trigger context, frequency, recency, confidence score, and recommended warning text.
- **Diagnostic Insight**: A structured explanation item linking observed failure state to likely cause and remediation recommendation.
- **Workflow Run**: A tracked execution instance for multi-step commands (`sync`, `ship`, `split`, `pair`) including synchronous steps, background handoff state, step outcomes, and rollback or resume hints.
- **Team Signal**: Aggregated contributor and queue context for a file or branch including ownership percentages, active change indicators, and conflict likelihood.
- **Repository Health Finding**: A prioritized risk item from deep audit dimensions (history hygiene, reliability, performance, security, stale artifacts).
- **Hosted Integration Provider**: An abstraction layer that retrieves pull request, CI, queue, blame, and merge state from supported source control platforms using a common contract.
- **AI Context Payload**: The full diff, file content, and related repository context transmitted to an external AI provider when AI-backed analysis is enabled.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Learned warnings become eligible only after 10 qualifying runs per repository and activate correctly for at least 95% of patterns that meet that threshold.
- **SC-002**: At least 80% of recurring conflict/test failure patterns observed in the previous 30 days are warned before push after learning baseline is established.
- **SC-003**: Users complete branch sync tasks with 50% fewer manual shell commands compared with the current documented workflow.
- **SC-004**: At least 70% of mixed-intent change sets evaluated with `sg split` are accepted with minimal manual regrouping (one edit or fewer).
- **SC-005**: Mean time from “ready to deliver” to merged pull request is reduced by 30% for users adopting `sg ship`.
- **SC-006**: Preventable merge conflict incidents on active team-owned files are reduced by 25% after introducing team awareness commands.
- **SC-007**: At least 90% of command runs involving partial external-data outages still produce actionable local recommendations.

## Assumptions

- Existing SaneGit command architecture and local `.sanegit` state storage remain available for extension without migration blockers.
- Users can authenticate to repository hosting and CI tooling through existing local credentials when optional team/CI features are invoked.
- Users who enable external AI-backed commands accept that full relevant diff and file context may be transmitted to the configured provider by default.
- Initial rollout can ship in phased increments while preserving backward compatibility for existing commands.
- Team-intelligence features are intended for repositories where contributor and pull request metadata is accessible through a supported hosting provider integration.
- Natural-language temporal references for `time-travel` are interpreted using reasonable developer-oriented defaults when phrasing is ambiguous.
