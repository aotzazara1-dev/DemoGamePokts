# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 186 files · ~195,990 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 22 file(s) not represented in the graph (top: .css 13, (none) 5, .bat 4)

## Summary
- 1287 nodes · 3177 edges · 104 communities (71 shown, 33 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 375 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99f4d2eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/src/index.ts
- OverworldScene.ts
- BattleScene
- src/types.ts
- OverworldEntityManager
- .setupUIControllers
- soundManager
- shared/src/index.ts
- client/package.json
- client/tsconfig.json
- .create
- OverworldEngine
- PlayerRosterState
- SkillManager
- battle-engine.ts
- RoamingBeastNetworkState
- InventoryModalController
- OverworldRenderer
- BattleNetwork
- compilerOptions
- package.json
- MinimapController
- EquipmentModalController
- .sendChatMessage
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- ChatController
- DebugToolbarController
- Combatant
- BattleScene.ts
- MapConfig
- check-god-files.mjs
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- DialogueModalController
- getItemDefinition
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- OverworldRoom
- server/package.json
- InventoryState
- server/tsconfig.json
- shared/tsconfig.json
- AGENTS.md
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- BattleEngine
- HeroRepository.ts
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
- dependencies
- 18. Mock Boundaries and Testing Conventions
- .addExpToCombatant
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- AccountRepository
- PlayerNetworkState
- BattleSkillMenuController
- 2. Requirements
- .movePlayer
- 04-client-roaming-beast-renderer-and-interaction
- 01: Shared Equipment Types and Catalog
- DatabaseEngine
- 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module
- Issue 02: Skill Tomes and Inventory Learning Integration
- Issue 03: BattleEngine Skill Resolution and Damage Calculation
- Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots
- Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats
- Equipment and Völundr System Specification
- Issue 01: Inventory Domain Model, InventoryManager & LootEngine
- .onCreate
- Requirements
- 05-dual-encounter-coexistence-and-testing

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 86 edges
2. `OverworldScene` - 55 edges
3. `Element` - 54 edges
4. `InventoryState` - 45 edges
5. `InventoryModalController` - 42 edges
6. `BattleScene` - 40 edges
7. `getItemDefinition()` - 39 edges
8. `OverworldRoom` - 37 edges
9. `MapConfig` - 35 edges
10. `vitest` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Description` --references--> `BattleScene`  [INFERRED]
  .scratch/inventory-system/issues/04-battle-scene-item-hud-and-qa-toolbar.md → packages/client/src/scenes/BattleScene.ts
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Objective` --references--> `BattleRoom`  [INFERRED]
  .scratch/level-progression/issues/02-battle-room-exp-rewards.md → packages/server/src/rooms/BattleRoom.ts
- `1. Seams Tested` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts

## Import Cycles
- None detected.

## Communities (104 total, 33 thin omitted)

### Community 0 - "server/src/index.ts"
Cohesion: 0.14
Nodes (10): toAccountSummary(), validateCredentials(), AuthenticatedRequest, PasswordUtils, AccountRecord, @colyseus/ws-transport, cors, express (+2 more)

### Community 1 - "OverworldScene.ts"
Cohesion: 0.06
Nodes (11): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+3 more)

### Community 2 - "BattleScene"
Cohesion: 0.13
Nodes (6): getValidTargets(), BattleScene, CombatActionType, Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations, Objective, Tasks

