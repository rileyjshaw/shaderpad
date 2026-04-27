---
title: Contributing
nextjs:
    metadata:
        title: Contributing
        description: ShaderPad’s philosophy, plugin guidance, and the bar for contributions to core.
---

ShaderPad is built around a small idea: make working with fragment shaders feel direct and simple, without turning the library into a giant framework.

## Philosophy

The core priorities are simple:

- Easy to use
- Performant by default
- Small bundle and API

It’s easier than ever to add features these days. Deciding what _not_ to include in core becomes the challenge. Every addition increases bundle size, API surface area, maintenance, documentation, and mental overhead. ShaderPad stays small by being strict about those tradeoffs.

When a feature does fit, it should integrate with the existing API cleanly, reuse existing constructs, and make the library feel more cohesive.

## Writing plugins

Most new ideas should start out as plugins.

Plugins let ShaderPad grow into specific niches without increasing the learning burden on everyone. If a feature can work as a separate plugin, utility, or package, that is usually the better design. Core should stay focused on the most basic workflows; expanded features work better when they can evolve independently.

Start with the [Plugins API](/docs/api/plugins).

## Contributing to core

A good core change usually means all of these are true:

- It solves a common need for a meaningful share of ShaderPad users.
- It cannot be just as good as a plugin, utility, or separate package.
- It fits the current API shape and reuses existing constructs where possible.
- It keeps the library small, composable, and sensible.
- It does not require breaking changes.
- It includes docs and tests when appropriate.

Before contributing, please read and follow our [Code of Conduct](https://github.com/miseryco/shaderpad/blob/main/CODE_OF_CONDUCT.md).

## About Riley

ShaderPad was built by [Riley Shaw](https://rileyjshaw.com) at [Misery & Company](https://misery.co). Riley is a programmer, uncle, and occasional VJ who will take any opportunity to project code onto the wall. After wiring up the same shader code over and over again, he made ShaderPad so he could skip to the fun part.
