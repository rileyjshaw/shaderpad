---
'shaderpad': minor
---

-   **WebGL 2.0 upgrade** 🚀

    ShaderPad now uses WebGL 2.0 and GLSL 3.00 ES. All shaders now use the `#version 300 es` directive with updated syntax:

    -   `attribute` → `in`
    -   `varying` → `out` (vertex) / `in` (fragment)
    -   `gl_FragColor` → custom `out` variables
    -   `texture2D` → `texture`

    This is a breaking change - existing shaders will need to be updated to use the new syntax.

-   **Frame history buffers**

    Added support for frame history buffers, enabling shaders to reference prior frames. The `u_history` uniform provides access to previous frames as a `sampler2DArray`.

    ```typescript
    // 2-frame history (eg. for cellular automata)
    const shader = new ShaderPad(fragmentShaderSrc, { history: 2 });
    ```

-   **Options object constructor**

    The constructor now accepts an options object instead of just a canvas element:

    ```typescript
    // Old API
    const shader = new ShaderPad(fragmentShaderSrc, canvas);

    // New API
    const shader = new ShaderPad(fragmentShaderSrc, { canvas });
    ```

-   **Resize throttling**

    Added throttled resize handling to improve performance during window resizing.

-   **Minor bugfixes around click handling**
