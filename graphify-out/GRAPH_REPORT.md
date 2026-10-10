# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 223 files · ~215,205 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 25 file(s) not represented in the graph (top: .css 16, (none) 5, .bat 4)

## Summary
- 1545 nodes · 3914 edges · 124 communities (86 shown, 38 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 443 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cb9a9890`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OverworldRoom
- CharacterSelectModalController
- BattleScene
- src/types.ts
- 1. Parameters & Primitive Types
- soundManager
- server/src/index.ts
- CharacterModalController
- client/tsconfig.json
- OverworldScene
- InventoryModalController.ts
- InventoryState
- ChatController
- PlayerNetworkState
- InventoryModalController
- OverworldRenderer
- Implementation Decisions
- compilerOptions
- package.json
- TileCoord
- EquipmentModalController
- DialogueModalController
- shared/src/index.ts
- battle-engine.ts
- 01: Shared Equipment Types and Catalog
- BattleScene.ts
- OverworldRoom.ts
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
- DialogueModalController.ts
- server/tsconfig.json
- shared/tsconfig.json
- AGENTS.md
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- Spec: Poktsonline Core Gameplay and Battle Loop (MVP)
- WarehouseModalController
- Combatant
- Issue 04: Stat Points Allocation UI for Hero and Beasts
- Ticket 03: Client Chat UI Controller and Input Guard
- Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification
- RosterModalController.ts
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
- ADR 0011: Active Beast Roster and In-Combat Swapping
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
- DatabaseEngine
- OverworldEntityManager
- 18. Mock Boundaries and Testing Conventions
- .addExpToCombatant
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- Issue 03: Server Persistence and Hero State
- Requirements
- Equipment and Völundr System Specification
- InnStorageState
- overworld-engine.ts
- Issue 01: Inventory Domain Model, InventoryManager & LootEngine
- 02: Equipment Manager and Stat Calculation
- InnStorageModalController
- 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity
- OverworldNetwork
- SkillTreeModalController.ts
- Issue 02: Skill Tomes and Inventory Learning Integration
- Issue 03: BattleEngine Skill Resolution and Damage Calculation
- Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots
- getSkillDefinition
- WarehouseState
- 2. Detailed Requirements
- BattleState.ts
- Issue 02: Server SQLite Schema and Persistence
- PlayerRosterState
- BattleNetwork
- .onCreate
- .handleActionClick
- 2. Requirements
- HeroRepository.ts
- RosterModalController
- HeroRepository
- 2. Domain Rules & Mechanics
- .playResolutionSequence
- BattleSkillMenuController
- 2. Requirements
- DebugToolbarController
- LootEngine
- Decision
- 22. Item Warehouse and Inn Beast Storage System
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats
- Issue 01: Shared Elemental Skill Tree Catalog and Types
- Ticket 02: BattleSwapMenuController and UI Modal
- 04-client-roaming-beast-renderer-and-interaction

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 118 edges
2. `OverworldScene` - 68 edges
3. `Element` - 66 edges
4. `InventoryState` - 61 edges
5. `getItemDefinition()` - 47 edges
6. `vitest` - 45 edges
7. `PlayerRosterState` - 45 edges
8. `BattleScene` - 43 edges
9. `InventoryModalController` - 42 edges
10. `OverworldRoom` - 37 edges

## Surprising Connections (you probably didn't know these)
- `Description` --references--> `BattleScene`  [INFERRED]
  .scratch/inventory-system/issues/04-battle-scene-item-hud-and-qa-toolbar.md → packages/client/src/scenes/BattleScene.ts
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Description` --references--> `BattleSwapMenuController`  [INFERRED]
  .scratch/in-combat-beast-swapping/issues/02-battle-swap-menu-controller-and-ui.md → packages/client/src/ui/BattleSwapMenuController.ts
- `Description` --references--> `HeroRepository`  [INFERRED]
  .scratch/warehouse-and-inn-storage/issues/02-server-sqlite-schema-and-persistence.md → packages/server/src/db/HeroRepository.ts

## Import Cycles
- None detected.

## Communities (124 total, 38 thin omitted)

### Community 0 - "OverworldRoom"
Cohesion: 0.16
Nodes (14): OverworldRoom, HeroFullSaveState, SyncHeroStatePayload, Direction, Tasks, 2.4 Server & Persistence, 03: Server Persistence and Colyseus Room Messages, Acceptance Criteria (+6 more)

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.06
Nodes (25): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+17 more)

