import type { ComponentType } from "react";
import type { Story } from "cyoa-core";
import { Choice, type ChoiceProps } from "./Choice.js";
import { Scene, type SceneProps } from "./Scene.js";
import { useStory } from "./useStory.js";

export interface StoryPlayerComponents {
  Scene?: ComponentType<SceneProps>;
  Choice?: ComponentType<ChoiceProps>;
}

export interface StoryPlayerProps {
  story: Story;
  /** Override the default `Scene`/`Choice` renderers, e.g. `components={{ Choice: MyChoice }}`. */
  components?: StoryPlayerComponents;
}

export function StoryPlayer({ story, components }: StoryPlayerProps) {
  const { currentNode, availableChoices, choose } = useStory(story);
  const SceneComponent = components?.Scene ?? Scene;
  const ChoiceComponent = components?.Choice ?? Choice;

  return (
    <div>
      <SceneComponent node={currentNode} />
      <div>
        {availableChoices.map(({ choice, index }) => (
          <ChoiceComponent key={index} choice={choice} onSelect={() => choose(index)} />
        ))}
      </div>
    </div>
  );
}
