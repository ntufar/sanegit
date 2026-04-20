# Research: SaneGit Command Assistant

## Decision 1: CLI and Process Execution Stack
- Decision: Use TypeScript + Node.js CLI with `commander` for command routing and `execa` for git process execution.
- Rationale: Strong ecosystem support for cross-platform CLIs, predictable process control, and straightforward testability of command handlers.
- Alternatives considered:
  - Native shell scripts: faster bootstrap but weak portability and maintainability.
  - Go/Rust rewrite: strong runtime performance but slower feature velocity for this product stage.

## Decision 2: AI Provider Integration Approach
- Decision: Introduce a provider adapter layer that supports predefined providers (OpenAI, Anthropic, Gemini, Mistral) plus arbitrary custom URL endpoints.
- Rationale: Decouples command behavior from provider SDK details and preserves flexibility for self-hosted or compatible endpoints.
- Alternatives considered:
  - Single-provider implementation: simpler but violates product requirement for provider choice.
  - Custom URL only: flexible but hurts onboarding and discoverability.

## Decision 3: Credential Strategy
- Decision: Persist only non-secret credential references in `.sanegit/config.json`; load secrets from OS keychain or environment variables.
- Rationale: Aligns with security requirements and keeps repo-local config safe to share.
- Alternatives considered:
  - Plaintext keys in config: unacceptable security risk.
  - Encrypted local blob only: adds key management complexity and still risks accidental handling errors.

## Decision 4: Degraded-Mode Behavior
- Decision: When AI requests fail or timeout, continue command execution with non-AI fallback and explicit degraded-mode notice.
- Rationale: Maintains core git usability while making reliability state visible.
- Alternatives considered:
  - Hard fail on AI outage: blocks core workflows and increases operational friction.
  - Silent fallback: avoids interruption but hides reliability issues from users.

## Decision 5: Performance Validation Strategy
- Decision: Add benchmark/integration timing assertions for `status`, `explain`, and `check` (p95 under 2s) and preview operations under 1s.
- Rationale: Converts performance goals into enforceable checks early.
- Alternatives considered:
  - Manual spot testing only: insufficient for regression prevention.
  - Full synthetic load harness initially: high setup overhead for initial release.

## Decision 6: Repository Memory Design
- Decision: Use `.sanegit/memory.json` for learned, non-secret repository patterns (conflict patterns, preferred recommendations, command usage hints).
- Rationale: Enables personalization without introducing external state dependencies.
- Alternatives considered:
  - Global machine memory only: weak per-repo contextual accuracy.
  - Database-backed memory: overkill for MVP scope.
