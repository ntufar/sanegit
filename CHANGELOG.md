# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
