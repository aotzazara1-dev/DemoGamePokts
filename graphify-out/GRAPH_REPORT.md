# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 170 files · ~186,489 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 13, (none) 5, .bat 4)

## Summary
- 1178 nodes · 2907 edges · 102 communities (67 shown, 35 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 357 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0efe71ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/src/index.ts
- AuthService
- BattleScene
- EquipmentManager
- OverworldEntityManager
- .setupUIControllers
- soundManager
- OverworldRoom.ts
- OverworldScene.ts
- client/tsconfig.json
- OverworldScene
- BattleScene.ts
- RosterModalController.ts
- ChatController
- src/types.ts
- RoamingBeastNetworkState
- InventoryModalController
- OverworldRenderer
- AuthModalController
- compilerOptions
- package.json
- TileCoord
- PlayerNetworkState
- Spec: Poktsonline Core Gameplay and Battle Loop (MVP)
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- BattleNetwork
- .create
- PlayerRosterState
- BattleRoom.ts
- MapConfig
- NPCDefinition
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- OverworldRoom
- server/package.json
- .sendChatMessage
- server/tsconfig.json
- shared/tsconfig.json
- Key Navigation Pointers
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- BattleEngine
- shared/src/index.ts
- Implementation Decisions
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- Combatant
- OverworldEngine
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
- Coding Standards
- HeroRepository
- EquipmentModalController
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- 04-client-roaming-beast-renderer-and-interaction
- AccountRepository
- CharacterSelectModalController
- getItemDefinition
- .movePlayer
- PortalDefinition
- InventoryState
- isometric.ts
- DatabaseEngine
- 02: Equipment Manager and Stat Calculation
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- 01: Shared Equipment Types and Catalog
- Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling
- Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats
- Issue 01: Inventory Domain Model, InventoryManager & LootEngine
- Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations
- Requirements
- Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions
- 03-server-encounter-trigger-and-respawn

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 70 edges
2. `OverworldScene` - 55 edges
3. `Element` - 47 edges
4. `InventoryState` - 44 edges
5. `BattleScene` - 38 edges
6. `getItemDefinition()` - 38 edges
7. `OverworldRoom` - 37 edges
8. `InventoryModalController` - 35 edges
9. `MapConfig` - 35 edges
10. `vitest` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Description` --references--> `BattleScene`  [INFERRED]
  .scratch/inventory-system/issues/04-battle-scene-item-hud-and-qa-toolbar.md → packages/client/src/scenes/BattleScene.ts
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Tasks` --references--> `InventoryModalController`  [INFERRED]
  .scratch/inventory-system/issues/03-inventory-modal-controller-and-styling.md → packages/client/src/ui/InventoryModalController.ts
- `Requirements` --references--> `InventoryModalController`  [INFERRED]
  .scratch/multi-map-portals/issues/03-client-tilemap-theming-portal-rendering-and-transitions.md → packages/client/src/ui/InventoryModalController.ts

## Import Cycles
- None detected.

## Communities (102 total, 35 thin omitted)

### Community 0 - "server/src/index.ts"
Cohesion: 0.15
Nodes (8): toAccountSummary(), validateCredentials(), AuthenticatedRequest, AccountRecord, @colyseus/ws-transport, cors, express, supertest

### Community 1 - "AuthService"
Cohesion: 0.17
Nodes (6): AuthService, HeroService, AuthModalCallbacks, CharacterSelectCallbacks, AccountSummary, HeroSummary

### Community 3 - "EquipmentManager"
Cohesion: 0.16
Nodes (14): EquipmentModalCallbacks, RosterModalCallbacks, EquipmentManager, ITEM_DATABASE, Attributes, EntityEquipment, EquipmentSlot, EquipmentStats (+6 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.18
Nodes (5): OverworldEntityManager, rectContains(), PlayerNetData, getIsometricDepth(), isoToScreen()

### Community 6 - "soundManager"
Cohesion: 0.05
Nodes (24): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+16 more)

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.11
Nodes (17): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, ChatControllerOptions (+9 more)

### Community 8 - "OverworldScene.ts"
Cohesion: 0.10
Nodes (3): DEFAULT_OVERWORLD_MAP, getMapConfig(), MAP_DATABASE

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.22
Nodes (3): OverworldScene, findPath(), 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 11 - "BattleScene.ts"
Cohesion: 0.15
Nodes (3): BattleState, CombatActionType, ItemType

### Community 13 - "ChatController"
Cohesion: 0.13
Nodes (8): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status, ChatController

### Community 14 - "src/types.ts"
Cohesion: 0.11
Nodes (17): ELEMENTAL_SKILLS, SkillDefinition, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleEvent, BattleEventType (+9 more)

### Community 15 - "RoamingBeastNetworkState"
Cohesion: 0.21
Nodes (7): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, @colyseus/schema, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description

### Community 18 - "AuthModalController"
Cohesion: 0.22
Nodes (3): AuthModalController, AuthSessionResponse, 02: HTTP Authentication Endpoints and Client Auth Modal

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (23): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+15 more)

