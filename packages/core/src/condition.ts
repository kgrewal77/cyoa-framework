import { parseConditionExpr } from "./parser.js";
import { getPath } from "./path.js";
import type { ConditionExpr, ConditionNode } from "./types.js";

export function evaluateCondition(
  condition: ConditionExpr,
  variables: Record<string, unknown>,
): boolean {
  const node = typeof condition === "string" ? parseConditionExpr(condition) : condition;
  return evaluateNode(node, variables);
}

function evaluateNode(node: ConditionNode, variables: Record<string, unknown>): boolean {
  switch (node.op) {
    case "and":
      return node.conditions.every((c) => evaluateNode(c, variables));
    case "or":
      return node.conditions.some((c) => evaluateNode(c, variables));
    case "not":
      return !evaluateNode(node.condition, variables);
    case "eq":
      return getPath(variables, node.path) === node.value;
    case "neq":
      return getPath(variables, node.path) !== node.value;
    case "gt":
    case "gte":
    case "lt":
    case "lte":
      return compare(node.op, getPath(variables, node.path), node.value);
  }
}

function compare(op: "gt" | "gte" | "lt" | "lte", actual: unknown, expected: unknown): boolean {
  let result: boolean;
  if (typeof actual === "number" && typeof expected === "number") {
    result = compareOrdered(op, actual, expected);
  } else if (typeof actual === "string" && typeof expected === "string") {
    result = compareOrdered(op, actual, expected);
  } else {
    return false;
  }
  return result;
}

function compareOrdered<T extends number | string>(op: "gt" | "gte" | "lt" | "lte", actual: T, expected: T): boolean {
  switch (op) {
    case "gt":
      return actual > expected;
    case "gte":
      return actual >= expected;
    case "lt":
      return actual < expected;
    case "lte":
      return actual <= expected;
  }
}
