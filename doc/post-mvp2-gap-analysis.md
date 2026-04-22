# Post-MVP2 Gap Analysis

Generated: 2026-04-22

## Overview

This document identifies implementation gaps between the current codebase (v0.2.4) and the specification requirements defined in `specs/002-indispensable-git-assistant/spec.md`.

---

## 1. Hosting Provider Gap

**Status**: Partial Implementation

- **Spec Requirement (FR-015)**: "System MUST support advanced hosted integrations through a host-agnostic interface rather than a provider-specific implementation."
- **Current State**: Only GitHub provider implemented
- **Affected Files**:
  - `src/hosting/index.ts:29` - Returns `UnknownHostedProvider` for non-GitHub
  - `src/hosting/github.ts` - Only GitHub implementation exists
- **Missing**: GitLab, Bitbucket, and other hosting providers
- **Impact**: Team features like `sg queue --team`, `sg who`, and CI diagnostics only work with GitHub repositories

---

## 2. Predictive Warnings Not Integrated

**Status**: Implemented but not wired

- **Spec Requirement (FR-004)**: "System MUST surface pre-push warnings when learned patterns indicate elevated probability of conflict or test failure."
- **Current State**:
  - Pattern learning exists in `src/core/memory.ts` and `src/core/patternLearner.ts`
  - `LEARN_ACTIVATION_THRESHOLD = 10` correctly implemented per spec
  - `getPredictiveWarnings()` function exists but is NOT called by the `push` command
- **Affected Files**:
  - `src/commands/push.ts` - Does not check learned patterns before pushing
  - `src/core/patternLearner.ts` - Unused predictive warning capability
- **Impact**: Users cannot receive learned warnings before pushing despite having the learning infrastructure

---

## 3. Queue Command Incomplete

**Status**: Partial Implementation

- **Spec Requirement (FR-014)**: "System MUST provide `sg queue --team` queue visibility with estimated sequencing impact and conflict risk hints."
- **Spec Acceptance Criteria**: "queue order, estimated wait impact, and likely conflict risk are shown with recommended timing."
- **Current State**: `src/commands/queue.ts` only shows basic merge queue state
- **Missing**:
  - Queue order display (position in queue)
  - Estimated wait impact (time-based)
  - Conflict risk hints per position
  - Recommended timing for queueing
- **Affected Files**:
  - `src/commands/queue.ts:4-21` - Minimal implementation
  - `src/hosting/github.ts` - Needs queue detail methods

---

## 4. CLI Version Mismatch

**Status**: Done

- **Current State**:
  - `package.json:3` declares version `"0.2.4"`
  - `src/cli.ts` now reads version dynamically from `package.json` at runtime
- **Solution**: Added `getVersion()` function that reads from `package.json` using synchronous fs read
- **Impact**: Version now automatically stays in sync during build

---

## 5. Output Contract Verification Needed

**Status**: Likely Complete (needs verification)

- **Spec Requirement (UX-001)**: "Feature MUST reuse existing command output structure and risk terminology"
- **Spec Requirement (FR-021)**: "System MUST ensure all new commands provide output in the existing Summary/Risk/Recommendation/Detail structure."
- **Current State**: Most commands use `writeOutput()` but some may not include all 4 sections
- **Affected Files**:
  - `src/commands/fix.ts` - Calls `writeOutput(plan)` - verify plan has all fields
  - `src/commands/check.ts` - Calls `writeOutput(plan)` - verify plan has all fields

---

## 6. Workflow State Persistence

**Status**: Implemented (needs verification)

- **Spec Requirement (FR-010)**: "System MUST persist `sg ship` workflow state so users can inspect status, resume monitoring, and recover from CLI interruption during CI wait or merge completion."
- **Current State**:
  - `src/core/workflowState.ts` exists with persistence
  - `src/cli.ts:189-191` has `--status` flag for `sg ship`
- **Needs Verification**:
  - Full resume capability after CLI interruption
  - Rollback hints implementation
  - Background workflow tracking completeness

---

## 7. Missing Test Coverage

**Status**: Infrastructure Available

- **Spec Requirement**: All features should have tests
- **Current State**: No explicit tests found for:
  - `pair` command (`src/commands/pair.ts`)
  - `time-travel` command (`src/commands/time-travel.ts`)
  - Integration between learning system and push safety
  - GitLab/Bitbucket hosting provider (not implemented)

---

## Summary Table

| Gap | Priority | Status |
|-----|----------|--------|
| Hosting Provider (GitLab/Bitbucket) | P2 | Missing |
| Predictive Warnings Integration | P1 | Not Wired |
| Queue --team Completeness | P2 | Partial |
| Version Mismatch | Low | Done |
| Output Contract Verification | Medium | Verify |
| Workflow State Persistence | Medium | Verify |
| Test Coverage | Low | Missing |

---

## Recommendations

1. **High Priority**: Wire `getPredictiveWarnings()` into the `push` command to satisfy FR-004
2. **High Priority**: Add GitLab/Bitbucket providers or document as GitHub-only for v1
3. **Medium Priority**: Enhance `sg queue --team` with queue position, wait estimates, and risk hints
4. ~~**Low Priority**: Fix CLI version mismatch~~ (Done)
5. **Low Priority**: Add tests for `pair` and `time-travel` commands
