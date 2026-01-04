---
'shaderpad': minor
---

Rewrite plugins to transfer landmark data as textures

Rewrite MediaPipe plugins (pose, face, hands) to transfer landmark data as textures instead of uniform arrays. Landmarks are now accessed via `texelFetch()` on `u_poseLandmarksTex`, `u_faceLandmarksTex`, and `u_handLandmarksTex` textures. The `poseLandmark()`, `faceLandmark()`, and `handLandmark()` functions now return `vec4` (x, y, z, visibility) instead of `vec2`. Function names updated: `getBody()` → `inBody()`, `getFace()` → `inFace()`, etc.

As part of this change, typed arrays (e.g., `Float32Array`) are now valid texture sources when provided with width and height.

Also:

-   Updated examples for the new API
-   Added debug option to reduce logging in production
