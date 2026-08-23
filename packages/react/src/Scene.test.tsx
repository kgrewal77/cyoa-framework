import { render, screen } from "@testing-library/react";
import type { StoryNode } from "cyoa-core";
import { describe, expect, it } from "vitest";
import { Scene } from "./Scene.js";

describe("Scene", () => {
  it("renders string content as text", () => {
    const node: StoryNode = { id: "n", content: "A dark forest.", choices: [] };
    render(<Scene node={node} />);
    expect(screen.getByText("A dark forest.")).toBeInTheDocument();
  });

  it("renders markup in content as literal text, not HTML", () => {
    const node: StoryNode = { id: "n", content: "<script>alert('x')</script>", choices: [] };
    const { container } = render(<Scene node={node} />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("<script>alert('x')</script>")).toBeInTheDocument();
  });

  it("flattens ContentBlock[] content by joining block values", () => {
    const node: StoryNode = {
      id: "n",
      content: [
        { type: "paragraph", value: "First block." },
        { type: "paragraph", value: "Second block." },
      ],
      choices: [],
    };
    const { container } = render(<Scene node={node} />);
    expect(container.textContent).toBe("First block.\n\nSecond block.");
  });
});
