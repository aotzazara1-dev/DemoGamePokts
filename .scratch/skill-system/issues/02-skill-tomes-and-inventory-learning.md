# Issue 02: Skill Tomes and Inventory Learning Integration

## Status: closed

## Blocked By: 01-shared-skill-types-and-skill-manager.md

## Description

Add Skill Tome items to the item database and support learning/teaching skills to Hero or Active Champion directly via item usage.

## Tasks

1. Add `item_tome_*` to `ITEM_DATABASE` in `packages/shared/src/inventory/item-database.ts`:
   - Categorized as `consumable` / `scroll`.
   - Linked to corresponding `skillId`.
2. Update `InventoryManager.useItemOnCombatant`:
   - If item is a Skill Tome, invoke `SkillManager.learnSkill(...)` onto an available flexible slot or first empty slot.
3. Unit tests in `packages/shared/test/inventory.test.ts`.
