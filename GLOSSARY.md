# Poktsonline

A 2D tile-based multiplayer online turn-based RPG inspired by TS Online mechanics set in an original fantasy universe.

## Language

**Overworld**:
The shared 2D grid-based map where players navigate, see other players, and encounter wild entities.
_Avoid_: World map, field, stage

**Hero**:
The primary character avatar created and directly controlled by a player.
_Avoid_: Avatar, player unit, main character

**Beast**:
A collectible creature in the world that can be captured, leveled up, and summoned to fight alongside the Hero.
_Avoid_: Pet, monster, general, pokemon

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
