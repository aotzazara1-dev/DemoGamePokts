# 22. Item Warehouse and Inn Beast Storage System

Date: 2026-10-10

## Status

Accepted

## Context

As players explore the multi-map world, defeat roaming beasts, level up, and capture champions, their 20-slot personal Inventory and 10-slot Beast Roster fill up quickly.
To support long-term item hoarding, equipment collection, and multi-team champion theory-crafting inspired by TS Online and Pokémon PC storage:

1. Players need an overflow storage solution for Items, Equipment, and Gold.
2. Players need a reserve daycare/storage sanctuary for Champions and Beasts beyond their 10-slot field roster.
3. Access should be anchored to town hubs via thematic NPCs (Innkeeper Göll in Novice Town).

## Decision

1. **Unified Hub NPC**:
   - Introduce Innkeeper Göll (`npc_goll`) stationed in Novice Town (Valhalla Sanctuary).
   - Dialogue options offer two distinct facilities:
     - `📦 คลังเก็บไอเทมและเหรียญทอง (Personal Item & Gold Warehouse)`
     - `🐎 โรงเตี๊ยมรับฝากขุนพล (Inn Beast Daycare & Storage)`

2. **Personal Item & Gold Warehouse**:
   - Capacity: **40 slots** (2 full inventory pages) storing any item or equipment stack.
   - Gold Storage: Dedicated `gold` balance permitting safe deposit and withdrawal of gold currency.
   - Side-by-Side Dual Grid UI: Players view their 20-slot backpack on the left and the 40-slot warehouse on the right for seamless one-click transfers.
   - Fees: **100% Free** (no gold surcharge).

3. **Inn Beast Storage (Daycare & Reserve)**:
   - Capacity: **30 Beasts/Champions** (3 pages of 10 beasts).
   - Daycare Rest & Recovery: Deposited beasts immediately have their HP and SP restored to 100% (full heal).
   - Safeguard Rules:
     - The Hero cannot be deposited.
     - The Active Beast cannot be deposited if it is the sole remaining beast in the active roster.
   - Side-by-Side Dual View: Field Roster on the left and Inn Storage on the right with instant Deposit/Withdraw actions.

4. **Persistence & Monorepo Boundaries**:
   - Domain logic and validation encapsulated in `@poktsonline/shared` (`WarehouseManager`, `InnStorageManager`).
   - Server persistence extends the SQLite schema: `warehouse_items` (JSON), `warehouse_gold` (INTEGER), and `inn_beasts` (JSON) on the `heroes` table.
   - Client UI decoupled into deep controllers: `WarehouseModalController` and `InnStorageModalController` (strictly <= 400 LOC ceiling per ADR 0020).

## Consequences

- Resolves inventory congestion and allows collection of extensive equipment sets and skill tomes.
- Enables collecting all wild beasts and historical champions without hitting the 10-roster ceiling.
- Adheres to Anti-God-Files guardrails (ADR 0020) with separated deep modal controllers.
