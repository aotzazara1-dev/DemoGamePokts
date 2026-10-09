# Spec: Multi-Map World Expansion and Portals

## Overview
Expand the Poktsonline Overworld beyond the single starter map into an interconnected world consisting of 3 distinct Maps:
1. `novice_town_and_meadow` (50x50): The starting town and grasslands.
2. `pebble_cave` (30x30): A subterranean cave dungeon featuring Earth and Water wild Beasts.
3. `bamboo_forest` (40x40): A lush forest featuring Wind and Fire wild Beasts.

Players travel between Maps via interactive **Portal** tiles with glowing visual markers. When a Hero steps onto a Portal, the client displays a fade transition, reloads the tilemap for the target Map, repositions the Hero, and updates the camera. The Colyseus `OverworldRoom` maintains a `mapId` for each player, filtering visibility so only players on the same Map are synced. Using a Town Scroll from any Map teleports the Hero back to Novice Town.

## Requirements

### 1. Domain Types & Map Configurations (`@poktsonline/shared`)
- Define `PortalDefinition`:
  ```ts
  export interface PortalDefinition {
    id: string;
    position: TileCoord;
    targetMapId: string;
    targetPosition: TileCoord;
    name: string;
  }
  ```
- Extend `MapConfig` to include:
  ```ts
  export interface MapConfig {
    id: string;
    name: string;
    theme: 'meadow' | 'cave' | 'forest';
    width: number;
    height: number;
    obstacles: TileCoord[];
    zones: ZoneDefinition[];
    portals: PortalDefinition[];
  }
  ```
- Provide `MAP_DATABASE`: Dictionary of Map configurations keyed by `mapId`:
  - `novice_town_and_meadow`:
    - Portal at `(35, 2)` -> target `pebble_cave` at `(2, 15)` ("Entrance to Pebble Cave")
    - Portal at `(48, 25)` -> target `bamboo_forest` at `(2, 25)` ("Pathway to Bamboo Forest")
  - `pebble_cave`:
    - Size 30x30, cave theme.
    - Zone `pebble_depths` (Lv. 5-8): `iron_beetle` (Earth), `cave_serpent` (Water).
    - Portal at `(1, 15)` -> target `novice_town_and_meadow` at `(35, 3)` ("Exit to Whispering Meadow")
  - `bamboo_forest`:
    - Size 40x40, forest theme.
    - Zone `emerald_bamboo` (Lv. 7-10): `bamboo_panda` (Earth), `crimson_fox` (Fire).
    - Portal at `(1, 25)` -> target `novice_town_and_meadow` at `(47, 25)` ("Return to Whispering Meadow")

### 2. Overworld Engine Portal Resolution (`@poktsonline/shared`)
- Extend `MovementResult` to return `portalTriggered?: boolean` and `portal?: PortalDefinition`.
- If the valid stepped-on tile matches a `PortalDefinition` position, set `portalTriggered: true` and attach `portal`.
- In `OverworldEngine.getMapConfig(mapId: string): MapConfig`.

### 3. Server Multiplayer Synchronization (`@poktsonline/server`)
- Add `mapId: string` to `PlayerNetworkState` (default `'novice_town_and_meadow'`).
- Handle client `'move'` message:
  - If a portal is triggered by the step, update player's `mapId = portal.targetMapId`, `x = portal.targetPosition.x`, `y = portal.targetPosition.y`.
  - Send message `'portalTransition'` with target map details.
- Handle `'warpTown'` message from Town Scroll:
  - Teleport player to `novice_town_and_meadow` at `(10, 10)`.

### 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`)
- Render distinct tile textures / colors depending on `map.theme`:
  - `'meadow'`: Green grass and stone paths (existing textures).
  - `'cave'`: Dark slate cave floor with stone borders.
  - `'forest'`: Deep emerald bamboo moss tiles.
- Render animated glowing runes / marker portals on tiles where `mapConfig.portals` are positioned.
- When stepping on a portal or receiving portal event:
  - Play camera fade out (250ms).
  - Clear existing tile sprites and redraw tilemap for the new `MapConfig`.
  - Move hero avatar to `targetPosition`.
  - Clear destination pathfinding markers.
  - Update `#zone-display` or map title banner.
  - Play camera fade in (250ms).
- Only render remote player sprites if their `mapId` equals current player's `mapId`.
