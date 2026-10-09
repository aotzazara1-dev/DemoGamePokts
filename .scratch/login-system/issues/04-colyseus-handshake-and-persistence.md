# 04: Colyseus Overworld Room Handshake and Full State Persistence

**What to build:**
Integration of authenticated Hero selection into the live Colyseus Overworld Room. When a player clicks "Enter World", the client establishes a Colyseus connection passing `sessionToken` and `heroId`. The server authenticates the handshake, loads the Hero's saved map, coordinates, direction, inventory, and roster from SQLite, and synchronizes authoritative state. Any progress made (movement, battle rewards, shop purchases) is saved back to SQLite automatically.

**Blocked by:** 03: Multi-Hero Character Selection and Creation Interface

**Status:** ready-for-agent

- [ ] `OverworldRoom.onJoin()` validates `sessionToken` and loads the specified `heroId` from SQLite database.
- [ ] Unauthorized join attempts (invalid token or unowned heroId) are rejected.
- [ ] Hero spawns at their saved `mapId`, `x`, `y`, and `direction` on the Overworld.
- [ ] Hero's saved Inventory (items and Gold) and Beast Roster are sent to the client and bound to game modals.
- [ ] Auto-save triggers persist Hero state back to SQLite:
  - On player movement / map portal transitions (`warpPortal`, `warpTown`).
  - On battle conclusion (`battleConcluded` with loot and EXP).
  - On shop transactions (buying and selling items).
  - On client disconnect (`onLeave`).
- [ ] Integration tests verify that rejoining after disconnect restores the exact saved state, position, items, and roster.
