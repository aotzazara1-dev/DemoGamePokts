# Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats

## Description
Connect the in-combat `Item` button in `BattleScene` to prompt usable inventory items and select ally targets, display victory loot on the battle conclusion banner, and add QA debug cheat buttons.

## Tasks
1. In `BattleScene.ts`, clicking `Item` opens a consumable item selection menu listing battle items in the player's inventory.
2. Selecting an item prompts ally target selection on the formation grid.
3. Update victory banner in `BattleScene.ts` to display Gold earned and dropped items.
4. Pass updated inventory back to `OverworldScene.ts` upon battle conclusion.
5. Add QA Debug Toolbar buttons in `DebugToolbarController.ts`: `+5 Steamed Buns`, `+5 Herbal Tea`, `+1,000 Gold`.

## Verification
- Run `npm run build && npm test`.
- Verify in browser that items can be used in combat, dropped from monsters, used on Overworld, and granted via QA toolbar.
