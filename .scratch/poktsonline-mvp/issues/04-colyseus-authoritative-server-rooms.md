# 04: Colyseus Authoritative Server Rooms

**What to build:** The authoritative Node.js server using Colyseus to maintain real-time multiplayer Overworld presence, trigger encounters, manage isolated Battle Instance rooms with a 30-second Action Phase timer, execute `BattleEngine.resolveTurn`, and return players to the Overworld upon combat conclusion.

**Blocked by:** 02: Deep BattleEngine and Turn Resolution, 03: Overworld Navigation and Encounter Engine

**Status:** ready-for-agent

- [ ] `OverworldRoom` manages connected player sessions and broadcasts movement updates across clients with low latency.
- [ ] Server validates player movement and evaluates encounter rolls through `OverworldEngine`.
- [ ] On encounter trigger, server instantiates a dedicated `BattleRoom` and moves the player's session into it.
- [ ] `BattleRoom` initializes combat state with the player's Hero + Active Beast vs wild enemies on the 2x5 Formation Grid.
- [ ] 30-second Action Phase countdown is synchronized across participants; when timer expires or all actions are locked in, the server invokes `BattleEngine.resolveTurn`.
- [ ] Resolution Phase event sequence is broadcast to client; when combat ends (win, lose, escape), room tears down and restores player to `OverworldRoom`.
- [ ] Integration tests verify room transitions and turn lifecycle.
