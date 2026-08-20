import { parseEffectExpr } from "./parser.js";
import { getPath, setPath } from "./path.js";
import type { Effect, EffectNode } from "./types.js";

export function applyEffect(
  effect: Effect,
  variables: Record<string, unknown>,
): Record<string, unknown> {
  const node = typeof effect === "string" ? parseEffectExpr(effect) : effect;
  return applyNode(node, variables);
}

export function applyEffects(
  effects: Effect[] | undefined,
  variables: Record<string, unknown>,
): Record<string, unknown> {
  if (!effects || effects.length === 0) return variables;
  return effects.reduce((vars, effect) => applyEffect(effect, vars), variables);
}

function applyNode(node: EffectNode, variables: Record<string, unknown>): Record<string, unknown> {
  switch (node.op) {
    case "set":
      return setPath(variables, node.path, node.value);
    case "add":
    case "subtract":
    case "multiply":
    case "divide": {
      const current = getPath(variables, node.path);
      const base = typeof current === "number" ? current : 0;
      const amount = typeof node.value === "number" ? node.value : Number(node.value);
      return setPath(variables, node.path, applyArithmetic(node.op, base, amount));
    }
    case "push": {
      const current = getPath(variables, node.path);
      const list = Array.isArray(current) ? current : [];
      return setPath(variables, node.path, [...list, node.value]);
    }
    case "remove": {
      const current = getPath(variables, node.path);
      const list = Array.isArray(current) ? current : [];
      return setPath(
        variables,
        node.path,
        list.filter((item) => item !== node.value),
      );
    }
  }
}

function applyArithmetic(op: "add" | "subtract" | "multiply" | "divide", base: number, amount: number): number {
  switch (op) {
    case "add":
      return base + amount;
    case "subtract":
      return base - amount;
    case "multiply":
      return base * amount;
    case "divide":
      return base / amount;
  }
}