### Community 3 - "src/types.ts"
Cohesion: 0.19
Nodes (15): EquipmentManager, SKILL_TOMES, Attributes, BattleEventType, BattleOutcome, EntityEquipment, EquipmentSlot, EquipmentStats (+7 more)

### Community 4 - "1. Parameters & Primitive Types"
Cohesion: 0.33
Nodes (5): 1. Parameters & Primitive Types, 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards, IsometricConfig

### Community 6 - "soundManager"
Cohesion: 0.11
Nodes (4): soundManager, config, game, soundBtn

### Community 7 - "server/src/index.ts"
Cohesion: 0.17
Nodes (8): toAccountSummary(), validateCredentials(), AuthenticatedRequest, PasswordUtils, AccountRecord, cors, express, supertest

### Community 8 - "CharacterModalController"
Cohesion: 0.18
Nodes (6): CharacterModalController, 04: Client UI Paperdoll and Modals Integration, Acceptance Criteria, Blocked By: 03-server-persistence-and-room-messages.md, Description, Status: closed

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.21
Nodes (3): OverworldScene, findPath(), 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 12 - "InventoryModalController.ts"
Cohesion: 0.12
Nodes (10): CharacterModalCallbacks, DebugToolbarCallbacks, EquipmentModalCallbacks, InventoryModalCallbacks, ShopModalCallbacks, ShopTab, SelectedSource, ADR-0022 (+2 more)

### Community 13 - "InventoryState"
Cohesion: 0.30
Nodes (5): InventoryManager, ShopManager, ADR-0020, InventoryState, Tasks

### Community 14 - "ChatController"
Cohesion: 0.06
Nodes (29): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative (+21 more)

### Community 15 - "PlayerNetworkState"
Cohesion: 0.13
Nodes (13): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, PlayerNetworkState, RoamingBeastNetworkState, @colyseus/schema, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements (+5 more)

### Community 16 - "InventoryModalController"
Cohesion: 0.09
Nodes (16): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification (+8 more)

