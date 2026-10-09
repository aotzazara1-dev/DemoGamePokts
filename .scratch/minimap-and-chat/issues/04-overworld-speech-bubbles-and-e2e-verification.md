# Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

Status: ready-for-agent
Triage: ready-for-agent
Blocks: none
Blocked-by: .scratch/minimap-and-chat/issues/01-shared-chat-types-and-server-broadcast.md, .scratch/minimap-and-chat/issues/02-minimap-radar-and-click-navigation.md, .scratch/minimap-and-chat/issues/03-client-chat-ui-controller-and-input-guard.md

## Context
Complete the full user experience with TS Online style speech bubbles floating over character sprites when speaking, routing game events (combat rewards, map entry) to the system chat log, and executing automated verification.

## Requirements
1. **Speech Bubble Rendering (`packages/client/src/scenes/OverworldScene.ts`)**:
   - When a `chatMessage` arrives with `channel: 'map'`:
     - Find the corresponding entity sprite container (local player `playerContainer` or other player container).
     - Spawn a Speech Bubble:
       - White/cream rounded container with downward-pointing tail.
       - Crisp dark text with wrapping up to ~32 chars/line.
       - Floating at an offset above the sprite head (e.g. `y - 65`).
       - Slight scale-in / pop animation.
       - Disappears automatically with fade-out after 4.5 seconds.
       - If a new message is received while an old bubble is active, replace the text and reset the timer.
2. **System Log Event Integration**:
   - Route Overworld map transitions: `"Entered [Map Name]"` -> `chatController.addMessage({ channel: 'system', ... })`.
   - Route Battle conclusion results (from BattleScene or server): `"Earned [N] Gold and [N] EXP"` -> System log.
   - Route item drops / loot: `"Obtained [Item Name] x[Count]"` -> System log.
3. **End-to-End Smoke Test (`scripts/test-e2e-smoke.js`)**:
   - Extend smoke test to verify:
     - `#minimap-canvas` exists, is visible, and has valid dimensions.
     - `#chat-overlay` exists, receives focus on `Enter`, and can send a test chat message.
4. **Verification**:
   - Run `npm test` across all workspaces.
   - Run `npm run test:e2e`.
   - Run `npm run build`.
