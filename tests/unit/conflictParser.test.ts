import { describe, expect, it } from "vitest";
import {
  parseConflictMarkers,
  reconstructFile,
  extractContextLines,
  type ConflictFile,
} from "../../src/core/conflictParser.js";

describe("parseConflictMarkers", () => {
  it("parses a basic two-way conflict", () => {
    const content = [
      "line before",
      "<<<<<<< HEAD",
      "ours line",
      "=======",
      "theirs line",
      ">>>>>>> feature",
      "line after",
    ].join("\n");

    const hunks = parseConflictMarkers(content);
    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.oursLabel).toBe("HEAD");
    expect(hunks[0]!.theirsLabel).toBe("feature");
    expect(hunks[0]!.oursContent).toEqual(["ours line"]);
    expect(hunks[0]!.theirsContent).toEqual(["theirs line"]);
    expect(hunks[0]!.startLine).toBe(2);
    expect(hunks[0]!.endLine).toBe(6);
  });

  it("parses multiple conflicts in one file", () => {
    const content = [
      "top",
      "<<<<<<< HEAD",
      "a",
      "=======",
      "b",
      ">>>>>>> branch",
      "middle",
      "<<<<<<< HEAD",
      "c",
      "=======",
      "d",
      ">>>>>>> branch",
      "bottom",
    ].join("\n");

    const hunks = parseConflictMarkers(content);
    expect(hunks).toHaveLength(2);
    expect(hunks[0]!.oursContent).toEqual(["a"]);
    expect(hunks[1]!.theirsContent).toEqual(["d"]);
  });

  it("handles multi-line content in each side", () => {
    const content = [
      "<<<<<<< HEAD",
      "line 1",
      "line 2",
      "=======",
      "line 3",
      "line 4",
      "line 5",
      ">>>>>>> other",
    ].join("\n");

    const hunks = parseConflictMarkers(content);
    expect(hunks[0]!.oursContent).toEqual(["line 1", "line 2"]);
    expect(hunks[0]!.theirsContent).toEqual(["line 3", "line 4", "line 5"]);
  });

  it("handles empty ours side", () => {
    const content = [
      "<<<<<<< HEAD",
      "=======",
      "new content",
      ">>>>>>> branch",
    ].join("\n");

    const hunks = parseConflictMarkers(content);
    expect(hunks[0]!.oursContent).toEqual([]);
    expect(hunks[0]!.theirsContent).toEqual(["new content"]);
  });

  it("handles empty theirs side", () => {
    const content = [
      "<<<<<<< HEAD",
      "existing",
      "=======",
      ">>>>>>> branch",
    ].join("\n");

    const hunks = parseConflictMarkers(content);
    expect(hunks[0]!.oursContent).toEqual(["existing"]);
    expect(hunks[0]!.theirsContent).toEqual([]);
  });

  it("returns empty array for no conflicts", () => {
    expect(parseConflictMarkers("clean file\nno conflicts")).toEqual([]);
  });
});

describe("reconstructFile", () => {
  it("replaces a single conflict hunk", () => {
    const content = [
      "before",
      "<<<<<<< HEAD",
      "ours",
      "=======",
      "theirs",
      ">>>>>>> branch",
      "after",
    ].join("\n");

    const conflict: ConflictFile = {
      path: "test.ts",
      fullContent: content,
      hunks: parseConflictMarkers(content),
    };

    const result = reconstructFile(conflict, ["resolved line"]);
    expect(result).toBe("before\nresolved line\nafter");
  });

  it("replaces multiple conflict hunks", () => {
    const content = [
      "top",
      "<<<<<<< HEAD",
      "a",
      "=======",
      "b",
      ">>>>>>> branch",
      "middle",
      "<<<<<<< HEAD",
      "c",
      "=======",
      "d",
      ">>>>>>> branch",
      "bottom",
    ].join("\n");

    const conflict: ConflictFile = {
      path: "test.ts",
      fullContent: content,
      hunks: parseConflictMarkers(content),
    };

    const result = reconstructFile(conflict, ["resolved-1", "resolved-2"]);
    expect(result).toBe("top\nresolved-1\nmiddle\nresolved-2\nbottom");
  });
});

describe("extractContextLines", () => {
  const content = "a\nb\nc\nd\ne\nf\ng";

  it("extracts lines before a given line", () => {
    const lines = extractContextLines(content, 5, -3);
    expect(lines).toEqual(["b", "c", "d"]);
  });

  it("extracts lines after a given line", () => {
    const lines = extractContextLines(content, 3, 2);
    expect(lines).toEqual(["d", "e"]);
  });

  it("clamps to beginning of file", () => {
    const lines = extractContextLines(content, 2, -5);
    expect(lines).toEqual(["a"]);
  });
});
