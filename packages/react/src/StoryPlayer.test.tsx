import { fireEvent, render, screen } from "@testing-library/react";
import type { Story } from "cyoa-core";
import { describe, expect, it } from "vitest";
import type { ChoiceProps } from "./Choice.js";
import { StoryPlayer } from "./StoryPlayer.js";
import { darkTheme } from "./theme.js";

function makeStory(): Story {
  return {
    id: "demo",
    title: "Demo",
    startNodeId: "hall",
    initialVariables: { hasKey: false },
    nodes: {
      hall: {
        id: "hall",
        content: "You are in a hall.",
        choices: [
          { text: "Open the locked door", target: "treasure", condition: "hasKey === true" },
          { text: "Leave", target: "outside" },
        ],
      },
      treasure: { id: "treasure", content: "Treasure!", choices: [] },
      outside: { id: "outside", content: "Outside.", choices: [] },
    },
  };
}

describe("StoryPlayer", () => {
  it("renders the current node and only its available choices", () => {
    render(<StoryPlayer story={makeStory()} />);

    expect(screen.getByText("You are in a hall.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leave" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open the locked door" })).toBeNull();
  });

  it("advances to the correct node when a choice after a gated one is clicked", () => {
    render(<StoryPlayer story={makeStory()} />);

    fireEvent.click(screen.getByRole("button", { name: "Leave" }));

    expect(screen.getByText("Outside.")).toBeInTheDocument();
  });

  it("uses overridden Scene/Choice components when provided", () => {
    function CustomChoice({ choice, onSelect }: ChoiceProps) {
      return (
        <button type="button" onClick={onSelect}>
          Custom: {choice.text}
        </button>
      );
    }

    render(<StoryPlayer story={makeStory()} components={{ Choice: CustomChoice }} />);

    expect(screen.getByRole("button", { name: "Custom: Leave" })).toBeInTheDocument();
  });

  it("applies the given theme's colors to the wrapper", () => {
    const { container } = render(<StoryPlayer story={makeStory()} theme={darkTheme} />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper.style.getPropertyValue("--cyoa-background")).toBe(darkTheme.colorBackground);
  });
});
