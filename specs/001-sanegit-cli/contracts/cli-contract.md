# CLI Contract: SaneGit (`sg`)

## Command Surface

- Binary: `sg`
- Package: `sanegit`
- Commands:
  - `sg status`
  - `sg commit`
  - `sg push`
  - `sg check`
  - `sg fix`
  - `sg undo`
  - `sg explain`
  - `sg wtf`
  - `sg ai-configure`

## Universal Output Contract

All commands MUST emit consistent sections:

1. Summary
2. Risk
3. Recommendation
4. Detail (optional)

## Common Exit Codes

- `0`: Successful operation
- `1`: User-correctable command/runtime issue
- `2`: Configuration or authentication issue
- `3`: Git state conflict requiring manual intervention

## Command Contracts

### `sg status`

- Purpose: Summarize repository state and immediate next actions.
- Inputs: current repository context.
- Outputs:
  - branch divergence (`aheadBy`, `behindBy`)
  - staged/unstaged/untracked summary
  - risk-level and recommended next action

### `sg commit`

- Purpose: Generate safe commit proposal and execute after confirmation.
- Inputs: staged changes, optional commit hint.
- Behavior:
  - proposes message
  - previews included change scope
  - requires explicit confirmation before commit write

### `sg push`

- Purpose: Predict push risks and push safely.
- Inputs: branch state, remote state, optional force intent.
- Behavior:
  - performs pre-push checks
  - blocks unsafe push unless explicitly acknowledged
  - emits degraded-mode notice if AI checks unavailable

### `sg check`

- Purpose: Evaluate merge/integration risk before queueing or merging.
- Inputs: branch, target integration context.
- Outputs: risk classification and remediation suggestions.

### `sg fix`

- Purpose: Recover from common git failure states.
- Inputs: current failure state (conflict, interrupted operation, rejected push).
- Behavior:
  - presents safe plan
  - previews changes
  - executes approved steps

### `sg undo`

- Purpose: Safely roll back recent user actions.
- Inputs: desired rollback scope.
- Behavior:
  - lists rollback options and consequences
  - requires confirmation for destructive impacts

### `sg explain`

- Purpose: Explain diffs or operation results in plain language.
- Inputs: diff range or pending changes.
- Outputs: intent summary, impact, and recommended next step.

### `sg wtf`

- Purpose: Run a panic-button diagnosis that finds everything wrong with the current repository state and offers a fix-oriented next step.
- Inputs: current repository context, optional GitHub CLI access, and merge queue predictor context.
- Behavior:
  - runs repository diagnostics in parallel
  - combines local and optional remote findings into a single urgency-ordered report
  - degrades gracefully when optional diagnostics are unavailable
  - recommends `sg fix` or equivalent next steps when actionable faults are found

## AI Provider Configuration Contract

### `sg ai-configure` (setup flow)

- Required selections:
  - provider: `openai|anthropic|gemini|mistral|custom`
  - custom URL (if provider = custom, otherwise optional override)
  - credential source: keychain reference or environment variable

### Configuration Rules

- Allow custom URLs including HTTP.
- Warn explicitly on non-HTTPS URL.
- Persist only non-secret references in `.sanegit/config.json`.
- Resolve secrets from OS keychain or environment variable.

## Error Contract

- Errors MUST be plain-English and actionable.
- If AI call fails or times out, command continues with non-AI fallback and marks output as degraded mode.
