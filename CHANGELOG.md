# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.4] - 2026-04-21

### Fixed
- Release workflow now installs `libsecret-1-dev` before `npm ci`, matching CI, so the `keytar` native module builds on Ubuntu runners
- CI and release workflows set global git `user.name` / `user.email` for consistent test environments

## [0.2.3] - 2026-04-21

### Added
- Google Search Console HTML verification file for site ownership

### Changed
- `sg split` uses hunk summarization when grouping staged changes into proposed commits
- `sg ship` (`runShip`) with pre-merge conflict checks, PR automation, clearer progress and error output, and simplified error paths
- `sg wtf` surfaces more actionable conflict-resolution detail when merge or rebase issues are detected
- Credential and API key resolution improved for hosted and provider flows
- CI workflow installs system dependencies needed for native modules (for example `keytar`)

### Fixed
- Ship integration tests updated for `RecoveryPlan` fields and stricter workflow validation

### Documentation
- README and static HTML documentation refreshed for clarity and current features

## [0.2.2] - 2026-04-21

### Added
- `sg who --file <path>` now supports both files and directories, with directory ownership aggregated across tracked files using blame-derived line ownership
- New local ownership parsing helpers and dedicated unit/integration coverage for repository, file, and directory ownership scopes
- New blame integration coverage validating parsed author and rationale output on real repository history

### Changed
- `sg who` now computes local ownership from git history by default and enriches collaborator signals with recent local activity even when hosted context is unavailable
- `sg time-travel` now resolves natural-language references (for example: "last commit", "yesterday", and "N commits ago") with explicit mapping details in output
- `sg doctor` now emits prioritized findings from richer repository health signals (detached HEAD, commit availability, object pressure, and working tree volume)
- `sg blame --explain` now parses porcelain blame metadata and synthesizes human-readable rationale from commit intent

### Fixed
- Ownership path-scope detection in `sg who --file` now correctly distinguishes exact file targets from directory targets to avoid misclassification

## [0.2.1] - 2026-04-21

### Added
- `sg who` now shows richer hosted context including repository name, default branch, and recent PR authors when available

### Fixed
- `sg ai-configure` now supports interactive provider selection and credential entry when flags are omitted
- AI provider integration now performs real provider HTTP requests instead of always falling back to deterministic output
- GitHub hosted context queries now use `gh` CLI fields compatible with current GitHub CLI releases

## [0.2.0] - 2026-04-21

### Added
- `sg sync` — one-command safe branch sync with local-work preservation and conflict guidance
- `sg ship` / `sg ship --status` — orchestrated delivery flow from preflight validation through merge completion with resumable background handoff
- `sg split` — propose and confirm logical commit groups from mixed-intent staged changes
- `sg who` — file-level collaborator ownership context with active PR and activity signals
- `sg blame --explain` — line-level historical change context with plain-language rationale
- `sg queue --team` — merge queue visibility with sequencing impact and conflict risk hints
- `sg time-travel` — resolve natural-language temporal references into safe repository navigation actions
- `sg pair` — lightweight pair-session lifecycle (start / status / handoff) with auditable state transitions
- `sg doctor` — deep repository health audit with prioritized findings across reliability, hygiene, performance, and security dimensions
- Predictive fault intelligence: `sg wtf --learn` records recurring failure patterns locally and surfaces pre-push warnings after threshold confidence is reached
- CI-failure diagnosis: `sg wtf --fix-ci` identifies probable root cause and offers direct handoff to recovery flow
- Hosting provider adapter layer (GitHub) for team-aware commands with graceful local fallback
- Resumable workflow journal for multi-step commands with checkpoint recovery
- Learned-pattern persistence and pruning bounded to 10 MB per repository
- AI context scoping, redaction, and size-limit policy for all provider calls
- Rollout controls for high-risk automation paths (`sg ship`, `sg wtf`)
- Expanded test suite: contract, integration, and unit coverage for all new commands (50+ test files)

### Changed
- `sg wtf` extended with `--learn` and `--fix-ci` flags and direct remediation handoff
- AI provider layer extended with context-scoped prompts and fallback markers
- Repository snapshot and output structures extended for hosted-context and AI markers

## [0.1.14] - 2026-04-21

### Added
- Full specification, planning, and design artifacts for the Indispensable Git Assistant feature (spec 002): spec.md, plan.md, research.md, data-model.md, quickstart.md, contracts/cli-contract.md, and checklists (requirements, safety)
- Copilot instructions updated to reference the new spec directory

