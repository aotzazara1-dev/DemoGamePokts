# 03-server-encounter-trigger-and-respawn
Status: resolved
Blocked by: 02

## Description
Implement authoritative collision encounters and respawn cooldown for Roaming Beasts.
- In `OverworldRoom.ts`:
  - When a roaming beast moves onto a tile occupied by a player (or a player moves onto a roaming beast's tile):
    - Check if player is already `inBattle` (if so, skip).
    - If eligible, mark player `inBattle = true`.
    - Mark beast `inCombat = true` and schedule respawn timestamp (now + 20s).
    - Construct `Combatant` enemy from roaming beast template & level, generate full encounter payload.
    - Dispatch `encounter` message to client.
  - On simulation tick, check beasts with `respawnAt > 0 && Date.now() >= respawnAt`:
    - Reset `inCombat = false`, `respawnAt = 0`.
    - Reposition beast to random valid tile within its zone.
  - Preserve existing step-based random encounters on player `move` without interference.
- Unit tests verifying collision triggers and respawn cycles in `packages/server/test/roaming-beast-encounter.test.ts`.

## Answer
Implemented collision encounter triggers both when beast moves onto player in `tickRoamingBeasts` and when player moves onto beast in `onMessage('move')`. Handled respawn cooldown (20s) and respawning to valid zone tiles. Preserved random grass step encounters. Tests passing in `roaming-beast-server.test.ts`.
