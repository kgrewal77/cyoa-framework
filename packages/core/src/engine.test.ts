import { describe, expect, it } from "vitest";
import { createStoryEngine } from "./engine.js";
import type { Story } from "./types.js";

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
          { text: "Take the key", target: "hall_with_key", effects: ["hasKey = true"] },
          { text: "Open the locked door", target: "treasure", condition: "hasKey === true" },
          { text: "Leave", target: "outside" },
        ],
      },
      hall_with_key: {
        id: "hall_with_key",
        content: "You have the key.",
        choices: [{ text: "Open the locked door", target: "treasure", condition: "hasKey === true" }],
      },
      treasure: {
        id: "treasure",
        content: "Treasure!",
        choices: [],
        onEnter: ["score = 100"],
      },
      outside: { id: "outside", content: "Outside.", choices: [] },
    },
  };
}

describe("createStoryEngine", () => {
  it("starts at startNodeId with initialVariables applied", () => {
    const engine = createStoryEngine(makeStory());
    expect(engine.currentNode.id).toBe("hall");
    expect(engine.variables).toEqual({ hasKey: false });
    expect(engine.history).toEqual([]);
  });

  it("throws if startNodeId does not exist in nodes", () => {
    const story = makeStory();
    story.startNodeId = "missing";
    expect(() => createStoryEngine(story)).toThrow(/startNodeId/);
  });

  it("filters availableChoices by condition", () => {
    const engine = createStoryEngine(makeStory());
    const availableTexts = engine.availableChoices.map((c) => c.text);
    expect(availableTexts).toEqual(["Take the key", "Leave"]);
  });

  it("choose() applies choice effects and transitions to target", () => {
    const engine = createStoryEngine(makeStory());
    engine.choose(0); // Take the key
    expect(engine.currentNode.id).toBe("hall_with_key");
    expect(engine.variables).toEqual({ hasKey: true });
    expect(engine.history).toEqual(["hall"]);
  });

  it("choose() applies the target node's onEnter effects after choice effects", () => {
    const engine = createStoryEngine(makeStory());
    engine.choose(0); // Take the key -> hall_with_key
    engine.choose(0); // Open the locked door -> treasure
    expect(engine.currentNode.id).toBe("treasure");
    expect(engine.variables).toEqual({ hasKey: true, score: 100 });
  });

  it("choose() throws when the target choice's condition is not met", () => {
    const engine = createStoryEngine(makeStory());
    expect(() => engine.choose(1)).toThrow(/not available/);
  });

  it("choose() throws on an out-of-range index", () => {
    const engine = createStoryEngine(makeStory());
    expect(() => engine.choose(99)).toThrow(/No choice at index/);
  });

  it("back() returns to the previous node without reverting variables", () => {
    const engine = createStoryEngine(makeStory());
    expect(engine.canGoBack()).toBe(false);

    engine.choose(0); // hall -> hall_with_key, hasKey becomes true
    expect(engine.canGoBack()).toBe(true);

    engine.back();
    expect(engine.currentNode.id).toBe("hall");
    expect(engine.variables).toEqual({ hasKey: true });
    expect(engine.history).toEqual([]);
  });

  it("back() throws when history is empty", () => {
    const engine = createStoryEngine(makeStory());
    expect(() => engine.back()).toThrow(/history is empty/);
  });

  it("getSnapshot() reflects current state", () => {
    const engine = createStoryEngine(makeStory());
    engine.choose(0);
    expect(engine.getSnapshot()).toEqual({
      currentNodeId: "hall_with_key",
      history: ["hall"],
      variables: { hasKey: true },
    });
  });
});
