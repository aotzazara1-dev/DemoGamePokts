# 01: SQLite Database Engine and Persistence Schemas

**What to build:**
A persistent SQLite database backend running embedded inside the game server that creates and manages relational tables for user accounts, active sessions, hero characters, 20-slot inventories, and beast rosters, with full transaction safety and schema migrations.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] SQLite database is created automatically at `packages/server/data/game.db` upon server boot.
- [x] Relational schema migrations exist for `accounts`, `sessions`, `heroes`, `hero_inventories`, and `hero_rosters`.
- [x] Repository helper methods exist for creating accounts, guest authentication, saving/loading heroes, and querying slots.
- [x] Database queries are ACID-compliant and protect against data corruption or duplicate username collisions.
- [x] Comprehensive unit tests verify database initialization, CRUD operations, transactions, and cascades in memory (`:memory:`).
