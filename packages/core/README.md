# cyoa-core

Framework-agnostic story engine for choose-your-own-adventure web stories. Pure state machine operating on a plain JSON story schema — no rendering, no React dependency.

## Status

Core engine implemented: `StoryEngine`/`createStoryEngine`, condition/effect evaluation (structured AST + safe string DSL, no `eval`), and `validateStory`. React bindings (`cyoa-react`) not yet started.

### Condition/effect DSL

Conditions and effects can be authored as plain strings, parsed by a small hand-rolled parser (no `eval`/`Function`) into the same typed AST the object form uses:

```
"hasKey === true && inventory.length > 0"   // condition
"hp -= 10"                                   // effect
"inventory.push('key')"                      // effect
```

## Install

```sh
pnpm add cyoa-core
```
