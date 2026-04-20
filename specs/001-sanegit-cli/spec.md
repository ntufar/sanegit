# Feature Specification: SaneGit Command Assistant

**Feature Branch**: `001-build-sanegit-cli`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "Build sanegit - a CLI that makes git usable by predicting problems, fixing them automatically, and explaining in plain English."

## Clarifications

### Session 2026-04-21

- Q: Where should API credentials be sourced and persisted for AI provider access? -> A: Support secure keychain by default with environment variable override.
- Q: What custom endpoint policy should apply for user-provided AI API URLs? -> A: Allow any custom URL, including HTTP.
- Q: What should happen when the AI provider is unavailable during command execution? -> A: Continue with non-AI fallback output and show degraded-mode notice.
- Q: How should API keys be stored locally? -> A: Store only key reference locally; actual key stays in OS keychain or environment variable.
- Q: Which predefined AI providers should be included initially? -> A: OpenAI, Anthropic, Google (Gemini), and Mistral.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Understand Repository State Quickly (Priority: P1)

As a developer, I can run a single command to see repository health, branch risk, and next safe actions in plain English so I can make progress without decoding raw git output.

**Why this priority**: Most day-to-day git friction starts with uncertainty about current state; solving this first unlocks every other workflow.

**Independent Test**: Can be fully tested by running status and explain commands in clean, dirty, and conflicted repositories and verifying that users can identify what to do next without reading raw git messages.

**Acceptance Scenarios**:

1. **Given** a repository with uncommitted changes, **When** the user runs the status command, **Then** the tool returns a plain-language summary of change types, risk level, and recommended next steps.
2. **Given** a repository with incoming and outgoing changes, **When** the user runs the status command, **Then** the tool explains branch divergence and whether push/pull actions are safe.

---

### User Story 2 - Commit and Push Safely (Priority: P2)

As a developer, I can create smart commits and push with predictive checks and guided fixes so I avoid broken history, rejected pushes, and avoidable conflicts.

**Why this priority**: Commit and push operations are high-frequency and high-impact; improving them prevents the most common costly mistakes.

**Independent Test**: Can be tested by running commit and push flows across normal, diverged, and conflict-prone branches and confirming the tool blocks unsafe actions and proposes clear remediation.

**Acceptance Scenarios**:

1. **Given** staged and unstaged changes, **When** the user runs the commit command, **Then** the tool proposes a clear commit message and states what is included before confirmation.
2. **Given** a branch likely to hit merge or policy issues, **When** the user runs push, **Then** the tool performs predictive checks, warns about risks, and offers safe fix options before pushing.

---

### User Story 3 - Recover from Problems Confidently (Priority: P3)

As a developer, I can run fix, undo, and check commands to recover from common git failures with low risk and clear explanations.

**Why this priority**: Recovery workflows are less frequent but critical when needed; confidence here reduces panic-driven mistakes.

**Independent Test**: Can be tested by introducing known failure states (conflicts, bad commit, accidental changes) and validating users can recover using the tool without manual git surgery.

**Acceptance Scenarios**:

1. **Given** a merge conflict, **When** the user runs fix, **Then** the tool provides a safe resolution plan and applies approved steps.
2. **Given** an undesired recent action, **When** the user runs undo, **Then** the tool presents available rollback options with consequences and performs the selected safe rollback.

