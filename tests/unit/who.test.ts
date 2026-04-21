import { describe, expect, it } from "vitest";
import {
  parseBlameOwnership,
  parseShortlogOutput,
} from "../../src/commands/who.js";

describe("who command helpers", () => {
  it("parses shortlog output into ownership shares", () => {
    const owners = parseShortlogOutput([
      "     2 Alice Example <alice@example.com>",
      "     1 Bob Example <bob@example.com>",
    ].join("\n"));

    expect(owners).toHaveLength(2);
    expect(owners[0]).toMatchObject({
      author: "Alice Example",
      commits: 2,
      share: 66.7,
    });
    expect(owners[1]).toMatchObject({
      author: "Bob Example",
      commits: 1,
      share: 33.3,
    });
  });

  it("parses blame output into file ownership shares", () => {
    const owners = parseBlameOwnership([
      "abc123 1 1 1",
      "author Alice Example",
      "author-mail <alice@example.com>",
      "\talpha",
      "def456 2 2 1",
      "author Bob Example",
      "author-mail <bob@example.com>",
      "\tbeta",
      "ghi789 3 3 1",
      "author Alice Example",
      "author-mail <alice@example.com>",
      "\tgamma",
    ].join("\n"));

    expect(owners).toHaveLength(2);
    expect(owners[0]).toMatchObject({
      author: "Alice Example",
      commits: 2,
      share: 66.7,
    });
    expect(owners[1]).toMatchObject({
      author: "Bob Example",
      commits: 1,
      share: 33.3,
    });
  });
});