# 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics

Date: 2026-10-09

## Status

Accepted

## Context

Poktsonline originally debuted with a placeholder TS Online oriental/wuxia fantasy setting (จอมยุทธ์, นักพรต, สัตว์อสูร, สำนัก). While the underlying engine mechanics (isometric 2D grid movement, turn-based 5v5 formation grid, cyclic elemental advantages, Colyseus room authority, and inventory) are technically robust and modular, the creative vision has evolved:

The game pivots to a **Record of Ragnarok (มหาศึกคนชนเทพ / Shuumatsu no Valkyrie)** mythological tournament setting combined with an **Isekai / Digimon World** player inception hook.

In this vision:
1. **The Protagonist (Player Hero)**: A human summoned across dimensions from modern Earth to the celestial Valhalla realm, awakening with a Divine Elemental Core (Earth, Water, Fire, or Wind).
2. **The Roster (Companions & Deities)**: Rather than generic wild animals, the collectible roster comprises **Einherjar (legendary human champions)** and **Gods (multinational deities)** spanning Norse, Greek, Hindu, Japanese, and Chinese pantheons (e.g. Lu Bu, Thor, Adam, Zeus, Sasaki Kojiro, Poseidon, Shiva, Buddha).
3. **Valkyries & Völundr**: Sister Valkyries (led by Brunhilde and Göll) who enter divine soul contracts (Völundr) to grant specialized passive buffs, divine weapons, and aura enhancements to the party.
4. **The Overworld World**: The world shifts from generic meadows to mythological battlegrounds:
   - **Valhalla Coliseum (ลานประลองวัลฮัลลา)**: The central tournament arena and hub.
   - **Asgard Sanctuary (ป่าศักดิ์สิทธิ์แอสการ์ด)**: The celestial highlands guarded by Norse beasts.
   - **Helheim Abyss (หุบเหวนรกเฮลไฮม์)**: The underworld domain of primordial chaos.
5. **NPCs**:
   - **Brunhilde (บรุนฮิลด์)**: The Chief Valkyrie strategist replacing Elder Shen as the primary guide.
   - **Heimdall (ไฮม์ดัล)**: The Apocalypse Announcer and Gjallarhorn horn-blower replacing the generic merchant, offering Divine Elixirs (Ambrosia, Golden Apple of Eden).

## Decision

We will implement this thematic shift across all workspaces while preserving 100% mechanical compatibility:

1. **Shared Workspace (`@poktsonline/shared`)**:
   - Update default roster templates to feature iconic Einherjar and Gods:
     - `thor` (Wind/Thunder - Mjolnir Strike)
     - `lu_bu` (Fire - Sky Piercer Halberd)
     - `kojiro` (Water - Senju Muso / Swallow Blade)
     - `adam` (Earth - Eyes of the Lord)
     - `zeus` (Wind - Fist that Surpasses Time)
     - `shiva` (Fire - Tandava Dance of Destruction)
     - `buddha` (Water - Six Realms Staff / Enlightenment)
   - Update map configurations:
     - `valhalla_coliseum` (replacing novice town, theme: `coliseum` / safe zone)
     - `asgard_sanctuary` (replacing misty forest, theme: `sanctuary` / wild zone)
     - `helheim_abyss` (replacing subterranean cave, theme: `abyss` / wild zone)
   - Update consumable item definitions:
     - `ambrosia_herb` (replacing Small Herb, heals 50 HP)
     - `eden_golden_apple` (replacing Mountain Ginseng, heals 150 HP + 40 SP)
     - `bifrost_scroll` (replacing Town Scroll, warps to Valhalla Coliseum)

2. **Server Workspace (`@poktsonline/server`)**:
   - Keep authoritative room logic and SQLite repositories intact, mapping existing map IDs cleanly with backward-compatibility fallbacks.
   - Seed default hero roster states with starter deities/Einherjar.

3. **Client Workspace (`@poktsonline/client`)**:
   - Update `OverworldRenderer` with celestial/divine pixel textures (Valhalla marble tiles, Asgard golden foliage, Helheim shadow stone, and Ragnarok champion sprites).
   - Update `OverworldEntityManager` with Brunhilde and Heimdall dialogues and interactive sound cues.
   - Retain all decoupled modal controllers (`AuthModal`, `CharacterSelectModal`, `InventoryModal`, `MinimapController`, `ChatController`).

## Consequences

### Positive
- Deep, immersive creative alignment with Record of Ragnarok and Isekai summoning fantasy.
- Distinct, memorable champions with unique lore identities replacing generic placeholders.
- 100% preservation of all proven mathematical combat rules, Colyseus network authority, and modular UI controllers.
- Richer storytelling, dialogue, and audio-visual character designs.

### Negative
- Requires updating map configuration references and procedural sprite assets.
- Requires updating unit test mocks and fixtures that referenced legacy map/item IDs.
