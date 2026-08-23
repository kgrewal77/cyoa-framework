# cyoa-react

React bindings for [`cyoa-core`](https://www.npmjs.com/package/cyoa-core) — render choose-your-own-adventure stories built with the engine as React components, with sane defaults and full control when you want it.

## Why `cyoa-react`

- **Drop-in player.** `<StoryPlayer story={...} />` renders a complete, playable story with one component.
- **Override anything.** Swap in your own `Scene`/`Choice` renderers via `components={{ Choice: MyChoice }}` — same pattern as MDX/Radix — without losing the engine wiring.
- **Or drive it yourself.** `useStory` exposes the engine's state and actions directly if you want to build your own UI from scratch.
- **XSS-safe by default.** Story content renders as plain text through React's default escaping — no `dangerouslySetInnerHTML`.

## Install

```sh
pnpm add cyoa-react cyoa-core
```

`react` and `react-dom` (^18 or ^19) are peer dependencies.

## Quickstart

```tsx
import { StoryPlayer } from "cyoa-react";
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
        { text: "Search the shelves", target: "hall_with_key", effects: ["hasKey = true"] },
        { text: "Try the door", target: "cellar", condition: "hasKey === true" },
      ],
    },
    hall_with_key: {
      id: "hall_with_key",
      content: "You find a rusty key.",
      choices: [{ text: "Try the door", target: "cellar", condition: "hasKey === true" }],
    },
    cellar: {
      id: "cellar",
      content: "The door creaks open onto a dark cellar.",
      choices: [],
    },
  },
};

export default function App() {
  return <StoryPlayer story={story} />;
}
```

Only choices whose `condition` currently passes are rendered — see [`cyoa-core`'s README](https://www.npmjs.com/package/cyoa-core) for the full condition/effect syntax.

## Custom rendering

Override the default `Scene`/`Choice` components without touching the engine wiring:

```tsx
import { StoryPlayer, type ChoiceProps } from "cyoa-react";

function MyChoice({ choice, onSelect }: ChoiceProps) {
  return (
    <button className="choice-button" onClick={onSelect}>
      {choice.text}
    </button>
  );
}

<StoryPlayer story={story} components={{ Choice: MyChoice }} />;
```

## Driving the story yourself

`useStory` gives you the engine's state and actions directly, so you can build a completely custom player:

```tsx
import { useStory } from "cyoa-react";

function CustomPlayer({ story }: { story: Story }) {
  const { currentNode, availableChoices, choose, back, canGoBack } = useStory(story);

  return (
    <div>
      <p>{currentNode.content}</p>
      {availableChoices.map(({ choice, index }) => (
        <button key={index} onClick={() => choose(index)}>
          {choice.text}
        </button>
      ))}
      {canGoBack && <button onClick={back}>Back</button>}
    </div>
  );
}
```

## Content and sanitization

`Scene`'s default renderer treats `node.content` as plain text — safe by construction, since React escapes it. If you render rich text or Markdown yourself (e.g. via `dangerouslySetInnerHTML`), sanitize it first with something like `DOMPurify`. `cyoa-react` does not do this for you.
