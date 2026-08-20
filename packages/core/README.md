# cyoa-core

UI agnostic story engine for writing branching, choose-your-own-adventure stories as plain, typed JSON. It handles state, branching logic, and validation for you. Pair it with your choice of React, another framework, or nothing at all.

## Why `cyoa-core`

- **Bring your own renderer.** The headless engine defers the choice to you.
- **Fully typed story schema.** Nodes, choices, conditions, and effects are all typed, so your editor catches mistakes as you write your story.
- **Write logic your way.** Gate a choice or apply an effect interchangeably with strings (`"hasKey === true"`, `"inventory.push('key')"`) or typechecked logic objects.
- **No `eval`, ever.** Story logic is parsed, not executed. It's safe to load stories from anywhere, including ones you didn't author yourself.
- **Validate before you ship.** Catch broken links, unreachable scenes, and typos in your story's logic with one function call.
- **Small and dependency-free.** Ships as ESM and CJS with bundled types, and tree-shakes cleanly.

## Install

```sh
pnpm add cyoa-core
```

## Docs

[Full API reference](https://kgrewal77.github.io/cyoa-framework/)

## Writing a story

A story is just data — a start node and a map of nodes, each with some content and a list of choices that lead elsewhere:

```ts
import type { Story } from "cyoa-core";

const story: Story = {
  id: "the-cellar",
  title: "The Cellar",
  startNodeId: "hall",
  initialVariables: { hasKey: false },
  nodes: {
    hall: {
      id: "hall",
      content: "A dusty hall. A locked door stands to the north.",
      choices: [
        {
          text: "Search the shelves",
          target: "hall_with_key",
          effects: ["hasKey = true"],
        },
        {
          text: "Try the door",
          target: "cellar",
          condition: "hasKey === true",
        },
      ],
    },
    hall_with_key: {
      id: "hall_with_key",
      content: "You find a rusty key.",
      choices: [
        {
          text: "Try the door",
          target: "cellar",
          condition: "hasKey === true",
        },
      ],
    },
    cellar: {
      id: "cellar",
      content: "The door creaks open onto a dark cellar.",
      choices: [],
    },
  },
};
```

Because it's plain JSON-compatible data, you can hand-write it, generate it, or load it from a CMS.

## Driving the story

`createStoryEngine` turns that data into a small state machine you can step through:

```ts
import { createStoryEngine } from "cyoa-core";

const engine = createStoryEngine(story);

engine.currentNode.content;
// "A dusty hall. A locked door stands to the north."

engine.availableChoices;
// only choices whose `condition` currently passes

engine.choose(0); // "Search the shelves" — picks up the key
engine.variables; // { hasKey: true }

engine.choose(0); // "Try the door" — now available, since hasKey is true
engine.currentNode.id; // "cellar"

engine.back(); // step back to re-read the previous scene
```

## Gating choices and applying effects

Conditions decide whether a choice is available; effects update your story's variables when a choice is taken. Write them as strings:

```ts
{ text: "Open the vault", target: "vault", condition: "hasKey === true && gold > 0" }
```

or as structured objects, if you'd rather have your editor check the logic itself:

```ts
{
  text: "Open the vault",
  target: "vault",
  condition: {
    op: "and",
    conditions: [
      { op: "eq", path: "hasKey", value: true },
      { op: "gt", path: "gold", value: 0 },
    ],
  },
}
```

Both forms support comparisons (`===`, `!==`, `>`, `>=`, `<`, `<=`), array membership (`inventory contains 'key'`), combinators (`&&`, `||`, `!`), and effects like `hp -= 10`, `score = 100`, or `inventory.push('key')`.

## Validating a story before you ship it

`validateStory` checks your whole story graph in one pass. No more finding a dead-end mid-playtest:

```ts
import { validateStory } from "cyoa-core";

const issues = validateStory(story);
// e.g. [{ type: "dangling-target", nodeId: "hall", choiceText: "Try the door", target: "celler" }]
```

It catches:

- a `startNodeId` that doesn't exist
- choices whose `target` points at a node that isn't there (typo-catching for links)
- nodes nothing can ever reach
- typos inside a condition or effect string
