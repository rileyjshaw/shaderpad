---
'shaderpad': minor
---

Add step method and frame counter

This release adds a `shaderPad.step` method, which enables finer-grained control over animation loops. The `shaderPad.play` callback now receives a `frame` parameter, which is the current frame number.