### Community 3 - "src/types.ts"
Cohesion: 0.17
Nodes (17): EquipmentManager, ITEM_DATABASE, SKILL_TOMES, Attributes, BattleEventType, EntityEquipment, EquipmentSlot, EquipmentStats (+9 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.09
Nodes (15): 1. Parameters & Primitive Types, 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards, OverworldEntityManager, rectContains(), PlayerNetData, getIsometricDepth() (+7 more)

### Community 7 - "shared/src/index.ts"
Cohesion: 0.05
Nodes (31): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, OverworldRendererConfig (+23 more)

### Community 8 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - ".create"
Cohesion: 0.18
Nodes (3): OverworldScene, findPath(), NPCDefinition

### Community 11 - "OverworldEngine"
Cohesion: 0.33
Nodes (4): OverworldEngine, 04: Colyseus Authoritative Server Rooms, 3. Deep Module: `OverworldEngine` (Shared/Server), Testing Decisions

### Community 12 - "PlayerRosterState"
Cohesion: 0.18
Nodes (6): DebugToolbarCallbacks, EquipmentModalCallbacks, RosterModalCallbacks, RosterManager, FormationSlot, PlayerRosterState

### Community 13 - "SkillManager"
Cohesion: 0.21
Nodes (9): ELEMENTAL_SKILLS, getSkillDefinition(), SKILL_DATABASE, SkillCategory, SkillDefinition, SkillManager, ADR-0021, CombatantSkillSlot (+1 more)

### Community 14 - "battle-engine.ts"
Cohesion: 0.19
Nodes (13): BattleSkillExecutor, ADR-0021, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleEvent, BattleOutcome (+5 more)

### Community 15 - "RoamingBeastNetworkState"
Cohesion: 0.19
Nodes (8): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, @colyseus/schema, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description, 2.2 Server AI & State Synchronization

### Community 16 - "InventoryModalController"
Cohesion: 0.10
Nodes (16): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification (+8 more)

### Community 18 - "BattleNetwork"
Cohesion: 0.14
Nodes (4): BattleEndCallback, BattleNetwork, TurnResolutionCallback, colyseus.js

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 23 - ".sendChatMessage"
Cohesion: 0.13
Nodes (13): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 2. Server Authority & Broadcasting (`packages/server`), 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`), 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`), 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`), Acceptance Criteria (+5 more)

### Community 24 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.14
Nodes (13): 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567), 2. Prior Art, 4. Server Colyseus Room Handshake & State Loading, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Implementation Decisions (+5 more)

### Community 25 - "ChatController"
Cohesion: 0.13
Nodes (8): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status, ChatController

### Community 27 - "Combatant"
Cohesion: 0.11
Nodes (10): CharacterModalCallbacks, BattleRoomOptions, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant, TeamFormation, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation (+2 more)

### Community 28 - "BattleScene.ts"
Cohesion: 0.14
Nodes (7): config, game, soundBtn, BattleSkillMenuCallbacks, ADR-0020, ItemType, phaser

### Community 29 - "MapConfig"
Cohesion: 0.20
Nodes (10): PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition, 01-shared-roaming-beast-types (+2 more)

### Community 30 - "check-god-files.mjs"
Cohesion: 0.19
Nodes (10): CEILINGS, countLines(), __dirname, __filename, getCeilingForFile(), getFiles(), LEGACY_WHITELIST, main() (+2 more)

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

### Community 34 - "DialogueModalController"
Cohesion: 0.27
Nodes (3): DialogueModalCallbacks, DialogueModalController, NPCDialogueOption

### Community 36 - "05: Full System Verification and Smoke Test"
Cohesion: 0.33
Nodes (5): 05: Full System Verification and Smoke Test, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "OverworldRoom"
Cohesion: 0.17
Nodes (8): OverworldRoom, HeroFullSaveState, 03: Server Persistence and Colyseus Room Messages, Acceptance Criteria, Blocked By: 02-equipment-manager-and-stat-calculation.md, Description, Status: resolved, 04: Colyseus Overworld Room Handshake and Full State Persistence

### Community 40 - "server/package.json"
Cohesion: 0.12
Nodes (16): @poktsonline/shared, main, name, private, scripts, build, start, test (+8 more)

### Community 41 - "InventoryState"
Cohesion: 0.31
Nodes (5): InventoryManager, LootEngine, InventoryState, Tasks, 5. Verification

### Community 42 - "server/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 43 - "shared/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 44 - "AGENTS.md"
Cohesion: 0.25
Nodes (6): Agent skills, Anti-God-Files Architecture & Deep Module Guardrails (ADR 0020), Codebase Navigation & Knowledge Graph (Mandatory Graphify-First), Domain docs, Issue tracker, Triage labels

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
Cohesion: 0.17
Nodes (12): BattleEngine, 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Further Notes, Implementation Decisions, Out of Scope (+4 more)

### Community 49 - "HeroRepository.ts"
Cohesion: 0.15
Nodes (5): InventoryModalCallbacks, ShopModalCallbacks, ShopTab, getItemIcon(), 01: Shared Ragnarok Champions Roster and Divine Item Database

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
Cohesion: 0.10
Nodes (12): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status, CharacterModalController, RosterModalController, 04: Client UI Paperdoll and Modals Integration (+4 more)

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 79 - "HeroRepository"
Cohesion: 0.33
Nodes (4): createHeroRouter(), HeroRepository, createServer(), 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 80 - "dependencies"
Cohesion: 0.12
Nodes (15): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js (+7 more)

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - ".addExpToCombatant"
Cohesion: 0.40
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 85 - "PlayerNetworkState"
Cohesion: 0.18
Nodes (9): PlayerNetworkState, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements, 3. Server Multiplayer Synchronization (`@poktsonline/server`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview, Requirements (+1 more)

### Community 86 - "BattleSkillMenuController"
Cohesion: 0.20
Nodes (6): BattleSkillMenuController, 1. Overview, 2.2 Battle Engine Integration (`packages/shared/src/battle/battle-engine.ts`), 2.3 Client UI Presentation (`@poktsonline/client`), 2. Detailed Architecture, Specification: 5-Slot Skill System, Signature Skills, and Elemental Affinity

### Community 87 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 88 - ".movePlayer"
Cohesion: 0.19
Nodes (10): OverworldEntityManagerConfig, MovementResult, PlayerOverworldState, PortalDefinition, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`) (+2 more)

