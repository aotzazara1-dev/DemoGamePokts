# Minimap Radar and In-Game Chat System Architecture

We decided to implement an integrated Overworld HUD expansion consisting of a real-time Minimap Radar and an in-game Chat System with Map broadcast and Speech Bubbles.

## 1. Minimap Radar Architecture
1. **Placement & Form Factor**:
   - Fixed at the top-right corner of the viewport within `#ui-overlay` (140x140px retro-styled circular or rounded radar container).
   - Displays current Map name and dynamic Hero tile coordinates `(X, Y)`.
2. **2D Canvas Rendering**:
   - Uses a dedicated `<canvas>` element drawn via 2D context rather than Phaser sub-cameras, ensuring lightweight resource consumption.
   - Automatically dimensions its scale to map bounds (e.g. 50x50 grid).
   - Color codes map terrain:
     - Safe Zone / Town: soft slate/green
     - Wild Zone / Forest / Cave: deep green / earthy brown
     - Obstacles / Walls: dark granite
   - Entity Blips:
     - **Hero (Player)**: pulsing bright green dot with facing indicator
     - **Other Heroes**: bright cyan dots
     - **NPCs / Merchants**: yellow/gold dots
     - **Portals**: vibrant purple/orange portal icons
     - **Roaming Beasts**: menacing red dots
3. **Interactive Click-to-Move**:
   - Clicking any point on the Minimap converts minimap pixel coordinates into grid `(tileX, tileY)`.
   - Delegates directly to `OverworldScene.findPathAndMove(...)` to pathfind the Hero to the clicked tile, ignoring unpassable tiles or clamping to the nearest walkable tile.

## 2. In-Game Chat System Architecture
1. **Network Protocol & Authority**:
   - Messages are routed through Colyseus `OverworldRoom`.
   - Client sends message `sendChatMessage`: `{ text: string, channel: 'map' }`.
   - Server validates length (1-120 chars), rate limits (max 1 msg per 500ms), attaches sender `{ heroId, heroName, accountId, timestamp, channel }`, and broadcasts `chatMessage` to all clients in the same OverworldRoom.
   - Server emits system messages (`channel: 'system'`) upon combat victories, loot acquisition, or map transitions.
2. **Client Chat UI Controller**:
   - Positioned at the bottom-left corner of the viewport (`#chat-overlay`).
   - Tabs:
     - **[All]**: Displays both Map Chat and System Logs.
     - **[System]**: Filters to only show progression, loot, and combat messages.
   - Input Box:
     - Pressing `Enter` focuses the chat input and temporarily suppresses Overworld hotkeys (`B`, `C`, `I`, movement keys).
     - Pressing `Enter` with text sends the message, clears input, and blurs.
     - Pressing `Escape` cancels and blurs input, immediately restoring game hotkeys.
   - Chat log is scrollable with auto-scroll down on new incoming messages unless scrolled up.
3. **Overworld Speech Bubbles**:
   - When a player speaks, a floating DOM or Phaser container Speech Bubble renders above their Hero sprite.
   - Contains a white balloon with rounded borders and small pointer pointing down to the character's head.
   - Displays text up to 40 characters (or multi-line) with a subtle pop-in animation.
   - Automatically fades out and is destroyed after 4.5 seconds.
