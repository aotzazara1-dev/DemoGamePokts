# Specification: Roaming Wild Beasts and Dual Encounter System

## 1. Overview
Introduce visible Roaming Beasts that wander through wild Zones on the Overworld. Heroes can see these beasts moving across the isometric grid. When a Hero collides with or is caught by a Roaming Beast, an authoritative Battle Instance starts immediately. The existing step-based random encounter mechanic in tall grass / wild zones remains fully intact and functional.

## 2. Requirements

### 2.1 Shared Data & Types
- Define `RoamingBeastEntity`:
  - `id`: unique string (e.g. `roam_beast_<mapId>_<uuid>`)
  - `templateId`: string (references `encounterPool.beastTemplateId`)
  - `name`: string
  - `element`: Element
  - `level`: number
  - `mapId`: string
  - `x`: number
  - `y`: number
  - `respawnAt`: number (timestamp or 0 if active)
  - `inCombat`: boolean
  - `zoneId`: string
- Helper logic for spawning initial roaming beasts based on wild zones in each map (e.g. 2-3 roaming beasts per wild zone).

### 2.2 Server AI & State Synchronization
- In `OverworldState`, add `roamingBeasts = new MapSchema<RoamingBeastNetworkState>()`.
- In `OverworldRoom`:
  - Initialize roaming beasts when room starts or on map population.
  - Implement a simulation tick (every ~1500ms):
    - Identify players on the same `mapId` who are not `inBattle`.
    - For each active roaming beast:
      - Calculate distance to nearest eligible player.
      - **Aggro Mode**: If distance <= 3 tiles, calculate step towards player avoiding obstacles.
      - **Wander Mode**: If distance > 3 or no player nearby, take a random adjacent step (or stay still) within zone bounds.
      - **Collision Detection**: If beast occupies the exact same tile as a player:
        - Trigger `encounter` payload for that player with the beast combatant.
        - Mark player `inBattle = true`.
        - Mark roaming beast `inCombat = true`, set `respawnAt = Date.now() + 20000`.
  - When a player moves via `onMessage('move')`:
    - After position update, check if player stepped onto any active roaming beast's tile.
    - If collision occurs, trigger encounter immediately.

### 2.3 Client Presentation & Interaction
- In `OverworldScene`:
  - Listen to `roamingBeasts` schema updates (add, remove, change).
  - Create Phaser Container for each roaming beast:
    - Shadow
    - Beast sprite / visual (element themed or distinct beast visual)
    - Name & Level badge (e.g. "Lv.4 Rock Boar") with element color
    - Idle breathing/bobbing tween
    - Smooth movement tween to target `(x, y)` when position updates
  - Click on Roaming Beast:
    - Target the beast's tile via A* pathfinding and begin moving towards it to trigger combat.
  - Battle return:
    - When returning from battle, the engaged beast is on cooldown / invisible, preventing instant re-battle.

### 2.4 Dual Encounter Coexistence
- Existing step-based random encounters in `OverworldEngine.movePlayer` continue to roll against `zone.encounterRatePerStep` when walking in wild zones.
