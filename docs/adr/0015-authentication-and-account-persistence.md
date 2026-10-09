# Hybrid Authentication, Multi-Hero Character Selection, and SQLite Persistence

We decided to implement a persistent account and character system using SQLite (`better-sqlite3`), hybrid authentication (Guest token + registered username/password), and a multi-hero character selection flow.

1. **Hybrid Authentication**:
   - **Guest Mode**: Generates a persistent UUID token stored in client `localStorage`. Users can play immediately without filling in registration credentials.
   - **Registered Mode**: Username and salted password hash (using Node.js `crypto.scrypt` or `bcrypt`) for cross-device access.
   - **Account Linking**: A Guest Account can be permanently upgraded to a Registered Account at any time by setting a username and password without losing progression.

2. **Account vs. Hero Cardinality (1 Account : Up to 3 Heroes)**:
   - Each Account can hold up to 3 distinct Heroes.
   - After authentication, the client transitions to a **Character Select** view.
   - Players can view their existing Heroes (name, level, element, current map), select a Hero to enter the Overworld, create a new Hero (choosing name and elemental affinity: Earth, Water, Fire, Wind), or delete an existing Hero.

3. **Storage & Persistence Architecture**:
   - Embedded SQLite database managed on the server (`packages/server/data/game.db`).
   - Normalized schema:
     - `accounts`: `id`, `username`, `password_hash`, `guest_token`, `created_at`
     - `heroes`: `id`, `account_id`, `name`, `element`, `level`, `exp`, `stat_points`, `allocated_stats`, `map_id`, `x`, `y`, `direction`, `gold`
     - `hero_inventories`: `hero_id`, `slot_index`, `item_id`, `quantity`
     - `hero_rosters`: `hero_id`, `beast_id`, `is_active`, `formation_index`, `level`, `exp`, `hp`, `sp`, `attributes`
   - **Save Triggers**: Auto-save on map transitions, battle conclusions, shop purchases/sales, and client disconnect (`onLeave`).

4. **Client Auth UI Flow**:
   - Implemented as a polished HTML/CSS DOM modal overlay before Phaser OverworldScene connection, preserving native input autocomplete, keyboard accessibility, and crisp responsive styling.
