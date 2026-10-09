# Feature Specification: Inventory & Consumable Item System

## 1. Overview & Goals
Implement a full TS Online-style 20-slot Inventory and Consumable Item system for Poktsonline. Players can collect items and Gold from wild monster loot drops, store items in a 20-slot grid, consume healing items on the Overworld to recover HP/SP, and use combat items during Battle Instances to heal or revive allies.

## 2. Domain Models & Types (@poktsonline/shared)
- **ItemDefinition**:
  - `id`: unique item key (e.g. `'item_steamed_bun'`)
  - `name`: Thai/English display name (e.g. `'Steamed Bun (ซาลาเปา)'`)
  - `type`: `'hp_restore' | 'sp_restore' | 'revive' | 'scroll'`
  - `effectValue`: number (+80 HP, +50 SP, +100 HP Revive, etc.)
  - `description`: item explainer text
  - `price`: buy/sell gold value
  - `stackMax`: maximum items per slot (default 99)
- **ITEM_DATABASE**:
  - `item_steamed_bun`: Restores +80 HP to target ally
  - `item_herbal_tea`: Restores +50 SP to target ally
  - `item_phoenix_feather`: Revives a fallen ally with 100 HP
  - `item_town_scroll`: Teleports Hero to Novice Town (Overworld only)
- **InventoryState**:
  - `slots`: 20 slots of `(ItemStack | null)[]`
  - `gold`: number (current currency)
- **InventoryManager**:
  - `createInitialInventory()`: returns 20 empty slots + starter items (3x Steamed Bun, 2x Herbal Tea, 200 Gold)
  - `addItem(inventory, itemId, quantity)`: finds existing stack or empty slot, returns success & new inventory
  - `removeItem(inventory, itemId, quantity)`: reduces stack or clears slot
  - `useItemOnCombatant(inventory, itemId, target)`: applies effect, decrements inventory, returns updated target & inventory
- **LootEngine**:
  - `calculateLoot(wildEnemies)`: rolls Gold reward (e.g. 15-30 Gold per monster level) and dropped item probability (e.g. 40% chance of Steamed Bun or Tea)

## 3. Authoritative Combat Integration (@poktsonline/server)
- `BattleEngine`:
  - When actor executes CombatAction `'item'`, it validates `itemId`, consumes the effect on `targetId` (or self), and emits `'heal'` or `'revive'` event with the item name.
- `BattleRoom`:
  - Upon `'victory'`, calls `LootEngine.calculateLoot(wildEnemies)` and passes `loot: { gold: number, droppedItems: ItemStack[] }` in the conclusion payload.

## 4. Client UI & Interactions (@poktsonline/client)
- **InventoryModalController** (`packages/client/src/ui/InventoryModalController.ts`):
  - 20-slot visual grid (4 rows x 5 columns)
  - Gold display counter with coin badge
  - Item detail tooltip / info panel on selection with "Use Item" and "Discard" actions
  - Hotkey `I` and `🎒 Bag [I]` button in game header
- **BattleScene Integration**:
  - Clicking `Item` in action bar brings up consumable items in inventory.
  - Clicking an item enters target selection (ally units on formation grid).
- **QA Developer Toolbar**:
  - Quick test buttons: `+5 Steamed Buns`, `+5 Herbal Tea`, `+1,000 Gold`.

## 5. Verification
- Shared unit tests for `InventoryManager`, `ITEM_DATABASE`, `LootEngine`.
- Server test for BattleRoom loot awarding.
- Zero regressions on existing 84 test cases.
