# 19. Equipment and Völundr System for Hero and Champions

Date: 2026-10-10

## Status

Accepted

## Context

Poktsonline features a turn-based tactical combat system and character progression.
The user requested an Equipment System (ระบบสวมใส่อุปกรณ์) that allows equipping gear onto both:

1. The **Hero** (ตัวหลัก - Isekai Traveler)
2. The **Roster Champions** (ลูกน้อง/ขุนพลตัวแทนมนุษย์และเทพเจ้า)

In the Record of Ragnarok lore, divine armaments and human weapons forged through the **Völundr** (โวลุนด์ - Valkyrie weapon transformation) are essential for mortals to stand against gods.

## Decision

1. **Equipment Slots (5 standard slots per entity)**:
   - `weapon` (อาวุธ): Grants `atk` / `int`.
   - `head` (ศีรษะ): Grants `def`, `maxHp`, `maxSp`.
   - `armor` (เกราะ/ลำตัว): Grants `def`, `maxHp`.
   - `boots` (รองเท้า): Grants `agi`, `def`.
   - `accessory` (เครื่องประดับ/จี้): Grants hybrid stats (`atk`, `def`, `agi`, `maxHp`, `maxSp`).

2. **Entity Equipment State**:
   - Both `Hero` and `Champion` (in `PlayerRosterState`) carry an `equipment` map:
     ```typescript
     export type EquipmentSlot =
       "weapon" | "head" | "armor" | "boots" | "accessory";
     export type EntityEquipment = Record<EquipmentSlot, string | null>;
     ```

3. **Effective Attributes Calculation**:
   - `Effective Stats = Base Attributes (from level + stat point allocation) + Sum(Equipment Item Stats)`.
   - Combat, overworld, and UI modals display and use effective stats.

4. **Equip / Unequip Lifecycle**:
   - Equipping an item from inventory to an entity slot removes 1 quantity of the item from `InventoryState`.
   - If the slot is already occupied, the previously equipped item returns to the player's inventory (swap).
   - Unequipping an item returns it to an available inventory slot. If inventory is full (20 slots), unequip fails with a notice.

5. **Server Authority & Persistence**:
   - SQLite `heroes` table stores hero equipment JSON.
   - SQLite `hero_rosters` table stores champion equipment JSON inside attributes.
   - Authoritative Colyseus `OverworldRoom` validates slot type, level requirements, ownership, and broadcasts state updates to the client.

6. **Client Paperdoll UI**:
   - Integrated into `CharacterModalController` (for Hero) and `RosterModalController` (for selected Champion) with visual slot indicators and stat difference tooltips.
   - `InventoryModalController` provides an `[สวมใส่ / Equip]` button with entity target picker (Hero or Champion).

## Consequences

- Deepens RPG progression for both Hero and recruited Champions.
- Creates item sinks and meaningful loot drop rewards.
- Cleanly isolated in `@poktsonline/shared/src/equipment/` without coupling to or breaking combat mechanics.
