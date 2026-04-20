# SaneGit Documentation

SaneGit (`sg`) is a CLI assistant that makes git usable by predicting problems, fixing them automatically, and explaining everything in plain English.

---

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [AI Provider Setup](#ai-provider-setup)
- [Commands](#commands)
  - [sg status](#sg-status)
  - [sg explain](#sg-explain)
  - [sg commit](#sg-commit)
  - [sg push](#sg-push)
  - [sg check](#sg-check)
  - [sg fix](#sg-fix)
  - [sg undo](#sg-undo)
  - [sg wtf](#sg-wtf)
- [Output Format](#output-format)
- [Exit Codes](#exit-codes)
- [Configuration](#configuration)
- [Degraded Mode](#degraded-mode)
- [Contributing](#contributing)

---

## Installation

**From npm (recommended):**

```bash
npm install -g @ntufar/sanegit
```

**From source:**

```bash
git clone https://github.com/ntufar/sanegit.git
cd sanegit
npm install
npm run build
npm link
```

---

## Getting Started

After installing, run any `sg` command inside a git repository:

```bash
cd my-project
sg status
```

For AI-powered explanations and suggestions, configure a provider first:

```bash
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY
```

Without a configured provider, all commands still work and return deterministic, rule-based output in **degraded mode**.

---

## AI Provider Setup

Use `sg ai-configure` to select and configure an AI provider.

```bash
sg ai-configure --provider <provider> [--credential-ref <ref>] [--base-url <url>]
```

### Supported providers

| Provider | `--provider` value |
|---|---|
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| Google Gemini | `gemini` |
| Mistral | `mistral` |
| Custom endpoint | `custom` |

### Credential storage

SaneGit never stores API keys in its config file. Pass a **reference** — the name of an environment variable or OS keychain entry — and the actual secret is resolved at runtime.

```bash
# Use an environment variable named OPENAI_API_KEY
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY

# Custom endpoint (HTTP is allowed but will show a warning)
sg ai-configure --provider custom --base-url https://my-llm.internal/v1 --credential-ref MY_TOKEN
```

Config is persisted to `.sanegit/config.json` in the current repository.

---

## Commands

### `sg status`

Show a plain-English summary of the current repository state.

```bash
sg status
```

**What it reports:**
- Staged, unstaged, and untracked file counts
- Branch divergence (`ahead by N`, `behind by N`)
- Overall risk level (`low` / `medium` / `high`)
- Recommended next action

**Example output:**
```
Summary: 3 staged files, 1 unstaged change, branch is 2 commits ahead of origin/main.
Risk: medium
Recommendation: Review unstaged change before committing. Push when ready.
```

---

### `sg explain`

Explain the current staged diff or a commit range in plain language.

```bash
sg explain
sg explain --range HEAD~3..HEAD
```

**What it reports:**
- Intent summary of what changed and why
- Impact assessment (files affected, functional scope)
- Recommended next step

---

### `sg commit`

Generate a commit message from staged changes and confirm before writing.

```bash
sg commit
sg commit --hint "fix login redirect"
```

**Behavior:**
1. Reads staged diff
2. Proposes a commit message
3. Previews the included change scope
4. Waits for explicit confirmation before committing

Pass `--hint` to guide the message generation.

---

### `sg push`

Predict push risks and push safely.

```bash
sg push
sg push --force
```

**Pre-push checks performed:**
- Branch divergence from remote
- Presence of unresolved conflicts
- CI status (when GitHub CLI is available)
- Merge queue readiness

**Behavior:**
- Blocks unsafe pushes unless explicitly acknowledged
- Prints a risk score and explanation before pushing
- Falls back to rule-based checks when AI is unavailable

---

### `sg check`

Evaluate merge and integration risk for the current branch.

```bash
sg check
sg check --target main
```

**What it checks:**
- Conflicts with target branch
- Stale branch age
- Uncommitted or diverged state
- CI failure indicators

Returns a risk classification (`low` / `medium` / `high`) and remediation suggestions.

---

### `sg fix`

Recover from common git failure states with a guided plan.

```bash
sg fix
```

**What it handles:**
- Merge conflicts
- Interrupted rebase or cherry-pick
- Rejected pushes
- Detached HEAD
- Accidentally staged or committed files

**Behavior:**
1. Diagnoses the current failure state
2. Presents a safe, step-by-step recovery plan
3. Previews every change before applying
4. Executes only after confirmation

---

### `sg undo`

List and apply safe rollbacks for recent git actions.

```bash
sg undo
```

**What it lists:**
- Recent commits that can be reverted or reset
- Stash operations
- Staged changes that can be unstaged

Each option shows consequences (e.g., "will discard local changes", "safe — remote not yet updated") and requires confirmation for destructive actions.

---

### `sg wtf`

Panic-button parallel diagnosis — finds everything wrong and tells you what to do.

```bash
sg wtf
```

Runs 7 diagnostic checks in parallel:

1. Working tree state
2. Branch divergence
3. Conflict markers
4. Stash state
5. Remote connectivity
6. CI status (requires GitHub CLI)
7. Merge queue position (if applicable)

Results are sorted by urgency. Actionable faults link directly to `sg fix` steps.

---

## Output Format

Every command follows the same four-section format:

```
Summary:        <what is happening right now>
Risk:           <low | medium | high>
Recommendation: <what to do next>
Detail:         <optional extended information>
```

This makes output scriptable and consistent across all commands.

---

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | User-correctable error (e.g., no staged files) |
| `2` | Configuration or authentication issue |
| `3` | Git state conflict requiring manual intervention |

---

## Configuration

SaneGit stores non-secret configuration in `.sanegit/config.json` inside your repository:

```json
{
  "provider": "openai",
  "credentialRef": "OPENAI_API_KEY",
  "baseUrl": null
}
```

An audit log of all command invocations is kept at `.sanegit/audit.log`. Repository-level memory (learned patterns) is stored in `.sanegit/memory.json`.

Add `.sanegit/` to your `.gitignore` to keep these files local:

```
.sanegit/
```

---

## Degraded Mode

When the configured AI provider is unavailable, misconfigured, or times out, SaneGit continues to function using rule-based analysis. Output is marked with a degraded-mode notice:

```
[degraded mode — AI provider unavailable, showing rule-based analysis]
```

All commands are safe to use in degraded mode. No data is lost and no git operations are skipped.

---

## Contributing

```bash
git clone https://github.com/ntufar/sanegit.git
cd sanegit
npm install

npm run lint        # ESLint
npm run typecheck   # TypeScript
npm run test        # Vitest (19 test files)
npm run build       # Compile to dist/
```

See [CHANGELOG.md](../CHANGELOG.md) for release history.
