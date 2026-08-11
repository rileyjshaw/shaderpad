---
'shaderpad': minor
---

Improve eye/mouth geometry

- Reduces triangle count in face mesh by filling eyes/mouth
- Improves eye and inner-mouth masks by triangulating between contour curves instead of fan-filling across the opening

In practice, you’ll notice a better inner mouth shape with a
closed-mouth smile.
