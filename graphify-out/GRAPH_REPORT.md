# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 168 files · ~181,169 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .css 12, (none) 5, .bat 4)

## Summary
- 1149 nodes · 2820 edges · 84 communities (53 shown, 31 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 345 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8cc40ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OverworldRoom
- CharacterSelectModalController
- BattleScene
- src/types.ts
- OverworldEntityManager
- .setupUIControllers
- soundManager
- OverworldRoom.ts
- OverworldScene.ts
- client/tsconfig.json
- .create
- BattleScene.ts
- RosterModalController.ts
- ChatController
- battle-engine.ts
- RoamingBeastNetworkState
- InventoryModalController
- OverworldRenderer.ts
- DebugToolbarController
- compilerOptions
- package.json
- TileCoord
- PlayerNetworkState
- Spec: Poktsonline Core Gameplay and Battle Loop (MVP)
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics
- PlayerRosterState
- RosterModalController
- BattleState.ts
- MapConfig
- NPCDefinition
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- ChatMessagePayload
- server/package.json
- .sendChatMessage
- server/tsconfig.json
- shared/tsconfig.json
- Agent skills
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
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
- Element
- scripts
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- 04-client-roaming-beast-renderer-and-interaction

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 64 edges
2. `OverworldScene` - 54 edges
3. `Element` - 47 edges
4. `InventoryState` - 40 edges
5. `BattleScene` - 38 edges
6. `OverworldRoom` - 37 edges
7. `getItemDefinition()` - 37 edges
8. `InventoryModalController` - 35 edges
9. `MapConfig` - 35 edges
10. `vitest` - 31 edges

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

## Communities (84 total, 31 thin omitted)

### Community 0 - "OverworldRoom"
Cohesion: 0.05
Nodes (31): Key Navigation Pointers, createAuthRouter(), toAccountSummary(), validateCredentials(), AuthenticatedRequest, createHeroRouter(), PasswordUtils, AccountRecord (+23 more)

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.08
Nodes (12): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+4 more)

### Community 2 - "BattleScene"
Cohesion: 0.07
Nodes (11): getValidTargets(), BattleNetwork, BattleScene, BattleEvent, Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification (+3 more)

### Community 3 - "src/types.ts"
Cohesion: 0.06
Nodes (39): ShopModalCallbacks, ShopModalController, EquipmentManager, InventoryManager, getItemDefinition(), ITEM_DATABASE, LootEngine, Attributes (+31 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.12
Nodes (10): OverworldEntityManager, rectContains(), PlayerNetData, getIsometricDepth(), IsometricGrid, IsoTileCoord, isoToScreen(), ScreenCoord (+2 more)

### Community 6 - "soundManager"
Cohesion: 0.05
Nodes (25): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+17 more)

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.16
Nodes (11): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, determineDirection() (+3 more)

### Community 8 - "OverworldScene.ts"
Cohesion: 0.10
Nodes (3): DEFAULT_OVERWORLD_MAP, getMapConfig(), MAP_DATABASE

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 11 - "BattleScene.ts"
Cohesion: 0.11
Nodes (6): BattleEndCallback, TurnResolutionCallback, BattleState, CombatAction, CombatActionType, ItemType

### Community 14 - "battle-engine.ts"
Cohesion: 0.17
Nodes (9): BattleEngine, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleOutcome, TeamActionsMap, TurnResolutionResult (+1 more)

### Community 15 - "RoamingBeastNetworkState"
Cohesion: 0.19
Nodes (8): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, @colyseus/schema, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description, 2.2 Server AI & State Synchronization

### Community 16 - "InventoryModalController"
Cohesion: 0.14
Nodes (8): InventoryModalController, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification, Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions, Objective, Requirements

### Community 17 - "OverworldRenderer.ts"
Cohesion: 0.15
Nodes (5): 1. Parameters & Primitive Types, OverworldRenderer, OverworldRendererConfig, IsometricConfig, 04: Procedural Champion Sprites, Divine Realm Textures, and Renderer

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (23): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+15 more)

### Community 22 - "PlayerNetworkState"
Cohesion: 0.22
Nodes (8): PlayerNetworkState, 1. Database & Persistence Architecture, 2. HTTP REST Auth API (Port 2567), 4. Server Colyseus Room Handshake & State Loading, Implementation Decisions, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements

