# 02: HTTP Authentication Endpoints and Client Auth Modal

**What to build:**
A complete end-to-end authentication system featuring secure HTTP REST endpoints on the game server and a responsive retro-styled HTML/CSS DOM modal on the client. Players can play instantly as a Guest, register a permanent username and password, log in to an existing account, or link a guest session to a new permanent account without losing progress.

**Blocked by:** 01: SQLite Database Engine and Persistence Schemas

**Status:** ready-for-agent

- [ ] HTTP REST endpoints mounted on port 2567: `POST /api/auth/guest`, `POST /api/auth/register`, `POST /api/auth/login`, and `POST /api/auth/link-account`.
- [ ] Passwords hashed with cryptographic salts using native `crypto.scrypt` (or standard secure hash).
- [ ] Guest token generated and stored in client `localStorage` for automatic reconnection.
- [ ] `AuthModalController` renders clean DOM UI overlay before entering the game, supporting Guest play, Login, Register, and Account Linking.
- [ ] Meaningful error messages displayed to the player for invalid passwords, duplicate usernames, or malformed credentials.
- [ ] Header bar contains a "Link Account" button when logged in as a Guest.
- [ ] Automated tests cover all auth endpoints (registration, duplicate checks, login success/failure, guest linking).
