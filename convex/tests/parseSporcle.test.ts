import { describe, expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  deobfuscate,
  buildReverseMapping,
  translateAnswers,
  parseExtractedData,
} from "../parseSporcle";
import { extractFromHtml } from "../extractFromHtml";

const sampleQuizHtml = readFileSync(
  resolve(__dirname, "../../sample_quiz.html"),
  "utf-8"
);

describe("extractFromHtml", () => {
  test("extracts title, charMap, and answers from sample quiz", () => {
    const result = extractFromHtml(sampleQuizHtml);
    expect(result.title).toBeTruthy();
    expect(result.charMapStr).toBeTruthy();
    expect(result.allAnswersStr).toBeTruthy();

    // charMap should be valid JSON object
    const charMap = JSON.parse(result.charMapStr);
    expect(typeof charMap).toBe("object");
    expect(Object.keys(charMap).length).toBeGreaterThan(0);

    // answers should be valid JSON array of arrays
    const answers = JSON.parse(result.allAnswersStr);
    expect(Array.isArray(answers)).toBe(true);
    expect(answers.length).toBeGreaterThan(0);
    expect(Array.isArray(answers[0])).toBe(true);
  });

  test("throws on HTML with no title", () => {
    expect(() => extractFromHtml("<html><body>no title</body></html>")).toThrow(
      "Could not find <title>"
    );
  });

  test("throws on HTML with no asta variable", () => {
    expect(() =>
      extractFromHtml("<html><title>Test</title><body></body></html>")
    ).toThrow("Could not find 'var asta ='");
  });
});

describe("deobfuscate", () => {
  test("replaces characters using reverse mapping", () => {
    const reverseMapping = { X: "a", Y: "b", Z: "c" };
    expect(deobfuscate("XYZ", reverseMapping)).toBe("abc");
  });

  test("preserves characters not in mapping", () => {
    const reverseMapping = { X: "a" };
    expect(deobfuscate("X1X2", reverseMapping)).toBe("a1a2");
  });

  test("handles empty string", () => {
    expect(deobfuscate("", {})).toBe("");
  });
});

describe("buildReverseMapping", () => {
  test("inverts the character mapping", () => {
    const charMap = { a: "X", b: "Y", c: "Z" };
    const reverse = buildReverseMapping(charMap);
    expect(reverse).toEqual({ X: "a", Y: "b", Z: "c" });
  });
});

describe("translateAnswers", () => {
  test("deobfuscates array-of-arrays format", () => {
    // charMap: a->X means obfuscated X = plaintext a
    const charMap = { a: "X", b: "Y", c: "Z" };
    const obfuscated: string[][] = [["XYZ", "XY"], ["ZZZ"]];
    const result = translateAnswers(obfuscated, charMap);
    expect(result).toEqual([["abc", "ab"], ["ccc"]]);
  });

  test("splits sub-variants on /", () => {
    // identity mapping for simplicity
    const charMap: Record<string, string> = {};
    const obfuscated: string[][] = [["hello/hi"]];
    const result = translateAnswers(obfuscated, charMap);
    expect(result).toEqual([["hello", "hi"]]);
  });

  test("deduplicates variants", () => {
    const charMap: Record<string, string> = {};
    const obfuscated: string[][] = [["hello", "hello"]];
    const result = translateAnswers(obfuscated, charMap);
    expect(result).toEqual([["hello"]]);
  });

  test("works end-to-end with sample quiz data", () => {
    const { allAnswersStr, charMapStr } = extractFromHtml(sampleQuizHtml);
    const { obfuscatedAnswers, charMap } = parseExtractedData(
      allAnswersStr,
      charMapStr
    );
    const answers = translateAnswers(obfuscatedAnswers, charMap);

    expect(answers.length).toBeGreaterThan(100);
    // All answers should be non-empty arrays of strings
    for (const variants of answers) {
      expect(Array.isArray(variants)).toBe(true);
      expect(variants.length).toBeGreaterThan(0);
      for (const v of variants) {
        expect(typeof v).toBe("string");
        expect(v.length).toBeGreaterThan(0);
      }
    }

    // Spot-check: the deobfuscated answers should be readable English words
    // (not still obfuscated gibberish). Check that common letters appear.
    const allText = answers.flat().join(" ").toLowerCase();
    expect(allText).toMatch(/[aeiou]/);
    expect(allText).toMatch(/the|and|of/);
  });
});

describe("parseExtractedData", () => {
  test("parses valid JSON strings", () => {
    const answersStr = '[["abc","def"],["ghi"]]';
    const charMapStr = '{"a":"X","b":"Y"}';
    const { obfuscatedAnswers, charMap } = parseExtractedData(
      answersStr,
      charMapStr
    );
    expect(obfuscatedAnswers).toEqual([["abc", "def"], ["ghi"]]);
    expect(charMap).toEqual({ a: "X", b: "Y" });
  });

  test("strips backslashes before parsing", () => {
    const answersStr = '[["a\\bc"]]';
    const charMapStr = "{}";
    const { obfuscatedAnswers } = parseExtractedData(answersStr, charMapStr);
    expect(obfuscatedAnswers).toEqual([["abc"]]);
  });

  test("normalizes flat strings to arrays", () => {
    const answersStr = '["hello","world"]';
    const charMapStr = "{}";
    const { obfuscatedAnswers } = parseExtractedData(answersStr, charMapStr);
    expect(obfuscatedAnswers).toEqual([["hello"], ["world"]]);
  });

  test("throws on empty answers", () => {
    expect(() => parseExtractedData("[]", "{}")).toThrow("not a non-empty");
  });

  test("throws on invalid JSON", () => {
    expect(() => parseExtractedData("not json", "{}")).toThrow();
  });
});
