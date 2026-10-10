# 02: Equipment Manager and Stat Calculation

## Status: resolved

## Blocked By: 01-shared-equipment-types-and-catalog.md

## Description

Implement `EquipmentManager` in `@poktsonline/shared/src/equipment/` to handle equipping, unequipping, swapping, and dynamic effective attribute calculations.

## Acceptance Criteria

- `createEmptyEquipment(): EntityEquipment` initializing all 5 slots to `null`.
- `calculateEffectiveAttributes(base: Attributes, equipment: EntityEquipment): Attributes` returning base stats combined with item bonuses.
- `canEquip(item: ItemDefinition, level: number): { canEquip: boolean; reason?: string }`
- `equipItem(inventory: InventoryState, equipment: EntityEquipment, itemId: string, level?: number): { success: boolean; inventory: InventoryState; equipment: EntityEquipment; swappedItemId?: string; reason?: string }`
- `unequipItem(inventory: InventoryState, equipment: EntityEquipment, slot: EquipmentSlot): { success: boolean; inventory: InventoryState; equipment: EntityEquipment; unequippedItemId?: string; reason?: string }`
- Unit tests covering:
  - Equipping an item into an empty slot
  - Swapping an item into an occupied slot (returns old item to inventory)
  - Unequipping when inventory has free space
  - Unequipping when inventory is full (must reject gracefully)
  - Effective attribute calculation with multiple equipped items.
