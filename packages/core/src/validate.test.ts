import { describe, expect, it } from "vitest";
import { validateStory } from "./validate.js";
import type { Story } from "./types.js";

function baseStory(overrides: Partial<Story> = {}): Story {
  return {
    id: "demo",
    title: "Demo",
    startNodeId: "start",
    nodes: {
      start: { id: "start", content: "Start", choices: [{ text: "Go", target: "end" }] },
      end: { id: "end", content: "End", choices: [] },
    },
    ...overrides,
  };
}

describe("validateStory", () => {
  it("returns no issues for a well-formed story", () => {
    expect(validateStory(baseStory())).toEqual([]);
  });

  it("flags a missing start node", () => {
    const story = baseStory({ startNodeId: "nowhere" });
    expect(validateStory(story)).toContainEqual({
      type: "missing-start-node",
      startNodeId: "nowhere",
    });
  });

  it("flags a dangling choice target", () => {
    const story = baseStory({
      nodes: {
        start: {
          id: "start",
          content: "Start",
          choices: [{ text: "Go nowhere", target: "missing" }],
        },
      },
    });
    expect(validateStory(story)).toContainEqual({
      type: "dangling-target",
      nodeId: "start",
      choiceText: "Go nowhere",
      target: "missing",
    });
  });

  it("flags an unreachable node", () => {
    const story = baseStory({
      nodes: {
        start: { id: "start", content: "Start", choices: [] },
        orphan: { id: "orphan", content: "Orphan", choices: [] },
      },
    });
    expect(validateStory(story)).toContainEqual({ type: "unreachable-node", nodeId: "orphan" });
  });

  it("does not flag nodes reachable only via a chain of choices", () => {
    const story = baseStory({
      nodes: {
        start: { id: "start", content: "Start", choices: [{ text: "Go", target: "mid" }] },
        mid: { id: "mid", content: "Mid", choices: [{ text: "Go", target: "end" }] },
        end: { id: "end", content: "End", choices: [] },
      },
    });
    expect(validateStory(story)).toEqual([]);
  });

  it("flags a malformed choice condition string", () => {
    const story = baseStory({
      nodes: {
        start: {
          id: "start",
          content: "Start",
          choices: [{ text: "Go", target: "end", condition: "hasKey ===" }],
        },
        end: { id: "end", content: "End", choices: [] },
      },
    });
    const issues = validateStory(story);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: "invalid-condition", nodeId: "start", choiceText: "Go" }),
    );
  });

  it("does not flag a structured (non-string) condition, since it's already type-checked", () => {
    const story = baseStory({
      nodes: {
        start: {
          id: "start",
          content: "Start",
          choices: [{ text: "Go", target: "end", condition: { op: "eq", path: "hasKey", value: true } }],
        },
        end: { id: "end", content: "End", choices: [] },
      },
    });
    expect(validateStory(story)).toEqual([]);
  });

  it("flags a malformed choice effect string", () => {
    const story = baseStory({
      nodes: {
        start: {
          id: "start",
          content: "Start",
          choices: [{ text: "Go", target: "end", effects: ["hasKey"] }],
        },
        end: { id: "end", content: "End", choices: [] },
      },
    });
    const issues = validateStory(story);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: "invalid-effect", nodeId: "start", choiceText: "Go" }),
    );
  });

  it("flags a malformed onEnter effect string, with no choiceText since it isn't tied to a choice", () => {
    const story = baseStory({
      nodes: {
        start: {
          id: "start",
          content: "Start",
          choices: [],
          onEnter: ["inventory.pop('key')"],
        },
      },
    });
    const issues = validateStory(story);
    expect(issues).toContainEqual(
      expect.objectContaining({ type: "invalid-effect", nodeId: "start", choiceText: undefined }),
    );
  });
});
