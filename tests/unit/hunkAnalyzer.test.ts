import { describe, it, expect } from 'vitest';
import { parseDiffOutput } from '../../src/core/hunkAnalyzer.js';

describe('hunkAnalyzer', () => {
  it('should parse simple git diff hunks', () => {
    const diff = `diff --git a/test.txt b/test.txt
index 12345..67890 100644
--- a/test.txt
+++ b/test.txt
@@ -1,2 +1,3 @@
 line 1
+added line
 line 2
@@ -10 +11,2 @@
-old line
+new line
`;
    const hunks = parseDiffOutput(diff);
    expect(hunks).toHaveLength(2);
    expect(hunks[0]).toBeDefined();
    expect(hunks[0]!.startLine).toBe(1);
    expect(hunks[1]).toBeDefined();
    expect(hunks[1]!.startLine).toBe(11);
  });
});
