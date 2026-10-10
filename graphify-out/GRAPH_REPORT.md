# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 224 files · ~216,773 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 26 file(s) not represented in the graph (top: .css 17, (none) 5, .bat 4)

## Summary
- 1547 nodes · 3932 edges · 130 communities (94 shown, 36 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 443 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b091d57a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- warehouse-inn-ui.test.ts
- CharacterSelectModalController
- BattleScene
- EquipmentManager
- getIsometricDepth
- soundManager
- OverworldRoom.ts
- RosterModalController
- client/tsconfig.json
- OverworldScene
- OverworldScene.ts
- InventoryModalController.ts
- ChatController
- .sendChatMessage
- RoamingBeastNetworkState
- InventoryModalController
- src/types.ts
- .handleActionClick
- compilerOptions
- package.json
- TileCoord
- EquipmentModalController
- dependencies
- shared/src/index.ts
- .resolveTurn
- 01: Shared Equipment Types and Catalog
- BattleScene.ts
- OverworldNetwork.ts
- MapConfig
- client/package.json
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- getItemDefinition
- AccountRepository
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- check-god-files.mjs
- server/package.json
- Issue 03: NPC Innkeeper Dialogue and Overworld Integration
- server/tsconfig.json
- shared/tsconfig.json
- AGENTS.md
- Domain Docs
- Issue tracker: Local Markdown
- .movePlayer
- Spec: Poktsonline Core Gameplay and Battle Loop (MVP)
- WarehouseModalController
- Combatant
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- ChatMessagePayload
- SkillTreeModalController
- Poktsonline
- character_poses.md
- 0001-web-tech-stack.md
- 0002-phaser-and-colyseus.md
- 0003-classic-combat-rules.md
- 0004-monorepo-workspace-structure.md
- 0005-capture-and-encounter-mechanics.md
- 0006-damage-and-combo-formulas.md
- 0007-in-memory-persistence-mvp.md
- ADR 0008: Four Branching Elemental Skill Trees
- 0009-manual-stat-allocation.md
- 0010-party-system-and-coop-combat.md
- battle-engine.ts
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
- HeroRepository.ts
- OverworldEntityManager
- 18. Mock Boundaries and Testing Conventions
- 2. Requirements
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- Issue 03: Server Persistence and Hero State
- OverworldRenderer
- PlayerNetworkState
- PlayerRosterState
- OverworldEngine
- Issue 01: Inventory Domain Model, InventoryManager & LootEngine
- 02: Equipment Manager and Stat Calculation
- InnStorageModalController
- 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity
- .connectToServer
- SkillTreeModalController.ts
- Issue 02: Skill Tomes and Inventory Learning Integration
- BattleRoom.ts
- Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots
- getSkillDefinition
- InventoryState
- 2. Detailed Requirements
- BattleState.ts
- .onCreate
- Issue 02: Skill Tree Manager and Progression Engine
- BattleNetwork
- 2. Requirements
- BattleSwapMenuController
- devDependencies
- 2. Requirements
- 22. Item Warehouse and Inn Beast Storage System
- OverworldRoom
- 2. Domain Rules & Mechanics
- .showBattleEndBanner
- 2.3 Client UI Presentation (`@poktsonline/client`)
- NPCDefinition
- DebugToolbarController
- ElementalSkillTreeConfig
- Requirements
- Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats
- RoamingBeastEntity
- Issue 02: Server SQLite Schema and Persistence
- Coding Standards
- scripts
- 03: Server Persistence and Colyseus Room Messages
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- Requirements
- 04-client-roaming-beast-renderer-and-interaction
- Ticket 01: Shared Chat Types and Server Overworld Room Broadcast

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 118 edges
2. `OverworldScene` - 68 edges
3. `Element` - 67 edges
4. `InventoryState` - 61 edges
5. `getItemDefinition()` - 47 edges
6. `vitest` - 46 edges
7. `PlayerRosterState` - 45 edges
8. `BattleScene` - 43 edges
9. `InventoryModalController` - 42 edges
10. `OverworldRoom` - 38 edges

## Surprising Connections (you probably didn't know these)
- `Description` --references--> `BattleScene`  [INFERRED]
  .scratch/inventory-system/issues/04-battle-scene-item-hud-and-qa-toolbar.md → packages/client/src/scenes/BattleScene.ts
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.5 UI & User Experience` --references--> `SkillTreeModalController`  [INFERRED]
  .scratch/elemental-skill-tree/spec.md → packages/client/src/ui/SkillTreeModalController.ts
- `Description` --references--> `HeroRepository`  [INFERRED]
  .scratch/warehouse-and-inn-storage/issues/02-server-sqlite-schema-and-persistence.md → packages/server/src/db/HeroRepository.ts

## Import Cycles
- None detected.

## Communities (130 total, 36 thin omitted)

### Community 0 - "warehouse-inn-ui.test.ts"
Cohesion: 0.17
Nodes (11): InnStorageModalCallbacks, ADR-0022, HeroFullSaveState, SyncHeroStatePayload, InnStorageManager, InnStorageState, Tasks, 2.4 Server & Persistence (+3 more)

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.06
Nodes (25): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+17 more)

### Community 3 - "EquipmentManager"
Cohesion: 0.19
Nodes (12): EquipmentManager, SKILL_TOMES, Attributes, EntityEquipment, EquipmentSlot, EquipmentStats, ItemDefinition, Acceptance Criteria (+4 more)

### Community 4 - "getIsometricDepth"
Cohesion: 0.14
Nodes (12): 1. Parameters & Primitive Types, OverworldEntityManagerConfig, OverworldRendererConfig, getIsometricDepth(), IsometricConfig, IsometricGrid, IsoTileCoord, isoToScreen() (+4 more)

### Community 6 - "soundManager"
Cohesion: 0.10
Nodes (6): soundManager, config, game, soundBtn, BattleSwapMenuCallbacks, ADR-0011

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.14
Nodes (3): DEFAULT_OVERWORLD_MAP, getMapConfig(), MAP_DATABASE

### Community 8 - "RosterModalController"
Cohesion: 0.09
Nodes (12): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status, CharacterModalController, RosterModalController, 04: Client UI Paperdoll and Modals Integration (+4 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 11 - "OverworldScene.ts"
Cohesion: 0.09
Nodes (6): CharacterModalCallbacks, EquipmentModalCallbacks, EQUIP_ICONS, EQUIP_SLOTS, RosterModalCallbacks, ProgressionEngine

### Community 12 - "InventoryModalController.ts"
Cohesion: 0.10
Nodes (8): InventoryModalCallbacks, ShopModalCallbacks, ShopTab, SelectedSource, ADR-0022, WarehouseModalCallbacks, ITEM_DATABASE, NPCDialogueOption

### Community 14 - ".sendChatMessage"
Cohesion: 0.13
Nodes (13): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 2. Server Authority & Broadcasting (`packages/server`), 3. Minimap Controller (`packages/client/src/ui/MinimapController.ts`), 4. Chat UI Controller (`packages/client/src/ui/ChatModalController.ts`), 5. Overworld Speech Bubbles (`packages/client/src/scenes/OverworldScene.ts`), Acceptance Criteria (+5 more)

### Community 15 - "RoamingBeastNetworkState"
Cohesion: 0.22
Nodes (7): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description, 2.2 Server AI & State Synchronization

### Community 16 - "InventoryModalController"
Cohesion: 0.09
Nodes (16): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification (+8 more)

### Community 17 - "src/types.ts"
Cohesion: 0.14
Nodes (13): SkillSlotResult, SkillUnlockResult, ADR-0008, ADR-0020, ADR-0021, BattleEventType, BattleOutcome, ItemType (+5 more)

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 21 - "TileCoord"
Cohesion: 0.15
Nodes (5): MinimapController, MinimapControllerOptions, MinimapEntities, MinimapEntity, TileCoord

### Community 23 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js

### Community 24 - "shared/src/index.ts"
Cohesion: 0.13
Nodes (9): BattleSkillMenuCallbacks, ADR-0020, CreateHeroPayload, Element, Earth, Fire, Water, Wind (+1 more)

### Community 25 - ".resolveTurn"
Cohesion: 0.20
Nodes (8): BattleSwapExecutor, ExecuteSwapParams, FORMATION_CENTER_OUT_COLUMNS, ADR-0011, BattleState, TeamActionsMap, TurnResolutionResult, 02: Deep BattleEngine and Turn Resolution

### Community 26 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.40
Nodes (4): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved

### Community 27 - "BattleScene.ts"
Cohesion: 0.12
Nodes (9): getValidTargets(), BattleEndCallback, TurnResolutionCallback, CombatAction, CombatActionType, colyseus.js, Description, Requirements (+1 more)

### Community 28 - "OverworldNetwork.ts"
Cohesion: 0.12
Nodes (9): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, MoveMessagePayload (+1 more)

### Community 29 - "MapConfig"
Cohesion: 0.27
Nodes (6): PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, ZoneDefinition

### Community 30 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

### Community 35 - "AccountRepository"
Cohesion: 0.15
Nodes (10): createAuthRouter(), toAccountSummary(), validateCredentials(), AuthenticatedRequest, PasswordUtils, AccountRecord, AccountRepository, cors (+2 more)

### Community 36 - "05: Full System Verification and Smoke Test"
Cohesion: 0.33
Nodes (5): 05: Full System Verification and Smoke Test, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 37 - "3. Architecture & Data Structures"
Cohesion: 0.13
Nodes (14): 1. Overview, 2.1 EXP Requirement Curve, 2.2 Enemy EXP Reward Curve, 2.3 Level Up Rewards, 2.4 Stat Point Allocation Effects, 2. Mathematical Domain Formulas, 3.1 Combatant Model Extension (`@poktsonline/shared`), 3.2 Progression Engine (`@poktsonline/shared/src/progression/`) (+6 more)

### Community 38 - "check-god-files.mjs"
Cohesion: 0.19
Nodes (10): CEILINGS, countLines(), __dirname, __filename, getCeilingForFile(), getFiles(), LEGACY_WHITELIST, main() (+2 more)

### Community 40 - "server/package.json"
Cohesion: 0.13
Nodes (14): @poktsonline/shared, main, name, private, type, version, colyseus, @colyseus/ws-transport (+6 more)

### Community 41 - "Issue 03: NPC Innkeeper Dialogue and Overworld Integration"
Cohesion: 0.29
Nodes (6): DialogueModalCallbacks, Blocking Edges, Description, Issue 03: NPC Innkeeper Dialogue and Overworld Integration, Tasks, Verification

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

### Community 47 - ".movePlayer"
Cohesion: 0.15
Nodes (10): MovementResult, PlayerOverworldState, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 2. Overworld Engine Portal Resolution (`@poktsonline/shared`), 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing (+2 more)

### Community 48 - "Spec: Poktsonline Core Gameplay and Battle Loop (MVP)"
Cohesion: 0.17
Nodes (11): 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Further Notes, Implementation Decisions, Out of Scope, Problem Statement (+3 more)

### Community 50 - "Combatant"
Cohesion: 0.18
Nodes (9): DebugToolbarCallbacks, findSkillTreeNode(), LevelUpResult, StatAllocationResult, SkillTreeManager, Combatant, Tasks, 2.1 Domain & Data Model (+1 more)

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "ChatMessagePayload"
Cohesion: 0.26
Nodes (6): ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload, Requirements, 1. Shared Types & Network Schema (`@poktsonline/shared`)

### Community 55 - "SkillTreeModalController"
Cohesion: 0.19
Nodes (6): SkillTreeModalController, SkillTreeNode, Description, Issue 04: Client Skill Tree Modal Controller and HUD, Tasks, Verification

### Community 65 - "ADR 0008: Four Branching Elemental Skill Trees"
Cohesion: 0.40
Nodes (4): ADR 0008: Four Branching Elemental Skill Trees, Context, Decision, Progression & Skill Points

### Community 68 - "battle-engine.ts"
Cohesion: 0.33
Nodes (8): BattleSkillExecutor, ADR-0021, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), ADR-0021, BattleEvent

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 80 - "OverworldEntityManager"
Cohesion: 0.21
Nodes (3): OverworldEntityManager, rectContains(), 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "2. Requirements"
Cohesion: 0.33
Nodes (5): 1. Overview, 2.2 Unlock & Prerequisite Rules, 2.5 UI & User Experience, 2. Requirements, Specification: Elemental Skill Tree for Hero (ADR 0008)

### Community 83 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 84 - "Issue 03: Server Persistence and Hero State"
Cohesion: 0.50
Nodes (3): Description, Issue 03: Server Persistence and Hero State, Verification

### Community 85 - "OverworldRenderer"
Cohesion: 0.13
Nodes (9): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status, OverworldRenderer (+1 more)

### Community 86 - "PlayerNetworkState"
Cohesion: 0.22
Nodes (6): PlayerNetworkState, 04: Colyseus Overworld Room Handshake and Full State Persistence, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements, 3. Server Multiplayer Synchronization (`@poktsonline/server`)

### Community 87 - "PlayerRosterState"
Cohesion: 0.18
Nodes (8): InnDepositResult, InnWithdrawResult, ADR-0020, ADR-0022, RosterManager, FormationSlot, PlayerRosterState, 01: Shared Ragnarok Champions Roster and Divine Item Database

### Community 88 - "OverworldEngine"
Cohesion: 0.33
Nodes (4): OverworldEngine, 04: Colyseus Authoritative Server Rooms, 3. Deep Module: `OverworldEngine` (Shared/Server), Testing Decisions

### Community 89 - "Issue 01: Inventory Domain Model, InventoryManager & LootEngine"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Inventory Domain Model, InventoryManager & LootEngine, Verification

### Community 90 - "02: Equipment Manager and Stat Calculation"
Cohesion: 0.33
Nodes (5): 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description, Status: resolved

### Community 91 - "InnStorageModalController"
Cohesion: 0.19
Nodes (6): InnStorageModalController, Blocking Edges, Description, Issue 04: Client Warehouse and Inn Modal Controllers, Tasks, Verification

### Community 92 - "21. 5-Slot Skill System, Signature Skills, and Elemental Affinity"
Cohesion: 0.33
Nodes (5): 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity, Consequences, Context, Decision, Status

### Community 94 - "SkillTreeModalController.ts"
Cohesion: 0.15
Nodes (7): SkillTreeModalCallbacks, ADR-0008, ADR-0020, ELEMENTAL_SKILL_TREES, getElementalSkillTree(), ADR-0008, ADR-0020

### Community 95 - "Issue 02: Skill Tomes and Inventory Learning Integration"
Cohesion: 0.33
Nodes (5): Blocked By: 01-shared-skill-types-and-skill-manager.md, Description, Issue 02: Skill Tomes and Inventory Learning Integration, Status: closed, Tasks

### Community 96 - "BattleRoom.ts"
Cohesion: 0.09
Nodes (15): BattleRoomOptions, BattleEngine, LootEngine, LootReward, TeamFormation, 1. Overview & Goals, 3. Authoritative Combat Integration (@poktsonline/server), 4. Client UI & Interactions (@poktsonline/client) (+7 more)

### Community 97 - "Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots"
Cohesion: 0.33
Nodes (5): Blocked By: 03-battle-engine-skill-execution.md, Description, Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots, Status: closed, Tasks

### Community 98 - "getSkillDefinition"
Cohesion: 0.16
Nodes (12): ELEMENTAL_SKILLS, getSkillDefinition(), getSkillDisplayName(), SKILL_DATABASE, SkillCategory, SkillDefinition, TREE_SKILLS, ADR-0008 (+4 more)

### Community 99 - "InventoryState"
Cohesion: 0.13
Nodes (17): InventoryManager, ShopManager, ADR-0020, ADR-0020, ADR-0022, WarehouseGoldResult, WarehouseItemResult, WarehouseManager (+9 more)

### Community 100 - "2. Detailed Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types (`@poktsonline/shared`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish, 2. Detailed Requirements, Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

### Community 101 - "BattleState.ts"
Cohesion: 0.40
Nodes (3): BattleRoomState, CombatantNetworkState, @colyseus/schema

### Community 102 - ".onCreate"
Cohesion: 0.29
Nodes (4): determineDirection(), 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 103 - "Issue 02: Skill Tree Manager and Progression Engine"
Cohesion: 0.21
Nodes (6): Description, Issue 02: Skill Tree Manager and Progression Engine, Verification, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective, Tasks

### Community 105 - "2. Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Domain & Data Models (`@poktsonline/shared`), 2.3 NPC & Dialogue Integration (`packages/shared` & `packages/client`), 2.4 Client Deep UI Controllers (`@poktsonline/client`), 2.5 Guardrails & Anti-God-Files Compliance (ADR 0020), 2. Requirements, Feature Specification: Item Warehouse and Inn Beast Storage

### Community 106 - "BattleSwapMenuController"
Cohesion: 0.12
Nodes (12): ADR 0011: Active Beast Roster and In-Combat Swapping, Consequences, Context, Decision, Status, BattleSwapMenuController, Description, Requirements (+4 more)

### Community 107 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, supertest, @types/cors, @types/express, @types/node, @types/sql.js, @types/supertest

### Community 108 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 109 - "22. Item Warehouse and Inn Beast Storage System"
Cohesion: 0.33
Nodes (5): 22. Item Warehouse and Inn Beast Storage System, Consequences, Context, Decision, Status

### Community 110 - "OverworldRoom"
Cohesion: 0.22
Nodes (8): Key Navigation Pointers, createHeroRouter(), HeroRepository, createServer(), OverworldRoom, Description, 02: Valhalla World Maps, Bifrost Portals, and Server Spawning, 2.2 Server Persistence & World Authority (`@poktsonline/server`)

### Community 111 - "2. Domain Rules & Mechanics"
Cohesion: 0.20
Nodes (9): 1. Overview & Objective, 2.1 Action Cost & Initiator, 2.2 Formation Placement & Inheritance, 2.3 Turn Resolution Sequence, 2.4 Eligibility Criteria, 2.5 Roster Synchronization & Post-Battle Persistence, 2. Domain Rules & Mechanics, 3. Architecture & Anti-God-Files Guardrails (ADR 0020) (+1 more)

### Community 112 - ".showBattleEndBanner"
Cohesion: 0.40
Nodes (3): Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations, Objective, Tasks

### Community 113 - "2.3 Client UI Presentation (`@poktsonline/client`)"
Cohesion: 0.33
Nodes (5): 1. Overview, 2.2 Battle Engine Integration (`packages/shared/src/battle/battle-engine.ts`), 2.3 Client UI Presentation (`@poktsonline/client`), 2. Detailed Architecture, Specification: 5-Slot Skill System, Signature Skills, and Elemental Affinity

### Community 116 - "ElementalSkillTreeConfig"
Cohesion: 0.33
Nodes (5): ElementalSkillTreeConfig, Description, Issue 01: Shared Elemental Skill Tree Catalog and Types, Tasks, Verification

### Community 117 - "Requirements"
Cohesion: 0.33
Nodes (5): 1. Domain Types & Map Configurations (`@poktsonline/shared`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview, Requirements, Spec: Multi-Map World Expansion and Portals

### Community 118 - "Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module"
Cohesion: 0.33
Nodes (5): Blocked By: None, Description, Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module, Status: open, Tasks

### Community 119 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 120 - "Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats"
Cohesion: 0.40
Nodes (4): Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification

### Community 121 - "RoamingBeastEntity"
Cohesion: 0.50
Nodes (4): RoamingBeastEntity, 01-shared-roaming-beast-types, Answer, Description

### Community 122 - "Issue 02: Server SQLite Schema and Persistence"
Cohesion: 0.40
Nodes (4): Blocking Edges, Description, Issue 02: Server SQLite Schema and Persistence, Verification

### Community 123 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 124 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, start, test

### Community 125 - "03: Server Persistence and Colyseus Room Messages"
Cohesion: 0.50
Nodes (3): 03: Server Persistence and Colyseus Room Messages, Blocked By: 02-equipment-manager-and-stat-calculation.md, Status: resolved

### Community 126 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 127 - "Requirements"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 128 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

## Knowledge Gaps
- **43 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 533 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `warehouse-inn-ui.test.ts`, `BattleScene`, `EquipmentManager`, `.setupUIControllers`, `soundManager`, `OverworldRoom.ts`, `RosterModalController`, `OverworldScene.ts`, `InventoryModalController.ts`, `InventoryModalController`, `src/types.ts`, `.handleActionClick`, `EquipmentModalController`, `shared/src/index.ts`, `.resolveTurn`, `BattleScene.ts`, `MapConfig`, `BattleRoom`, `3. Architecture & Data Structures`, `SkillTreeModalController`, `battle-engine.ts`, `HeroRepository.ts`, `PlayerRosterState`, `.connectToServer`, `SkillTreeModalController.ts`, `BattleRoom.ts`, `getSkillDefinition`, `InventoryState`, `.onCreate`, `Issue 02: Skill Tree Manager and Progression Engine`, `OverworldRoom`, `.showBattleEndBanner`, `DebugToolbarController`, `ElementalSkillTreeConfig`, `Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Combatant` (e.g. with `Tasks` and `Tasks`) actually correct?**
  _`Combatant` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.05693693693693694 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `warehouse-inn-ui.test.ts`, `CharacterSelectModalController`, `04-client-roaming-beast-renderer-and-interaction`, `getIsometricDepth`, `.setupUIControllers`, `soundManager`, `RosterModalController`, `OverworldScene.ts`, `ChatController`, `InventoryModalController`, `TileCoord`, `EquipmentModalController`, `MapConfig`, `getItemDefinition`, `3. Architecture & Data Structures`, `WarehouseModalController`, `SkillTreeModalController`, `OverworldEntityManager`, `OverworldRenderer`, `PlayerRosterState`, `InnStorageModalController`, `.connectToServer`, `InventoryState`, `2. Requirements`, `.showBattleEndBanner`, `NPCDefinition`, `DebugToolbarController`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `OverworldScene` (e.g. with `Description` and `Objective`) actually correct?**
  _`OverworldScene` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `getIsometricDepth` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._