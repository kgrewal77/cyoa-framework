import type { Choice as ChoiceData } from "cyoa-core";

export interface ChoiceProps {
  choice: ChoiceData;
  onSelect: () => void;
}

export function Choice({ choice, onSelect }: ChoiceProps) {
  return (
    <button type="button" onClick={onSelect}>
      {choice.text}
    </button>
  );
}
