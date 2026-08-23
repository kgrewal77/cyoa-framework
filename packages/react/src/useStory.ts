import type { Choice, Story, StoryNode } from "cyoa-core";
import { createStoryEngine } from "cyoa-core";
import { useCallback, useReducer, useRef } from "react";

/** A choice paired with its index in the node's full `choices` array — the index
 * `choose()` expects. Needed because `availableChoices` is filtered by condition, so
 * its position in that filtered list is not the same as its position in `choices`. */
export interface AvailableChoice {
  choice: Choice;
  index: number;
}

export interface UseStoryResult {
  currentNode: StoryNode;
  availableChoices: AvailableChoice[];
  history: readonly string[];
  variables: Readonly<Record<string, unknown>>;
  choose: (choiceIndex: number) => void;
  back: () => void;
  canGoBack: boolean;
}

/**
 * Bridges the imperative, mutable `StoryEngine` into React. The engine instance is
 * kept in a ref so it survives re-renders without being reconstructed; `choose`/`back`
 * mutate it directly (outside the reducer, so React Strict Mode's dev-time double
 * invocation of reducers can't double-apply an effect) and then force a re-render via
 * a side-effect-free counter reducer.
 */
export function useStory(story: Story): UseStoryResult {
  const engineRef = useRef(createStoryEngine(story));
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);

  const choose = useCallback((choiceIndex: number) => {
    engineRef.current.choose(choiceIndex);
    forceRender();
  }, []);

  const back = useCallback(() => {
    engineRef.current.back();
    forceRender();
  }, []);

  const engine = engineRef.current;
  const currentNode = engine.currentNode;
  const availableChoices = engine.availableChoices.map((choice) => ({
    choice,
    index: currentNode.choices.indexOf(choice),
  }));

  return {
    currentNode,
    availableChoices,
    history: engine.history,
    variables: engine.variables,
    choose,
    back,
    canGoBack: engine.canGoBack(),
  };
}
