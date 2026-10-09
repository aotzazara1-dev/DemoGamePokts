# 02-colyseus-roaming-beast-schema-and-ai
Status: resolved
Blocked by: 01

## Description
Implement the Colyseus schema and server-side AI simulation tick for Roaming Beasts.
- Create `RoamingBeastNetworkState` in `packages/server/src/schema/OverworldState.ts`.
- Add `roamingBeasts = new MapSchema<RoamingBeastNetworkState>()` to `OverworldState`.
- In `OverworldRoom.ts`, initialize roaming beasts for maps upon room creation.
- Add recurring tick (every 1500ms) to update roaming beast movements:
  - If a player is within aggro radius (<= 3 tiles), step towards the player.
  - If no player nearby, take a random valid step within zone bounds or remain idle.
  - Avoid obstacle collisions.
- Add unit tests verifying AI movement and schema updates in `packages/server/test/roaming-beast-ai.test.ts`.

## Answer
Implemented `RoamingBeastNetworkState` in `packages/server/src/schema/OverworldState.ts` and wired simulation interval `setSimulationInterval` calling `tickRoamingBeasts()` in `OverworldRoom.ts`. Added comprehensive test suite in `packages/server/test/roaming-beast-server.test.ts`.
