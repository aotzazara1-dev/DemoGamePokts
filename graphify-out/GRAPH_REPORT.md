# Graph Report - Poktsonline  (2026-10-09)

## Corpus Check
- 157 files · ~174,977 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .css 12, .bat 4, (none) 1)

## Summary
- 1071 nodes · 2596 edges · 78 communities (50 shown, 28 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 305 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a0d9fdb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/src/index.ts
- AuthModalController
- BattleScene
- BattleScene.ts
- OverworldEntityManager
- OverworldNetwork
- soundManager
- OverworldRoom.ts
- OverworldScene.ts
- client/tsconfig.json
- OverworldScene
- BattleRoom.ts
- shared/src/index.ts
- ChatController
- battle-engine.ts
- PlayerNetworkState
- MapConfig
- src/types.ts
- .create
- compilerOptions
- package.json
- TileCoord
- OverworldRenderer
- OverworldEngine
- OverworldRoom
- Combatant
- Element
- PlayerRosterState
- CharacterSelectModalController
- PortalDefinition
- NPCDefinition
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- .movePlayer
- 3. Architecture & Data Structures
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- AuthService
- HeroSummary
- server/tsconfig.json
- shared/tsconfig.json
- Agent skills
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- Coding Standards
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- 03-server-encounter-trigger-and-respawn
- 04-client-roaming-beast-renderer-and-interaction
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

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 61 edges
2. `OverworldScene` - 54 edges
3. `Element` - 46 edges
4. `BattleScene` - 38 edges
5. `MapConfig` - 35 edges
6. `InventoryState` - 34 edges
7. `OverworldRoom` - 32 edges
8. `OverworldEntityManager` - 31 edges
9. `vitest` - 29 edges
10. `soundManager` - 29 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Objective` --references--> `BattleRoom`  [INFERRED]
  .scratch/level-progression/issues/02-battle-room-exp-rewards.md → packages/server/src/rooms/BattleRoom.ts
- `1. Seams Tested` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts
- `Solution` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts

## Import Cycles
- None detected.

## Communities (78 total, 28 thin omitted)

### Community 0 - "server/src/index.ts"
Cohesion: 0.06
Nodes (35): Key Navigation Pointers, @poktsonline/shared, main, name, private, scripts, build, start (+27 more)

### Community 1 - "AuthModalController"
Cohesion: 0.22
Nodes (3): AuthModalController, AuthSessionResponse, 02: HTTP Authentication Endpoints and Client Auth Modal

### Community 2 - "BattleScene"
Cohesion: 0.06
Nodes (16): getValidTargets(), BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene, BattleEvent, CombatAction, CombatActionType (+8 more)

### Community 3 - "BattleScene.ts"
Cohesion: 0.06
Nodes (23): InventoryModalCallbacks, InventoryModalController, ShopModalCallbacks, ShopModalController, ShopTab, InventoryManager, getItemDefinition(), getItemIcon() (+15 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.11
Nodes (11): 1. Parameters & Primitive Types, OverworldEntityManager, rectContains(), PlayerNetData, getIsometricDepth(), IsometricConfig, IsometricGrid, IsoTileCoord (+3 more)

### Community 6 - "soundManager"
Cohesion: 0.05
Nodes (24): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+16 more)

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.13
Nodes (10): ChatMessageCallback, EncounterCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, SyncHeroStatePayload, SendChatMessagePayload (+2 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.22
Nodes (3): OverworldScene, findPath(), 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 11 - "BattleRoom.ts"
Cohesion: 0.13
Nodes (7): BattleRoomOptions, BattleEngine, BattleState, ItemType, TeamActionsMap, TeamFormation, 02: Deep BattleEngine and Turn Resolution

### Community 12 - "shared/src/index.ts"
Cohesion: 0.18
Nodes (5): CharacterModalCallbacks, MinimapControllerOptions, MinimapEntities, MinimapEntity, vitest

### Community 13 - "ChatController"
Cohesion: 0.06
Nodes (28): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative (+20 more)

### Community 14 - "battle-engine.ts"
Cohesion: 0.18
Nodes (7): ELEMENTAL_SKILLS, SkillDefinition, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), TurnResolutionResult

### Community 15 - "PlayerNetworkState"
Cohesion: 0.13
Nodes (12): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, PlayerNetworkState, RoamingBeastNetworkState, @colyseus/schema, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements (+4 more)

### Community 16 - "MapConfig"
Cohesion: 0.22
Nodes (9): PathfindingOptions, RoamingBeastManager, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition, 01-shared-roaming-beast-types, Answer (+1 more)

### Community 17 - "src/types.ts"
Cohesion: 0.18
Nodes (10): LootEngine, Attributes, BattleEventType, BattleOutcome, LootReward, MapTheme, PortalTransitionMessage, ZoneBounds (+2 more)

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, name, private, scripts, build, client (+6 more)

### Community 21 - "TileCoord"
Cohesion: 0.16
Nodes (5): MinimapController, TileCoord, Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 23 - "OverworldEngine"
Cohesion: 0.12
Nodes (15): OverworldEngine, 04: Colyseus Authoritative Server Rooms, 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 3. Deep Module: `OverworldEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Further Notes (+7 more)

### Community 24 - "OverworldRoom"
Cohesion: 0.33
Nodes (4): determineDirection(), OverworldRoom, HeroFullSaveState, getMapConfig()

### Community 25 - "Combatant"
Cohesion: 0.23
Nodes (5): CharacterModalController, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant

### Community 26 - "Element"
Cohesion: 0.17
Nodes (8): OverworldRendererConfig, CreateHeroPayload, Direction, Element, Earth, Fire, Water, Wind

### Community 27 - "PlayerRosterState"
Cohesion: 0.08
Nodes (17): DebugToolbarCallbacks, RosterModalCallbacks, RosterModalController, RosterManager, FormationSlot, PlayerRosterState, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective (+9 more)

### Community 29 - "PortalDefinition"
Cohesion: 0.16
Nodes (13): OverworldEntityManagerConfig, MovementResult, PortalDefinition, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`), 2. Overworld Engine Portal Resolution (`@poktsonline/shared`) (+5 more)

### Community 30 - "NPCDefinition"
Cohesion: 0.29
Nodes (4): DialogueModalCallbacks, DialogueModalController, NPCDefinition, NPCDialogueOption

### Community 31 - "BattleRoom"
Cohesion: 0.18
Nodes (3): BattleRoom, BattleRoomState, CombatantNetworkState

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

### Community 36 - ".movePlayer"
Cohesion: 0.13
Nodes (11): PlayerOverworldState, 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing, Answer, Description, 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction (+3 more)

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.14
Nodes (13): 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567), 2. Prior Art, 4. Server Colyseus Room Handshake & State Loading, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Implementation Decisions (+5 more)

### Community 40 - "AuthService"
Cohesion: 0.27
Nodes (3): AuthService, AuthModalCallbacks, AccountSummary

### Community 41 - "HeroSummary"
Cohesion: 0.35
Nodes (3): HeroService, CharacterSelectCallbacks, HeroSummary

### Community 42 - "server/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 43 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 44 - "Agent skills"
Cohesion: 0.29
Nodes (5): Agent skills, Codebase Navigation & Knowledge Graph (Graphify), Domain docs, Issue tracker, Triage labels

### Community 45 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 46 - "Issue tracker: Local Markdown"
Cohesion: 0.33
Nodes (5): Conventions, Issue tracker: Local Markdown, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 47 - "Feature Specification: Inventory & Consumable Item System"
Cohesion: 0.33
Nodes (5): 1. Overview & Goals, 2. Domain Models & Types (@poktsonline/shared), 3. Authoritative Combat Integration (@poktsonline/server), 4. Client UI & Interactions (@poktsonline/client), Feature Specification: Inventory & Consumable Item System

### Community 48 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 49 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 50 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "03-server-encounter-trigger-and-respawn"
Cohesion: 0.50
Nodes (3): 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 55 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

## Knowledge Gaps
- **18 isolated node(s):** `typescript`, `@poktsonline/shared`, `happy-dom`, `vite`, `../../tsconfig.json` (+13 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 352 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `server/src/index.ts`, `BattleScene`, `BattleScene.ts`, `3. Architecture & Data Structures`, `OverworldRoom.ts`, `OverworldScene.ts`, `BattleRoom.ts`, `shared/src/index.ts`, `battle-engine.ts`, `MapConfig`, `src/types.ts`, `.create`, `03-server-encounter-trigger-and-respawn`, `OverworldRoom`, `Element`, `PlayerRosterState`, `BattleRoom`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `typescript`, `@poktsonline/shared`, `happy-dom` to the rest of the system?**
  _18 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05553923009109609 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `AuthModalController`, `BattleScene`, `BattleScene.ts`, `OverworldEntityManager`, `OverworldNetwork`, `soundManager`, `OverworldRoom.ts`, `OverworldScene.ts`, `ChatController`, `MapConfig`, `.create`, `TileCoord`, `OverworldRenderer`, `Combatant`, `Element`, `PlayerRosterState`, `CharacterSelectModalController`, `NPCDefinition`, `.movePlayer`, `3. Architecture & Data Structures`, `HeroSummary`, `04-client-roaming-beast-renderer-and-interaction`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `BattleScene` be split into smaller, more focused modules?**
  _Cohesion score 0.06328320802005012 - nodes in this community are weakly interconnected._