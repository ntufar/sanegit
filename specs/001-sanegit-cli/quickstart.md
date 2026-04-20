# Quickstart: SaneGit Command Assistant

## Prerequisites

- Node.js 22+
- Git installed and available in shell
- Repository checked out locally

## Install and Run

```bash
npm install
npm run build
npm link
sg --help
```

## Configure AI Provider

```bash
sg ai-configure --provider openai --credential-ref my-key-ref
```

Expected setup flow:

1. Select provider from OpenAI, Anthropic, Gemini, Mistral, or Custom.
2. Optionally specify custom API base URL (HTTP allowed with warning).
3. Provide credential source:
   - OS keychain reference (default), or
   - environment variable override

## Core Validation Scenarios

### Scenario 1: Status and Explain

```bash
sg status
sg explain
```

Expected:

- Plain-English summary
- Risk level
- Recommended next action

### Scenario 2: Smart Commit

```bash
sg commit
```

Expected:

- Proposed commit message
- Preview of included changes
- Confirmation prompt before write

### Scenario 3: Safe Push

```bash
sg push
```

Expected:

- Pre-push risk checks
- Safety warning/block for unsafe push conditions

### Scenario 4: Recovery

```bash
sg fix
sg undo
```

Expected:

- Recovery/rollback options with consequences
- Confirmation for risk-bearing actions

### Scenario 5: AI Degraded Mode

- Simulate provider outage or invalid key.
- Run `sg explain` or `sg check`.
  Expected:
- Command still returns fallback output.
- Output explicitly notes degraded mode.

## Performance Checkpoints

- `sg status`, `sg explain`, `sg check` complete p95 under 2s on 10k-file repository.
- `sg commit`, `sg fix`, `sg undo` preview phase appears under 1s for common flows.
