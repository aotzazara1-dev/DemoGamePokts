# Feature Specification: Item Warehouse and Inn Beast Storage

## 1. Overview

Provides players with an essential town sanctuary utility:

1. **Personal Item & Gold Warehouse**: A 40-slot storage vault and gold depository allowing Heroes to store excess items, equipment, and gold.
2. **Inn Beast Storage**: A 30-capacity inn daycare/box allowing Heroes to deposit, withdraw, and manage champions outside their 10-slot active field roster, automatically restoring deposited beasts' HP and SP to 100%.

Both facilities are accessible via Innkeeper Göll (`npc_goll`) in Novice Town.

## 2. Requirements

### 2.1 Domain & Data Models (`@poktsonline/shared`)

- **WarehouseState**:
  - `slots: (ItemStack | null)[]`: exactly 40 slots.
  - `gold: number`: stored gold balance (min 0).
- **InnStorageState**:
  - `beasts: Combatant[]`: up to 30 beasts.
- **WarehouseManager**:
  - `createInitialWarehouse(): WarehouseState` (40 empty slots, 0 gold).
  - `depositItem(inventory: InventoryState, warehouse: WarehouseState, slotIndex: number, quantity?: number): { success: boolean; inventory: InventoryState; warehouse: WarehouseState; reason?: string }`
  - `withdrawItem(inventory: InventoryState, warehouse: WarehouseState, warehouseSlotIndex: number, quantity?: number): { success: boolean; inventory: InventoryState; warehouse: WarehouseState; reason?: string }`
  - `depositGold(inventory: InventoryState, warehouse: WarehouseState, amount: number): { success: boolean; inventory: InventoryState; warehouse: WarehouseState; reason?: string }`
  - `withdrawGold(inventory: InventoryState, warehouse: WarehouseState, amount: number): { success: boolean; inventory: InventoryState; warehouse: WarehouseState; reason?: string }`
- **InnStorageManager**:
  - `createInitialInnStorage(): InnStorageState` (`beasts: []`).
  - `depositBeast(roster: PlayerRosterState, storage: InnStorageState, beastId: string): { success: boolean; roster: PlayerRosterState; storage: InnStorageState; reason?: string }`
    - Full heal: set `hp = maxHp`, `sp = maxSp`.
    - Disallow depositing the Hero.
    - Disallow depositing if `storage.beasts.length >= 30`.
    - If `beastId === roster.activeBeastId`, allow only if another beast exists in `roster.beasts` and automatically set the next beast as `activeBeastId`. If it's the only beast in `roster.beasts`, reject with clear reason.
  - `withdrawBeast(roster: PlayerRosterState, storage: InnStorageState, beastId: string): { success: boolean; roster: PlayerRosterState; storage: InnStorageState; reason?: string }`
    - Disallow withdrawing if `roster.beasts.length >= RosterManager.MAX_BEAST_CAPACITY (10)`.

### 2.2 Server Persistence & Handshake (`@poktsonline/server`)

- SQLite schema migrations on `heroes` table:
  - `warehouse_items TEXT DEFAULT '[]'` (JSON array of 40 slots).
  - `warehouse_gold INTEGER DEFAULT 0`.
  - `inn_beasts TEXT DEFAULT '[]'` (JSON array of stored beasts).
- `HeroRepository`:
  - `getHeroFullState`: load and unpack `warehouse` and `innStorage`.
  - `saveHeroState`: serialize and persist `warehouse_items`, `warehouse_gold`, and `inn_beasts`.
- Client-Server Sync:
  - Include `warehouse` and `innStorage` in `HeroFullSaveState` and `SyncHeroStatePayload`.

### 2.3 NPC & Dialogue Integration (`packages/shared` & `packages/client`)

- In `packages/shared/src/overworld/map-database.ts`:
  - Add `npc_goll` ("Göll (เกิลล์ น้องสาวคนสุดท้องแห่ง 13 วาลคิรี)") positioned near the center of Novice Town (e.g. at `{ x: 10, y: 7 }`).
  - Dialogue options:
    - `opt_warehouse` (action: `'warehouse'`): "📦 คลังเก็บไอเทมและเหรียญทอง (Personal Item & Gold Warehouse)"
    - `opt_inn_beasts` (action: `'inn_beasts'`): "🐎 โรงเตี๊ยมรับฝากขุนพล (Inn Beast Daycare & Storage)"
    - `opt_close` (action: `'close'`): "✕ ลาก่อน (Goodbye)"
- In `DialogueModalController.ts`:
  - Handle `onOpenWarehouse` and `onOpenInnStorage` callbacks.

### 2.4 Client Deep UI Controllers (`@poktsonline/client`)

- **`WarehouseModalController`** (<= 400 LOC ceiling):
  - Side-by-side view: Inventory (left, 20 slots) vs Warehouse (right, 40 slots).
  - Displays current Gold and stored Warehouse Gold with Quick Deposit / Withdraw buttons.
  - Item detail inspector with one-click "ฝากเข้าคลัง (Deposit)" and "ถอนออก (Withdraw)" buttons.
- **`InnStorageModalController`** (<= 400 LOC ceiling):
  - Side-by-side view: Active Roster (left) vs Inn Storage (right, up to 30 beasts).
  - Displays Beast avatar, element badge, level, HP/SP bars.
  - "ฝากพักโรงเตี๊ยม (Deposit)" & "รับกลับเข้าทีม (Withdraw)" buttons with instant feedback toast notifications.
- CSS Styling in modular files.

### 2.5 Guardrails & Anti-God-Files Compliance (ADR 0020)

- All new controllers (`WarehouseModalController.ts`, `InnStorageModalController.ts`, `WarehouseManager.ts`, `InnStorageManager.ts`) strictly <= 400 LOC.
- `OverworldScene.ts` capped at <= 1901 LOC (currently 1830 LOC; must stay under cap).
