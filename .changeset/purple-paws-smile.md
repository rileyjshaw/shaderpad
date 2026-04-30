---
'shaderpad': minor
---

Improve timing / lifecycle behavior

Pause `u_time` on `pause()`, so that `step()` and `play()` resume from the same timestamp after a pause.

Also renamed:
- `resetFrame()` => `rewind()`
- `beforeDraw` => `preDraw`
- `afterDraw` => `postDraw`
- `beforeStep` => `preStep`
- `afterStep` => `postStep`
