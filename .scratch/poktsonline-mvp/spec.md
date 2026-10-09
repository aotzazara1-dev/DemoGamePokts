# Spec: Poktsonline Core Gameplay and Battle Loop (MVP)

Status: ready-for-agent

## Problem Statement

Players longing for the classic tactical depth of TS Online—specifically its isometric world, turn-based 5v5 formation grid, agility-based turn order, cooperative combos, and creature capture mechanics—currently lack a modern, accessible web-based multiplayer game that captures this experience with original fantasy creatures.

## Solution

A full-stack web-based multiplayer RPG featuring:
1. An isometric 2.5D Overworld where players move on a grid and see each other in real-time.
2. Wild encounter Zones that trigger transitions into isolated Battle Instances.
3. A classic 2x5 Formation Grid turn-based combat system supporting 1 Hero + 1 Active Beast per player, 6 attributes, a 4-element cycle, simultaneous 30-second Action Phases, AGI-based resolution with synchronized Combos, and level-gated creature Captures.

## User Stories

1. As a player, I want to control my Hero on an isometric 2.5D Overworld grid using 4-directional or point-and-click movement, so that I can explore the world intuitively.
2. As a player, I want to see other online Heroes moving on the Overworld in real-time, so that the game feels alive and social.
3. As a player, I want to explore distinct Zones on the Overworld, so that I know where dangerous wild encounters can occur.
4. As a player walking through a wild Zone, I want each step to have a chance of triggering a random encounter, so that I am seamlessly transitioned into a Battle Instance.
5. As a player entering a Battle Instance, I want my Hero and my Active Beast positioned on our side of the 2x5 Formation Grid, so that our tactical layout is established.
6. As a player in combat, I want enemy Beasts positioned on their side of the 2x5 Formation Grid, so that I can evaluate their frontline and backline threats.
7. As a player in combat, I want the Front Row to intercept direct melee attacks, so that units in the Back Row are shielded from harm until the Front Row slot ahead of them is cleared.
8. As a player in combat, I want a 30-second Action Phase where I select Combat Actions for both my Hero and my Active Beast, so that turns are brisk and require tactical planning.
9. As a player during the Action Phase, I want to choose from six Combat Actions (Attack, Skill, Defend, Capture, Flee, Item), so that I have the full tactical toolkit available.
10. As a player selecting the Attack Combat Action, I want to target a valid enemy slot on the opposing Formation Grid, so that my unit attacks that target during resolution.
11. As a player selecting the Skill Combat Action, I want to choose an elemental ability that consumes SP, so that I can exploit Elemental Advantages or support my team.
12. As a player selecting the Defend Combat Action, I want my unit to take 50% reduced damage from incoming attacks during the Resolution Phase, so that I can protect vulnerable units.
13. As a player selecting the Capture Combat Action with my Hero, I want to target an enemy wild Beast, so that I can attempt to tame it and add it to my roster.
14. As a player selecting the Flee Combat Action, I want my escape chance to be evaluated against the enemies' AGI, so that I can disengage from unwinnable fights.
15. As a player entering the Resolution Phase, I want actions to execute in descending order of unit AGI, so that high-speed units act before low-speed units.
16. As a player coordinating attacks, I want my Hero and Active Beast to trigger a Combo attack if they target the same enemy and their AGI difference is 15 or less, so that their combined attacks deal massive cooperative damage (1.5x - 2.0x).
17. As a player attacking with an Elemental Advantage (Earth > Water > Fire > Wind > Earth), I want to deal 1.5x damage, so that matching elements against opposing weaknesses is strategically rewarded.
18. As a player attacking against an elemental disadvantage, I want damage reduced to 0.7x, so that I am discouraged from using mismatched elements.
19. As a player attempting to Capture a Beast, I want the attempt to automatically fail if my Hero's Level is lower than the target Beast's Level, so that high-level Beasts cannot be captured prematurely.
20. As a player attempting to Capture an eligible Beast, I want the capture chance to increase as the target Beast's remaining HP decreases, so that weakening the target before capture is an essential tactic.
21. As a player, when a Capture is successful, I want the wild Beast to be immediately added to my captured Beasts collection and removed from combat, so that I expand my team.
22. As a player, when all opposing combatants are defeated or captured, I want to receive victory notification and return seamlessly to the Overworld at my previous position.
23. As a player, when all friendly combatants on my team are defeated, I want to be transported back to an Overworld safe spawn point with restored HP, so that I can recover and try again.

