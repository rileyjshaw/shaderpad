---
'shaderpad': minor
---

Add texture and destroy methods

This release adds `shaderPad.initializeTexture` and `shaderPad.updateTextures` methods, which roughly map to how `initializeUniform` and `updateUniform` works. It also adds a `shaderPad.destroy` method, which runs some general cleanup.

This release also fixes a bug where a passed-in canvas would resize indefinitely on a retina display.
