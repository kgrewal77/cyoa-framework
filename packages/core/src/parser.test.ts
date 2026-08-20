import { describe, expect, it } from "vitest";
import { ParseError, parseConditionExpr, parseEffectExpr } from "./parser.js";

describe("parseConditionExpr", () => {
  it("parses a simple equality comparison", () => {
    expect(parseConditionExpr("hasKey === true")).toEqual({
      op: "eq",
      path: "hasKey",
      value: true,
    });
  });

  it("parses numeric and string literals", () => {
    expect(parseConditionExpr("inventory.length > 0")).toEqual({
      op: "gt",
      path: "inventory.length",
      value: 0,
    });
    expect(parseConditionExpr("name === 'Alice'")).toEqual({
      op: "eq",
      path: "name",
      value: "Alice",
    });
    expect(parseConditionExpr('name === "Bob"')).toEqual({
      op: "eq",
      path: "name",
      value: "Bob",
    });
  });

  it("parses all comparison operators", () => {
    expect(parseConditionExpr("hp !== 0")).toMatchObject({ op: "neq" });
    expect(parseConditionExpr("hp >= 10")).toMatchObject({ op: "gte" });
    expect(parseConditionExpr("hp < 10")).toMatchObject({ op: "lt" });
    expect(parseConditionExpr("hp <= 10")).toMatchObject({ op: "lte" });
  });

  it("parses && and || with correct precedence (&& binds tighter than ||)", () => {
    expect(parseConditionExpr("a === 1 || b === 2 && c === 3")).toEqual({
      op: "or",
      conditions: [
        { op: "eq", path: "a", value: 1 },
        {
          op: "and",
          conditions: [
            { op: "eq", path: "b", value: 2 },
            { op: "eq", path: "c", value: 3 },
          ],
        },
      ],
    });
  });

  it("parses the contains operator", () => {
    expect(parseConditionExpr("inventory contains 'key'")).toEqual({
      op: "contains",
      path: "inventory",
      value: "key",
    });
    expect(parseConditionExpr("player.inventory contains 'key'")).toEqual({
      op: "contains",
      path: "player.inventory",
      value: "key",
    });
  });

  it("does not mistake an identifier prefixed with 'contains' for the keyword", () => {
    expect(parseConditionExpr("containsAll === true")).toEqual({
      op: "eq",
      path: "containsAll",
      value: true,
    });
  });

  it("parses negation", () => {
    expect(parseConditionExpr("!hasKey === true")).toEqual({
      op: "not",
      condition: { op: "eq", path: "hasKey", value: true },
    });
  });

  it("parses parenthesized groups", () => {
    expect(parseConditionExpr("(a === 1 || b === 2) && c === 3")).toEqual({
      op: "and",
      conditions: [
        {
          op: "or",
          conditions: [
            { op: "eq", path: "a", value: 1 },
            { op: "eq", path: "b", value: 2 },
          ],
        },
        { op: "eq", path: "c", value: 3 },
      ],
    });
  });

  it("throws ParseError on malformed input", () => {
    expect(() => parseConditionExpr("hasKey ===")).toThrow(ParseError);
    expect(() => parseConditionExpr("=== true")).toThrow(ParseError);
    expect(() => parseConditionExpr("hasKey === true &&")).toThrow(ParseError);
    expect(() => parseConditionExpr("hasKey === true extra")).toThrow(ParseError);
    expect(() => parseConditionExpr("name === 'unterminated")).toThrow(ParseError);
  });
});

describe("parseEffectExpr", () => {
  it("parses assignment", () => {
    expect(parseEffectExpr("hasKey = true")).toEqual({ op: "set", path: "hasKey", value: true });
  });

  it("parses compound assignment operators", () => {
    expect(parseEffectExpr("hp += 10")).toEqual({ op: "add", path: "hp", value: 10 });
    expect(parseEffectExpr("hp -= 10")).toEqual({ op: "subtract", path: "hp", value: 10 });
    expect(parseEffectExpr("hp *= 2")).toEqual({ op: "multiply", path: "hp", value: 2 });
    expect(parseEffectExpr("hp /= 2")).toEqual({ op: "divide", path: "hp", value: 2 });
  });

  it("parses push/remove method calls", () => {
    expect(parseEffectExpr("inventory.push('key')")).toEqual({
      op: "push",
      path: "inventory",
      value: "key",
    });
    expect(parseEffectExpr("inventory.remove('key')")).toEqual({
      op: "remove",
      path: "inventory",
      value: "key",
    });
  });

  it("parses nested paths for push/remove", () => {
    expect(parseEffectExpr("player.inventory.push('sword')")).toEqual({
      op: "push",
      path: "player.inventory",
      value: "sword",
    });
  });

  it("throws ParseError on malformed input", () => {
    expect(() => parseEffectExpr("hasKey")).toThrow(ParseError);
    expect(() => parseEffectExpr("hasKey ==")).toThrow(ParseError);
    expect(() => parseEffectExpr("inventory.pop('key')")).toThrow(ParseError);
    expect(() => parseEffectExpr("hp += 10 extra")).toThrow(ParseError);
  });
});
