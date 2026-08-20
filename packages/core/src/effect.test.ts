import { describe, expect, it } from "vitest";
import { applyEffect, applyEffects } from "./effect.js";
import type { EffectNode } from "./types.js";

describe("applyEffect", () => {
  it("applies string-form set/compound-assignment effects", () => {
    expect(applyEffect("hasKey = true", {})).toEqual({ hasKey: true });
    expect(applyEffect("hp += 10", { hp: 5 })).toEqual({ hp: 15 });
    expect(applyEffect("hp -= 5", { hp: 10 })).toEqual({ hp: 5 });
    expect(applyEffect("hp *= 2", { hp: 5 })).toEqual({ hp: 10 });
    expect(applyEffect("hp /= 2", { hp: 10 })).toEqual({ hp: 5 });
  });

  it("treats a missing numeric variable as 0 for arithmetic effects", () => {
    expect(applyEffect("score += 5", {})).toEqual({ score: 5 });
  });

  it("applies structured AST effects identically", () => {
    const node: EffectNode = { op: "add", path: "hp", value: 10 };
    expect(applyEffect(node, { hp: 5 })).toEqual({ hp: 15 });
  });

  it("applies push/remove on nested array paths", () => {
    const vars = { player: { inventory: ["sword"] } };
    const afterPush = applyEffect("player.inventory.push('key')", vars);
    expect(afterPush).toEqual({ player: { inventory: ["sword", "key"] } });

    const afterRemove = applyEffect("player.inventory.remove('sword')", afterPush);
    expect(afterRemove).toEqual({ player: { inventory: ["key"] } });
  });

  it("push on a missing path starts a new array", () => {
    expect(applyEffect("inventory.push('key')", {})).toEqual({ inventory: ["key"] });
  });

  it("does not mutate the input variables object", () => {
    const vars = { hp: 5 };
    applyEffect("hp += 10", vars);
    expect(vars).toEqual({ hp: 5 });
  });

  it("sets a nested path without disturbing sibling keys", () => {
    const vars = { flags: { hasKey: false, hasSword: true } };
    expect(applyEffect("flags.hasKey = true", vars)).toEqual({
      flags: { hasKey: true, hasSword: true },
    });
  });
});

describe("applyEffects", () => {
  it("applies a list of effects in order", () => {
    const result = applyEffects(["hp = 20", "hp -= 5", "inventory.push('key')"], {});
    expect(result).toEqual({ hp: 15, inventory: ["key"] });
  });

  it("returns the same variables object when effects is undefined or empty", () => {
    const vars = { hp: 5 };
    expect(applyEffects(undefined, vars)).toBe(vars);
    expect(applyEffects([], vars)).toBe(vars);
  });
});
