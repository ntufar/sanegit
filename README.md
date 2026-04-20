# SaneGit

SaneGit is a CLI assistant that helps developers understand repository state, avoid risky pushes, and recover from git problems with plain-English guidance.

📖 **[Full documentation](doc/guide.md)**

## Install

**From npm (recommended):**

```bash
npm install -g sanegit
```

**From source:**

```bash
npm install
npm run build
npm link
```

## Commands

- `sg status`
- `sg explain`
- `sg commit`
- `sg push`
- `sg check`
- `sg fix`
- `sg undo`
- `sg wtf`
- `sg ai-configure --provider openai --credential-ref my-key-ref`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run test
```
