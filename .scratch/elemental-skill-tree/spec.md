# Specification: Elemental Skill Tree for Hero (ADR 0008)

## 1. Overview

Empowers the Hero (The Awakened / Isekai Traveler) with an elemental progression tree unique to their core element (Earth, Water, Fire, Wind).
The skill tree features **two specialized branching paths per element** plus a capstone ultimate ability.
Heroes gain **1 Skill Point (SP)** every time they level up and use these points to unlock abilities along their tree branches, which can then be equipped into their 5 combat slots.

## 2. Requirements

### 2.1 Domain & Data Model

- **Skill Points**:
  - The Hero receives `+1 Skill Point` upon every level-up via `ProgressionEngine.addExpToCombatant`.
  - Existing/new Heroes start with `skillPoints: 0` (or appropriate points based on level) and `unlockedSkillIds: []`.
- **Branching Architecture (2 Branches + 1 Ultimate per Element)**:
  - **Earth (ธาตุดิน)**:
    - _Branch A (ศิลาพิทักษ์ - Sentinel Defense)_:
      - Tier 1 (Lv.1): `skill_earth_shield` (Terra Ward - เกราะปราณศิลา, DEF +35%)
      - Tier 2 (Lv.10): `skill_stone_wall` (Stone Rampart - กำแพงศิลา, DEF +50% & Frontline Shield)
      - Tier 3 (Lv.20): `skill_clay_regeneration` (Earthen Vigor - พสุธาฟื้นชีพ, Continuous HP recovery & self-sustain)
    - _Branch B (ธรณีทำลายล้าง - Cataclysmic Tremor)_:
      - Tier 1 (Lv.1): `rock_throw` (Rock Throw - หินทับศัตรู, Heavy frontline crush)
      - Tier 2 (Lv.10): `skill_quakestrike` (Cataclysm Tremor - ธรณีพิโรธ, High Earth damage)
      - Tier 3 (Lv.20): `skill_earth_splitter` (Continent Splitter - หมัดผ่าปฐพี, Devastating earth strike)
    - _Capstone Ultimate (Lv.30, Requires Tier 3 in either branch)_:
      - `skill_ultimate_gaia_wrath` (Wrath of Gaia - มหาพิโรธพระแม่ธรณี, Catastrophic Earth destruction)
  - **Water (ธาตุน้ำ)**:
    - _Branch A (ธารน้ำทิพย์ - Sacred Spring Recovery)_:
      - Tier 1 (Lv.1): `skill_healing_spring` (Healing Spring - ธารน้ำทิพย์, Single-target heal)
      - Tier 2 (Lv.10): `skill_purifying_wave` (Cleansing Tide - คลื่นชำระล้าง, Group heal & status cleanse)
      - Tier 3 (Lv.20): `skill_ocean_revival` (Nectar of Life - วารีชุบวิญญาณ, Revive fallen ally with 50% HP)
    - _Branch B (เหมันต์เยือกแข็ง - Glacial Frost & Torrent)_:
      - Tier 1 (Lv.1): `aqua_jet` (Aqua Jet - กระแสน้ำเชี่ยวกราก, High-speed water thrust)
      - Tier 2 (Lv.10): `skill_frost_breath` (Niflheim Blizzard - หิมะเหมันต์, Freezing water damage)
      - Tier 3 (Lv.20): `skill_glacial_spike` (Absolute Zero Spike - หอกน้ำแข็งนิรันดร์, Massive piercing ice damage)
    - _Capstone Ultimate (Lv.30, Requires Tier 3 in either branch)_:
      - `skill_ultimate_poseidon_deluge` (Leviathan Tsunami - มหาคลื่นกลืนสมุทร, Piercing deluge)
  - **Fire (ธาตุไฟ)**:
    - _Branch A (คมดาบเพลิงกายภาพ - Blazing Blade & Might)_:
      - Tier 1 (Lv.1): `flame_strike` (Flame Strike - คมดาบเพลิงโลกันตร์, Scorching slash)
      - Tier 2 (Lv.10): `skill_raging_flame` (Blazing Might - มนตร์เพลิงปลุกพลัง, ATK +30%)
      - Tier 3 (Lv.20): `skill_crimson_lotus` (Crimson Lotus Slash - เพลงดาบดอกบัวชาด, Multi-hit fire strike)
    - _Branch B (เพลิงเวทระเบิด - Pyroblast & Meteors)_:
      - Tier 1 (Lv.1): `skill_fireball` (Fireball - บอลเพลิงกาฬ, Explosive fire blast)
      - Tier 2 (Lv.10): `skill_inferno_blast` (Muspelheim Meteor - อุกกาบาตเพลิง, High elemental burst)
      - Tier 3 (Lv.20): `skill_dragon_breath` (Hellfire Dragon Breath - ลมหายใจมังกรเพลิง, Scorching wave)
    - _Capstone Ultimate (Lv.30, Requires Tier 3 in either branch)_:
      - `skill_ultimate_surtr_conflagration` (Surtr's Calamity - เพลิงผลาญพิภพเซิร์ท, Unstoppable hellfire)
  - **Wind (ธาตุลม)**:
    - _Branch A (วายุเร่งความเร็ว - Zephyr Speed & Evasion)_:
      - Tier 1 (Lv.1): `skill_wind_haste` (Zephyr Swiftness - มนตร์วายุเร่งความเร็ว, AGI +35%)
      - Tier 2 (Lv.10): `skill_shadow_evasion` (Mirage Step - ย่างก้าวภาพลวงตา, AGI +50%)
      - Tier 3 (Lv.20): `skill_tempest_celerity` (Tempest Flow - ปราณวายุไร้เงา, High-speed strike & AGI boost)
    - _Branch B (พายุกวาดล้าง - Aero Slices & Vortex)_:
      - Tier 1 (Lv.1): `gale_slash` (Gale Slash - ดาบวายุเชือดเฉือน, Piercing gale)
      - Tier 2 (Lv.10): `skill_cyclone_barrage` (Tornado Vortex - พายุหมุนกวาดล้าง, Heavy wind burst)
      - Tier 3 (Lv.20): `skill_sky_rending_strike` (Heaven's Cleaver - ดาบฟันนภา, High critical slash)
    - _Capstone Ultimate (Lv.30, Requires Tier 3 in either branch)_:
      - `skill_ultimate_odin_tempest` (Gungnir Windstorm - วายุสลาตันแห่งโอดิน, Furious tempest)

### 2.2 Unlock & Prerequisite Rules

1. **Level Requirement**: Hero's current level >= node's `requiredLevel`.
2. **Skill Points**: Hero must have >= node's `skillPointCost` (default 1).
3. **Prerequisite Skill**: If node specifies `requiredSkillId`, that prerequisite skill must already be in `hero.unlockedSkillIds`.
4. **Element Match**: Only nodes belonging to the Hero's assigned `Element` can be unlocked.
5. **No Double-Spending**: Already unlocked skills cannot be unlocked again.

### 2.3 Integration with 5-Slot Skill System

- When unlocked from the tree, the skill is added to `hero.unlockedSkillIds`.
- Auto-equip: If the Hero has an empty flexible slot (slots 1-4), the newly learned skill is automatically equipped for convenience.
- Slot Management: Players can freely equip or swap any unlocked skill into slots 1-4 via `SkillTreeManager.equipSkillToSlot`. Slot 0 remains the innate locked signature skill.

### 2.4 Server & Persistence

- SQLite database schema: `heroes` table stores `skill_points`, `unlocked_skill_ids` (JSON), and `skill_slots` (JSON).
- `HeroRepository.saveHeroState` and `getHeroFullState` persist and restore these fields.

### 2.5 UI & User Experience

- Header HUD button `btn-skill-tree` ("🌳 ทรีสกิล / Skill Tree") opens the modal.
- Dedicated deep module `SkillTreeModalController` (under 400 lines):
  - Displays available Skill Points (`⭐ N Skill Points Available`).
  - Side-by-side branch columns with visual connectors.
  - Interactive skill nodes with state indication: Locked, Unlockable (glowing golden button), and Learned (green checkmark).
  - Detailed skill tooltip / card showing Name, SP cost, category, power multiplier, and description.
  - Direct "Equip to Slot" (ติดตั้งลงช่องสกิล) modal interaction to assign learned skills to slots 1-4.
