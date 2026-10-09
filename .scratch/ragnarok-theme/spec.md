# Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

## 1. Overview
Pivot the narrative theme, domain terminology, starter rosters, maps, NPCs, and item aesthetics from generic Wuxia placeholders to **Record of Ragnarok (มหาศึกคนชนเทพ / Shuumatsu no Valkyrie)** merged with an **Isekai / Digimon World** protagonist inception hook.
The player hero is a summoned human traveler awakened with a Divine Elemental Core in Valhalla, fighting alongside legendary Einherjar (human champions) and Gods across celestial arenas, assisted by Valkyrie companions (Völundr) and challenged by roaming mythological entities.

All underlying gameplay mechanics—including 2D isometric movement, 5v5 turn-based formation grid, 4-element cyclic advantages (Water > Fire > Wind > Earth > Water), Colyseus authoritative networking, SQLite account persistence, and inventory transactions—remain 100% intact and mechanically compatible.

## 2. Detailed Requirements

### 2.1 Shared Data & Types (`@poktsonline/shared`)
- **Starter & Collectible Roster (Einherjar & Gods)**:
  - Water: Sasaki Kojiro (`kojiro` - ผู้แพ้ที่ยิ่งใหญ่ที่สุด / Swallow Blade) & Buddha (`buddha` - พระพุทธเจ้า / Enlightenment)
  - Fire: Lu Bu (`lu_bu` - ลิโป้ / Sky Piercer Halberd) & Shiva (`shiva` - พระศิวะ / Tandava Flame)
  - Wind: Thor (`thor` - ธอร์ / Mjolnir Hammer) & Zeus (`zeus` - ซุส / Fist that Surpasses Time)
  - Earth: Adam (`adam` - อดัม / Eyes of the Lord) & Heracles / Raiden
  - Default starter companion in `RosterManager.createInitialRoster()` defaults to elemental starter deity/Einherjar.
- **Ragnarok Maps (`MAP_DATABASE`)**:
  - `valhalla_coliseum` (Theme: `coliseum`, Safe arena & central tournament hub; aliases `novice_town_and_meadow` for backward-compatibility)
  - `asgard_sanctuary` (Theme: `sanctuary` / celestial forest, Norse wild encounter pool: Valkyrie Einherjar, Fenrir Pup, Pegasus; aliases `bamboo_forest`)
  - `helheim_abyss` (Theme: `abyss` / underworld cavern, chaotic wild encounter pool: Cerberus Hound, Chaos Serpent, Underworld Skeleton; aliases `pebble_cave`)
  - Portals connect Valhalla Coliseum <-> Asgard Sanctuary and Valhalla Coliseum <-> Helheim Abyss via Bifrost Gateways.
- **Consumable & Loot Items (`ITEM_DATABASE` & `LootEngine`)**:
  - `item_small_herb`: Ambrosia Dew (น้ำทิพย์อัมฤทธิ์) - heals 50 HP.
  - `item_ginseng`: Soma Elixir (น้ำโสมะศักดิ์สิทธิ์) - heals 40 SP.
  - `item_steamed_bun`: Golden Apple of Eden (แอปเปิ้ลทองคำแห่งอีเดน) - heals 80 HP.
  - `item_herbal_tea`: Nectar of the Gods (น้ำอมฤตแห่งทวยเทพ) - heals 50 SP.
  - `item_vitality_pill`: Valkyrie Balm (ยารักษาแห่งวาลคิรี) - heals 200 HP.
  - `item_phoenix_feather`: Völundr Feather (ขนนกฟื้นวิญญาณโวลุนเดอร์) - revives ally with 100 HP.
  - `item_town_scroll`: Bifrost Scroll (ม้วนคัมภีร์ไบฟรอสต์) - warps to Valhalla Coliseum.
  - Drops: Dragon Tooth (เขี้ยวมังกรสวรรค์), Nemean Hide (หนังราชสีห์นีเมียน), Jörmungandr Scale (เกล็ดพญางูยอร์มุนกันด์), Yggdrasil Branch (กิ่งไม้โลกอิกดราซิล).

### 2.2 Server Persistence & World Authority (`@poktsonline/server`)
- Update `HeroRepository.getStarterBeast(element)` to grant elemental Einherjar/God starters:
  - Water: `beast_starter_kojiro` (Sasaki Kojiro)
  - Fire: `beast_starter_lu_bu` (Lu Bu)
  - Wind: `beast_starter_thor` (Thor)
  - Earth: `beast_starter_adam` (Adam)
- In `HeroRepository.createHero()`, set default spawn map to `valhalla_coliseum` (with automatic fallback handling for existing heroes).
- In `OverworldRoom`, support both canonical `valhalla_coliseum` and backward-compatible IDs.

### 2.3 Client Visuals & Presentation (`@poktsonline/client`)
- **OverworldRenderer Textures**:
  - `tile_coliseum` / `tile_safe`: Golden-inlaid celestial marble flooring for Valhalla Coliseum.
  - `tile_sanctuary` / `tile_forest`: Luminous golden-green sacred grass for Asgard Sanctuary.
  - `tile_abyss` / `tile_cave`: Dark obsidian and violet abyssal stone for Helheim Abyss.
  - Procedural sprites for Ragnarok Champions:
    - `beast_thor`: Norse warrior with red cape and Mjolnir thunder hammer.
    - `beast_lu_bu`: Fierce warrior with twin pheasant feathers and halberd.
    - `beast_kojiro`: Japanese swordmaster in green haori with nodachi.
    - `beast_adam`: Radiant blonde champion with leaf sash and golden aura.
    - `beast_zeus`: Muscular bearded patriarch with lightning arcs.
    - `beast_shiva`: Indigo four-armed god of destruction with fire crown.
    - `beast_buddha`: Enlightened deity with modern stylish shades and lotus staff.
- **NPC Presentation & Dialogues**:
  - `npc_brunhilde`: Chief Valkyrie strategist replacing Elder Shen; offers full party divine vigor restoration ("Völundr Resonance") and tactical advice for Ragnarok battles.
  - `npc_heimdall`: The Apocalypse Announcer & Gjallarhorn horn-blower replacing Merchant Qian; opens the Divine Armory & Item Shop.

### 2.4 Verification & Polish
- Monorepo build passes without type or lint errors.
- All 212+ unit tests in client, server, and shared pass green.
- Graphify knowledge graph updated to reflect new domain architecture.
