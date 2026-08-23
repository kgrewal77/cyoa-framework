import type { StoryNode } from "cyoa-core";

export interface SceneProps {
  node: StoryNode;
}

/**
 * Default node content renderer. `node.content` is rendered as plain text — React
 * escapes it by default, so this is XSS-safe with no `dangerouslySetInnerHTML`.
 * `ContentBlock[]` content is flattened to its block text; a structured, per-block-type
 * renderer is left for once `cyoa-core` defines a real block type vocabulary.
 */
export function Scene({ node }: SceneProps) {
  const text =
    typeof node.content === "string"
      ? node.content
      : node.content.map((block) => block.value).join("\n\n");

  return <p>{text}</p>;
}
