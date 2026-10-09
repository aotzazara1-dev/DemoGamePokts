# Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions

**Blocking**: 01-shared-portal-types-and-map-database.md, 02-colyseus-multi-map-state-and-warp-sync.md

## Objective
Implement multi-map client rendering in `OverworldScene.ts`: generate themed isometric tiles (meadow, cave, forest), render glowing portal markers, animate smooth camera transitions upon warping, filter other players by `mapId`, and wire Town Scroll warp.

## Requirements
1. Themed Isometric Tile Textures:
   - Generate or procedurally texture `tile_cave` (dark slate stone) and `tile_forest` (vibrant emerald moss).
   - In `renderTilemap()`, draw tiles according to the active `mapConfig.theme` and dimensions.
2. Portal Markers:
   - On tiles designated in `mapConfig.portals`, render an animated/pulsing portal circle or gate rune with a floating name tag (e.g. "🌀 Pebble Cave").
3. Map Transition Flow:
   - When client initiates or receives `'portalTransition'`:
     - Fade out camera (250ms).
     - Destroy old tile sprites, obstacle graphics, and portal markers.
     - Set `this.mapConfig = getMapConfig(targetMapId)`.
     - Update player avatar isometric position to `targetPosition`.
     - Re-render tilemap, obstacles, and new portals.
     - Center camera immediately on player.
     - Update `#zone-display` header with new Map & Zone name.
     - Fade in camera (250ms).
4. Remote Player Filtering:
   - In player sync logic, only display remote player sprites if `player.mapId === this.currentMapId`. Hide or remove sprites of players on other maps.
5. Town Scroll Integration:
   - Send `'warpTown'` to network when Town Scroll is used from `InventoryModalController`, triggering the transition back to Novice Town.
