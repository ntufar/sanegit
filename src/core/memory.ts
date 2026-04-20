import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface MemoryProfile {
  frequentFiles: string[];
  previousRecommendations: string[];
  updatedAt: string;
}

const DEFAULT_MEMORY: MemoryProfile = {
  frequentFiles: [],
  previousRecommendations: [],
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
