import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface LearnedPattern {
  key: string;
  observations: number;
  qualifyingRuns: number;
  confidence: number;
  lastObservedAt: string;
  warning: string;
}

export interface MemoryProfile {
  frequentFiles: string[];
  previousRecommendations: string[];
  learnedPatterns: Record<string, LearnedPattern>;
  updatedAt: string;
}

const DEFAULT_MEMORY: MemoryProfile = {
  frequentFiles: [],
  previousRecommendations: [],
  learnedPatterns: {},
  updatedAt: new Date(0).toISOString(),
};

export async function loadMemory(
  cwd: string = process.cwd(),
): Promise<MemoryProfile> {
  const path = join(cwd, ".sanegit", "memory.json");
  try {
    const content = await readFile(path, "utf8");
    return {
      ...DEFAULT_MEMORY,
      ...(JSON.parse(content) as Partial<MemoryProfile>),
    };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

export async function saveMemory(
  memory: MemoryProfile,
  cwd: string = process.cwd(),
): Promise<void> {
  const dir = join(cwd, ".sanegit");
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "memory.json"),
    JSON.stringify({ ...memory, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

export function addPatternObservation(
  memory: MemoryProfile,
  key: string,
  nowIso: string,
  dedupeWindowMs: number = 10 * 60 * 1000,
): void {
  const existing = memory.learnedPatterns[key];
  const previousObservedAt = existing
    ? Date.parse(existing.lastObservedAt)
    : Number.NaN;
  const now = Date.parse(nowIso);
  const isDuplicateWithinWindow =
    Number.isFinite(previousObservedAt) &&
    now - previousObservedAt >= 0 &&
    now - previousObservedAt < dedupeWindowMs;

  const base: LearnedPattern = existing ?? {
    key,
    observations: 0,
    qualifyingRuns: 0,
    confidence: 0,
    lastObservedAt: nowIso,
    warning: `Pattern '${key}' indicates elevated risk.`,
  };

  base.observations += 1;
  if (!isDuplicateWithinWindow) {
    base.qualifyingRuns += 1;
  }
  base.lastObservedAt = nowIso;
  base.confidence = Math.min(
    0.99,
    Number((base.qualifyingRuns / Math.max(base.observations, 1)).toFixed(2)),
  );

  memory.learnedPatterns[key] = base;
}

export function pruneLearnedPatterns(
  memory: MemoryProfile,
  maxEntries: number = 256,
): void {
  const entries = Object.entries(memory.learnedPatterns);
  if (entries.length <= maxEntries) {
    return;
  }

  entries
    .sort(
      (left, right) =>
        Date.parse(right[1].lastObservedAt) - Date.parse(left[1].lastObservedAt),
    )
    .slice(maxEntries)
    .forEach(([key]) => {
      delete memory.learnedPatterns[key];
    });
}
