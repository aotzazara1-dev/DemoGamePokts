# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 172 files · ~187,976 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 13, (none) 5, .bat 4)

## Summary
- 1196 nodes · 2966 edges · 83 communities (50 shown, 33 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 358 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dd031b09`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hero-api.test.ts
- CharacterSelectModalController
- BattleScene.ts
- InventoryState
- OverworldEntityManager
- .setupUIControllers
- soundManager
- OverworldRoom.ts
- client/tsconfig.json
- OverworldScene
- src/types.ts
- client/package.json
- ChatController
- battle-engine.ts
- server/src/index.ts
- InventoryModalController
- OverworldRenderer
- 03: Server Persistence and Colyseus Room Messages
- compilerOptions
- package.json
- MinimapController
- .onJoin
- PlayerNetworkState
- .create
- PlayerRosterState
- BattleRoom.ts
- MapConfig
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- OverworldRoom
- server/package.json
- server/tsconfig.json
- shared/tsconfig.json
- Agent skills
- Domain Docs
- Issue tracker: Local Markdown
- LootEngine
- BattleEngine
- shared/src/index.ts
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- Combatant
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
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- AccountRepository
- .movePlayer
- Requirements
- getIsometricDepth
- DatabaseEngine
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- 01: Shared Equipment Types and Catalog
- 03-server-encounter-trigger-and-respawn

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

## Communities (83 total, 33 thin omitted)

### Community 0 - "hero-api.test.ts"
Cohesion: 0.22
Nodes (8): toAccountSummary(), validateCredentials(), AuthenticatedRequest, PasswordUtils, AccountRecord, cors, express, supertest

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.08
Nodes (11): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+3 more)

### Community 2 - "BattleScene.ts"
Cohesion: 0.05
Nodes (21): getValidTargets(), config, game, soundBtn, BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene (+13 more)

### Community 3 - "InventoryState"
Cohesion: 0.06
Nodes (31): EquipmentModalCallbacks, RosterModalCallbacks, ShopModalCallbacks, ShopModalController, ShopTab, EquipmentManager, InventoryManager, getItemDefinition() (+23 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.12
Nodes (7): OverworldEntityManager, OverworldEntityManagerConfig, rectContains(), PlayerNetData, PortalDefinition, TileCoord, 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.16
Nodes (10): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, SendChatMessagePayload (+2 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.15
Nodes (6): OverworldScene, DialogueModalCallbacks, DialogueModalController, findPath(), NPCDefinition, NPCDialogueOption

### Community 11 - "src/types.ts"
Cohesion: 0.17
Nodes (10): PathfindingOptions, BattleEventType, EncounterPoolEntry, FormationSlot, ItemType, MapTheme, PortalTransitionMessage, ZoneBounds (+2 more)

### Community 12 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 13 - "ChatController"
Cohesion: 0.06
Nodes (28): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative (+20 more)

### Community 14 - "battle-engine.ts"
Cohesion: 0.18
Nodes (8): calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleOutcome, TeamActionsMap, TurnResolutionResult, 02: Deep BattleEngine and Turn Resolution

### Community 16 - "InventoryModalController"
Cohesion: 0.08
Nodes (21): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, 04: Client UI Paperdoll and Modals Integration, Acceptance Criteria, Blocked By: 03-server-persistence-and-room-messages.md, Description (+13 more)

### Community 18 - "03: Server Persistence and Colyseus Room Messages"
Cohesion: 0.40
Nodes (4): 03: Server Persistence and Colyseus Room Messages, Blocked By: 02-equipment-manager-and-stat-calculation.md, Description, Status: resolved

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (23): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+15 more)

### Community 24 - "PlayerNetworkState"
Cohesion: 0.07
Nodes (25): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, PlayerNetworkState, RoamingBeastNetworkState, @colyseus/schema, 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567) (+17 more)

### Community 27 - "PlayerRosterState"
Cohesion: 0.06
Nodes (21): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status, DebugToolbarCallbacks, EquipmentModalController, RosterModalController (+13 more)

### Community 28 - "BattleRoom.ts"
Cohesion: 0.29
Nodes (4): BattleRoomOptions, BattleRoomState, CombatantNetworkState, TeamFormation

### Community 29 - "MapConfig"
Cohesion: 0.17
Nodes (11): determineDirection(), getMapConfig(), RoamingBeastManager, MapConfig, RoamingBeastEntity, Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation (+3 more)

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
Cohesion: 0.39
Nodes (5): OverworldRoom, CreateHeroPayload, HeroFullSaveState, SyncHeroStatePayload, Direction

### Community 40 - "server/package.json"
Cohesion: 0.12
Nodes (16): @poktsonline/shared, main, name, private, scripts, build, start, test (+8 more)

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

### Community 47 - "LootEngine"
Cohesion: 0.20
Nodes (8): LootEngine, LootReward, 1. Overview & Goals, 2. Domain Models & Types (@poktsonline/shared), 3. Authoritative Combat Integration (@poktsonline/server), 4. Client UI & Interactions (@poktsonline/client), 5. Verification, Feature Specification: Inventory & Consumable Item System

### Community 48 - "BattleEngine"
Cohesion: 0.10
Nodes (19): BattleEngine, OverworldEngine, Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification, 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server) (+11 more)

### Community 49 - "shared/src/index.ts"
Cohesion: 0.11
Nodes (14): OverworldRendererConfig, MinimapControllerOptions, MinimapEntities, MinimapEntity, ELEMENTAL_SKILLS, SkillDefinition, DEFAULT_OVERWORLD_MAP, MAP_DATABASE (+6 more)

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
Cohesion: 0.22
Nodes (7): CharacterModalCallbacks, CharacterModalController, InventoryModalCallbacks, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant

### Community 79 - "HeroRepository"
Cohesion: 0.25
Nodes (5): createHeroRouter(), HeroRepository, createServer(), Acceptance Criteria, 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 87 - ".movePlayer"
Cohesion: 0.10
Nodes (16): MovementResult, PlayerOverworldState, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 2. Overworld Engine Portal Resolution (`@poktsonline/shared`), 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing (+8 more)

### Community 88 - "Requirements"
Cohesion: 0.29
Nodes (6): 1. Domain Types & Map Configurations (`@poktsonline/shared`), 3. Server Multiplayer Synchronization (`@poktsonline/server`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview, Requirements, Spec: Multi-Map World Expansion and Portals

### Community 90 - "getIsometricDepth"
Cohesion: 0.13
Nodes (13): 1. Parameters & Primitive Types, 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards, getIsometricDepth(), IsometricGrid, IsoTileCoord, isoToScreen() (+5 more)

### Community 91 - "DatabaseEngine"
Cohesion: 0.25
Nodes (3): Key Navigation Pointers, IsometricConfig, DatabaseEngine

### Community 93 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 94 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.40
Nodes (4): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved

### Community 101 - "03-server-encounter-trigger-and-respawn"
Cohesion: 0.50
Nodes (3): 03-server-encounter-trigger-and-respawn, Answer, Description

## Knowledge Gaps
- **21 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+16 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 403 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `BattleScene.ts`, `InventoryState`, `.setupUIControllers`, `OverworldRoom`, `3. Architecture & Data Structures`, `OverworldScene.ts`, `03-server-encounter-trigger-and-respawn`, `src/types.ts`, `battle-engine.ts`, `HeroRepository`, `InventoryModalController`, `shared/src/index.ts`, `LootEngine`, `.create`, `PlayerRosterState`, `BattleRoom.ts`, `MapConfig`, `BattleRoom`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _21 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.07978142076502732 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `CharacterSelectModalController`, `BattleScene.ts`, `InventoryState`, `OverworldEntityManager`, `.setupUIControllers`, `getIsometricDepth`, `OverworldRoom`, `OverworldScene.ts`, `3. Architecture & Data Structures`, `ChatController`, `InventoryModalController`, `OverworldRenderer`, `MinimapController`, `Combatant`, `.movePlayer`, `.create`, `PlayerRosterState`, `MapConfig`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `BattleScene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0518326545723806 - nodes in this community are weakly interconnected._