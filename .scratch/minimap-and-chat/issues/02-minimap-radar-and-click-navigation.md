# Ticket 02: Minimap Radar Canvas and Click Navigation

Status: ready-for-agent
Triage: ready-for-agent
Blocks: .scratch/minimap-and-chat/issues/04-overworld-speech-bubbles-and-e2e-verification.md
Blocked-by: none

## Context
Players have no macro-level visual awareness of current map layout, portals, NPCs, roaming beasts, or their own coordinates.

## Requirements
1. **DOM Structure & CSS (`packages/client/index.html` & `styles/index.css`)**:
   - Add `#minimap-container` in top-right HUD:
     - Header: Map title and coordinates badge `(X: 10, Y: 10)`.
     - Body: `<canvas id="minimap-canvas" width="140" height="140"></canvas>`.
     - Footer/Border: Sleek dark sci-fi/fantasy wuxia border with subtle glow.
2. **Minimap Controller (`packages/client/src/ui/MinimapController.ts`)**:
   - Accepts map configuration (`MapConfig`), dimensions, and callback `onNavigate(tileX, tileY)`.
   - `render(playerPos: TileCoord, entities: { portals: TileCoord[], npcs: TileCoord[], beasts: TileCoord[], otherPlayers: TileCoord[] })`:
     - Renders background tile grid (walkable vs obstacle vs safe zone).
     - Renders portal squares (purple/orange).
     - Renders NPC dots (yellow).
     - Renders Roaming Beast dots (red).
     - Renders other Hero dots (cyan).
     - Renders player Hero dot (bright pulsating green dot).
     - Updates coordinate text `(X: playerPos.x, Y: playerPos.y)`.
   - Click Handler:
     - Converts mouse click offset on canvas to `(tileX, tileY)`.
     - Clamps to map bounds `[0, mapConfig.width - 1]` and `[0, mapConfig.height - 1]`.
     - Dispatches `onNavigate(tileX, tileY)`.
3. **Integration with OverworldScene (`packages/client/src/scenes/OverworldScene.ts`)**:
   - Instantiate `MinimapController`.
   - On scene update / step: pass current player tile, active beasts, NPCs, portals, other players.
   - On minimap click: invoke `this.findPathAndMove(targetTile.x, targetTile.y)`.
4. **Unit Tests (`packages/client/test/minimap.test.ts`)**:
   - Test screen-to-tile calculation and bounds clamping.
   - Test entity blip coordinate projection.
