# Research: Indispensable Git Assistant

## Decision 1: Hosted Integration Architecture
- Decision: Introduce a host-agnostic `src/hosting/` adapter layer with a shared `HostingProvider` contract and provider auto-detection from repository remotes plus explicit config override.
- Rationale: The existing AI provider abstraction already separates provider-specific behavior from command flows. Reusing that pattern keeps hosted integrations out of command modules and supports the spec requirement that advanced integrations be host-agnostic from the start.
- Alternatives considered:
  - GitHub-only implementation: rejected because it violates the clarified host-agnostic requirement and creates refactor debt.
  - Provider switching inside command handlers: rejected because it spreads hosted API logic across commands and weakens testability.

## Decision 2: `sg ship` Workflow Persistence
- Decision: Persist resumable delivery workflow state in `.sanegit/workflows.json` with explicit checkpoints for preflight, remediation, push, PR creation, CI waiting, and merge completion.
- Rationale: The repo already uses local JSON files under `.sanegit/` for config and memory. A structured workflow journal fits the same model and satisfies the clarified requirement that `sg ship` hand off long-running remote work to a tracked background workflow.
- Alternatives considered:
  - In-memory workflow tracking only: rejected because it cannot survive CLI interruption.
  - Separate workflow file per run: rejected because a single indexed JSON file is simpler for inspection and bounded local state.

## Decision 3: Local Learning Storage for `sg wtf --learn`
- Decision: Extend `.sanegit/memory.json` with repository-scoped learned pattern records that track occurrence counts, recent runs, confidence, warning text, and eviction metadata.
- Rationale: Local-first learning is a hard product requirement. Extending the existing memory store avoids introducing parallel persistence logic and makes bounded pruning easier to enforce.
- Alternatives considered:
  - Dedicated learned-pattern file: rejected because it duplicates load/save logic with no meaningful isolation benefit.
  - External pattern service: rejected because the feature must operate without mandatory cloud dependencies.

## Decision 4: AI Context Handling and Transparency
- Decision: When AI is enabled, commands may automatically send full relevant diff and file context to the configured provider, and user-visible output must clearly indicate when external AI analysis was used.
- Rationale: This matches the clarified product direction while preserving trust through explicit output markers. It also keeps local-only fallback behavior available whenever AI calls fail or the provider is not configured.
- Alternatives considered:
  - Explicit per-command opt-in for external context: rejected because it conflicts with the clarified default.
  - Silent AI use with no output marker: rejected because it weakens transparency and violates the spec’s distinction between local-only and provider-backed behavior.

## Decision 5: Output and Workflow UX Consistency
- Decision: Preserve the current `Summary`, `Risk`, `Recommendation`, and `Detail` structure for all new commands, including background workflow status commands and degraded-mode notices.
- Rationale: The constitution and feature spec both treat UX consistency as non-negotiable. Reusing the existing formatter avoids fragmenting command behavior as the CLI grows.
- Alternatives considered:
  - Custom progress screens for long-running commands: rejected because they would introduce a second user interaction model.
  - Provider-specific output blocks: rejected because they reduce consistency and complicate contract testing.

## Decision 6: Testing and Validation Strategy
- Decision: Cover the feature with three layers: unit tests for learning/workflow/provider state, integration tests with fixture repositories for end-to-end command behavior, and contract tests for command surface and output invariants.
- Rationale: The feature expands both behavior and surface area. The existing Vitest-based setup already supports this structure and aligns with the constitution requirement that tests define done.
- Alternatives considered:
  - Unit tests only: rejected because multi-step git workflows and hosted integrations need realistic repository fixtures.
  - Manual validation only: rejected because it cannot defend against regressions in command UX or persistence behavior.
