# ADR 0008: Four Branching Elemental Skill Trees

## Context

In TS Online, characters develop distinct tactical identities based on their core Element (Earth, Water, Fire, Wind). While champions and beasts carry immutable innate Signature Skills and learn flexible abilities via Skill Tomes (ADR 0021), the Hero (The Awakened / Isekai Traveler) commands a Divine Elemental Core that unlocks advanced martial and magical techniques through an elemental progression tree.

## Decision

We structure the Hero's abilities into specialized 2-branch Skill Trees per Element, featuring Tier 1 to Tier 3 linear progressions along each branch, culminating in a shared Capstone Ultimate at Level 30:

1. **Earth (ธาตุดิน)**:
   - _Branch A (ศิลาพิทักษ์ - Sentinel Ward)_: Focuses on physical defense buffs (`skill_earth_shield` Terra Ward DEF +35%), heavy damage reduction barrier (`skill_stone_wall` Stone Rampart), and cellular regeneration (`skill_clay_regeneration` Earthen Vigor).
   - _Branch B (ธรณีทำลายล้าง - Cataclysmic Shatter)_: Focuses on crushing physical and earth strikes (`rock_throw`, `skill_quakestrike` Cataclysm Tremor, `skill_earth_splitter` Continent Splitter).
   - _Capstone Ultimate_: `skill_ultimate_gaia_wrath` (Wrath of Gaia - มหาพิโรธพระแม่ธรณี).

2. **Water (ธาตุน้ำ)**:
   - _Branch A (ธารน้ำทิพย์ - Sacred Spring Recovery)_: Specializes in single ally healing (`skill_healing_spring`), area-wide cleansing (`skill_purifying_wave` Cleansing Tide), and combat resurrection (`skill_ocean_revival` Nectar of Life).
   - _Branch B (เหมันต์เยือกแข็ง - Glacial Frost & Torrent)_: Specializes in high-pressure torrents and cryogenic freezing strikes (`aqua_jet`, `skill_frost_breath`, `skill_glacial_spike` Absolute Zero Spike).
   - _Capstone Ultimate_: `skill_ultimate_poseidon_deluge` (Leviathan Tsunami - มหาคลื่นกลืนสมุทร).

3. **Fire (ธาตุไฟ)**:
   - _Branch A (คมดาบเพลิงกายภาพ - Blazing Blade & Might)_: Delivers scorching physical blade techniques (`flame_strike`), internal combat fury buffs (`skill_raging_flame` Blazing Might ATK +30%), and high-crit multi-slashes (`skill_crimson_lotus`).
   - _Branch B (เพลิงเวทระเบิด - Pyroblast & Meteors)_: Channels high magical destructive bursts (`skill_fireball`, `skill_inferno_blast` Muspelheim Meteor, `skill_dragon_breath` Hellfire Dragon Breath).
   - _Capstone Ultimate_: `skill_ultimate_surtr_conflagration` (Surtr's Calamity - เพลิงผลาญพิภพเซิร์ท).

4. **Wind (ธาตุลม)**:
   - _Branch A (วายุเร่งความเร็ว - Zephyr Speed & Evasion)_: Maximizes initiative and team synchronization (`skill_wind_haste` Zephyr Swiftness AGI +35%), mirage evasion (`skill_shadow_evasion` Mirage Step AGI +50%), and zero-lag agility strikes (`skill_tempest_celerity` Tempest Flow).
   - _Branch B (พายุกวาดล้าง - Aero Slices & Vortex)_: Executes sharp wind blades that bypass defenses (`gale_slash`, `skill_cyclone_barrage` Tornado Vortex, `skill_sky_rending_strike` Heaven's Cleaver).
   - _Capstone Ultimate_: `skill_ultimate_odin_tempest` (Gungnir Windstorm - วายุสลาตันแห่งโอดิน).

## Progression & Skill Points

- **Skill Points Gain**: The Hero gains `+1 Skill Point` upon every level-up.
- **Node Cost**: Each skill node requires 1 Skill Point and has a minimum level requirement (Tier 1: Lv.1, Tier 2: Lv.10, Tier 3: Lv.20, Ultimate: Lv.30).
- **Prerequisites**: Nodes along a branch require the preceding Tier to be unlocked first. Capstone Ultimates require completing Tier 3 of either branch.
- **Integration with 5-Slot Combat Grid**: Learned skills populate the Hero's `unlockedSkillIds` pool. Unlocked skills can be freely equipped or swapped into the Hero's flexible slots 1–4. Slot 0 remains the innate core signature skill.
