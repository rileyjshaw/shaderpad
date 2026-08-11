---
'shaderpad': minor
---

-   Enhanced mouse interaction uniforms

    Updated the mouse interaction uniforms to provide comprehensive input tracking:

    -   `u_cursor` is now a `vec4` with cursor position (x, y) and scroll position (z, w)
    -   `u_click` is now a `vec3` with click position (x, y) and left click state (z)

    This allows shaders to respond to cursor movement, scrolling, and mouse clicks.

-   Callbacks passed to `play` now receive `time` in seconds, not milliseconds.

    This improves consistency with the `u_time` uniform.
