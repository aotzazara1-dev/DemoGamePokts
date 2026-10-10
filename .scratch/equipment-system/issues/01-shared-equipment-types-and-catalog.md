# 01: Shared Equipment Types and Catalog

## Status: resolved

## Blocked By: None

## Description

Define domain types, interfaces, and initial equipment definitions in `@poktsonline/shared`.

## Acceptance Criteria

- `EquipmentSlot` union: `'weapon' | 'head' | 'armor' | 'boots' | 'accessory'`
- `EntityEquipment` type: `Record<EquipmentSlot, string | null>`
- `EquipmentStats` interface: `{ atk?: number; def?: number; int?: number; agi?: number; maxHp?: number; maxSp?: number; }`
- `EquipmentItemDefinition` interface extending `ItemDefinition` with `slot`, `stats`, `requiredLevel`
- Initial item catalog containing items for each slot:
  - Weapons: `weapon_sky_piercer` (Lu Bu's halberd), `weapon_mjolnir_replica` (Thor's hammer), `weapon_monohoshizao` (Kojiro's longsword)
  - Head: `head_valkyrie_helm`, `head_iron_circlet`
  - Armor: `armor_valhalla_plate`, `armor_leather_tunic`
  - Boots: `boots_hermes_sandals`, `boots_combat_greaves`
  - Accessories: `acc_draupnir_ring`, `acc_eden_amulet`
- Unit tests validating item lookup, slots, and stats.
