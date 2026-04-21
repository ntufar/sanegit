# Quickstart: Indispensable Git Assistant

## Prerequisites

- Node.js 22+
- Git installed and available on the shell path
- A local repository with a configured remote
- Optional: AI provider configuration for provider-backed explanations

## Install and Build

```bash
npm install
npm run build
npm link
sg --help
```

## Scenario 1: Teach `sg wtf` a Recurring Failure Pattern

```bash
sg wtf --learn
```

Expected:

- Records a repository-scoped learned pattern candidate in `.sanegit/memory.json`
- Does not activate proactive learned warnings until 10 qualifying runs are recorded
- Uses the normal `Summary / Risk / Recommendation / Detail` output structure
- Shows an AI-enhanced marker when external provider analysis was used

## Scenario 2: Run a Resumable Delivery Flow

```bash
sg ship
sg ship status
```

Expected:

- `sg ship` runs synchronously through preflight, remediation, push, and pull request setup
- CI waiting and merge completion hand off to tracked background workflow state in `.sanegit/workflows.json`
- `sg ship status` reports the latest checkpoint, risk level, and next action using the standard output contract

## Scenario 3: Sync Local Work Safely

```bash
sg sync
```

Expected:

- Preserves uncommitted work before updating against mainline
- Confirms only when a destructive local action is required
- Emits conflict handling guidance if sync cannot complete cleanly

## Scenario 4: Inspect Team and Queue Context

```bash
sg who src/commands/wtf.ts
sg blame --explain src/commands/wtf.ts
sg queue --team
```

Expected:

- Uses the active hosting provider adapter when available
- Degrades to actionable local guidance when hosted data is unavailable
- Keeps output consistent regardless of provider source

## Scenario 5: Validate Offline and Degraded Modes

1. Disable AI credentials or simulate provider outage.
2. Disable or misconfigure hosted integration credentials.
3. Run:

```bash
sg wtf --learn
sg ship status
sg queue --team
```

Expected:

- Commands still return actionable output without crashing
- Output explicitly distinguishes local-only fallback from provider-backed results
- Learned patterns and workflow state remain locally available even when remote services fail

## Performance Checkpoints

- `sg wtf`, `sg sync`, and `sg split` provide initial actionable output within 2 seconds on a typical 5k-file repository
- Hosted workflows emit progress/status updates at least every 10 seconds while waiting on remote systems
- Existing `sg status`, `sg wtf`, and `sg check` median runtime regression stays within 15% of current baseline
