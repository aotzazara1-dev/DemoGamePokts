# Ticket 02: BattleSwapMenuController and UI Modal

Status: Completed

## Description

Build the client DOM modal controller `BattleSwapMenuController` and accompanying CSS styles to display conscious Reserve Beasts and handle selection.

## Requirements

1. Create `packages/client/src/ui/BattleSwapMenuController.ts` (Ceiling <= 400 LOC):
   - Accepts list of reserve beasts (or player roster) and current active beast ID.
   - Filters out currently deployed beast and renders reserve beasts.
   - For each beast, displays name, element icon, level, HP progress bar, and SP progress bar.
   - Disables selection for any beast with `hp <= 0`.
   - Callbacks: `onSelectBeast(beastId: string)` and `onCancel()`.
2. Create `packages/client/src/styles/battle-swap-menu.css`:
   - Dual-state card styling (active, disabled), retro TS Online aesthetic.
3. Unit Tests in `packages/client/test/battle-swap-ui.test.ts`:
   - Renders reserve beasts excluding active beast.
   - Disables defeated beasts.
   - Triggers `onSelectBeast` on click.
   - Triggers `onCancel` on close.
