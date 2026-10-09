# Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization

**Blocking**: 01-shared-portal-types-and-map-database.md

## Objective
Add `mapId` to Colyseus `PlayerNetworkState`, handle portal transition and `warpTown` messages in `OverworldRoom`, and ensure authoritative spatial positioning across maps.

## Requirements
1. In `packages/server/src/schema/OverworldState.ts`:
   - Add `@type("string") mapId: string = "novice_town_and_meadow";` to `PlayerNetworkState`.
2. In `packages/server/src/rooms/OverworldRoom.ts`:
   - On player join, initialize `player.mapId = "novice_town_and_meadow"`.
   - On `'move'` message:
     - Retrieve current player's `mapConfig` via `getMapConfig(player.mapId)`.
     - Execute `OverworldEngine.movePlayer(..., currentMapConfig)`.
     - If `result.portalTriggered && result.portal`:
       - Update `player.mapId = result.portal.targetMapId`.
       - Update `player.x = result.portal.targetPosition.x`.
       - Update `player.y = result.portal.targetPosition.y`.
       - Reset step counter in zone.
       - Send `'portalTransition'` message to client with target map details.
   - On `'warpTown'` message:
     - Update `player.mapId = "novice_town_and_meadow"`.
     - Update `player.x = 10; player.y = 10;`.
     - Reset step counter.
     - Send `'portalTransition'` with novice town map.
3. Unit tests in `packages/server/test/overworld-room.test.ts`:
   - Verify player steps on portal tile triggers map change and position warp.
   - Verify `warpTown` command correctly resets player to Novice Town center.
