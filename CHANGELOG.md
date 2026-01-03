# shaderpad

## 1.0.0-beta.29

### Minor Changes

-   Expose individual face landmarks in face plugin

## 1.0.0-beta.28

### Minor Changes

-   Add share text as optional second argument to save()

## 1.0.0-beta.27

### Minor Changes

-   Add u_mouth to face plugin

## 1.0.0-beta.26

### Minor Changes

-   Improve MediaPipe media handling

## 1.0.0-beta.25

### Minor Changes

-   Improve pose segmentation

## 1.0.0-beta.24

### Patch Changes

-   Fix fitCover/fitContain function name swap

## 1.0.0-beta.23

### Patch Changes

-   Include u_resolution definition in helpers plugin

## 1.0.0-beta.22

### Minor Changes

-   Add fitContain and fitCover helper functions

## 1.0.0-beta.21

### Minor Changes

-   Export all plugins as default exports

    Also resolve deprecation warning for non-DOM textures

## 1.0.0-beta.20

### Minor Changes

-   Add draw() method

## 1.0.0-beta.19

### Minor Changes

-   Add hands and pose plugins

    ### Minor Changes

    -   Add MediaPipe hands plugin

        The `hands` plugin uses [MediaPipe Hand Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) to detect and track hand landmarks in video or image textures. Each hand contributes 22 landmarks (21 standard landmarks plus hand center).

    -   Add MediaPipe pose plugin

        The `pose` plugin uses [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) to detect and track body pose landmarks. Each pose contributes 33 landmarks, and the plugin provides both landmark data and a mask texture showing the skeleton and body segmentation.

    -   Add documentation site

        Added a new documentation site that showcases ShaderPad with a live shader example. The site is automatically deployed to GitHub Pages via a new GitHub Actions workflow.

    -   Add new example shaders

        Added several new example shaders demonstrating the new plugins and various shader techniques:

        -   `hands.ts`: Hand tracking example
        -   `pose.ts`: Pose tracking example
        -   `god-rays.ts`: God rays effect example
        -   `fragmentum.ts`: Complex procedural shader example

    ### Patch Changes

    -   Update package.json exports to include new plugins (hands, pose)
    -   Remove plugins/index.ts in favor of individual plugin exports (optimizes bundle size)
    -   Update README with comprehensive documentation for all MediaPipe plugins
    -   Add project logo

## 1.0.0-beta.18

### Minor Changes

-   Add per-texture history

    The history plugin now supports history tracking for individual textures, in addition to framebuffer history. When initializing a texture with `initializeTexture()`, you can now specify a historyDepth parameter to maintain a buffer of prior frames for that specific texture:

    ```ts
    // Store the last 30 webcam frames
    // shader.initializeTexture('u_webcam', videoElement, 30);
    ```

    Added two new examples demonstrating per-texture history:

    -   history-webcam-channels
    -   history-webcam-grid

## 1.0.0-beta.17

### Minor Changes

-   Add plugin system

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

## 1.0.0-alpha.16

### Minor Changes

-   Prevent double play

## 1.0.0-alpha.15

### Patch Changes

-   Improve iOS recognition on save

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
