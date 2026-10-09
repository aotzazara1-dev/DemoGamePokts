# Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations

Status: ready
Blocked by: 02

## Objective
Update `BattleScene` to display earned EXP and Level Up announcements upon victory, and return updated Hero and Beast progression data back to `OverworldScene`.

## Tasks
1. Listen for `battleEnd` with `expAwarded` and `levelUps`.
2. Enhance `showBattleEndBanner` with EXP reward display and glowing Level Up text.
3. Pass `updatedHero`, `updatedActiveBeast`, and `levelUps` in `scene.resume('OverworldScene', ...)`.
4. Update `OverworldScene` resume handler to sync Hero and Beast progression in `this.roster`.
