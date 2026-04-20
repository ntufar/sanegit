# Data Model: SaneGit Command Assistant

## Entity: RepositorySnapshot
- Purpose: Represents current git repository state for decision and explanation workflows.
- Fields:
  - `repoPath` (string, required)
  - `currentBranch` (string, required)
  - `isDetachedHead` (boolean, required)
  - `stagedFiles` (array<string>, required)
  - `unstagedFiles` (array<string>, required)
  - `untrackedFiles` (array<string>, required)
  - `aheadBy` (integer >= 0, required)
  - `behindBy` (integer >= 0, required)
  - `hasConflicts` (boolean, required)
  - `timestamp` (ISO datetime, required)
- Relationships:
  - Referenced by `OperationPlan` and `ExplanationArtifact`.

## Entity: OperationPlan
- Purpose: Encodes proposed action plan for commit/push/fix/undo/check workflows.
- Fields:
  - `id` (string, required)
  - `command` (enum: status|commit|push|check|fix|undo|explain, required)
  - `riskLevel` (enum: low|medium|high|critical, required)
  - `summary` (string, required)
  - `recommendedSteps` (array<string>, required)
  - `requiresConfirmation` (boolean, required)
  - `fallbackMode` (boolean, required)
  - `warnings` (array<string>, optional)
- Relationships:
  - Built from one `RepositorySnapshot`.
  - May produce one `SafetyDecisionRecord`.

## Entity: ExplanationArtifact
- Purpose: Human-readable explanation of diff, repository state, or command outcome.
- Fields:
  - `id` (string, required)
  - `sourceType` (enum: diff|status|operation, required)
  - `plainSummary` (string, required)
  - `riskNarrative` (string, required)
  - `recommendedNextAction` (string, required)
  - `detail` (string, optional)
- Validation rules:
  - Must include summary, risk, recommendation sections to satisfy UX consistency gate.

## Entity: AIProviderConfiguration
- Purpose: Tracks configured AI provider source and endpoint metadata.
- Fields:
  - `provider` (enum: openai|anthropic|gemini|mistral|custom, required)
  - `baseUrl` (string URL, required)
  - `allowInsecureHttp` (boolean, required)
  - `credentialRef` (string, optional)
  - `envVarName` (string, optional; default `SANEGIT_API_KEY`)
- Validation rules:
  - `provider=custom` requires explicit `baseUrl`.
  - Non-HTTPS URL sets warning flag in command output.
  - At least one of `credentialRef` or environment key must resolve at runtime.

## Entity: APICredentialRecord
- Purpose: Non-secret link to credential source.
- Fields:
  - `providerKey` (string, required)
  - `source` (enum: keychain|env, required)
  - `reference` (string, required; keychain item id or env var name)
  - `lastValidatedAt` (ISO datetime, optional)
- Validation rules:
  - Plaintext secrets are prohibited in persisted config.

## Entity: MemoryProfile
- Purpose: Repository-local learned behavioral metadata.
- Fields:
  - `version` (string, required)
  - `preferredHints` (array<string>, optional)
  - `historicalConflictPatterns` (array<string>, optional)
  - `successfulFixPatterns` (array<string>, optional)
  - `lastUpdated` (ISO datetime, required)
- State transitions:
  - Updated after successful command completion.
  - Pruned when profile exceeds configured size limits.

## Entity: SafetyDecisionRecord
- Purpose: Audit user confirmations for risk-bearing actions.
- Fields:
  - `id` (string, required)
  - `operationPlanId` (string, required)
  - `decision` (enum: approve|reject|override, required)
  - `reason` (string, optional)
  - `decidedAt` (ISO datetime, required)
- Relationships:
  - Belongs to one `OperationPlan`.