## [0.1.13] - 2026-04-21

### Added
- Colorized terminal output for Summary, Risk, Recommendation, and Detail sections
- Risk-aware coloring levels (none/low/medium/high/critical) for faster scanning

### Changed
- `sg wtf` now uses the shared output formatter for consistent colorized output

## [0.1.12] - 2026-04-21

### Changed
- Reverted package name to `sanegit` (unscoped) for simplicity and better branding
- Removed GitHub Package Registry publishing to focus on npm.org distribution

## [0.1.11] - 2026-04-21

### Added
- Error message and configuration prompt when running `sg explain` or `sg commit` without AI provider configured
- New `checkAIConfigured` utility in core to validate and guide AI provider setup

## [0.1.10] - 2026-04-21

### Fixed
- Corrected npm package executable path from `dist/cli.js` to `dist/src/cli.js` so global `sg` command is installed correctly
- Removed invalid `types` entry that pointed to a non-generated declaration file

## [0.1.9] - 2026-04-21

### Fixed
- Added `packages: write` workflow permission so GitHub Package Registry publish can create/update package entries

## [0.1.8] - 2026-04-21

### Changed
- Switched package name to `@ntufar/sanegit` so GitHub Package Registry publish succeeds
- Updated npm install and badge links to the scoped package

## [0.1.7] - 2026-04-21

### Fixed
- Corrected release workflow npm auth token interpolation in `.npmrc` generation

## [0.1.6] - 2026-04-21

### Fixed
- Removed conflicting `publishConfig` from package.json that prevented npm publish; explicit `--registry` flags in workflow handle routing

## [0.1.5] - 2026-04-21

### Added
- Expanded README with feature highlights, quick start guide, and resource links

## [0.1.4] - 2026-04-21

### Fixed
- Configure npm authentication in workflow via .npmrc instead of relying on setup-node registry-url

## [0.1.3] - 2026-04-21

### Fixed
- Fixed GitHub Package Registry authentication in release workflow by removing hardcoded npm registry-url

## [0.1.2] - 2026-04-21

### Added
- Dual publishing to npm and GitHub Package Registry

## [0.1.1] - 2026-04-21

### Fixed
- Added `prepublishOnly` build step to ensure `dist/` is always compiled before npm publish
- Corrected missing compiled output in published npm package

## [0.1.0] - 2026-04-21

### Added
- `sg status` — plain-English repository state summary with AI-generated risk assessment
- `sg explain` — explain staged or recent changes in natural language
- `sg commit` — AI-suggested commit message from staged diff with confirmation prompt
- `sg push` — pre-push safety evaluation with risk scoring before pushing
- `sg check` — detect common repository problems (conflicts, detached HEAD, stale branches, etc.)
- `sg fix` — AI-guided recovery plan for detected issues
- `sg undo` — list undo options for recent git actions with safety annotations
- `sg wtf` — panic-button parallel diagnosis across 7 issue categories
- `sg ai-configure` — configure AI provider (OpenAI, Anthropic, Google, Mistral, or custom)
- AI abstraction layer with `FallbackProvider` (deterministic, no live API required)
- Local state storage in `.sanegit/config.json`, `.sanegit/memory.json`, `.sanegit/audit.log`
- Zod-validated configuration schema with credential resolution
- Push risk predictor and merge queue risk scorer
- GitHub Actions CI workflow — lint, typecheck, test, build on every push and pull request
- GitHub Actions release workflow — full validation, npm publish with provenance, and GitHub Release on `v*` tags
- Contract tests, integration tests, and unit tests (19 test files, 21 tests)

### Fixed
- Added `repository.url` to `package.json` to satisfy npm provenance validation

[0.2.4]: https://github.com/ntufar/sanegit/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/ntufar/sanegit/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/ntufar/sanegit/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/ntufar/sanegit/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ntufar/sanegit/compare/v0.1.14...v0.2.0
[0.1.14]: https://github.com/ntufar/sanegit/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/ntufar/sanegit/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/ntufar/sanegit/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/ntufar/sanegit/compare/v0.1.10...v0.1.11
[0.1.10]: https://github.com/ntufar/sanegit/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/ntufar/sanegit/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/ntufar/sanegit/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/ntufar/sanegit/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/ntufar/sanegit/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/ntufar/sanegit/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/ntufar/sanegit/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/ntufar/sanegit/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/ntufar/sanegit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/ntufar/sanegit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ntufar/sanegit/releases/tag/v0.1.0
