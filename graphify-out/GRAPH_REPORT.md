# Graph Report - Poktsonline  (2026-10-09)

## Corpus Check
- 158 files · ~175,199 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .css 12, (none) 5, .bat 4)

## Summary
- 1086 nodes · 2612 edges · 83 communities (48 shown, 35 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 307 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a059b0f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/src/index.ts
- AuthService
- BattleScene.ts
- InventoryState
- OverworldEntityManager
- OverworldNetwork
- soundManager
- OverworldRoom.ts
- OverworldScene.ts
- client/tsconfig.json
- OverworldScene
- BattleRoom.ts
- Combatant
- ChatController
- battle-engine.ts
- PlayerNetworkState
- RoamingBeastManager
- src/types.ts
- .create
- compilerOptions
- package.json
- TileCoord
- client/package.json
- BattleEngine
- OverworldRoom
- CharacterModalController
- Element
- RosterModalController
- CharacterSelectModalController
- .movePlayer
- NPCDefinition
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- 2. Requirements
- 3. Architecture & Data Structures
- shared/src/index.ts
- server/package.json
- .sendChatMessage
- server/tsconfig.json
- shared/tsconfig.json
- Key Navigation Pointers
- Domain Docs
- Issue tracker: Local Markdown
- LootEngine
- AccountRepository
- HeroRepository.ts
- DatabaseEngine
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation
- overworld-engine.test.ts
- Poktsonline
- character_poses.md
- 0001-web-tech-stack.md
- 0002-phaser-and-colyseus.md
- 0003-classic-combat-rules.md
- 0004-monorepo-workspace-structure.md
- 0005-capture-and-encounter-mechanics.md
- 0006-damage-and-combo-formulas.md
- 0007-in-memory-persistence-mvp.md
- 0008-elemental-skill-trees.md
- 0009-manual-stat-allocation.md
- 0010-party-system-and-coop-combat.md
- 0011-beast-roster-and-reserve-swapping.md
- 0012-inventory-and-item-system.md
- 0013-multi-map-and-portals.md
- 0015-authentication-and-account-persistence.md
- triage-labels.md
- 01-sqlite-engine-and-schemas.md
- 01-scaffold-monorepo-core-formulas.md
- 05-phaser-isometric-overworld-client.md
- 06-phaser-battle-scene-combat-hud.md
- 05-full-system-verification-and-smoke-test.md
- HeroRepository
- 2. Detailed Requirements
- 18. Mock Boundaries and Testing Conventions

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 61 edges
2. `OverworldScene` - 54 edges
3. `Element` - 46 edges
4. `BattleScene` - 38 edges
5. `MapConfig` - 35 edges
6. `InventoryState` - 34 edges
7. `OverworldRoom` - 33 edges
8. `OverworldEntityManager` - 31 edges
9. `vitest` - 29 edges
10. `soundManager` - 29 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `1. Seams Tested` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts
- `Solution` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts
- `3. Server Multiplayer Synchronization (`@poktsonline/server`)` --references--> `PlayerNetworkState`  [INFERRED]
  .scratch/multi-map-portals/spec.md → packages/server/src/schema/OverworldState.ts

## Import Cycles
- None detected.

## Communities (83 total, 35 thin omitted)

### Community 0 - "server/src/index.ts"
Cohesion: 0.14
Nodes (11): createAuthRouter(), toAccountSummary(), validateCredentials(), AuthenticatedRequest, PasswordUtils, AccountRecord, @colyseus/ws-transport, cors (+3 more)

### Community 1 - "AuthService"
Cohesion: 0.13
Nodes (7): AuthService, AuthModalCallbacks, AuthModalController, AccountSummary, AuthSessionResponse, CreateHeroPayload, 02: HTTP Authentication Endpoints and Client Auth Modal

### Community 2 - "BattleScene.ts"
Cohesion: 0.05
Nodes (18): getValidTargets(), BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene, BattleEvent, BattleState, CombatAction (+10 more)

### Community 3 - "InventoryState"
Cohesion: 0.06
Nodes (23): InventoryModalCallbacks, InventoryModalController, ShopModalCallbacks, ShopModalController, ShopTab, InventoryManager, getItemDefinition(), getItemIcon() (+15 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.05
Nodes (29): 1. Parameters & Primitive Types, 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards, 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision (+21 more)

### Community 6 - "soundManager"
Cohesion: 0.11
Nodes (4): soundManager, config, game, soundBtn

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.15
Nodes (9): ChatMessageCallback, EncounterCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, SyncHeroStatePayload, MoveMessagePayload (+1 more)

### Community 8 - "OverworldScene.ts"
Cohesion: 0.12
Nodes (3): HeroService, CharacterSelectCallbacks, HeroSummary

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 11 - "BattleRoom.ts"
Cohesion: 0.18
Nodes (4): BattleRoomOptions, BattleRoomState, CombatantNetworkState, TeamFormation

### Community 12 - "Combatant"
Cohesion: 0.19
Nodes (8): CharacterModalCallbacks, DebugToolbarCallbacks, RosterModalCallbacks, LevelUpResult, ProgressionEngine, StatAllocationResult, Attributes, Combatant

### Community 14 - "battle-engine.ts"
Cohesion: 0.15
Nodes (10): ELEMENTAL_SKILLS, SkillDefinition, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleOutcome, TeamActionsMap (+2 more)

### Community 15 - "PlayerNetworkState"
Cohesion: 0.07
Nodes (25): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, PlayerNetworkState, RoamingBeastNetworkState, @colyseus/schema, 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567) (+17 more)

### Community 16 - "RoamingBeastManager"
Cohesion: 0.29
Nodes (5): RoamingBeastManager, RoamingBeastEntity, 01-shared-roaming-beast-types, Answer, Description

### Community 17 - "src/types.ts"
Cohesion: 0.24
Nodes (9): PathfindingOptions, BattleEventType, EncounterPoolEntry, MapConfig, MapTheme, PortalTransitionMessage, ZoneBounds, ZoneDefinition (+1 more)

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (23): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+15 more)

