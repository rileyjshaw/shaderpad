# shaderpad

## 1.0.0-alpha.14

### Patch Changes

-   Improve mobile save experience

## 1.0.0-alpha.13

### Minor Changes

-   Improve save experience on mobile

## 1.0.0-alpha.12

### Minor Changes

-   Improve resize behaviour

## 1.0.0-alpha.11

### Patch Changes

-   Remove wheel position from u_cursor

## 1.0.0-alpha.10

### Minor Changes

-   Add reset() and onResize

## 1.0.0-alpha.9

### Patch Changes

-   Make initial history frames transparent

## 1.0.0-alpha.8

### Minor Changes

-   Allow `initializeTexture` and `history` to exist in the same shader

## 1.0.0-alpha.7

### Minor Changes

-   -   **WebGL 2.0 upgrade** 🚀

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

## 1.0.0-alpha.6

### Minor Changes

-   Update uniform names to use conventional u\_ prefix

### Patch Changes

-   b9bf4b1: npx changeset version

## 1.0.0-alpha.5

### Minor Changes

-   Enhanced mouse interaction uniforms

    Updated the mouse interaction uniforms to provide comprehensive input tracking:

    -   `u_cursor` is now a `vec4` with cursor position (x, y) and scroll position (z, w)
    -   `u_click` is now a `vec3` with click position (x, y) and left click state (z)

    This allows shaders to respond to cursor movement, scrolling, and mouse clicks.

-   Callbacks passed to `play` now receive `time` in seconds, not milliseconds.

    This improves consistency with the `u_time` uniform.

## 1.0.0-alpha.4

### Minor Changes

-   Add step method and frame counter

    This release adds a `shaderPad.step` method, which enables finer-grained control over animation loops. The `shaderPad.play` callback now receives a `frame` parameter, which is the current frame number.

## 1.0.0-alpha.3

### Minor Changes

-   Add texture and destroy methods

    This release adds `shaderPad.initializeTexture` and `shaderPad.updateTextures` methods, which roughly map to how `initializeUniform` and `updateUniform` works. It also adds a `shaderPad.destroy` method, which runs some general cleanup.

    This release also fixes a bug where a passed-in canvas would resize indefinitely on a retina display.

## 1.0.0-alpha.2

### Patch Changes

-   Remove log from save()

## 1.0.0-alpha.1

### Minor Changes

-   Add save() method

    This method saves the current frame to a PNG file. The filename is optional; if not provided, it will be "export.png".

## 1.0.0-alpha.0

### Major Changes

-   Initial alpha release 🎉

    I’ve started using this on a few projects, and I’m pretty confident that the API will retain this general shape. I want to try adopting ShaderPad into a few more projects before officially moving this out of alpha.

    Always open to suggestions!
