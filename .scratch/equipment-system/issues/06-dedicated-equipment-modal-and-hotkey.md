# 06: Dedicated Equipment Modal [E] and Unit Switcher

## Status: closed

## Blocked By: 04-client-ui-paperdoll-and-modals.md

## Description

Decouple the Equipment Paperdoll system out of the Character Status Modal (`[C]`) into its own dedicated modal opened via hotkey `[E]` (`EquipmentModalController.ts`), providing unified party equipment management for both the Hero and all Champions in one place.

## Acceptance Criteria

- Create `EquipmentModalController.ts` in `packages/client/src/ui/`:
  - 3-column workstation layout:
    - Column 1: Unit Roster (Hero + all Champions with avatars, elements, and levels)
    - Column 2: Central Paperdoll (5 slots: `head`, `weapon`, `armor`, `boots`, `accessory`) with effective attributes `(+bonus)` and 1-click unequip
    - Column 3: Quick Gear Bag (listing equipable items in bag for 1-click equipping to selected unit)
  - Unit switching dynamically refreshes the paperdoll and attributes for that unit.
- Update `CharacterModalController.ts` (`[C]`):
  - Remove paperdoll slots to restore pure focus on Character Level, EXP bar, and Stat Points allocation.
- Update `packages/client/index.html` & CSS:
  - Add `#equipment-modal` DOM structure and `equipment-modal.css`.
  - Add `header-btn-equipment` (`🛡️ Equipment [E]`) to header bar and `btn-equipment` to overworld HUD.
  - Update controls bar with `[E] Equipment`.
- Update `OverworldScene.ts`:
  - Wire `this.equipmentModal = new EquipmentModalController(...)`.
  - Add `keydown-E` listener to toggle the modal.
  - Include in `isAnyModalOpen()` and `ESC` handler.
  - Synchronize equipment state changes with server and local roster.
- Comprehensive Unit Tests:
  - Create `packages/client/test/equipment-modal.test.ts`.
  - Verify all tests pass with `npm run check`.