### Community 22 - "PlayerNetworkState"
Cohesion: 0.25
Nodes (5): PlayerNetworkState, 04: Colyseus Overworld Room Handshake and Full State Persistence, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements

### Community 23 - "Spec: Poktsonline Core Gameplay and Battle Loop (MVP)"
Cohesion: 0.33
Nodes (5): Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), User Stories

### Community 24 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.14
Nodes (13): 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567), 2. Prior Art, 4. Server Colyseus Room Handshake & State Loading, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Implementation Decisions (+5 more)

### Community 25 - "BattleNetwork"
Cohesion: 0.14
Nodes (5): BattleEndCallback, BattleNetwork, TurnResolutionCallback, CombatAction, colyseus.js

### Community 27 - "PlayerRosterState"
Cohesion: 0.06
Nodes (26): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status, DebugToolbarCallbacks, DebugToolbarController, RosterModalController (+18 more)

### Community 28 - "BattleRoom.ts"
Cohesion: 0.16
Nodes (8): BattleRoomOptions, BattleRoomState, CombatantNetworkState, LootEngine, ItemStack, LootReward, TeamFormation, 5. Verification

### Community 29 - "MapConfig"
Cohesion: 0.22
Nodes (9): PathfindingOptions, RoamingBeastManager, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition, 01-shared-roaming-beast-types, Answer (+1 more)

### Community 30 - "NPCDefinition"
Cohesion: 0.29
Nodes (4): DialogueModalCallbacks, DialogueModalController, NPCDefinition, NPCDialogueOption

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

### Community 36 - "05: Full System Verification and Smoke Test"
Cohesion: 0.33
Nodes (5): 05: Full System Verification and Smoke Test, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "OverworldRoom"
Cohesion: 0.18
Nodes (8): determineDirection(), OverworldRoom, HeroFullSaveState, 03: Server Persistence and Colyseus Room Messages, Acceptance Criteria, Blocked By: 02-equipment-manager-and-stat-calculation.md, Description, Status: resolved

### Community 40 - "server/package.json"
Cohesion: 0.11
Nodes (17): @poktsonline/shared, main, name, private, scripts, build, start, test (+9 more)

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

### Community 47 - "Feature Specification: Inventory & Consumable Item System"
Cohesion: 0.33
Nodes (5): 1. Overview & Goals, 2. Domain Models & Types (@poktsonline/shared), 3. Authoritative Combat Integration (@poktsonline/server), 4. Client UI & Interactions (@poktsonline/client), Feature Specification: Inventory & Consumable Item System

### Community 48 - "BattleEngine"
Cohesion: 0.25
Nodes (7): BattleEngine, Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification, 2. Deep Module: `BattleEngine` (Shared/Server), Further Notes

### Community 49 - "shared/src/index.ts"
Cohesion: 0.13
Nodes (13): OverworldRendererConfig, MinimapControllerOptions, MinimapEntities, MinimapEntity, CreateHeroPayload, SyncHeroStatePayload, Direction, Element (+5 more)

