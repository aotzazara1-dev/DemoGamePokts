# 03: Server Persistence and Colyseus Room Messages

## Status: resolved

## Blocked By: 02-equipment-manager-and-stat-calculation.md

## Description

Integrate equipment state into SQLite database schema, `HeroRepository`, and `OverworldRoom` networking in `@poktsonline/server`.

## Acceptance Criteria

- Database schema migration:
  - Add `equipment` column to `heroes` table (JSON object default `{}`)
  - Champion equipment stored inside `attributes` JSON in `hero_rosters`
- `HeroRepository`:
  - `createHero`: initializes hero and starter champion with empty equipment
  - `getHeroFullState`: loads hero equipment and each roster champion's equipment
  - `saveHeroState`: saves hero equipment and each roster champion's equipment
- `OverworldRoom`:
  - Listen to `equip_item`: `{ targetType: 'hero' | 'champion', championId?: string, itemId: string }`
  - Listen to `unequip_item`: `{ targetType: 'hero' | 'champion', championId?: string, slot: EquipmentSlot }`
  - Broadcasts updated player state (`player_equipment_updated`) to client
  - Triggers auto-save to persist changes
- Server unit tests verifying persistence and room equip/unequip message flows.
