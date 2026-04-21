# Data Model: Indispensable Git Assistant

## Entity: LearnedPattern
- Purpose: Repository-scoped record of recurring failure or warning signals discovered by `sg wtf --learn`.
- Fields:
  - `patternKey` (string, required)
  - `category` (enum: conflict|ci|queue|ship|other, required)
  - `occurrences` (integer >= 0, required)
  - `recentRuns` (array of ISO datetimes, max 10, required)
  - `confidenceScore` (number 0.0-1.0, required)
  - `activationThreshold` (integer, required; default 10)
  - `warningText` (string, required)
  - `lastSeenAt` (ISO datetime, required)
  - `lastRecommendedAction` (string, optional)
  - `aiEnhanced` (boolean, required)
- Validation rules:
  - A warning is not eligible for proactive output until `occurrences >= activationThreshold`.
  - Pattern storage must support pruning to keep repository memory below 10 MB.

## Entity: WorkflowRun
- Purpose: Tracks multi-step execution state for long-running commands such as `sg ship`, `sg sync`, and future resumable operations.
- Fields:
  - `workflowId` (string, required)
  - `command` (enum: ship|sync|split|pair, required)
  - `status` (enum: active|waiting|blocked|completed|failed|cancelled, required)
  - `phase` (enum: preflight|remediation|push|pr|ci-wait|merge|handoff|complete, required)
  - `branchName` (string, required)
  - `headCommit` (string, optional)
  - `remoteReference` (string, optional)
  - `pullRequestUrl` (string, optional)
  - `startedAt` (ISO datetime, required)
  - `updatedAt` (ISO datetime, required)
  - `backgroundHandoffAt` (ISO datetime, optional)
  - `checkpoints` (array<WorkflowCheckpoint>, required)
  - `resumeHint` (string, optional)
- Relationships:
  - Owns many `WorkflowCheckpoint` entries.

## Entity: WorkflowCheckpoint
- Purpose: Immutable checkpoint inside a workflow run.
- Fields:
  - `name` (string, required)
  - `outcome` (enum: passed|failed|skipped|waiting, required)
  - `recordedAt` (ISO datetime, required)
  - `summary` (string, required)
  - `riskLevel` (enum: low|medium|high|critical, required)
  - `recommendation` (string, optional)

## Entity: HostedIntegrationProvider
- Purpose: Captures the active source-control hosting integration selected or auto-detected for a repository.
- Fields:
  - `providerKey` (enum: github|gitlab|gitea|custom, required)
  - `baseUrl` (string URL, optional)
  - `autoDetected` (boolean, required)
  - `credentialRef` (string, optional)
  - `supportsPullRequests` (boolean, required)
  - `supportsCiStatus` (boolean, required)
  - `supportsMergeQueue` (boolean, required)
  - `supportsBlameContext` (boolean, required)
- Validation rules:
  - Provider-specific features must degrade gracefully when unsupported.

## Entity: HostedContextSnapshot
- Purpose: Snapshot of remote collaboration state used by `sg ship`, `sg who`, `sg blame --explain`, and `sg queue --team`.
- Fields:
  - `repositorySlug` (string, required)
  - `pullRequestId` (string, optional)
  - `pullRequestState` (enum: none|open|draft|merged|closed, required)
  - `ciStatus` (enum: unknown|pending|passed|failed, required)
  - `mergeQueuePosition` (integer, optional)
  - `mergeQueueRisk` (enum: low|medium|high, optional)
  - `activeContributors` (array<string>, optional)
  - `ownershipHints` (array<string>, optional)
  - `fetchedAt` (ISO datetime, required)

## Entity: AIContextPayload
- Purpose: Describes the repository content sent to an external AI provider for provider-backed analysis.
- Fields:
  - `command` (string, required)
  - `includesDiff` (boolean, required)
  - `includedFiles` (array<string>, required)
  - `reason` (string, required)
  - `providerKey` (string, required)
  - `createdAt` (ISO datetime, required)
- Validation rules:
  - Commands must expose when an external AI context payload was used.

## Entity: DiagnosticInsight
- Purpose: Structured explanation item that links local or remote observations to a recommended action.
- Fields:
  - `insightId` (string, required)
  - `source` (enum: local|hosted|ai, required)
  - `summary` (string, required)
  - `riskLevel` (enum: low|medium|high|critical, required)
  - `recommendation` (string, required)
  - `detail` (string, optional)
  - `relatedPatternKey` (string, optional)
  - `relatedWorkflowId` (string, optional)
