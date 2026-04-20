# SaneGit

[![npm version](https://img.shields.io/npm/v/%40ntufar%2Fsanegit.svg)](https://www.npmjs.com/package/@ntufar/sanegit)
[![npm downloads](https://img.shields.io/npm/dm/%40ntufar%2Fsanegit.svg)](https://www.npmjs.com/package/@ntufar/sanegit)

**SaneGit** is a CLI assistant that makes git usable by predicting problems, fixing them automatically, and explaining everything in plain English.

Stop struggling with cryptic git errors. SaneGit helps you understand repository state, avoid risky pushes, recover from failures, and commit with confidence.

## Features

- 🔍 **Understand state** — `sg status` shows repository health in plain language
- 📝 **Smart commits** — `sg commit` proposes messages and previews changes before writing
- 🛡️ **Safe pushes** — `sg push` predicts risks and blocks unsafe operations
- 🔧 **Auto-recovery** — `sg fix` guides you through merge conflicts, detached HEAD, and more
- 📊 **Diagnose fast** — `sg wtf` runs 7 parallel checks and prioritizes what to fix
- 🤖 **AI-powered** — Integrates OpenAI, Anthropic, Google, Mistral (or custom endpoints)
- 📖 **Plain English** — Every command explains what's happening and what to do next
- 💾 **Degrades gracefully** — Works without AI provider (rule-based fallback)

📖 **[Full documentation](doc/guide.md)**

## Quick Start

```bash
# Install from npm
npm install -g @ntufar/sanegit

# Check your repository state
cd my-project
sg status

# Configure AI provider (optional)
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY

# Explore commands
sg explain        # Explain staged changes
sg commit         # AI-suggested commit message
sg push           # Pre-push safety checks
sg check          # Merge readiness assessment
sg fix            # Recover from failures
sg undo           # List and apply safe rollbacks
sg wtf            # Panic-button diagnosis
```

## Install

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

## Commands at a Glance

| Command | Purpose |
|---|---|
| `sg status` | Repository state and next actions |
| `sg explain` | Plain-English change explanation |
| `sg commit` | AI-suggested commit message with preview |
| `sg push` | Pre-push risk evaluation |
| `sg check` | Merge readiness assessment |
| `sg fix` | Guided recovery from common git failures |
| `sg undo` | Safe rollback options with consequences |
| `sg wtf` | Panic-button parallel diagnosis |
| `sg ai-configure` | Setup AI provider integration |

## Configuration

SaneGit stores configuration in `.sanegit/config.json` (gitignored):

```bash
# Set AI provider
sg ai-configure --provider openai --credential-ref OPENAI_API_KEY

# Use environment variable or OS keychain
# Add to .gitignore:
.sanegit/
```

All commands work without AI configuration — they fall back to rule-based analysis in degraded mode.

## Requirements

- **Node.js 22+** (ESM support required)
- **Git 2.0+** (any recent version)
- Optional: OpenAI, Anthropic, Google, or Mistral API key

## Development

```bash
# Clone and setup
git clone https://github.com/ntufar/sanegit.git
cd sanegit
npm install

# Commands
npm run build       # Compile TypeScript
npm run dev         # Run in development mode
npm run lint        # ESLint check
npm run typecheck   # TypeScript validation
npm run test        # Vitest (19 test files, 21 tests)
npm run format      # Prettier formatting
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

- **Full Documentation**: [doc/guide.md](doc/guide.md)
- **API Specification**: [specs/001-sanegit-cli/contracts/cli-contract.md](specs/001-sanegit-cli/contracts/cli-contract.md)
- **Feature Spec**: [specs/001-sanegit-cli/spec.md](specs/001-sanegit-cli/spec.md)
- **GitHub**: [github.com/ntufar/sanegit](https://github.com/ntufar/sanegit)
- **npm**: [npmjs.com/package/@ntufar/sanegit](https://www.npmjs.com/package/@ntufar/sanegit)

---

Made with ❤️ to make git less frustrating.
