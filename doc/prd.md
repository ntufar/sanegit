Build "sanegit" — a CLI that makes git usable.

**Core philosophy**: Git should predict problems, fix them automatically, and explain in plain English.

**Package**: sanegit (npm)
**Binary**: sg
**Repo**: github.com/ntufar/sanegit

**FILE STRUCTURE**:
sanegit/
  package.json
  README.md
  src/
    cli.ts # commander setup
    commands/
      status.ts # human status
      commit.ts # smart commit
      push.ts # predict + fix + push
      check.ts # merge queue oracle
      fix.ts # auto-resolve
      undo.ts # safe undo
      explain.ts # explain diff
    core/
      git.ts # git wrapper (execa)
      predictor.ts # merge queue logic
      resolver.ts # Mistral conflict resolution
      memory.ts # learns repo patterns
    ai/
      prompts.ts # all Mistral prompts
 .sanegit/
    config.json
    memory.json