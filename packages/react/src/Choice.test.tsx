import { fireEvent, render, screen } from "@testing-library/react";
import type { Choice as ChoiceData } from "cyoa-core";
import { describe, expect, it, vi } from "vitest";
import { Choice } from "./Choice.js";

describe("Choice", () => {
  it("renders the choice text as a button", () => {
    const choice: ChoiceData = { text: "Go north", target: "forest" };
    render(<Choice choice={choice} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Go north" })).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const choice: ChoiceData = { text: "Go north", target: "forest" };
    const onSelect = vi.fn();
    render(<Choice choice={choice} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Go north" }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
