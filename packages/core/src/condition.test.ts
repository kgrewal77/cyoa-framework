import { describe, expect, it } from "vitest";
import { evaluateCondition } from "./condition.js";
import type { ConditionNode } from "./types.js";

describe("evaluateCondition", () => {
  it("evaluates string-form conditions", () => {
    expect(evaluateCondition("hasKey === true", { hasKey: true })).toBe(true);
    expect(evaluateCondition("hasKey === true", { hasKey: false })).toBe(false);
    expect(evaluateCondition("inventory.length > 0", { inventory: { length: 2 } })).toBe(true);
  });

  it("evaluates structured AST conditions identically", () => {
    const node: ConditionNode = { op: "eq", path: "hasKey", value: true };
    expect(evaluateCondition(node, { hasKey: true })).toBe(true);
  });

  it("evaluates and/or/not combinators", () => {
    const vars = { a: 1, b: 2, c: 3 };
    expect(evaluateCondition("a === 1 && b === 2", vars)).toBe(true);
    expect(evaluateCondition("a === 1 && b === 99", vars)).toBe(false);
    expect(evaluateCondition("a === 99 || b === 2", vars)).toBe(true);
    expect(evaluateCondition("!(a === 99)", vars)).toBe(true);
  });

  it("resolves nested paths", () => {
    expect(evaluateCondition("flags.hasKey === true", { flags: { hasKey: true } })).toBe(true);
    expect(evaluateCondition("flags.hasKey === true", { flags: {} })).toBe(false);
    expect(evaluateCondition("flags.hasKey === true", {})).toBe(false);
  });

  it("string comparisons only compare like types", () => {
    expect(evaluateCondition("name > 5", { name: "abc" })).toBe(false);
    expect(evaluateCondition("score > 5", { score: 10 })).toBe(true);
    expect(evaluateCondition("name === 5", { name: "5" })).toBe(false);
  });

  it("compares strings lexicographically", () => {
    expect(evaluateCondition("name > 'apple'", { name: "banana" })).toBe(true);
    expect(evaluateCondition("name < 'apple'", { name: "banana" })).toBe(false);
  });

  it("evaluates contains for array membership", () => {
    expect(evaluateCondition("inventory contains 'key'", { inventory: ["key", "sword"] })).toBe(true);
    expect(evaluateCondition("inventory contains 'shield'", { inventory: ["key", "sword"] })).toBe(false);
  });

  it("evaluates contains as the structured AST form identically", () => {
    const node: ConditionNode = { op: "contains", path: "inventory", value: "key" };
    expect(evaluateCondition(node, { inventory: ["key"] })).toBe(true);
  });

  it("contains resolves nested paths", () => {
    expect(evaluateCondition("player.inventory contains 'key'", { player: { inventory: ["key"] } })).toBe(
      true,
    );
  });

  it("contains is false when the path isn't an array", () => {
    expect(evaluateCondition("inventory contains 'key'", { inventory: "key" })).toBe(false);
    expect(evaluateCondition("inventory contains 'key'", {})).toBe(false);
  });

  it("contains composes with combinators", () => {
    const vars = { inventory: ["key"], hasMap: true };
    expect(evaluateCondition("inventory contains 'key' && hasMap === true", vars)).toBe(true);
    expect(evaluateCondition("inventory contains 'sword' || hasMap === true", vars)).toBe(true);
  });
});
