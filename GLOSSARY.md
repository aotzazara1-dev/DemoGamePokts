# Poktsonline

A 2D tile-based multiplayer online turn-based RPG inspired by TS Online mechanics set in an original fantasy universe.

## Language

**Overworld**:
The shared 2D grid-based map where players navigate, see other players, and encounter wild entities.
_Avoid_: World map, field, stage

**Hero (Isekai Traveler / The Awakened)**:
The primary character avatar summoned from modern Earth into the Valhalla realm, awakening with a Divine Elemental Core and directly controlled by a player.
_Avoid_: Avatar, player unit, main character

**Account**:
The persistent credential record (either registered with username/password or provisioned as a Guest) that owns up to three Heroes.
_Avoid_: User, profile, player account, login

**Guest Account**:
A provisional Account identified by a persistent client-side token allowing immediate play without credentials, eligible for permanent linking to a username and password.
_Avoid_: Anonymous user, temp player, trial account

**Character Select**:
The pre-game interface where an authenticated Account views, creates, selects, or deletes their Heroes before entering the Overworld.
_Avoid_: Lobby, hero menu, character screen

**Hero Save State**:
The persistent authoritative database snapshot of a Hero's progression (Attributes, EXP, Stat Points, current Map, Tile position, Inventory, Gold, and Champion Roster).
_Avoid_: Savefile, character data, player backup

**Champion (Einherjar or God)**:
A legendary human warrior soul (Einherjar: e.g. Lu Bu, Sasaki Kojiro, Adam) or celestial deity (God: e.g. Thor, Zeus, Shiva, Buddha) who can be contracted, leveled up, and summoned into battle alongside the Hero.
_Avoid_: Pet, monster, general, pokemon

**Valkyrie Companion**:
A divine battle maiden (e.g. Brunhilde, Göll, Randgriz, Hrist) who forges a soul contract (Völundr) to grant specialized passive buffs, stat auras, and ultimate divine abilities to the party.
_Avoid_: Mascot, assist npc, fairy

**Roaming Mythological Entity**:
A visible wild mythological beast or rogue divine spirit roaming actively across wild Zones on the Overworld that can chase nearby Heroes and initiate combat upon collision.
_Avoid_: Wandering monster, world boss, mob on map

**Battle Instance**:
An isolated turn-based combat session between a team of Heroes/Beasts and enemy units.
_Avoid_: Match, arena, encounter room

**Active Beast**:
The single Beast deployed by a Hero to fight alongside them in a Battle Instance.
_Avoid_: Summon, current pet, primary monster

**Formation Grid**:
The 2x5 slot grid (Front Row and Back Row) assigned to each side during a Battle Instance.
_Avoid_: Battle board, field slots, battle matrix

**Front Row**:
The front line of 5 positions in the Formation Grid, which intercepts direct melee attacks aimed at the rear.
_Avoid_: Vanguard, frontline

**Back Row**:
The rear line of 5 positions in the Formation Grid, protected from direct melee attacks until the corresponding Front Row slot is vacant.
_Avoid_: Rearguard, backline

**Action Phase**:
The simultaneous time-limited window during combat where players select commands for their Hero and Beast.
_Avoid_: Turn phase, input window, plan phase

**Resolution Phase**:
The phase where battle actions execute in sequence based on agility and combo conditions.
_Avoid_: Execute phase, battle step

**Attribute**:
One of the six core numerical statistics (HP, SP, ATK, DEF, INT, AGI) governing combat capabilities of Heroes and Beasts.
_Avoid_: Stat, parameter, status value

**Element**:
The innate affinity of a Hero, Beast, or Skill belonging to one of four types: Earth, Water, Fire, or Wind.
_Avoid_: Type, school, aspect

**Elemental Advantage**:
The cyclic counter system where Earth beats Water, Water beats Fire, Fire beats Wind, and Wind beats Earth.
_Avoid_: Type matchup, elemental weakness

**Combo**:
A simultaneous cooperative attack triggered when units with closely synchronized AGI attack the same target in a single turn.
_Avoid_: Chain attack, link attack, team up

**Capture**:
A specialized combat action where a Hero attempts to tame and acquire an enemy wild Beast.
_Avoid_: Catch, recruit, tame, pokeball

**Zone**:
A marked region of the Overworld containing distinct environmental tiles, encounter tables, and step-based battle triggers.
_Avoid_: Area, biome, map sector

**Combat Action**:
One of six distinct battle commands (Attack, Skill, Defend, Capture, Flee, Item) selected during the Action Phase.
_Avoid_: Turn move, command, tactic

**Skill Tree**:
A branching progression path of elemental abilities unique to each of the four Elements.
_Avoid_: Talent tree, ability board, mastery

