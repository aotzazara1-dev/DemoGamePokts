# Ticket 03: BattleScene Swap Action and Sprite Rendering

Status: Completed

## Description

Integrate the Swap action and `BattleSwapMenuController` into `BattleScene.ts`, ensuring sprite textures update upon swap and post-battle roster state preserves the new active beast.

## Requirements

1. Add `btn-action-swap` ("🔄 เปลี่ยนตัว") to the action bar in `BattleScene`.
2. When clicked during the Hero's action phase:
   - Open `BattleSwapMenuController` populated with `this.roster.beasts`.
   - Selecting a beast dispatches action `{ type: "swap", swapBeastId: beast.id }`.
3. Handle `'swap'` event during turn animation:
   - Show battle notification / float text: `${hero.name} เรียกตัว ${newBeast.name} ลงสู่สนาม!`.
   - Update the sprite and health bar of the beast slot on the canvas.
   - Update `this.roster.activeBeastId = newBeast.id`.
4. Ensure `BattleScene.ts` strictly satisfies the whitelist cap (<= 1,290 lines).
5. Comprehensive build and tests verification.
