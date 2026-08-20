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

export type ConditionExpr = string;

export type Effect = string;

export interface Story {
  id: string;
  title: string;
  startNodeId: string;
  nodes: Record<string, StoryNode>;
  initialVariables?: Record<string, unknown>;
}