**Stat Point**:
A distributable point awarded upon leveling up that permanently increases a chosen Attribute.
_Avoid_: Ability point, attribute token, bonus stat

**Party**:
A cooperative group of up to five Heroes who travel together across the Overworld and enter Battle Instances as a united team.
_Avoid_: Team, squad, group

**Party Leader**:
The designated Hero controlling Overworld navigation for the entire Party while other members follow in column formation.
_Avoid_: Captain, host, party owner

**Reserve Beast**:
A carried Beast in a Hero's roster that is not currently deployed in combat but is available to be swapped into battle.
_Avoid_: Backup pet, benched monster, sub unit

**Swap**:
A tactical Combat Action allowing a Hero to withdraw their Active Beast and deploy a Reserve Beast during a Battle Instance.
_Avoid_: Switch, tag, substitute

**Jam**:
The action of an external Hero on the Overworld joining an active Battle Instance mid-combat to reinforce an ally team.
_Avoid_: Reinforce, assist, join in

**Inventory**:
The 20-slot grid storage container carried by a Hero holding stacked consumable items and currency.
_Avoid_: Bag, backpack, chest, storage

**Item**:
A distinct collectible possession carried in an Inventory (such as restorative consumables, combat scrolls, or utility goods).
_Avoid_: Prop, tool, consumable object

**Gold**:
The universal trade currency earned from defeating monsters or selling items.
_Avoid_: Money, coin, cash, credits

**Loot Table**:
The authoritative probability distribution mapping defeated wild enemies to rewarded Gold amounts and dropped items.
_Avoid_: Drop rate, reward list, monster loot

**Map**:
A distinct bounded 2D isometric grid environment with its own layout of obstacles, aesthetic tiles, Zones, and Portals.
_Avoid_: Stage, level, room, scene, world

**Portal**:
A designated interactive tile on the Overworld that teleports a Hero to a specified destination coordinate on another Map.
_Avoid_: Warp gate, door, exit, teleport pad

**Minimap**:
The radar heads-up display at the top-right corner of the Overworld visualizing map terrain, Hero coordinates, Portals, NPCs, and Roaming Beasts, supporting click-to-move pathfinding.
_Avoid_: Radar, sub-map, mini-view

**Chat Message**:
A textual communication payload transmitted over the Overworld network containing sender identity, channel type, message text, and timestamp.
_Avoid_: Talk, whisper, text, speech

**Speech Bubble**:
A temporary floating graphic container rendered above an entity's sprite in the Overworld displaying their recently spoken Chat Message before fading out.
_Avoid_: Text balloon, talk bubble, chat pop-up

**Chat Channel**:
The categorization route for Chat Messages (such as Map Chat broadcast to players in the current Map, or System Log notifications for combat, gold, and item events).
_Avoid_: Chat room, tab group, talk mode

**Equipment Slot**:
One of five wearable gear locations (`head`, `weapon`, `armor`, `boots`, `accessory`) present on both a Hero and their Roster Champions.
_Avoid_: Gear slot, body part, armor hole

**Equipment Item**:
An Item with a specific Equipment Slot requirement that permanently boosts combat Attributes when equipped onto a Hero or Champion.
_Avoid_: Armor piece, wearable prop, weapon item

**Völundr (Divine Armament)**:
A mythological or sacred weapon/armor soul-forged to empower mortals and gods with formidable Attribute bonuses.
_Avoid_: Enchanted weapon, holy relic, super gear

**Effective Attributes**:
The final combat statistics calculated by combining an entity's Base Attributes (from level and allocated Stat Points) with the cumulative Attribute modifiers of all equipped gear.
_Avoid_: Total stats, final power, adjusted attributes

**Paperdoll**:
The visual UI representation in Character and Roster modals displaying the five Equipment Slots around the character's avatar.
_Avoid_: Equipment screen, gear board, dressing room

**God File**:
An overgrown monolithic source file exceeding the project's tiered line limit (400/600 lines) or conflating multiple orthogonal responsibilities (Phaser lifecycle, networking, DOM, audio). Anti-pattern prohibited by ADR 0020.
_Avoid_: Giant class, mega file, all-in-one script

**Deep Module**:
A cohesive software module providing substantial functionality behind a narrow, simple interface at a clean seam (e.g., dedicated Modal Controllers, Input Managers, Network Bridges).
_Avoid_: Shallow module, helper dump, util spaghetti

**Graphify-First Navigation**:
The mandatory agent engineering rule requiring execution of `graphify query` or `graphify explain` prior to codebase exploration or structural modifications.
_Avoid_: Blind grep, brute-force file scanning, guessing file locations
