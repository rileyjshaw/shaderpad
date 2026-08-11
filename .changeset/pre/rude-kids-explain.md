---
'shaderpad': minor
---

Add hands and pose plugins

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
