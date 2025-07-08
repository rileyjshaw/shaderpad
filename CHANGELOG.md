# shaderpad

## 1.0.0-alpha.5

### Minor Changes

-   Enhanced mouse interaction uniforms

    Updated the mouse interaction uniforms to provide comprehensive input tracking:

    -   `uCursor` is now a `vec4` with cursor position (x, y) and scroll position (z, w)
    -   `uClick` is now a `vec3` with click position (x, y) and left click state (z)

    This allows shaders to respond to cursor movement, scrolling, and mouse clicks.

-   Callbacks passed to `play` now receive `time` in seconds, not milliseconds.

    This improves consistency with the `uTime` uniform.

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