### Community 21 - "TileCoord"
Cohesion: 0.14
Nodes (8): MinimapController, MinimapControllerOptions, MinimapEntities, MinimapEntity, TileCoord, Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 22 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 23 - "BattleEngine"
Cohesion: 0.11
Nodes (18): BattleEngine, Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification, 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 3. Deep Module: `OverworldEngine` (Shared/Server) (+10 more)

### Community 24 - "OverworldRoom"
Cohesion: 0.19
Nodes (6): determineDirection(), OverworldRoom, HeroFullSaveState, 04: Colyseus Overworld Room Handshake and Full State Persistence, Overview, Spec: Multi-Map World Expansion and Portals

### Community 26 - "Element"
Cohesion: 0.18
Nodes (9): RosterManager, Element, Earth, Fire, Water, Wind, FormationSlot, PlayerRosterState (+1 more)

### Community 29 - ".movePlayer"
Cohesion: 0.13
Nodes (15): MovementResult, PlayerOverworldState, PortalDefinition, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`), 2. Overworld Engine Portal Resolution (`@poktsonline/shared`) (+7 more)

### Community 30 - "NPCDefinition"
Cohesion: 0.29
Nodes (5): OverworldEntityManagerConfig, DialogueModalCallbacks, DialogueModalController, NPCDefinition, NPCDialogueOption

### Community 31 - "BattleRoom"
Cohesion: 0.14
Nodes (5): BattleRoom, Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks, 04: Colyseus Authoritative Server Rooms

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

### Community 34 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js

### Community 35 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, supertest, @types/cors, @types/express, @types/node, @types/sql.js, @types/supertest

### Community 36 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "shared/src/index.ts"
Cohesion: 0.21
Nodes (8): ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload, Context, Requirements, Ticket 01: Shared Chat Types and Server Overworld Room Broadcast, 1. Shared Types & Network Schema (`@poktsonline/shared`)

### Community 40 - "server/package.json"
Cohesion: 0.12
Nodes (16): @poktsonline/shared, main, name, private, scripts, build, start, test (+8 more)

### Community 41 - ".sendChatMessage"
Cohesion: 0.13
Nodes (13): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 2. Server Authority & Broadcasting (`packages/server`), 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`), 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`), 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`), Acceptance Criteria (+5 more)

### Community 42 - "server/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 43 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 44 - "Key Navigation Pointers"
Cohesion: 0.25
Nodes (6): Agent skills, Codebase Navigation & Knowledge Graph, Domain docs, Issue tracker, Key Navigation Pointers, Triage labels

### Community 45 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 46 - "Issue tracker: Local Markdown"
Cohesion: 0.33
Nodes (5): Conventions, Issue tracker: Local Markdown, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 47 - "LootEngine"
Cohesion: 0.20
Nodes (8): LootEngine, LootReward, 1. Overview & Goals, 2. Domain Models & Types (@poktsonline/shared), 3. Authoritative Combat Integration (@poktsonline/server), 4. Client UI & Interactions (@poktsonline/client), 5. Verification, Feature Specification: Inventory & Consumable Item System

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation"
Cohesion: 0.21
Nodes (6): Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective, Tasks, 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 55 - "overworld-engine.test.ts"
Cohesion: 0.27
Nodes (4): DEFAULT_OVERWORLD_MAP, getMapConfig(), MAP_DATABASE, OverworldEngine

### Community 79 - "HeroRepository"
Cohesion: 0.31
Nodes (4): createHeroRouter(), HeroRepository, createServer(), 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 80 - "2. Detailed Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Shared Data & Types (`@poktsonline/shared`), 2.2 Server Persistence & World Authority (`@poktsonline/server`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish, 2. Detailed Requirements, Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

## Knowledge Gaps
- **21 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 365 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `AuthService`, `BattleScene.ts`, `InventoryState`, `OverworldRoom.ts`, `OverworldScene.ts`, `BattleRoom.ts`, `battle-engine.ts`, `RoamingBeastManager`, `src/types.ts`, `.create`, `OverworldRoom`, `CharacterModalController`, `Element`, `RosterModalController`, `BattleRoom`, `3. Architecture & Data Structures`, `LootEngine`, `HeroRepository.ts`, `Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation`, `overworld-engine.test.ts`, `.setupUIControllers`, `HeroRepository`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.135632183908046 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `AuthService`, `BattleScene.ts`, `InventoryState`, `OverworldEntityManager`, `OverworldNetwork`, `soundManager`, `OverworldScene.ts`, `ChatController`, `src/types.ts`, `.create`, `TileCoord`, `CharacterModalController`, `Element`, `RosterModalController`, `CharacterSelectModalController`, `NPCDefinition`, `2. Requirements`, `3. Architecture & Data Structures`, `HeroRepository.ts`, `.setupUIControllers`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `AuthService` be split into smaller, more focused modules?**
  _Cohesion score 0.13368983957219252 - nodes in this community are weakly interconnected._