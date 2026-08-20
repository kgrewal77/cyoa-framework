export interface StoryNode {
  id: string;
  content: string | ContentBlock[];
  choices: Choice[];
  onEnter?: Effect[];
}

export interface ContentBlock {
  type: string;
  value: string;
}

export interface Choice {
  text: string;
  target: string;
  condition?: ConditionExpr;
  effects?: Effect[];
}

export interface Story {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
  initialVariables?: Record<string, unknown>;
}

export type Literal = string | number | boolean;

/** Dot-separated path into the variables bag, e.g. "inventory.length" or "flags.hasKey". */
export type VariablePath = string;

export type ComparisonOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

export interface ComparisonCondition {
  op: ComparisonOp;
  path: VariablePath;
  value: Literal;
}

export interface AndCondition {
  op: "and";
  conditions: ConditionNode[];
}

export interface OrCondition {
  op: "or";
  conditions: ConditionNode[];
}

export interface NotCondition {
  op: "not";
  condition: ConditionNode;
}

export type ConditionNode = ComparisonCondition | AndCondition | OrCondition | NotCondition;

/**
 * A condition can be authored either as the structured AST directly, or as a string
 * in the small DSL grammar (e.g. "hasKey === true && inventory.length > 0"), which is
 * parsed into the same AST at evaluation time. No `eval`/`Function` is ever used.
 */
export type ConditionExpr = string | ConditionNode;

export type SetEffectOp = "set" | "add" | "subtract" | "multiply" | "divide";

export interface SetEffect {
  op: SetEffectOp;
  path: VariablePath;
  value: Literal;
}

export interface ListEffect {
  op: "push" | "remove";
  path: VariablePath;
  value: Literal;
}

export type EffectNode = SetEffect | ListEffect;

/**
 * Like ConditionExpr: a string ("inventory.push('key')", "hp -= 10") is parsed into
 * the same EffectNode AST evaluation uses. No dynamic code execution.
 */
export type Effect = string | EffectNode;
