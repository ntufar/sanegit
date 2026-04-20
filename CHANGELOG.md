# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.5]: https://github.com/ntufar/sanegit/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/ntufar/sanegit/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/ntufar/sanegit/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/ntufar/sanegit/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/ntufar/sanegit/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/ntufar/sanegit/releases/tag/v0.1.0
