# Feature Spec: Overworld Minimap Radar and In-Game Chat System

Status: ready-for-agent
Triage: ready-for-agent

## Problem Statement

As players explore the multi-map isometric world of Poktsonline, two major user experience voids exist:
1. **Lack of World Spatial Awareness**: Players have no macro-level view of the map terrain, their relative position, portal locations, friendly NPCs, or incoming Roaming Beasts, forcing blind navigation and manual scrolling.
2. **Lack of Player Communication & Event Feedback**: Players sharing an Overworld map cannot communicate, socialize, or coordinate. Furthermore, in-game combat results, gold acquisitions, and item drops lack a persistent chronological log that players can review.

## Solution

Implement an integrated Overworld HUD expansion comprising:
1. **Interactive Minimap Radar**:
   - Fixed at the top-right corner of `#ui-overlay` (140x140px retro-styled radar container).
   - Dynamic 2D canvas displaying current map layout, terrain colors (safe town, wild grass/caves, walls/obstacles).
   - Real-time entity blips: Hero (green pulse), NPCs (yellow/gold), Portals (purple/orange), and Roaming Beasts (red).
   - Displays map title and real-time Hero grid coordinates `(X, Y)`.
   - Click-to-move navigation: Clicking anywhere on the minimap pathfinds the Hero to that target tile.
2. **In-Game Chat & System Log**:
   - Fixed at the bottom-left corner of the viewport (`#chat-overlay`).
   - Two tab channels: `[All]` (Map Chat + System notifications) and `[System]` (combat results, loot, gold).
   - Keyboard control: Pressing `Enter` focuses chat input while suppressing game hotkeys; pressing `Enter` again sends message; `Esc` cancels.
   - Message transmission: Real-time broadcast via Colyseus `OverworldRoom` (`sendChatMessage` / `chatMessage`) with rate-limiting and length validation.
3. **Overworld Speech Bubbles**:
   - When a Hero sends a chat message, a retro-styled speech bubble pops up over their sprite on the Overworld for 4.5 seconds before gracefully fading out.

## User Stories

1. As a player navigating the Overworld, I want to see a Minimap radar at the top-right corner displaying my coordinates `(X, Y)` and the current Map name so that I always know where I am.
2. As a player looking for shops or exits, I want NPCs and Portals clearly marked with distinct colored dots on the Minimap so that I can easily find my way.
3. As a player farming or avoiding monsters, I want Roaming Beasts marked as red dots on the Minimap so that I can engage or steer clear of them.
4. As a player travelling long distances, I want to click on a location on the Minimap so that my Hero automatically pathfinds towards that tile.
5. As a player sharing an Overworld map, I want to press `Enter`, type a message, and send it to other players on the same map.
6. As a player typing in chat, I want game hotkeys (like `I` for inventory or `B` for beasts) to be paused so that my typing does not accidentally open menus or trigger abilities.
7. As a player conversing with others, I want a speech bubble to appear over speaking characters' heads so that conversations feel immersive like classic TS Online.
8. As a player fighting beasts or looting items, I want a persistent `[System]` log in the chat window so that I can review combat rewards, EXP, and gold gained.

## Implementation Decisions

### 1. Shared Types & Network Schema (`@poktsonline/shared`)
- Types in `packages/shared/src/types/chat.ts`:
  - `ChatChannel`: `'map' | 'system'`
  - `ChatMessagePayload`: `{ id: string; senderId: string; senderName: string; channel: ChatChannel; text: string; timestamp: number }`
  - `SendChatMessagePayload`: `{ text: string; channel?: ChatChannel }`

### 2. Server Authority & Broadcasting (`packages/server`)
- `OverworldRoom`:
  - Listen for `sendChatMessage`:
    - Enforce message constraints (1 - 120 characters, trim whitespace).
    - Rate limit: 1 message per 500ms per client.
    - Attach active hero name from `clientHeroMap`.
    - Broadcast `chatMessage` payload to all clients in the room.
  - Broadcast system notifications on major events (e.g. hero entering map, loot drops).

### 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`)
- Render into a `<canvas>` element (140x140 px).
- Re-render on frame updates / entity movement:
  - Background terrain grid colored by tile type (passable / unwalkable / safe zone).
  - Portals as small highlighted squares/icons.
  - NPCs as gold dots.
  - Roaming beasts as red dots.
  - Other heroes as cyan dots.
  - Player hero as bright green dot with facing direction indicator.
- Mouse click event handler:
  - Maps click `(px, py)` to `(tileX, tileY)` relative to map dimensions.
  - Invokes `onNavigate(tileX, tileY)`.

### 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`)
- Manages `#chat-overlay` DOM structure:
  - Channel tabs: `[All]`, `[System]`.
  - Message log container with autoscroll.
  - Text input with placeholder `"Press Enter to chat..."`.
- Global keyboard handler:
  - `Enter` when not focused -> focus chat input, set `isChatActive = true`.
  - `Enter` when focused with text -> dispatch `network.sendChatMessage(text)`, clear input, blur, set `isChatActive = false`.
  - `Escape` when focused -> blur input, set `isChatActive = false`.
  - When `isChatActive = true`, input events are stopped from propagating to Phaser hotkeys.

### 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`)
- Speech bubble component rendered as a lightweight Phaser container (or positioned HTML element above sprite).
- Rounded background rectangle with speech pointer.
- Text auto-wrapped with maximum width.
- Tweens in with slight bounce, stays for 4 seconds, fades out over 0.5s, then destroyed.

## Acceptance Criteria
1. Minimap renders accurately at top-right, showing map terrain, portals, NPCs, roaming beasts, and player position.
2. Clicking a tile on the Minimap initiates pathfinding to that tile.
3. Chat messages sent via `Enter` appear in the chat log of all players in the same map.
4. Speech bubbles render above the speaking hero's head in the Overworld and fade out automatically.
5. System messages (e.g. combat rewards, joins) appear in `[All]` and `[System]` tabs.
6. Typing in chat does not trigger movement or menu hotkeys (`B`, `C`, `I`).
7. All unit tests, E2E tests, and builds compile and pass cleanly.
