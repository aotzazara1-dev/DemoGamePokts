# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 174 files · ~189,309 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 13, (none) 5, .bat 4)

## Summary
- 1216 nodes · 2990 edges · 94 communities (61 shown, 33 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 358 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba16562a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hero-api.test.ts
- CharacterSelectModalController
- BattleScene
- src/types.ts
- OverworldEntityManager
- .setupUIControllers
- soundManager
- OverworldNetwork.ts
- client/tsconfig.json
- OverworldScene
- overworld-engine.test.ts
- InventoryModalController.ts
- ChatMessagePayload
- battle-engine.ts
- OverworldRoom.ts
- InventoryModalController
- OverworldRenderer
- 03: Server Persistence and Colyseus Room Messages
- compilerOptions
- package.json
- TileCoord
- EquipmentModalController
- .sendChatMessage
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- ChatController
- .create
- Combatant
- BattleScene.ts
- MapConfig
- check-god-files.mjs
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- NPCDefinition
- OverworldRenderer.ts
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- OverworldRoom
- server/package.json
- 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics
- server/tsconfig.json
- shared/tsconfig.json
- Key Navigation Pointers
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- BattleEngine
- shared/src/index.ts
- 2. Detailed Requirements
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- RosterModalController
- BattleState.ts
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
- 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation
- HeroRepository
- 19. Equipment and Völundr System for Hero and Champions
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- AccountRepository
- Implementation Decisions
- Coding Standards
- .movePlayer
- PortalDefinition
- 04-client-roaming-beast-renderer-and-interaction
- isometric.ts
- DatabaseEngine
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- .onCreate

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 71 edges
2. `OverworldScene` - 55 edges
3. `Element` - 48 edges
4. `InventoryState` - 45 edges
5. `InventoryModalController` - 42 edges
6. `getItemDefinition()` - 39 edges
7. `BattleScene` - 38 edges
8. `OverworldRoom` - 37 edges
9. `MapConfig` - 35 edges
10. `vitest` - 32 edges

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

## Communities (94 total, 33 thin omitted)

### Community 0 - "hero-api.test.ts"
Cohesion: 0.20
Nodes (7): AuthenticatedRequest, PasswordUtils, AccountRecord, cors, express, sql.js, supertest

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.09
Nodes (8): AuthService, AuthModalCallbacks, AuthModalController, CharacterSelectModalController, AccountSummary, AuthSessionResponse, 02: HTTP Authentication Endpoints and Client Auth Modal, 03: Multi-Hero Character Selection and Creation Interface

### Community 2 - "BattleScene"
Cohesion: 0.07
Nodes (10): BattleNetwork, BattleScene, BattleEvent, Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification, Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations (+2 more)

### Community 3 - "src/types.ts"
Cohesion: 0.06
Nodes (39): EquipmentModalCallbacks, ShopModalController, EquipmentManager, InventoryManager, getItemDefinition(), ITEM_DATABASE, LootEngine, Attributes (+31 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.18
Nodes (5): OverworldEntityManager, rectContains(), PlayerNetData, getIsometricDepth(), isoToScreen()

### Community 6 - "soundManager"
Cohesion: 0.05
Nodes (24): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+16 more)

### Community 7 - "OverworldNetwork.ts"
Cohesion: 0.12
Nodes (9): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, MoveMessagePayload (+1 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 11 - "overworld-engine.test.ts"
Cohesion: 0.19
Nodes (4): DEFAULT_OVERWORLD_MAP, MAP_DATABASE, OverworldEngine, ZoneDefinition

### Community 13 - "ChatMessagePayload"
Cohesion: 0.16
Nodes (8): ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload, Context, Requirements, Ticket 01: Shared Chat Types and Server Overworld Room Broadcast, 1. Shared Types & Network Schema (`@poktsonline/shared`)

### Community 14 - "battle-engine.ts"
Cohesion: 0.15
Nodes (10): ELEMENTAL_SKILLS, SkillDefinition, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleOutcome, TeamActionsMap (+2 more)

### Community 15 - "OverworldRoom.ts"
Cohesion: 0.14
Nodes (7): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description, 2.2 Server AI & State Synchronization

### Community 16 - "InventoryModalController"
Cohesion: 0.10
Nodes (16): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification (+8 more)

### Community 18 - "03: Server Persistence and Colyseus Room Messages"
Cohesion: 0.40
Nodes (4): 03: Server Persistence and Colyseus Room Messages, Blocked By: 02-equipment-manager-and-stat-calculation.md, Description, Status: resolved

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 21 - "TileCoord"
Cohesion: 0.16
Nodes (5): MinimapController, TileCoord, Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 23 - ".sendChatMessage"
Cohesion: 0.13
Nodes (13): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 2. Server Authority & Broadcasting (`packages/server`), 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`), 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`), 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`), Acceptance Criteria (+5 more)

### Community 24 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.14
Nodes (13): 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567), 2. Prior Art, 4. Server Colyseus Room Handshake & State Loading, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Implementation Decisions (+5 more)

### Community 27 - "Combatant"
Cohesion: 0.10
Nodes (20): Decision, CharacterModalCallbacks, DebugToolbarCallbacks, InventoryModalCallbacks, RosterModalCallbacks, ShopModalCallbacks, HeroFullSaveState, SyncHeroStatePayload (+12 more)

### Community 28 - "BattleScene.ts"
Cohesion: 0.11
Nodes (9): getValidTargets(), BattleEndCallback, TurnResolutionCallback, BattleRoomOptions, BattleState, CombatAction, CombatActionType, TeamFormation (+1 more)

### Community 29 - "MapConfig"
Cohesion: 0.21
Nodes (10): findPath(), PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, RoamingBeastEntity, 01-shared-roaming-beast-types (+2 more)

### Community 30 - "check-god-files.mjs"
Cohesion: 0.21
Nodes (10): ADR-0020, CEILINGS, countLines(), __dirname, __filename, getCeilingForFile(), getFiles(), LEGACY_WHITELIST (+2 more)

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

### Community 34 - "NPCDefinition"
Cohesion: 0.29
Nodes (4): DialogueModalCallbacks, DialogueModalController, NPCDefinition, NPCDialogueOption

### Community 35 - "OverworldRenderer.ts"
Cohesion: 0.24
Nodes (4): OverworldRendererConfig, MinimapControllerOptions, MinimapEntities, MinimapEntity

### Community 36 - "05: Full System Verification and Smoke Test"
Cohesion: 0.33
Nodes (5): 05: Full System Verification and Smoke Test, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "OverworldRoom"
Cohesion: 0.21
Nodes (6): OverworldRoom, PlayerNetworkState, 04: Colyseus Overworld Room Handshake and Full State Persistence, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements

### Community 40 - "server/package.json"
Cohesion: 0.06
Nodes (32): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js (+24 more)

### Community 41 - "17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics"
Cohesion: 0.25
Nodes (7): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status

### Community 42 - "server/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 43 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 44 - "Key Navigation Pointers"
Cohesion: 0.22
Nodes (7): Agent skills, Anti-God-Files Architecture & Deep Module Guardrails (ADR 0020), Codebase Navigation & Knowledge Graph (Mandatory Graphify-First), Domain docs, Issue tracker, Key Navigation Pointers, Triage labels

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
Cohesion: 0.22
Nodes (9): BattleEngine, 2. Deep Module: `BattleEngine` (Shared/Server), Further Notes, Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), Testing Decisions (+1 more)

### Community 49 - "shared/src/index.ts"
Cohesion: 0.16
Nodes (10): HeroService, CharacterSelectCallbacks, CreateHeroPayload, HeroSummary, Element, Earth, Fire, Water (+2 more)

### Community 50 - "2. Detailed Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Shared Data & Types (`@poktsonline/shared`), 2.2 Server Persistence & World Authority (`@poktsonline/server`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish, 2. Detailed Requirements, Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "RosterModalController"
Cohesion: 0.12
Nodes (7): CharacterModalController, RosterModalController, 04: Client UI Paperdoll and Modals Integration, Acceptance Criteria, Blocked By: 03-server-persistence-and-room-messages.md, Description, Status: closed

### Community 55 - "BattleState.ts"
Cohesion: 0.33
Nodes (3): BattleRoomState, CombatantNetworkState, @colyseus/schema

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 79 - "HeroRepository"
Cohesion: 0.25
Nodes (5): createHeroRouter(), HeroRepository, createServer(), Acceptance Criteria, 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 80 - "19. Equipment and Völundr System for Hero and Champions"
Cohesion: 0.40
Nodes (4): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Status

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 84 - "AccountRepository"
Cohesion: 0.30
Nodes (4): createAuthRouter(), toAccountSummary(), validateCredentials(), AccountRepository

### Community 85 - "Implementation Decisions"
Cohesion: 0.40
Nodes (5): 1. Architectural Structure, 3. Deep Module: `OverworldEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

### Community 86 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 87 - ".movePlayer"
Cohesion: 0.13
Nodes (11): PlayerOverworldState, 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing, Answer, Description, 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction (+3 more)

### Community 88 - "PortalDefinition"
Cohesion: 0.16
Nodes (13): OverworldEntityManagerConfig, MovementResult, PortalDefinition, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`), 2. Overworld Engine Portal Resolution (`@poktsonline/shared`) (+5 more)

### Community 89 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

### Community 90 - "isometric.ts"
Cohesion: 0.23
Nodes (6): 1. Parameters & Primitive Types, IsometricConfig, IsometricGrid, IsoTileCoord, ScreenCoord, screenToIso()

### Community 93 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 101 - ".onCreate"
Cohesion: 0.24
Nodes (5): determineDirection(), getMapConfig(), 03-server-encounter-trigger-and-respawn, Answer, Description

## Knowledge Gaps
- **22 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 416 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OverworldRoom` connect `OverworldRoom` to `src/types.ts`, `.onCreate`, `PortalDefinition`, `Key Navigation Pointers`, `ChatMessagePayload`, `OverworldRoom.ts`, `HeroRepository`, `18. Mock Boundaries and Testing Conventions`, `shared/src/index.ts`, `03: Server Persistence and Colyseus Room Messages`, `AccountRepository`, `Implementation Decisions`, `2. Detailed Requirements`, `.sendChatMessage`, `Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence`, `Combatant`, `MapConfig`, `BattleRoom`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.09397163120567376 - nodes in this community are weakly interconnected._
- **Why does `Combatant` connect `Combatant` to `BattleScene`, `src/types.ts`, `.onCreate`, `3. Architecture & Data Structures`, `OverworldScene.ts`, `overworld-engine.test.ts`, `InventoryModalController.ts`, `battle-engine.ts`, `HeroRepository`, `InventoryModalController`, `shared/src/index.ts`, `BattleState.ts`, `RosterModalController`, `EquipmentModalController`, `.create`, `BattleScene.ts`, `MapConfig`?**
  _High betweenness centrality (0.085) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `BattleScene` be split into smaller, more focused modules?**
  _Cohesion score 0.07428571428571429 - nodes in this community are weakly interconnected._