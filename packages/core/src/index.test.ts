import { describe, expect, it } from "vitest";
import type { Story } from "./index.js";

describe("Story type", () => {
  it("accepts a minimal valid story shape", () => {
    const story: Story = {
      id: "demo",
      title: "Demo",
      startNodeId: "start",
      nodes: {
        start: { id: "start", content: "Hello", choices: [] },
      },
    };

    expect(story.nodes.start?.id).toBe("start");
  });
});
