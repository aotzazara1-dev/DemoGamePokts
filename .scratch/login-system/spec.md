# Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence

Status: ready-for-agent
Triage: ready-for-agent

## Problem Statement

Currently, players connecting to Poktsonline are assigned a random ephemeral name (e.g. `Hero_123`) and start at default coordinates with default stats, inventory, and roster. When the player disconnects, closes the browser tab, or restarts the game, all progression (levels, attributes, captured Beasts, earned Gold, and acquired Items) is permanently lost. Furthermore, players cannot choose their Hero's elemental affinity or name, have no ability to manage multiple characters, and cannot access their account across devices.

## Solution

A robust, lightweight, and cohesive authentication and persistence system:
1. **Hybrid Authentication**: Support both frictionless Guest play (instant play via persistent `localStorage` client token) and Registered Accounts (Username + salted password hash), with seamless account linking to preserve Guest progression.
2. **Multi-Hero Character Selection**: An interactive Character Select interface allowing each Account to own up to 3 distinct Heroes, display their status, choose a name and elemental affinity (Earth, Water, Fire, Wind) upon creation, receive a matching elemental Starter Beast, and enter the Overworld with their selected Hero.
3. **Server-Authoritative SQLite Persistence**: An embedded SQLite database (`packages/server/data/game.db`) managed via `better-sqlite3` that reliably persists full Hero states (Attributes, EXP, Stat Points, current Map, Tile position, Inventory items, Gold, and Beast Roster) across sessions.
4. **Seamless Colyseus Handshake**: A secure token-based handshake where authenticated clients join `OverworldRoom` with their `heroId` and `sessionToken`, loading their authoritative state and auto-saving on transitions and disconnects.

## User Stories

1. As a new visitor, I want to click "Play as Guest" so that I can immediately explore the Overworld without remembering or typing credentials.
2. As a returning guest on the same browser, I want my guest token to automatically retrieve my existing Heroes so that my progress is maintained.
3. As a guest player who has leveled up my Hero, I want to link my account to a Username and Password so that I can access my character from any computer or browser.
4. As a registered player, I want to log in with my Username and Password so that I can safely load my account.
5. As a registered player, I want an error message when entering an incorrect password so that I know my login attempt was rejected.
6. As a new player, I want to create a new Account with a unique Username and Password so that I have a permanent identity in the game.
7. As an authenticated player with an empty slot, I want to create a new Hero with a custom name (3–16 characters) and chosen Element so that I can roleplay my preferred martial style.
8. As a newly created Hero, I want to receive a level 1 Starter Beast matching my chosen Element so that I have a companion ready for combat.
9. As an authenticated player with existing Heroes, I want to see a Character Select list showing each Hero's name, element, level, and current map location so that I can choose which Hero to play.
10. As an authenticated player, I want to select a Hero and click "Enter World" so that I spawn in the Overworld at that Hero's saved map and tile coordinates.
11. As an authenticated player, I want to delete an existing Hero by typing the Hero's name as a confirmation so that I can free up a slot without accidental deletion.
12. As an authenticated player, I want the system to enforce a maximum of 3 Heroes per Account so that roster capacity limits are respected.
13. As an active Hero, I want my acquired Gold and Inventory items to be saved in the database upon winning battles or purchasing from shops so that I never lose items.
14. As an active Hero, I want my current map and tile position saved when I log out or disconnect so that I resume exactly where I left off.
15. As a server administrator, I want SQLite to run in-process without external database dependencies so that the project remains lightweight and easy to develop.

## Implementation Decisions

### 1. Database & Persistence Architecture
- Use `better-sqlite3` within `packages/server` storing database file at `packages/server/data/game.db`.
- Database initialization executes schema migrations on server start:
  - `accounts` table: `id` (TEXT PRIMARY KEY), `username` (TEXT UNIQUE NULLABLE), `password_hash` (TEXT NULLABLE), `guest_token` (TEXT UNIQUE NULLABLE), `created_at` (INTEGER).
  - `sessions` table: `token` (TEXT PRIMARY KEY), `account_id` (TEXT), `expires_at` (INTEGER).
  - `heroes` table: `id` (TEXT PRIMARY KEY), `account_id` (TEXT), `name` (TEXT), `element` (TEXT), `level` (INTEGER), `exp` (INTEGER), `stat_points` (INTEGER), `allocated_stats` (TEXT JSON), `map_id` (TEXT), `x` (INTEGER), `y` (INTEGER), `direction` (TEXT), `gold` (INTEGER), `created_at` (INTEGER).
  - `hero_inventories` table: `hero_id` (TEXT), `slot_index` (INTEGER), `item_id` (TEXT), `quantity` (INTEGER), PRIMARY KEY (`hero_id`, `slot_index`).
  - `hero_rosters` table: `hero_id` (TEXT), `beast_id` (TEXT), `is_active` (INTEGER), `formation_index` (INTEGER), `level` (INTEGER), `exp` (INTEGER), `hp` (INTEGER), `sp` (INTEGER), `attributes` (TEXT JSON), PRIMARY KEY (`hero_id`, `beast_id`).