## Implementation Decisions

### 1. Architectural Structure
- Monorepo containing three packages:
  - `packages/shared`: Pure TypeScript definitions, attribute models, elemental cycle tables, damage and capture formulas, and deterministic resolution engines.
  - `packages/server`: Node.js server using Colyseus for authoritative game state, room management (`OverworldRoom` and `BattleRoom`), and combat validation.
  - `packages/client`: Browser client using Vite and Phaser 3 with an isometric 2.5D scene pipeline.

### 2. Deep Module: `BattleEngine` (Shared/Server)
- Located in `packages/shared/src/battle/` and imported by `packages/server`.
- Exposes a single, deep, deterministic interface:
  `resolveTurn(state: BattleState, actions: TeamActionsMap, rng?: RandomNumberGenerator): TurnResolutionResult`
- Invariants:
  - Validates all unit actions against current formation status (e.g. Front Row blocking rules).
  - Sorts active combatants by AGI descending.
  - Detects and groups valid Combo actions where allied units target the identical enemy and `|unitA.agi - unitB.agi| <= 15`.
  - Computes damage using `Math.max(1, (atk * 2) - def) * elementalMultiplier * comboMultiplier`.
  - Evaluates Capture checks: requires `hero.level >= target.level`, calculating probability inversely proportional to `target.currentHp / target.maxHp`.
  - Produces an immutable, stepped log of events (animations, damage numbers, status effects, deaths, captures) that the client plays sequentially.

### 3. Deep Module: `OverworldEngine` (Shared/Server)
- Located in `packages/shared/src/overworld/`.
- Exposes:
  `movePlayer(state: PlayerOverworldState, targetTile: TileCoord, zoneConfig: ZoneDefinition, rng?: RandomNumberGenerator): MovementResult`
- Computes tile walkability, grid distance, and evaluates step-based encounter probability when moving inside wild Zones.

### 4. Room Management (Server)
- `OverworldRoom`: Broadcasts player positions and movement vectors across connected clients.
- When an encounter triggers, the server spawns an isolated `BattleRoom`, moves the player's session into the battle room, and suspends their Overworld presence.
- When combat ends (victory, defeat, or escape), the `BattleRoom` disposes and the player returns to `OverworldRoom`.

### 5. In-Memory Data and Seed Definitions
- Mock seed files in JSON defining:
  - Starting Beasts with initial attributes (HP, SP, ATK, DEF, INT, AGI) and innate Elements.
  - Basic Skills per element (Earth: Rock Throw, Water: Aqua Jet, Fire: Flame Strike, Wind: Gale Slash).
  - Zone encounter tables specifying wild Beast pools and level ranges.

## Testing Decisions

- **Testing Principles**: Tests must exclusively exercise external behavior through high-level module interfaces, never private state or internal helper functions.
- **`BattleEngine` Test Suite (`packages/shared/test/battle-engine.test.ts`)**:
  - Initiative test: Verifies that combatants execute in exact AGI order.
  - Frontline protection test: Verifies that a Back Row unit cannot be targeted by direct melee attacks while its Front Row guard is alive.
  - Elemental cycle test: Verifies that Earth > Water > Fire > Wind > Earth correctly applies 1.5x advantage and 0.7x disadvantage multipliers.
  - Combo trigger test: Verifies that two allied units with $\le 15$ AGI difference targeting the same enemy execute a combined attack with increased damage; verifies that $> 15$ AGI difference executes separately.
  - Capture logic test: Verifies that `hero.level < beast.level` always fails; verifies that lower target HP yields higher capture success rate.
  - Defend action test: Verifies that incoming damage is reduced by 50%.
- **`OverworldEngine` Test Suite (`packages/shared/test/overworld-engine.test.ts`)**:
  - Grid boundary and obstacle collision tests.
  - Zone step-count encounter probability triggering with seeded RNG.

## Out of Scope

- User authentication, persistent database storage, and account registration (in-memory sessions for MVP).
- Guild systems, player trading, marketplace stalls, and auction houses.
- Chat channels, friend lists, and party matchmaking queues.
- Quest dialogue trees, NPC scripting engines, and world lore cutscenes.
- Sound effects, background music, and particle shader effects.
- PvP arenas and dueling between players.

## Further Notes

- Once the core `BattleEngine` is fully tested with unit tests, the server and client wrappers can be built rapidly against the known-good game engine.