### Community 18 - "Implementation Decisions"
Cohesion: 0.33
Nodes (6): 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 3. Deep Module: `OverworldEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 21 - "TileCoord"
Cohesion: 0.12
Nodes (9): OverworldRendererConfig, MinimapController, MinimapControllerOptions, MinimapEntities, MinimapEntity, TileCoord, Context, Requirements (+1 more)

### Community 24 - "shared/src/index.ts"
Cohesion: 0.18
Nodes (6): Element, Earth, Fire, Water, Wind, vitest

### Community 25 - "battle-engine.ts"
Cohesion: 0.12
Nodes (20): BattleEngine, BattleSkillExecutor, ADR-0021, BattleSwapExecutor, ExecuteSwapParams, ADR-0011, calculateDamage(), canTriggerCombo() (+12 more)

### Community 26 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.40
Nodes (4): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved

### Community 27 - "BattleScene.ts"
Cohesion: 0.10
Nodes (7): getValidTargets(), BattleEndCallback, TurnResolutionCallback, BattleRoomOptions, ItemType, TeamFormation, colyseus.js

### Community 28 - "OverworldRoom.ts"
Cohesion: 0.11
Nodes (9): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, MoveMessagePayload (+1 more)

### Community 29 - "MapConfig"
Cohesion: 0.21
Nodes (9): PathfindingOptions, RoamingBeastManager, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition, 01-shared-roaming-beast-types, Answer (+1 more)

### Community 30 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

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
Cohesion: 0.06
Nodes (33): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js (+25 more)

### Community 41 - "DialogueModalController.ts"
Cohesion: 0.18
Nodes (7): DialogueModalCallbacks, NPCDialogueOption, Blocking Edges, Description, Issue 03: NPC Innkeeper Dialogue and Overworld Integration, Tasks, Verification

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

### Community 48 - "Spec: Poktsonline Core Gameplay and Battle Loop (MVP)"
Cohesion: 0.29
Nodes (6): Further Notes, Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), User Stories

### Community 50 - "Combatant"
Cohesion: 0.17
Nodes (12): findSkillTreeNode(), LevelUpResult, ProgressionEngine, StatAllocationResult, SkillSlotResult, SkillTreeManager, SkillUnlockResult, ADR-0008 (+4 more)

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 54 - "RosterModalController.ts"
Cohesion: 0.10
Nodes (14): BattleSkillMenuCallbacks, ADR-0020, BattleSwapMenuCallbacks, ADR-0011, EQUIP_ICONS, EQUIP_SLOTS, ELEMENTAL_SKILLS, getSkillDisplayName() (+6 more)

### Community 55 - "SkillTreeModalController"
Cohesion: 0.12
Nodes (12): SkillTreeModalController, SkillTreeNode, Description, Issue 04: Client Skill Tree Modal Controller and HUD, Tasks, Verification, 1. Overview, 2.2 Unlock & Prerequisite Rules (+4 more)

### Community 65 - "ADR 0008: Four Branching Elemental Skill Trees"
Cohesion: 0.40
Nodes (4): ADR 0008: Four Branching Elemental Skill Trees, Context, Decision, Progression & Skill Points

### Community 68 - "ADR 0011: Active Beast Roster and In-Combat Swapping"
Cohesion: 0.33
Nodes (5): ADR 0011: Active Beast Roster and In-Combat Swapping, Consequences, Context, Decision, Status

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 80 - "OverworldEntityManager"
Cohesion: 0.11
Nodes (12): OverworldEntityManager, OverworldEntityManagerConfig, rectContains(), PlayerNetData, getIsometricDepth(), IsometricGrid, IsoTileCoord, isoToScreen() (+4 more)

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - ".addExpToCombatant"
Cohesion: 0.18
Nodes (8): Description, Issue 02: Skill Tree Manager and Progression Engine, Tasks, Verification, 2.1 Domain & Data Model, Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 84 - "Issue 03: Server Persistence and Hero State"
Cohesion: 0.50
Nodes (3): Description, Issue 03: Server Persistence and Hero State, Verification

### Community 85 - "Requirements"
Cohesion: 0.33
Nodes (5): 1. Domain Types & Map Configurations (`@poktsonline/shared`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview, Requirements, Spec: Multi-Map World Expansion and Portals

### Community 86 - "Equipment and Völundr System Specification"
Cohesion: 0.50
Nodes (3): Architecture & Data Flow, Equipment and Völundr System Specification, Objective

### Community 87 - "InnStorageState"
Cohesion: 0.16
Nodes (12): InnStorageModalCallbacks, ADR-0022, InnDepositResult, InnStorageManager, InnWithdrawResult, ADR-0020, ADR-0022, InnStorageState (+4 more)

### Community 88 - "overworld-engine.ts"
Cohesion: 0.12
Nodes (14): DEFAULT_OVERWORLD_MAP, MAP_DATABASE, OverworldEngine, MovementResult, PlayerOverworldState, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements (+6 more)

### Community 89 - "Issue 01: Inventory Domain Model, InventoryManager & LootEngine"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Inventory Domain Model, InventoryManager & LootEngine, Verification

### Community 90 - "02: Equipment Manager and Stat Calculation"
Cohesion: 0.33
Nodes (5): 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description, Status: resolved

### Community 91 - "InnStorageModalController"
Cohesion: 0.18
Nodes (6): InnStorageModalController, Blocking Edges, Description, Issue 04: Client Warehouse and Inn Modal Controllers, Tasks, Verification

### Community 92 - "21. 5-Slot Skill System, Signature Skills, and Elemental Affinity"
Cohesion: 0.33
Nodes (5): 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity, Consequences, Context, Decision, Status

### Community 94 - "SkillTreeModalController.ts"
Cohesion: 0.14
Nodes (9): SkillTreeModalCallbacks, ADR-0008, ADR-0020, ELEMENTAL_SKILL_TREES, getElementalSkillTree(), ADR-0008, ADR-0020, ElementalSkillTreeConfig (+1 more)

### Community 95 - "Issue 02: Skill Tomes and Inventory Learning Integration"
Cohesion: 0.33
Nodes (5): Blocked By: 01-shared-skill-types-and-skill-manager.md, Description, Issue 02: Skill Tomes and Inventory Learning Integration, Status: closed, Tasks

### Community 96 - "Issue 03: BattleEngine Skill Resolution and Damage Calculation"
Cohesion: 0.33
Nodes (5): Blocked By: 01-shared-skill-types-and-skill-manager.md, Description, Issue 03: BattleEngine Skill Resolution and Damage Calculation, Status: closed, Tasks

### Community 97 - "Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots"
Cohesion: 0.33
Nodes (5): Blocked By: 03-battle-engine-skill-execution.md, Description, Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots, Status: closed, Tasks

### Community 98 - "getSkillDefinition"
Cohesion: 0.19
Nodes (10): getSkillDefinition(), SkillDefinition, SkillManager, CombatantSkillSlot, Blocked By: None, Description, Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module, Status: open (+2 more)

### Community 99 - "WarehouseState"
Cohesion: 0.23
Nodes (8): WarehouseModalCallbacks, ADR-0020, ADR-0022, WarehouseGoldResult, WarehouseItemResult, WarehouseManager, ItemStack, WarehouseState

### Community 100 - "2. Detailed Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.2 Server Persistence & World Authority (`@poktsonline/server`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish, 2. Detailed Requirements, Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

### Community 102 - "Issue 02: Server SQLite Schema and Persistence"
Cohesion: 0.40
Nodes (4): Blocking Edges, Description, Issue 02: Server SQLite Schema and Persistence, Verification

### Community 103 - "PlayerRosterState"
Cohesion: 0.17
Nodes (8): RosterModalCallbacks, RosterManager, FormationSlot, PlayerRosterState, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective, Tasks, 2.1 Shared Data & Types (`@poktsonline/shared`)

### Community 105 - ".onCreate"
Cohesion: 0.28
Nodes (5): determineDirection(), getMapConfig(), 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 106 - ".handleActionClick"
Cohesion: 0.21
Nodes (4): BattleSwapMenuController, Description, Requirements, Ticket 03: BattleScene Swap Action and Sprite Rendering

### Community 107 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 110 - "HeroRepository"
Cohesion: 0.33
Nodes (4): createHeroRouter(), HeroRepository, createServer(), 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

### Community 111 - "2. Domain Rules & Mechanics"
Cohesion: 0.20
Nodes (9): 1. Overview & Objective, 2.1 Action Cost & Initiator, 2.2 Formation Placement & Inheritance, 2.3 Turn Resolution Sequence, 2.4 Eligibility Criteria, 2.5 Roster Synchronization & Post-Battle Persistence, 2. Domain Rules & Mechanics, 3. Architecture & Anti-God-Files Guardrails (ADR 0020) (+1 more)

### Community 112 - ".playResolutionSequence"
Cohesion: 0.22
Nodes (3): Issue 03: BattleScene Victory Banner EXP & Level Up Celebrations, Objective, Tasks

### Community 113 - "BattleSkillMenuController"
Cohesion: 0.22
Nodes (6): BattleSkillMenuController, 1. Overview, 2.2 Battle Engine Integration (`packages/shared/src/battle/battle-engine.ts`), 2.3 Client UI Presentation (`@poktsonline/client`), 2. Detailed Architecture, Specification: 5-Slot Skill System, Signature Skills, and Elemental Affinity

### Community 114 - "2. Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Domain & Data Models (`@poktsonline/shared`), 2.3 NPC & Dialogue Integration (`packages/shared` & `packages/client`), 2.4 Client Deep UI Controllers (`@poktsonline/client`), 2.5 Guardrails & Anti-God-Files Compliance (ADR 0020), 2. Requirements, Feature Specification: Item Warehouse and Inn Beast Storage

### Community 116 - "LootEngine"
Cohesion: 0.33
Nodes (4): LootEngine, LootReward, 5. Verification, 01: Shared Ragnarok Champions Roster and Divine Item Database

### Community 117 - "Decision"
Cohesion: 0.33
Nodes (5): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status

### Community 118 - "22. Item Warehouse and Inn Beast Storage System"
Cohesion: 0.33
Nodes (5): 22. Item Warehouse and Inn Beast Storage System, Consequences, Context, Decision, Status

### Community 119 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 120 - "Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats"
Cohesion: 0.40
Nodes (4): Description, Issue 04: In-Combat Item Action Picker & QA Toolbar Cheats, Tasks, Verification

### Community 121 - "Issue 01: Shared Elemental Skill Tree Catalog and Types"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Shared Elemental Skill Tree Catalog and Types, Verification

### Community 122 - "Ticket 02: BattleSwapMenuController and UI Modal"
Cohesion: 0.50
Nodes (3): Description, Requirements, Ticket 02: BattleSwapMenuController and UI Modal

### Community 123 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

## Knowledge Gaps
- **43 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 532 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `OverworldRoom`, `BattleScene`, `src/types.ts`, `.setupUIControllers`, `CharacterModalController`, `OverworldScene.ts`, `InventoryModalController.ts`, `InventoryState`, `InventoryModalController`, `EquipmentModalController`, `shared/src/index.ts`, `battle-engine.ts`, `BattleScene.ts`, `MapConfig`, `3. Architecture & Data Structures`, `RosterModalController.ts`, `SkillTreeModalController`, `.addExpToCombatant`, `InnStorageState`, `overworld-engine.ts`, `SkillTreeModalController.ts`, `getSkillDefinition`, `WarehouseState`, `BattleState.ts`, `PlayerRosterState`, `.onCreate`, `.handleActionClick`, `HeroRepository.ts`, `HeroRepository`, `.playResolutionSequence`, `DebugToolbarController`, `LootEngine`?**
  _High betweenness centrality (0.121) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Combatant` (e.g. with `Tasks` and `Tasks`) actually correct?**
  _`Combatant` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.05693693693693694 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `OverworldRoom`, `CharacterSelectModalController`, `.setupUIControllers`, `soundManager`, `CharacterModalController`, `OverworldScene.ts`, `InventoryState`, `ChatController`, `InventoryModalController`, `OverworldRenderer`, `TileCoord`, `EquipmentModalController`, `DialogueModalController`, `MapConfig`, `getItemDefinition`, `3. Architecture & Data Structures`, `WarehouseModalController`, `SkillTreeModalController`, `OverworldEntityManager`, `InnStorageState`, `InnStorageModalController`, `OverworldNetwork`, `WarehouseState`, `PlayerRosterState`, `2. Requirements`, `RosterModalController`, `.playResolutionSequence`, `DebugToolbarController`, `04-client-roaming-beast-renderer-and-interaction`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `OverworldScene` (e.g. with `Description` and `Objective`) actually correct?**
  _`OverworldScene` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `soundManager` be split into smaller, more focused modules?**
  _Cohesion score 0.11494252873563218 - nodes in this community are weakly interconnected._