### Community 89 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

### Community 90 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.16
Nodes (9): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved, 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description (+1 more)

### Community 91 - "DatabaseEngine"
Cohesion: 0.24
Nodes (3): Key Navigation Pointers, IsometricConfig, DatabaseEngine

### Community 92 - "21. 5-Slot Skill System, Signature Skills, and Elemental Affinity"
Cohesion: 0.33
Nodes (5): 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity, Consequences, Context, Decision, Status

### Community 93 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 94 - "Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module"
Cohesion: 0.33
Nodes (5): Blocked By: None, Description, Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module, Status: open, Tasks

### Community 95 - "Issue 02: Skill Tomes and Inventory Learning Integration"
Cohesion: 0.33
Nodes (5): Blocked By: 01-shared-skill-types-and-skill-manager.md, Description, Issue 02: Skill Tomes and Inventory Learning Integration, Status: closed, Tasks

### Community 96 - "Issue 03: BattleEngine Skill Resolution and Damage Calculation"
Cohesion: 0.33
Nodes (5): Blocked By: 01-shared-skill-types-and-skill-manager.md, Description, Issue 03: BattleEngine Skill Resolution and Damage Calculation, Status: closed, Tasks

### Community 97 - "Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots"
Cohesion: 0.33
Nodes (5): Blocked By: 03-battle-engine-skill-execution.md, Description, Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots, Status: closed, Tasks

### Community 98 - "Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats"
Cohesion: 0.40
Nodes (4): Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification

### Community 99 - "Equipment and Völundr System Specification"
Cohesion: 0.50
Nodes (3): Architecture & Data Flow, Equipment and Völundr System Specification, Objective

### Community 100 - "Issue 01: Inventory Domain Model, InventoryManager & LootEngine"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Inventory Domain Model, InventoryManager & LootEngine, Verification

### Community 101 - ".onCreate"
Cohesion: 0.28
Nodes (5): determineDirection(), getMapConfig(), 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 102 - "Requirements"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 103 - "05-dual-encounter-coexistence-and-testing"
Cohesion: 0.50
Nodes (3): 05-dual-encounter-coexistence-and-testing, Answer, Description

## Knowledge Gaps
- **25 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+20 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 445 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `OverworldScene.ts`, `BattleScene`, `src/types.ts`, `.setupUIControllers`, `shared/src/index.ts`, `PlayerRosterState`, `SkillManager`, `battle-engine.ts`, `InventoryModalController`, `EquipmentModalController`, `DebugToolbarController`, `BattleScene.ts`, `MapConfig`, `3. Architecture & Data Structures`, `OverworldRoom`, `InventoryState`, `HeroRepository.ts`, `RosterModalController`, `BattleState.ts`, `HeroRepository`, `.addExpToCombatant`, `Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module`, `.onCreate`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `Combatant` (e.g. with `Tasks` and `3.1 Combatant Model Extension (`@poktsonline/shared`)`) actually correct?**
  _`Combatant` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _25 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `server/src/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `.create` to `OverworldScene.ts`, `BattleScene`, `OverworldEntityManager`, `.setupUIControllers`, `PlayerRosterState`, `InventoryModalController`, `OverworldRenderer`, `MinimapController`, `EquipmentModalController`, `ChatController`, `DebugToolbarController`, `BattleScene.ts`, `MapConfig`, `DialogueModalController`, `getItemDefinition`, `3. Architecture & Data Structures`, `InventoryState`, `RosterModalController`, `2. Requirements`, `04-client-roaming-beast-renderer-and-interaction`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `OverworldScene` (e.g. with `Objective` and `Tasks`) actually correct?**
  _`OverworldScene` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Should `OverworldScene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06018018018018018 - nodes in this community are weakly interconnected._