### Community 23 - "Spec: Poktsonline Core Gameplay and Battle Loop (MVP)"
Cohesion: 0.29
Nodes (6): Further Notes, Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), User Stories

### Community 24 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.20
Nodes (9): 1. Seams Tested, 2. Prior Art, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Out of Scope, Problem Statement, Solution, Testing Decisions (+1 more)

### Community 25 - "17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics"
Cohesion: 0.25
Nodes (7): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status

### Community 26 - "PlayerRosterState"
Cohesion: 0.18
Nodes (8): DebugToolbarCallbacks, RosterModalCallbacks, BattleRoomOptions, RosterManager, FormationSlot, PlayerRosterState, TeamFormation, 01: Shared Ragnarok Champions Roster and Divine Item Database

### Community 27 - "RosterModalController"
Cohesion: 0.10
Nodes (12): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status, CharacterModalController, RosterModalController, 04: Client UI Paperdoll and Modals Integration (+4 more)

### Community 29 - "MapConfig"
Cohesion: 0.05
Nodes (40): OverworldEntityManagerConfig, PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, MovementResult, PlayerOverworldState (+32 more)

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

### Community 38 - "ChatMessagePayload"
Cohesion: 0.18
Nodes (8): ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload, Context, Requirements, Ticket 01: Shared Chat Types and Server Overworld Room Broadcast, 1. Shared Types & Network Schema (`@poktsonline/shared`)

### Community 40 - "server/package.json"
Cohesion: 0.13
Nodes (14): @poktsonline/shared, main, name, private, type, version, colyseus, @colyseus/ws-transport (+6 more)

### Community 41 - ".sendChatMessage"
Cohesion: 0.13
Nodes (13): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 2. Server Authority & Broadcasting (`packages/server`), 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`), 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`), 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`), Acceptance Criteria (+5 more)

### Community 42 - "server/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 43 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 44 - "Agent skills"
Cohesion: 0.29
Nodes (5): Agent skills, Codebase Navigation & Knowledge Graph, Domain docs, Issue tracker, Triage labels

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

### Community 49 - "shared/src/index.ts"
Cohesion: 0.31
Nodes (4): MinimapControllerOptions, MinimapEntities, MinimapEntity, vitest

### Community 50 - "Implementation Decisions"
Cohesion: 0.40
Nodes (5): 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

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
Cohesion: 0.21
Nodes (9): CharacterModalCallbacks, InventoryModalCallbacks, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective (+1 more)

### Community 55 - "OverworldEngine"
Cohesion: 0.33
Nodes (4): OverworldEngine, 04: Colyseus Authoritative Server Rooms, 3. Deep Module: `OverworldEngine` (Shared/Server), Testing Decisions

### Community 78 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 79 - "Element"
Cohesion: 0.25
Nodes (7): ELEMENTAL_SKILLS, SkillDefinition, Element, Earth, Fire, Water, Wind

### Community 80 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, start, test

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

## Knowledge Gaps
- **21 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 393 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `OverworldRoom`, `CharacterSelectModalController`, `BattleScene`, `src/types.ts`, `.setupUIControllers`, `3. Architecture & Data Structures`, `OverworldRoom.ts`, `OverworldScene.ts`, `BattleScene.ts`, `RosterModalController.ts`, `battle-engine.ts`, `Element`, `InventoryModalController`, `DebugToolbarController`, `PlayerRosterState`, `RosterModalController`, `BattleState.ts`, `MapConfig`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OverworldRoom` be split into smaller, more focused modules?**
  _Cohesion score 0.053992221459620224 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `.create` to `CharacterSelectModalController`, `BattleScene`, `src/types.ts`, `OverworldEntityManager`, `.setupUIControllers`, `soundManager`, `3. Architecture & Data Structures`, `OverworldScene.ts`, `ChatController`, `InventoryModalController`, `OverworldRenderer.ts`, `DebugToolbarController`, `04-client-roaming-beast-renderer-and-interaction`, `TileCoord`, `PlayerRosterState`, `RosterModalController`, `MapConfig`, `NPCDefinition`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.07680491551459294 - nodes in this community are weakly interconnected._