import type { Story } from "cyoa-core";
import { useStory } from "cyoa-react";

export interface GameProps {
  story: Story;
  onRestart: () => void;
}

export function Game({ story, onRestart }: GameProps) {
  const { currentNode, availableChoices, choose, back, canGoBack } = useStory(story);
  const isEnding = availableChoices.length === 0;

  return (
    <div className="game">
      <p className="scene">{currentNode.content as string}</p>

      {isEnding ? (
        <button type="button" className="restart" onClick={onRestart}>
          Play again
        </button>
      ) : (
        <div className="choices">
          {availableChoices.map(({ choice, index }) => (
            <button key={index} type="button" className="choice" onClick={() => choose(index)}>
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {canGoBack && !isEnding && (
        <button type="button" className="back" onClick={back}>
          ← Back
        </button>
      )}
    </div>
  );
}
