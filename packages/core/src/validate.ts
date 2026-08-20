import { parseConditionExpr, parseEffectExpr } from "./parser.js";
import type { Effect, Story } from "./types.js";

export type ValidationIssue =
  | { type: "missing-start-node"; startNodeId: string }
  | { type: "dangling-target"; nodeId: string; choiceText: string; target: string }
  | { type: "unreachable-node"; nodeId: string }
  | { type: "invalid-condition"; nodeId: string; choiceText: string; message: string }
  | { type: "invalid-effect"; nodeId: string; choiceText?: string; message: string };

export function validateStory(story: Story): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(Object.keys(story.nodes));

  if (!nodeIds.has(story.startNodeId)) {
    issues.push({ type: "missing-start-node", startNodeId: story.startNodeId });
  }

  for (const node of Object.values(story.nodes)) {
    checkEffects(node.onEnter, node.id, undefined, issues);

    for (const choice of node.choices) {
      if (!nodeIds.has(choice.target)) {
        issues.push({
          type: "dangling-target",
          nodeId: node.id,
          choiceText: choice.text,
          target: choice.target,
        });
      }

      if (typeof choice.condition === "string") {
        try {
          parseConditionExpr(choice.condition);
        } catch (error) {
          issues.push({
            type: "invalid-condition",
            nodeId: node.id,
            choiceText: choice.text,
            message: error instanceof Error ? error.message : String(error),
          });
        }
      }

      checkEffects(choice.effects, node.id, choice.text, issues);
    }
  }

  if (nodeIds.has(story.startNodeId)) {
    const reachable = new Set<string>();
    const queue = [story.startNodeId];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (reachable.has(id)) continue;
      reachable.add(id);
      const node = story.nodes[id];
      if (!node) continue;
      for (const choice of node.choices) {
        if (nodeIds.has(choice.target) && !reachable.has(choice.target)) {
          queue.push(choice.target);
        }
      }
    }
    for (const id of nodeIds) {
      if (!reachable.has(id)) {
        issues.push({ type: "unreachable-node", nodeId: id });
      }
    }
  }

  return issues;
}

function checkEffects(
  effects: Effect[] | undefined,
  nodeId: string,
  choiceText: string | undefined,
  issues: ValidationIssue[],
): void {
  if (!effects) return;
  for (const effect of effects) {
    if (typeof effect !== "string") continue;
    try {
      parseEffectExpr(effect);
    } catch (error) {
      issues.push({
        type: "invalid-effect",
        nodeId,
        choiceText,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
