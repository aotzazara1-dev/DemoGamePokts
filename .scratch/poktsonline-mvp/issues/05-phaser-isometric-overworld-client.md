# 05: Phaser Isometric Overworld Client

**What to build:** The browser-based game client using Phaser 3 and Vite, rendering an isometric 2.5D tilemap, allowing player Hero movement via keyboard/mouse, displaying real-time movement of other connected players via Colyseus, and transitioning visually into combat when an encounter occurs.

**Blocked by:** 04: Colyseus Authoritative Server Rooms

**Status:** resolved

- [x] Vite + Phaser 3 client project bootstraps in `packages/client`.
- [x] Isometric 2.5D tilemap scene renders with distinct visual terrain (safe town/path and wild grass/forest Zones).
- [x] Player controls Hero avatar with smooth grid-based movement and camera tracking.
- [x] Colyseus client SDK syncs and renders other online players moving on the same Overworld map.
- [x] When server triggers an encounter, client plays a screen transition effect and switches to the Battle Scene.
