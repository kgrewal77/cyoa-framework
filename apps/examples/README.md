# cyoa-examples

A runnable demo of `cyoa-react` and `cyoa-core`, consumed as workspace packages (not copy-pasted source). "The Lighthouse" is a small branching story showing off variables, `onEnter`/choice effects, gated choices (a plain condition and a `contains` check), and multiple endings.

- [`src/stories/lighthouse.ts`](./src/stories/lighthouse.ts) — the story data, written against `cyoa-core`'s `Story` type
- [`src/Game.tsx`](./src/Game.tsx) — drives the story with `useStory` directly (rather than the default `<StoryPlayer>`), to show the fully-custom-UI path

## Run it

From the repo root:

```sh
pnpm install
pnpm --filter cyoa-examples dev
```
