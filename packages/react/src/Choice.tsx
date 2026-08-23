import type { Choice as ChoiceData } from "cyoa-core";
import { themeCssVar } from "./theme.js";

export interface ChoiceProps {
  choice: ChoiceData;
  onSelect: () => void;
}

export function Choice({ choice, onSelect }: ChoiceProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="cyoa-choice"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "0.75rem 1rem",
        marginBottom: "0.5rem",
        borderRadius: "0.5rem",
        border: `1px solid var(${themeCssVar.choiceBorder})`,
        background: `var(${themeCssVar.choiceBackground})`,
        color: `var(${themeCssVar.choiceText})`,
        cursor: "pointer",
      }}
    >
      {choice.text}
    </button>
  );
}
