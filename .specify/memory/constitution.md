<!--
Sync Impact Report
- Version change: 0.0.0-template -> 1.0.0
- Modified principles:
	- Template Principle 1 -> I. Code Quality Is Enforced
	- Template Principle 2 -> II. Tests Define Done (NON-NEGOTIABLE)
	- Template Principle 3 -> III. User Experience Consistency Is Mandatory
	- Template Principle 4 -> IV. Performance Budgets Are Product Requirements
	- Template Principle 5 -> V. Observability and Safe Delivery
- Added sections:
	- Engineering Standards
	- Delivery Workflow and Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present in repository)
- Follow-up TODOs:
	- None
-->

# SaneGit Constitution

## Core Principles

### I. Code Quality Is Enforced
All production code MUST pass formatter, linter, and static analysis checks in CI before merge.
Changes MUST keep modules cohesive, avoid duplicated logic, and preserve clear naming and
readability. Public interfaces and non-obvious behavior MUST include concise documentation in
code or feature docs. Rationale: strict quality gates reduce defect density and speed up reviews.

### II. Tests Define Done (NON-NEGOTIABLE)
Every change MUST include automated tests at the appropriate level (unit, integration, or
contract). Bug fixes MUST add a regression test that fails before the fix and passes after it.
Merges are blocked when required tests fail. Rationale: enforce confidence in refactoring and
prevent recurring defects.

### III. User Experience Consistency Is Mandatory
User-facing behavior MUST follow shared interaction patterns, terminology, and visual tokens
defined by the current feature set. New UI patterns MUST be justified in the spec and documented
for reuse. Accessibility requirements (keyboard navigation, semantic labels, and sufficient
contrast) MUST be validated for all new UI surfaces. Rationale: a consistent experience reduces
user errors and support overhead.

### IV. Performance Budgets Are Product Requirements
Each feature spec MUST define measurable performance targets relevant to its scope (for example:
p95 latency, render time, memory, or startup time). Changes affecting critical paths MUST provide
evidence (benchmark, profile, or load test) that budgets are met. Regressions beyond agreed
budgets MUST be treated as release blockers unless explicitly approved with a remediation plan.
Rationale: performance is a user-visible quality attribute and must be managed intentionally.

### V. Observability and Safe Delivery
Critical flows MUST emit structured telemetry sufficient to detect failures and validate behavior
after release. High-risk changes MUST use staged rollout, feature flags, or equivalent controls.
Post-release checks MUST verify key quality and performance signals. Rationale: rapid detection and
controlled rollout minimize impact when issues escape pre-release testing.

## Engineering Standards

- Specifications MUST include acceptance scenarios, measurable success criteria, UX consistency
	expectations, and explicit performance targets.
- Implementation plans MUST include constitution gate checks for quality, testing, UX, and
	performance.
- Task lists MUST map work to user stories and include testing plus quality validation tasks.
- Pull requests MUST link to the governing spec and summarize impact on tests, UX, and performance.

## Delivery Workflow and Quality Gates

1. Specify: define user stories, acceptance scenarios, UX consistency expectations, and measurable
	 performance targets.
2. Plan: validate constitution gates and design a test strategy before implementation begins.
3. Tasks: include mandatory test tasks and explicit quality/performance verification work.
4. Implement: run tests and quality checks locally and in CI; resolve all blocking failures.
5. Review: confirm constitution compliance, including UX consistency and performance evidence.

## Governance

This constitution is the highest-priority engineering policy for this repository. In case of
conflict, this document supersedes ad hoc practices and undocumented conventions.

Amendments require:
1. A proposed change with rationale and impacted templates/docs.
2. Explicit approval by project maintainers.
3. A synchronization update to affected templates in `.specify/templates/` before merge.

Versioning policy:
1. MAJOR: incompatible governance changes or principle removals/redefinitions.
2. MINOR: new principle/section or materially expanded mandatory guidance.
3. PATCH: clarifications, wording improvements, and typo-level refinements.

Compliance review expectations:
1. Every plan and pull request MUST include a constitution compliance check.
2. Violations MUST be documented in a complexity/risk log with owner and due date.
3. Approved temporary exceptions MUST include an expiration condition.

**Version**: 1.0.0 | **Ratified**: 2026-04-20 | **Last Amended**: 2026-04-20
