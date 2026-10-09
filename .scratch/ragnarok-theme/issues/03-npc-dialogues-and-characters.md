# 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

**What to build:**
Replace the generic Wuxia village NPCs (Elder Zhang and Merchant Qian) with Record of Ragnarok's iconic personalities: Chief Valkyrie Brunhilde (`npc_brunhilde`) and Apocalypse Announcer Heimdall (`npc_heimdall`). Implement full-heal party blessings ("Völundr Resonance"), strategic guidance on mortal vs. divine combat, and the celestial Armory & Elixir Shop.

**Blocked by:** Ticket 02

**Status:** resolved

- [x] Define `npc_brunhilde` in `valhalla_coliseum`: Chief Valkyrie strategist with dialogue options for Völundr healing blessing, Ragnarok tournament advice, and exit.
- [x] Define `npc_heimdall` in `valhalla_coliseum`: Apocalypse Announcer with Gjallarhorn horn offering Ambrosia, Soma, Golden Apple of Eden, and Bifrost Scrolls.
- [x] Ensure NPC dialogue responses in `OverworldEntityManager` and `OverworldScene` handle the new options gracefully.
- [x] Verify NPC interaction tests in client and server pass.
