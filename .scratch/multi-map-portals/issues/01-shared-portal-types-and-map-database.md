# Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection

**Blocking**: none

## Objective
Implement `PortalDefinition`, extend `MapConfig`, create `MAP_DATABASE` with all 3 maps and their wild Beast pools, and add portal detection to `OverworldEngine.movePlayer` in `@poktsonline/shared`.

## Requirements
1. In `packages/shared/src/types.ts`:
   - Add `PortalDefinition`:
     ```ts
     export interface PortalDefinition {
       id: string;
       position: TileCoord;
       targetMapId: string;
       targetPosition: TileCoord;
       name: string;
     }
     ```
   - Update `MapConfig`:
     - Add `id: string;`
     - Add `name: string;`
     - Add `theme: 'meadow' | 'cave' | 'forest';`
     - Add `portals: PortalDefinition[];`
   - Update `MovementResult`:
     - Add `portalTriggered?: boolean;`
     - Add `portal?: PortalDefinition;`
2. In `packages/shared/src/overworld/map-database.ts`:
   - Export `MAP_DATABASE: Record<string, MapConfig>` containing:
     - `novice_town_and_meadow` (50x50, theme: 'meadow', 2 portals)
     - `pebble_cave` (30x30, theme: 'cave', Iron Beetle & Cave Serpent, 1 portal back)
     - `bamboo_forest` (40x40, theme: 'forest', Bamboo Panda & Crimson Fox, 1 portal back)
   - Export `DEFAULT_OVERWORLD_MAP` as alias to `MAP_DATABASE['novice_town_and_meadow']`.
   - Export `getMapConfig(mapId: string): MapConfig`.
3. In `packages/shared/src/overworld/overworld-engine.ts`:
   - Detect if destination tile has a portal in `mapConfig.portals`. If so, return `portalTriggered: true` and `portal: matchingPortal`.
4. Unit tests in `packages/shared/test/overworld-engine.test.ts`:
   - Test portal resolution on movement.
   - Test `MAP_DATABASE` integrity (valid portals, target maps exist, return positions within bounds).