### 2. HTTP REST Auth API (Port 2567)
- Express or Node HTTP request listener mounted on the existing `httpServer` in `packages/server/src/index.ts`:
  - `POST /api/auth/guest` -> Creates or retrieves account by `guestToken`, returns `{ token, account: { id, isGuest: true } }`.
  - `POST /api/auth/register` -> Accepts `{ username, password }`, hashes with `crypto.scryptSync`, returns `{ token, account: { id, username, isGuest: false } }`.
  - `POST /api/auth/login` -> Accepts `{ username, password }`, verifies hash, returns `{ token, account }`.
  - `POST /api/auth/link-account` -> Accepts `{ token, username, password }`, updates guest account to permanent credentials.
  - `GET /api/heroes` -> Header `Authorization: Bearer <token>`, returns `{ heroes: HeroSummary[] }` (up to 3).
  - `POST /api/heroes` -> Accepts `{ name, element }`, validates name (3-16 alphanumeric/thai/space chars), creates Hero, inserts Starter Beast and initial inventory, returns `{ hero: HeroSummary }`.
  - `DELETE /api/heroes/:id` -> Accepts `{ confirmName }`, verifies ownership, deletes Hero and cascade records.

### 3. Client Presentation & Flow
- High-contrast, responsive DOM overlays:
  - `AuthModalController`: Guest login, Login with Username/Password, Register tab, and Link Account modal.
  - `CharacterSelectModalController`: Displays 3 hero cards (or "Create Hero" slot buttons), displays Hero name, element badge, level, map, and "Enter World" / "Delete" buttons.
- On successful selection, passes `{ heroId, sessionToken }` to `OverworldScene` and `OverworldNetwork.connect()`.

### 4. Server Colyseus Room Handshake & State Loading
- In `OverworldRoom.onJoin(client, options)`:
  - Validates `options.sessionToken` and `options.heroId`.
  - Loads Hero record from SQLite database.
  - Initializes `PlayerNetworkState` with saved `x`, `y`, `direction`, `mapId`, and `name`.
  - Sends initial full state packet (roster, inventory, gold) to client on join.
  - Auto-saves Hero position, inventory, and roster on `onLeave(client)`.

## Testing Decisions

### 1. Seams Tested
- **Seam 1: HTTP Auth & Hero API Seam (Highest Backend Seam)**
  - Use `supertest` or HTTP requests against server endpoints.
  - Test registration, duplicate usernames, guest creation, account linking, password verification, hero creation (element assignment, starter beast, 3-hero cap), and hero deletion.
- **Seam 2: Colyseus Overworld Room Persistence Seam (Integration Seam)**
  - Test `OverworldRoom` joining with valid/invalid session tokens, verifying loaded coordinates, state mutation, and database persistence on leave.
- **Seam 3: Shared Database Repository Seam (Unit Seam)**
  - In-memory SQLite (`:memory:`) unit tests for queries, transaction rollbacks, cascades, and schema migrations.

### 2. Prior Art
- Existing server tests in `packages/server/test/overworld-room.test.ts` and `battle-room.test.ts`.
- Existing shared tests in `packages/shared/test/inventory.test.ts` and `roster.test.ts`.

## Out of Scope

- Multi-server account clustering (single server instance is standard for this architecture).
- Email verification / password recovery via email (simple account recovery only).
- In-game friend lists or mail systems (belong in subsequent social features).
- Cosmetic character sprite customizer (uses established wuxia sprites with element badges).

## Further Notes

- Passwords are salted with random 16-byte salts and hashed with native `crypto.scryptSync(password, salt, 64)`.
- SQLite database directory `packages/server/data/` is added to `.gitignore` to prevent committing live databases.
