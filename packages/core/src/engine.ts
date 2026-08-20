import { evaluateCondition } from "./condition.js";
import { applyEffects } from "./effect.js";
import type { Choice, Story, StoryNode } from "./types.js";

export interface StoryEngineSnapshot {
  currentNodeId: string;
  history: readonly string[];
  variables: Readonly<Record<string, unknown>>;
}

/**
 * Headless story state machine. Holds no rendering concerns — `cyoa-react` (or any
 * other consumer) drives its UI off `currentNode`/`availableChoices` and calls
 * `choose()` in response to user input.
 */
export class StoryEngine {
  private state: {
    currentNodeId: string;
    history: string[];
    variables: Record<string, unknown>;
  };

  constructor(private readonly story: Story) {
    const node = story.nodes[story.startNodeId];
    if (!node) {
      throw new Error(`Story has no node matching startNodeId "${story.startNodeId}"`);
    }
    const variables = applyEffects(node.onEnter, { ...(story.initialVariables ?? {}) });
    this.state = { currentNodeId: story.startNodeId, history: [], variables };
  }

  get currentNode(): StoryNode {
    const node = this.story.nodes[this.state.currentNodeId];
    if (!node) {
      throw new Error(`Current node "${this.state.currentNodeId}" does not exist in story`);
    }
    return node;
  }

  get history(): readonly string[] {
    return this.state.history;
  }

  get variables(): Readonly<Record<string, unknown>> {
    return this.state.variables;
  }

  /** Choices on the current node whose condition passes against current variables. */
  get availableChoices(): Choice[] {
    return this.currentNode.choices.filter((choice) =>
      choice.condition ? evaluateCondition(choice.condition, this.state.variables) : true,
    );
  }

  /** Advances to `currentNode.choices[choiceIndex]`, applying its effects then the target node's onEnter effects. */
  choose(choiceIndex: number): void {
    const choice = this.currentNode.choices[choiceIndex];
    if (!choice) {
      throw new Error(`No choice at index ${choiceIndex} on node "${this.state.currentNodeId}"`);
    }
    if (choice.condition && !evaluateCondition(choice.condition, this.state.variables)) {
      throw new Error(`Choice "${choice.text}" is not available: condition not met`);
    }
    const targetNode = this.story.nodes[choice.target];
    if (!targetNode) {
      throw new Error(`Choice "${choice.text}" targets unknown node "${choice.target}"`);
    }

    const variablesAfterChoice = applyEffects(choice.effects, this.state.variables);
    const variablesAfterEnter = applyEffects(targetNode.onEnter, variablesAfterChoice);

    this.state = {
      currentNodeId: choice.target,
      history: [...this.state.history, this.state.currentNodeId],
      variables: variablesAfterEnter,
    };
  }

  canGoBack(): boolean {
    return this.state.history.length > 0;
  }

  /**
   * Navigates to the previous node for re-reading. Variables are intentionally NOT
   * reverted — `back()` is narrative "go re-read" navigation, not a state undo.
   */
  back(): void {
    const previous = this.state.history[this.state.history.length - 1];
    if (previous === undefined) {
      throw new Error("Cannot go back: history is empty");
    }
    this.state = {
      currentNodeId: previous,
      history: this.state.history.slice(0, -1),
      variables: this.state.variables,
    };
  }

  getSnapshot(): StoryEngineSnapshot {
    return {
      currentNodeId: this.state.currentNodeId,
      history: this.state.history,
      variables: this.state.variables,
    };
  }
}

export function createStoryEngine(story: Story): StoryEngine {
  return new StoryEngine(story);
}
