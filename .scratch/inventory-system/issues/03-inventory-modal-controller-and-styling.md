# Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling

## Description
Create the client-side Inventory UI modal, 20-slot interactive grid, item detail inspector with "Use" and "Drop" options, gold display, and overworld hotkey / header button.

## Tasks
1. Create `packages/client/src/styles/inventory-modal.css` for 20-slot grid, item icon badges, quantity tags, gold counter, and item inspector card.
2. Add `@import './inventory-modal.css';` to `packages/client/src/styles/index.css`.
3. Add `#inventory-modal` HTML template in `packages/client/index.html` and add `🎒 [I] Bag` in `#game-header`.
4. Implement `InventoryModalController.ts` in `packages/client/src/ui/InventoryModalController.ts`:
   - Slot selection, item info rendering, "Use Item" on Hero/Active Beast, "Drop Item".
   - Gold display formatting.
5. Wire `InventoryModalController` into `OverworldScene.ts` with hotkey `I`.

## Verification
- Verify build with `npm run build`.
