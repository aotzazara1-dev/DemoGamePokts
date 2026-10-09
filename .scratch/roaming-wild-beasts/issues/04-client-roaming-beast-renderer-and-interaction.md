# 04-client-roaming-beast-renderer-and-interaction
Status: resolved
Blocked by: 03

## Description
Render synchronized Roaming Beasts in Phaser `OverworldScene`.
- Listen to `roamingBeasts.onAdd`, `roamingBeasts.onRemove`, and `roamingBeasts.onChange`.
- Only render beasts whose `mapId` matches the player's active `mapConfig.id` and where `!inCombat`.
- Display each beast with:
  - Element-themed sprite or icon.
  - Floating level and name tag (e.g., `🌿 Lv.4 Leaf Sprite`).
  - Isometric depth sorting (`getIsometricDepth`).
  - Smooth tween interpolation when beast position updates.
  - Interactive click: clicking a roaming beast navigates the player to the beast to trigger battle.

## Answer
Implemented roaming beast visual rendering with procedural pixel sprites, element colors, level labels, bobbing animations, map transition visibility filtering, smooth tween updates, and click-to-pathfind navigation in `OverworldScene.ts`.
