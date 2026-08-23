import { act, renderHook } from "@testing-library/react";
import type { Story } from "cyoa-core";
import { describe, expect, it } from "vitest";
import { useStory } from "./useStory.js";

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
          { text: "Take the key", target: "hall_with_key", effects: ["hasKey = true"] },
          { text: "Leave", target: "outside" },
        ],
      },
      hall_with_key: {
        id: "hall_with_key",
        content: "You have the key.",
        choices: [{ text: "Open the locked door", target: "treasure", condition: "hasKey === true" }],
      },
      treasure: { id: "treasure", content: "Treasure!", choices: [] },
      outside: { id: "outside", content: "Outside.", choices: [] },
    },
  };
}

describe("useStory", () => {
  it("starts at the story's startNodeId", () => {
    const { result } = renderHook(() => useStory(makeStory()));
    expect(result.current.currentNode.id).toBe("hall");
    expect(result.current.variables).toEqual({ hasKey: false });
    expect(result.current.canGoBack).toBe(false);
  });

  it("resolves availableChoices to their true index in the full choices array, not their filtered position", () => {
    const { result } = renderHook(() => useStory(makeStory()));

    // "Open the locked door" (index 0) is gated out, so only "Take the key" (index 1)
    // and "Leave" (index 2) should be available — at their *original* indices.
    expect(result.current.availableChoices).toEqual([
      { choice: expect.objectContaining({ text: "Take the key" }), index: 1 },
      { choice: expect.objectContaining({ text: "Leave" }), index: 2 },
    ]);
  });

  it("choose() advances using the resolved index, landing on the correct node", () => {
    const { result } = renderHook(() => useStory(makeStory()));

    const leaveChoice = result.current.availableChoices.find((c) => c.choice.text === "Leave");
    act(() => {
      result.current.choose(leaveChoice!.index);
    });

    expect(result.current.currentNode.id).toBe("outside");
  });

  it("back() re-reads the previous node without reverting variables", () => {
    const { result } = renderHook(() => useStory(makeStory()));

    const takeKey = result.current.availableChoices.find((c) => c.choice.text === "Take the key");
    act(() => {
      result.current.choose(takeKey!.index);
    });
    expect(result.current.currentNode.id).toBe("hall_with_key");
    expect(result.current.variables).toEqual({ hasKey: true });

    act(() => {
      result.current.back();
    });
    expect(result.current.currentNode.id).toBe("hall");
    expect(result.current.variables).toEqual({ hasKey: true });
    expect(result.current.canGoBack).toBe(false);
  });
});
