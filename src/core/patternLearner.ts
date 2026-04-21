import {
  loadMemory,
  saveMemory,
  addPatternObservation,
  pruneLearnedPatterns,
  type LearnedPattern,
} from "./memory.js";

export const LEARN_ACTIVATION_THRESHOLD = 10;

export interface PredictiveWarning {
  key: string;
  confidence: number;
  warning: string;
  observations: number;
}

export async function learnFromSignals(
  signals: string[],
  cwd: string = process.cwd(),
  nowIso?: string,
): Promise<LearnedPattern[]> {
  const memory = await loadMemory(cwd);
  const now = nowIso ?? new Date().toISOString();

  for (const signal of signals) {
    addPatternObservation(memory, signal, now);
  }

  pruneLearnedPatterns(memory, 256);
  await saveMemory(memory, cwd);

  return Object.values(memory.learnedPatterns);
}

export async function getPredictiveWarnings(
  cwd: string = process.cwd(),
): Promise<PredictiveWarning[]> {
  const memory = await loadMemory(cwd);

  return Object.entries(memory.learnedPatterns)
    .map(([key, pattern]) => ({ key, pattern }))
    .filter(
      ({ pattern }) => pattern.qualifyingRuns >= LEARN_ACTIVATION_THRESHOLD,
    )
    .map(({ key, pattern }) => ({
      key,
      confidence: pattern.confidence,
      warning: pattern.warning,
      observations: pattern.observations,
    }))
    .sort((left, right) => right.confidence - left.confidence);
}
