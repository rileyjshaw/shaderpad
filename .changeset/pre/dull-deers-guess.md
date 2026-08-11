---
'shaderpad': minor
---

Add plugin system

Finally in beta! This version adds a new plugin system, and migrates history
and save functionality out of the main class into standalone plugins. This
reduces bundle size for the most common usecases, and ensures flexibility going
forward.

This commit also reorganizes the examples directory; now all demos can be
played without needing to edit any files.

Other significant changes:

-   The `play` callback now runs after the next loop is requested, so
    `shader.pause()` can be called from within the `play` callback.
-   The constructor no-longer accepts a `history` option. That has moved to the
    history plugin’s configuration.
-   The constructor now accepts a `plugins` option.