### Community 50 - "Implementation Decisions"
Cohesion: 0.50
Nodes (4): 1. Architectural Structure, 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "Combatant"
Cohesion: 0.31
Nodes (6): CharacterModalCallbacks, InventoryModalCallbacks, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant

### Community 55 - "OverworldEngine"
Cohesion: 0.33
Nodes (4): OverworldEngine, 04: Colyseus Authoritative Server Rooms, 3. Deep Module: `OverworldEngine` (Shared/Server), Testing Decisions

### Community 78 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 79 - "HeroRepository"
Cohesion: 0.33
Nodes (4): createHeroRouter(), HeroRepository, createServer(), 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

### Community 84 - "AccountRepository"
Cohesion: 0.27
Nodes (3): createAuthRouter(), PasswordUtils, AccountRepository

### Community 87 - ".movePlayer"
Cohesion: 0.12
Nodes (12): PlayerOverworldState, 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing, Answer, Description, 1. Overview, 2.1 Shared Data & Types, 2.2 Server AI & State Synchronization (+4 more)

### Community 88 - "PortalDefinition"
Cohesion: 0.16
Nodes (13): OverworldEntityManagerConfig, MovementResult, PortalDefinition, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`), 2. Overworld Engine Portal Resolution (`@poktsonline/shared`) (+5 more)

### Community 89 - "InventoryState"
Cohesion: 0.40
Nodes (4): ShopModalCallbacks, InventoryManager, InventoryState, Tasks

### Community 90 - "isometric.ts"
Cohesion: 0.23
Nodes (6): 1. Parameters & Primitive Types, IsometricConfig, IsometricGrid, IsoTileCoord, ScreenCoord, screenToIso()

### Community 92 - "02: Equipment Manager and Stat Calculation"
Cohesion: 0.33
Nodes (5): 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description, Status: resolved

### Community 93 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 94 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.40
Nodes (4): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved

### Community 95 - "Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling"
Cohesion: 0.40
Nodes (4): Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification

### Community 96 - "Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats"
Cohesion: 0.40
Nodes (4): Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification

### Community 97 - "Issue 01: Inventory Domain Model, InventoryManager & LootEngine"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Inventory Domain Model, InventoryManager & LootEngine, Verification

### Community 98 - "Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations"
Cohesion: 0.50
Nodes (3): Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations, Objective, Tasks

### Community 99 - "Requirements"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 100 - "Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions"
Cohesion: 0.50
Nodes (3): Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions, Objective, Requirements

### Community 101 - "03-server-encounter-trigger-and-respawn"
Cohesion: 0.50
Nodes (3): 03-server-encounter-trigger-and-respawn, Answer, Description

## Knowledge Gaps
- **21 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 398 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `BattleScene`, `EquipmentManager`, `OverworldScene.ts`, `BattleScene.ts`, `RosterModalController.ts`, `src/types.ts`, `InventoryModalController`, `.create`, `PlayerRosterState`, `BattleRoom.ts`, `MapConfig`, `BattleRoom`, `3. Architecture & Data Structures`, `OverworldRoom`, `shared/src/index.ts`, `HeroRepository`, `EquipmentModalController`, `InventoryState`, `03-server-encounter-trigger-and-respawn`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BattleScene` be split into smaller, more focused modules?**
  _Cohesion score 0.1471264367816092 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `AuthService`, `OverworldEntityManager`, `.setupUIControllers`, `soundManager`, `OverworldScene.ts`, `ChatController`, `InventoryModalController`, `OverworldRenderer`, `AuthModalController`, `TileCoord`, `.create`, `PlayerRosterState`, `MapConfig`, `NPCDefinition`, `3. Architecture & Data Structures`, `shared/src/index.ts`, `EquipmentModalController`, `04-client-roaming-beast-renderer-and-interaction`, `CharacterSelectModalController`, `getItemDefinition`, `.movePlayer`, `InventoryState`, `Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `.setupUIControllers` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._