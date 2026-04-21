# SaneGit

[![npm version](https://img.shields.io/npm/v/sanegit.svg)](https://www.npmjs.com/package/sanegit)
[![npm downloads](https://img.shields.io/npm/dm/sanegit.svg)](https://www.npmjs.com/package/sanegit)

🌐 **[Visit the website →](https://ntufar.github.io/sanegit)**

**SaneGit** is a CLI assistant that makes git usable by predicting problems, fixing them automatically, and explaining everything in plain English.

Stop struggling with cryptic git errors. SaneGit helps you understand repository state, avoid risky pushes, recover from failures, and commit with confidence.

## Features

- 🔍 **Understand state** — `sg status` shows repository health in plain language
- 📝 **Smart commits** — `sg commit` proposes a message and file list; confirms before writing (requires a configured AI provider)
- 🛡️ **Safe pushes** — `sg push` predicts risks and blocks unsafe operations
- 🔧 **Auto-recovery** — `sg fix` guides you through merge conflicts, detached HEAD, and more
- 📊 **What's the Fault?** — `sg wtf` diagnoses urgent problems; optional `--learn` (record fault signals) and `--fix-ci` (CI-focused remediation)
- 🤖 **AI-powered** — OpenAI, Anthropic, Google (Gemini), Mistral, or a custom HTTP endpoint
- 📖 **Plain English** — Structured output (summary, risk, recommendation, detail) across commands
- 💾 **Degrades gracefully** — Rule-based fallbacks when AI is unavailable or not configured

📖 **[Full documentation](doc/guide.md)**

## Quick Start

```bash
# Install from npm
npm install -g sanegit

# Check your repository state
cd my-project
sg status

# Configure AI provider (optional; needed for AI-heavy commands like explain/commit)
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY

# Explore commands
sg explain        # Explain current changes (needs AI)
sg commit         # Proposed commit from staged changes (needs AI)
sg push           # Pre-push safety checks
sg check          # Merge readiness assessment
sg fix            # Recover from failures
sg undo           # List and apply safe rollbacks
sg wtf            # Diagnose problems; add --learn or --fix-ci as needed
sg ship           # Delivery flow; use sg ship --status to resume/track
```

## Install

**From npm (recommended):**

```bash
npm install -g sanegit
```

**From source:**

```bash
git clone https://github.com/ntufar/sanegit.git
cd sanegit
npm install
npm run build
npm link
```

## Commands at a Glance

| Command | Purpose |
|---|---|
| `sg status` | Repository state and next actions |
| `sg explain` | Plain-English change explanation (AI) |
| `sg commit` | Guided commit plan from staged changes (AI) |
| `sg push` | Pre-push risk evaluation |
| `sg check` | Merge readiness assessment |
| `sg fix` | Guided recovery from common git failures |
| `sg undo` | Safe rollback options with consequences |
| `sg wtf` | Urgent diagnosis; `--learn`, `--fix-ci` |
| `sg sync` | Preserve local work and synchronize with mainline |
| `sg ship` | One-command delivery flow; `--status` for workflow state |
| `sg split` | Propose logical commit groups from staged changes |
| `sg who` | Collaborator ownership; optional `--file` (file or directory) |
| `sg queue --team` | Merge queue impact and risk hints |
| `sg blame --file <path> --line <n> --explain` | Line history with hosted context |
| `sg time-travel --to <ref>` | Resolve refs safely, including natural-language targets |
| `sg pair` | Pair sessions: `--action start`, `status`, or `handoff` (use `--session` with the latter two) |
| `sg doctor` | Deep repository health diagnostics |
| `sg ai-configure` | AI provider, `--url` for custom base URL, `--credential-ref` |

## Configuration

SaneGit stores configuration in `.sanegit/config.json` (intended to be gitignored). Secrets are not stored in the file: pass a **credential reference** (environment variable name or keychain entry) via `sg ai-configure --credential-ref …`. Use `--url` with `--provider custom` for a custom API base URL.

```bash
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY

# Add to .gitignore:
.sanegit/
```

Commands that depend on AI exit early with a clear message when no provider is configured; others use rule-based or hosted-context data where applicable.

## Requirements

- **Node.js 22+** (see `engines` in `package.json`)
- **Git** (any recent version)
- Optional: API access for your chosen AI provider

## Development

```bash
git clone https://github.com/ntufar/sanegit.git
cd sanegit
npm install

npm run build       # Compile TypeScript to dist/
npm run dev         # Run CLI via tsx (src/cli.ts)
npm run lint        # ESLint
npm run typecheck   # TypeScript --noEmit
npm run test        # Vitest (36 test files, 54 tests)
npm run format      # Prettier

# Focused suites (see package.json for more)
npm run test:unit
npm run test:integration
npm run test:contract
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit with descriptive messages
4. Push and open a pull request

## License

MIT — See LICENSE for details

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Resources

- **Full documentation**: [doc/guide.md](doc/guide.md)
- **GitHub Pages**: [docs/index.html](docs/index.html) (published site: [ntufar.github.io/sanegit](https://ntufar.github.io/sanegit))
- **API specification**: [specs/001-sanegit-cli/contracts/cli-contract.md](specs/001-sanegit-cli/contracts/cli-contract.md)
- **Feature spec**: [specs/001-sanegit-cli/spec.md](specs/001-sanegit-cli/spec.md)
- **GitHub**: [github.com/ntufar/sanegit](https://github.com/ntufar/sanegit)
- **npm**: [npmjs.com/package/sanegit](https://www.npmjs.com/package/sanegit)

---

Made with ❤️ to make git less frustrating.