---

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Repository is not initialized or is in a detached HEAD state.
- Working tree contains binary files or very large changes where automatic explanation quality may degrade.
- Remote is unavailable or authentication fails during push.
- AI provider endpoint is unavailable, misconfigured, or returns authentication errors.
- Conflicts cannot be auto-resolved with high confidence.
- Undo request would remove unpushed commits or discard uncommitted work.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST provide a status command that summarizes repository state in plain English, including branch divergence, staged/unstaged changes, and immediate next actions.
- **FR-002**: System MUST provide an explain command that translates selected change sets into human-readable intent and impact.
- **FR-003**: System MUST provide a commit command that proposes commit messages and requires explicit user confirmation before writing a commit.
- **FR-004**: System MUST provide a push command that runs pre-push risk checks and blocks unsafe push attempts unless the user explicitly acknowledges risk.
- **FR-005**: System MUST provide a check command that evaluates likely merge-queue or integration risks before the user opens or updates integration work.
- **FR-006**: System MUST provide a fix command for common git failure states and present step-by-step recovery actions with a preview before execution.
- **FR-007**: System MUST provide an undo command that offers reversible rollback options and explains consequences before applying changes.
- **FR-008**: System MUST keep an operation memory profile per repository to improve relevance of explanations and recommendations over time.
- **FR-009**: System MUST persist user-configurable preferences and learned memory in a project-local configuration area.
- **FR-010**: System MUST display user-friendly errors with clear recovery guidance when automatic resolution is not possible.
- **FR-011**: System MUST log critical command actions and outcomes in a way that supports troubleshooting and trust.
- **FR-012**: System MUST offer consistent command help and output structure across status, commit, push, check, fix, undo, and explain workflows.
- **FR-013**: System MUST allow users to choose from predefined AI API providers: OpenAI, Anthropic, Google (Gemini), and Mistral.
- **FR-014**: System MUST allow users to provide any custom AI API base URL, including HTTP endpoints, instead of selecting a predefined provider.
- **FR-015**: System MUST store only a non-secret credential reference in project-local configuration; plaintext API keys MUST NOT be stored in local config files.
- **FR-016**: System MUST retrieve API credentials from OS secure keychain and support environment variable override for non-interactive and CI workflows.
- **FR-017**: System MUST validate AI configuration completeness and provide actionable guidance when provider, URL, keychain credential, or environment override is missing or invalid.
- **FR-018**: System MUST display an explicit risk warning when a non-HTTPS AI API URL is configured.
- **FR-019**: System MUST continue command execution using non-AI fallback behavior when AI provider calls fail or timeout.
- **FR-020**: System MUST clearly indicate degraded mode in command output when fallback behavior is used.

### User Experience Consistency Requirements *(mandatory for user-facing changes)*

- **UX-001**: Feature MUST use plain-English, action-oriented language consistently across all command outputs.
- **UX-002**: Feature MUST use a consistent structure for every command response: summary, risk level, recommendation, and optional detail.
- **UX-003**: Any newly introduced output pattern MUST document when and why it differs from the standard structure.
- **UX-004**: AI provider and credential setup flows MUST clearly separate provider selection, custom URL input, and API key input so users understand required steps.

### Performance Requirements *(mandatory)*

- **PR-001**: Status, explain, and check command responses MUST complete in under 2 seconds for repositories with up to 10,000 tracked files under normal local conditions.
- **PR-002**: Commit, fix, and undo pre-execution previews MUST appear in under 1 second for common workflows.
- **PR-003**: Any measurable command-latency regression above 20% from the baseline MUST be treated as a release blocker until mitigated or explicitly waived.

### Key Entities *(include if feature involves data)*

- **Repository Snapshot**: Current working state context including branch, change summary, divergence, and conflict markers.
- **Operation Plan**: Proposed sequence of safe actions for commit, push, fix, or undo workflows including risk annotation.
- **Explanation Artifact**: Human-readable interpretation of a change set or command result.
- **Memory Profile**: Repository-local learned patterns and user preferences used to tailor recommendations.
- **Safety Decision Record**: Confirmation choices for risk-bearing operations to support auditability and user trust.
- **AI Provider Configuration**: Selected predefined provider identifier or custom API base URL for AI-assisted features.
- **API Credential Record**: User-supplied API key reference associated with the chosen provider configuration.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 90% of users can identify the correct next git action within 30 seconds after running status in a mixed-state repository.
- **SC-002**: At least 85% of attempted commits using the smart commit workflow complete without user message rewrites.
- **SC-003**: Pre-push checks prevent at least 70% of simulated unsafe pushes in test scenarios before remote rejection occurs.
- **SC-004**: At least 80% of introduced conflict scenarios are resolved through fix or guided recovery without manual raw git command entry.
- **SC-005**: 100% of command outputs follow the defined response structure (summary, risk, recommendation, detail).
- **SC-006**: 95th percentile response time for status, explain, and check remains under 2 seconds for the defined repository size threshold.
- **SC-007**: At least 95% of users can complete AI provider setup (provider selection or custom URL plus API key) without external documentation.

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- Target users are developers comfortable with terminal usage but not necessarily advanced git internals.
- The first release targets local repository workflows and common remote interactions; enterprise policy integrations are out of scope.
- Users can grant the tool access to their repository working directory and local git metadata.
- Network connectivity may be intermittent; local explanations and planning should remain useful when remote calls fail.
- A repository-local configuration and memory area is acceptable for storing preferences and learned behavior.
