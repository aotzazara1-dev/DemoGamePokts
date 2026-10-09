# 01: Shared Ragnarok Champions Roster and Divine Item Database

**What to build:**
Update the shared package (`@poktsonline/shared`) to define Record of Ragnarok Einherjar and Gods as starter and collectible champions (Thor, Lu Bu, Sasaki Kojiro, Adam, Zeus, Shiva, Buddha), refresh `RosterManager` initial roster definitions, and upgrade `ITEM_DATABASE` and `LootEngine` with mythological items (Ambrosia Dew, Soma Elixir, Golden Apple of Eden, Bifrost Scroll, Dragon Tooth, etc.) with 100% backward-compatible ID preservation.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Update `RosterManager.createInitialRoster()` to support elemental Einherjar/God starters with iconic names and attributes.
- [x] Update `ITEM_DATABASE` consumable names, descriptions, and lore to reflect Ragnarok divine elixirs and Völundr artifacts while preserving existing `item_*` IDs.
- [x] Update `getItemIcon()` with appropriate divine emojis/symbols for new item identities.
- [x] Update `LootEngine` drop tables and comments with Ragnarok spoils (Eden Apples, Nectar, Valkyrie Balm).
- [x] Verify that existing unit tests in `packages/shared/test/` continue to pass or are cleanly updated.
