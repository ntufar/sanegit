# CLI Contract: Indispensable Git Assistant

## Command Surface

- Binary: `sg`
- Expanded commands and modes covered by this feature:
  - `sg wtf --learn`
  - `sg wtf --fix-ci`
  - `sg sync`
  - `sg ship`
  - `sg ship status`
  - `sg split`
  - `sg who <path>`
  - `sg blame --explain <path>[:line]`
  - `sg queue --team`
  - `sg time-travel <reference>`
  - `sg pair start|status|handoff`
  - `sg doctor`

## Universal Output Contract

All commands MUST emit the same top-level sections in order:

1. `Summary`
2. `Risk`
3. `Recommendation`
4. `Detail` (optional, repeatable lines allowed)

Additional output rules:

- Commands using external AI analysis MUST clearly indicate that provider-backed analysis was used.
- Commands falling back to local-only or degraded behavior MUST state that explicitly.
- Commands with resumable state MUST include the workflow identifier or a resume hint in `Detail`.

## Common Exit Codes

- `0`: Successful operation
- `1`: User-correctable command or runtime issue
- `2`: Configuration, authentication, or provider setup issue
- `3`: Git conflict or workflow blockage requiring manual intervention

## Command Contracts

### `sg wtf --learn`

- Purpose: Learn recurring repository failure patterns and improve future warning quality.
- Inputs: Current repository state, optional AI provider context, local memory state.
- Behavior:
  - Records or updates learned pattern candidates locally.
  - Does not emit proactive learned warnings until 10 qualifying runs are accumulated for a pattern.
  - Works without AI; when AI is enabled, may automatically send full relevant diff and file context.

### `sg wtf --fix-ci`

- Purpose: Diagnose CI failures and offer a safe remediation path.
- Behavior:
  - Explains likely root cause.
  - Reuses the standard output contract.
  - Confirms before destructive local changes.

### `sg sync`

- Purpose: Safely preserve local work and update branch state against mainline.
- Behavior:
  - Detects uncommitted and divergent state before action.
  - Auto-runs remote-safe steps.
  - Requires confirmation only for destructive or irreversible local actions.

### `sg ship`

- Purpose: Execute a one-command delivery flow from validation through merge completion.
- Behavior:
  - Runs synchronously through preflight, remediation, push, and pull request setup.
  - Hands off CI waiting and merge completion to tracked background workflow state.
  - Persists checkpoints for inspection and recovery.

### `sg ship status`

- Purpose: Inspect the latest persisted ship workflow.
- Outputs:
  - Current workflow phase
  - Latest checkpoint outcome
  - Resume hint or next action

### `sg split`

- Purpose: Propose logical commit groups from mixed-intent changes.
- Behavior:
  - Shows proposed groups before writing commits.
  - Supports regrouping confirmation flow.

### `sg who`

- Purpose: Show collaborator ownership and recent activity for a file or path.
- Behavior:
  - Uses hosted integration when available.
  - Falls back to local git history when hosted signals are unavailable.

### `sg blame --explain`

- Purpose: Turn line history into human-readable rationale and context.
- Behavior:
  - Accepts file and optional line selector.
  - Includes local blame data and optional hosted collaboration context.

### `sg queue --team`

- Purpose: Show merge queue state, likely wait impact, and conflict timing guidance.
- Behavior:
  - Uses hosted provider support when available.
  - Returns actionable local guidance when queue data is unavailable.

### `sg time-travel`

- Purpose: Resolve natural-language historical references into a safe navigation action.
- Behavior:
  - Creates a safe working context rather than mutating the current branch silently.

### `sg pair`

- Purpose: Manage pair-programming session lifecycle.
- Modes:
  - `start`
  - `status`
  - `handoff`

### `sg doctor`

- Purpose: Run a prioritized repository health audit.
- Outputs:
  - Reliability, performance, hygiene, and security findings
  - Recommended remediation order

## Persistence Contract

- `.sanegit/memory.json` stores learned patterns and repository-local behavioral memory.
- `.sanegit/workflows.json` stores active and recent resumable workflow state.
- `.sanegit/audit.log` records structured workflow and degraded-mode events.

## Error Contract

- Errors MUST be plain-English and actionable.
- Provider unavailability MUST not crash commands that have a local fallback path.
- Commands with blocked workflow state MUST explain whether the user can retry, resume, or must intervene manually.
