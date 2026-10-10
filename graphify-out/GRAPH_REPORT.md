# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 215 files · ~211,387 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 25 file(s) not represented in the graph (top: .css 16, (none) 5, .bat 4)

## Summary
- 1498 nodes · 3812 edges · 110 communities (77 shown, 33 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 441 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9955920b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OverworldRoom
- CharacterSelectModalController
- BattleScene
- src/types.ts
- OverworldEntityManager.ts
- OverworldNetwork
- soundManager
- server/src/index.ts
- CharacterModalController
- client/tsconfig.json
- OverworldScene
- OverworldScene.ts
- shared/src/index.ts
- battle-engine.ts
- ChatController
- PlayerNetworkState
- InventoryModalController
- OverworldRenderer.ts
- Implementation Decisions
- compilerOptions
- package.json
- TileCoord
- EquipmentModalController
- PlayerRosterState
- Element
- packages_shared_src_index_element
- InnStorageModalController
- BattleScene.ts
- OverworldRoom.ts
- MapConfig
- client/package.json
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- .isAnyModalOpen
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
- RosterModalController
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
- DatabaseEngine
- OverworldEntityManager
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- BattleEngine
- 1. Parameters & Primitive Types
- Requirements
- Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence
- .movePlayer
- 04-client-roaming-beast-renderer-and-interaction
- 02: Equipment Manager and Stat Calculation
- 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics
- 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity
- 2. Requirements
- .createHero
- Issue 02: Skill Tomes and Inventory Learning Integration
- Issue 03: BattleEngine Skill Resolution and Damage Calculation
- Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots
- getSkillDefinition
- 22. Item Warehouse and Inn Beast Storage System
- 2. Detailed Requirements
- BattleState.ts
- Issue 02: Server SQLite Schema and Persistence
- RosterManager
- Issue 01: Shared Elemental Skill Tree Catalog and Types
- .onCreate
- Issue 01: Shared Warehouse and Inn Domain Types & Managers
- 2. Requirements
- Decision
- DebugToolbarController

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 110 edges
2. `OverworldScene` - 64 edges
3. `Element` - 64 edges
4. `InventoryState` - 60 edges
5. `getItemDefinition()` - 47 edges
6. `vitest` - 43 edges
7. `InventoryModalController` - 42 edges
8. `PlayerRosterState` - 42 edges
9. `BattleScene` - 40 edges
10. `OverworldRoom` - 37 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Description` --references--> `HeroRepository`  [INFERRED]
  .scratch/warehouse-and-inn-storage/issues/02-server-sqlite-schema-and-persistence.md → packages/server/src/db/HeroRepository.ts
- `Objective` --references--> `BattleRoom`  [INFERRED]
  .scratch/level-progression/issues/02-battle-room-exp-rewards.md → packages/server/src/rooms/BattleRoom.ts
- `1. Seams Tested` --references--> `OverworldRoom`  [INFERRED]
  .scratch/login-system/spec.md → packages/server/src/rooms/OverworldRoom.ts

## Import Cycles
- None detected.

## Communities (110 total, 33 thin omitted)

### Community 0 - "OverworldRoom"
Cohesion: 0.12
Nodes (18): Key Navigation Pointers, HeroRepository, OverworldRoom, HeroFullSaveState, Description, Issue 03: Server Persistence and Hero State, Tasks, Verification (+10 more)

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.08
Nodes (11): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+3 more)

### Community 2 - "BattleScene"
Cohesion: 0.05
Nodes (20): getValidTargets(), BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene, BattleSkillMenuController, CombatActionType, colyseus.js (+12 more)

### Community 3 - "src/types.ts"
Cohesion: 0.06
Nodes (42): EquipmentModalCallbacks, ShopModalCallbacks, ShopModalController, WarehouseModalCallbacks, EquipmentManager, InventoryManager, getItemDefinition(), ITEM_DATABASE (+34 more)

### Community 4 - "OverworldEntityManager.ts"
Cohesion: 0.15
Nodes (10): OverworldEntityManagerConfig, rectContains(), PlayerNetData, getIsometricDepth(), IsometricGrid, IsoTileCoord, isoToScreen(), ScreenCoord (+2 more)

### Community 6 - "soundManager"
Cohesion: 0.11
Nodes (4): soundManager, config, game, soundBtn

### Community 7 - "server/src/index.ts"
Cohesion: 0.21
Nodes (7): toAccountSummary(), validateCredentials(), AuthenticatedRequest, AccountRecord, cors, express, supertest

### Community 8 - "CharacterModalController"
Cohesion: 0.19
Nodes (6): CharacterModalController, 04: Client UI Paperdoll and Modals Integration, Acceptance Criteria, Blocked By: 03-server-persistence-and-room-messages.md, Description, Status: closed

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.18
Nodes (4): OverworldScene, DialogueModalController, findPath(), NPCDefinition

### Community 12 - "shared/src/index.ts"
Cohesion: 0.14
Nodes (7): ADR-0022, EQUIP_ICONS, EQUIP_SLOTS, ShopTab, SelectedSource, ADR-0022, getItemIcon()

### Community 13 - "battle-engine.ts"
Cohesion: 0.15
Nodes (13): BattleSkillExecutor, ADR-0021, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), ADR-0021, BattleEvent (+5 more)

### Community 14 - "ChatController"
Cohesion: 0.07
Nodes (22): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, ChatController, ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload (+14 more)

### Community 15 - "PlayerNetworkState"
Cohesion: 0.13
Nodes (13): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, PlayerNetworkState, RoamingBeastNetworkState, @colyseus/schema, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements (+5 more)

### Community 16 - "InventoryModalController"
Cohesion: 0.10
Nodes (16): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification (+8 more)

### Community 17 - "OverworldRenderer.ts"
Cohesion: 0.18
Nodes (4): OverworldRenderer, OverworldRendererConfig, phaser, 04: Procedural Champion Sprites, Divine Realm Textures, and Renderer

### Community 18 - "Implementation Decisions"
Cohesion: 0.40
Nodes (5): 1. Architectural Structure, 3. Deep Module: `OverworldEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 21 - "TileCoord"
Cohesion: 0.12
Nodes (8): MinimapController, MinimapControllerOptions, MinimapEntities, MinimapEntity, TileCoord, Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

### Community 23 - "PlayerRosterState"
Cohesion: 0.22
Nodes (11): InnStorageModalCallbacks, RosterModalCallbacks, SyncHeroStatePayload, InnDepositResult, InnStorageManager, InnWithdrawResult, ADR-0020, ADR-0022 (+3 more)

### Community 24 - "Element"
Cohesion: 0.17
Nodes (6): Element, Earth, Fire, Water, Wind, vitest

### Community 25 - "packages_shared_src_index_element"
Cohesion: 0.12
Nodes (9): SkillTreeModalCallbacks, ADR-0008, ADR-0020, ELEMENTAL_SKILL_TREES, getElementalSkillTree(), ADR-0008, ADR-0020, ElementalSkillTreeConfig (+1 more)

### Community 26 - "InnStorageModalController"
Cohesion: 0.19
Nodes (6): InnStorageModalController, Blocking Edges, Description, Issue 04: Client Warehouse and Inn Modal Controllers, Tasks, Verification

### Community 27 - "BattleScene.ts"
Cohesion: 0.11
Nodes (7): BattleRoomOptions, LootEngine, BattleState, ItemType, LootReward, TeamFormation, 01: Shared Ragnarok Champions Roster and Divine Item Database

### Community 28 - "OverworldRoom.ts"
Cohesion: 0.14
Nodes (9): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, MoveMessagePayload (+1 more)

### Community 29 - "MapConfig"
Cohesion: 0.20
Nodes (10): PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition, 01-shared-roaming-beast-types (+2 more)

### Community 30 - "client/package.json"
Cohesion: 0.10
Nodes (19): dependencies, colyseus.js, phaser, @poktsonline/shared, devDependencies, happy-dom, vite, @poktsonline/shared (+11 more)

### Community 32 - "shared/package.json"
Cohesion: 0.20
Nodes (9): main, name, private, scripts, build, test, type, types (+1 more)

### Community 33 - "test-e2e-smoke.js"
Cohesion: 0.24
Nodes (6): checkPortOpen(), http, runE2ESmoke(), send(), { spawn }, WebSocket

### Community 34 - ".isAnyModalOpen"
Cohesion: 0.14
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 35 - "AccountRepository"
Cohesion: 0.28
Nodes (4): createAuthRouter(), PasswordUtils, AccountRepository, createServer()

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
Nodes (5): 1. Overview & Goals, 2. Domain Models & Types (@poktsonline/shared), 4. Client UI & Interactions (@poktsonline/client), 5. Verification, Feature Specification: Inventory & Consumable Item System

### Community 48 - "Spec: Poktsonline Core Gameplay and Battle Loop (MVP)"
Cohesion: 0.33
Nodes (5): Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), User Stories

### Community 50 - "Combatant"
Cohesion: 0.10
Nodes (20): CharacterModalCallbacks, DebugToolbarCallbacks, InventoryModalCallbacks, findSkillTreeNode(), LevelUpResult, ProgressionEngine, StatAllocationResult, SkillSlotResult (+12 more)

### Community 51 - "Issue 04: Stat Points Allocation UI for Hero and Beasts"
Cohesion: 0.50
Nodes (3): Issue 04: Stat Points Allocation UI for Hero and Beasts, Objective, Tasks

### Community 52 - "Ticket 03: Client Chat UI Controller and Input Guard"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 03: Client Chat UI Controller and Input Guard

### Community 53 - "Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 04: Overworld Speech Bubbles, System Event Hook, and Verification

### Community 55 - "SkillTreeModalController"
Cohesion: 0.13
Nodes (12): SkillTreeModalController, SkillTreeNode, Description, Issue 04: Client Skill Tree Modal Controller and HUD, Tasks, Verification, 1. Overview, 2.1 Domain & Data Model (+4 more)

### Community 65 - "ADR 0008: Four Branching Elemental Skill Trees"
Cohesion: 0.40
Nodes (4): ADR 0008: Four Branching Elemental Skill Trees, Context, Decision, Progression & Skill Points

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "BattleEngine"
Cohesion: 0.22
Nodes (8): BattleEngine, Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification, 3. Authoritative Combat Integration (@poktsonline/server), 2. Deep Module: `BattleEngine` (Shared/Server), Further Notes

### Community 84 - "1. Parameters & Primitive Types"
Cohesion: 0.33
Nodes (5): 1. Parameters & Primitive Types, 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards, IsometricConfig

### Community 85 - "Requirements"
Cohesion: 0.33
Nodes (5): 1. Domain Types & Map Configurations (`@poktsonline/shared`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview, Requirements, Spec: Multi-Map World Expansion and Portals

### Community 87 - "Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence"
Cohesion: 0.14
Nodes (13): 1. Database & Persistence Architecture, 1. Seams Tested, 2. HTTP REST Auth API (Port 2567), 2. Prior Art, 4. Server Colyseus Room Handshake & State Loading, Feature Spec: Authentication, Multi-Hero Character Selection, and SQLite Persistence, Further Notes, Implementation Decisions (+5 more)

### Community 88 - ".movePlayer"
Cohesion: 0.12
Nodes (12): OverworldEngine, MovementResult, PlayerOverworldState, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 2. Overworld Engine Portal Resolution (`@poktsonline/shared`), 03: Overworld Navigation and Encounter Engine (+4 more)

### Community 89 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

### Community 90 - "02: Equipment Manager and Stat Calculation"
Cohesion: 0.33
Nodes (5): 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description, Status: resolved

### Community 91 - "17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics"
Cohesion: 0.25
Nodes (7): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status

### Community 92 - "21. 5-Slot Skill System, Signature Skills, and Elemental Affinity"
Cohesion: 0.33
Nodes (5): 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity, Consequences, Context, Decision, Status

### Community 93 - "2. Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Domain & Data Models (`@poktsonline/shared`), 2.3 NPC & Dialogue Integration (`packages/shared` & `packages/client`), 2.4 Client Deep UI Controllers (`@poktsonline/client`), 2.5 Guardrails & Anti-God-Files Compliance (ADR 0020), 2. Requirements, Feature Specification: Item Warehouse and Inn Beast Storage

### Community 94 - ".createHero"
Cohesion: 0.33
Nodes (3): createHeroRouter(), CreateHeroPayload, 2.2 Server Persistence & World Authority (`@poktsonline/server`)

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
Cohesion: 0.10
Nodes (19): BattleSkillMenuCallbacks, ADR-0020, ELEMENTAL_SKILLS, getSkillDefinition(), getSkillDisplayName(), SKILL_DATABASE, SkillCategory, SkillDefinition (+11 more)

### Community 99 - "22. Item Warehouse and Inn Beast Storage System"
Cohesion: 0.33
Nodes (5): 22. Item Warehouse and Inn Beast Storage System, Consequences, Context, Decision, Status

### Community 100 - "2. Detailed Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types (`@poktsonline/shared`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish, 2. Detailed Requirements, Specification: Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr

### Community 102 - "Issue 02: Server SQLite Schema and Persistence"
Cohesion: 0.40
Nodes (4): Blocking Edges, Description, Issue 02: Server SQLite Schema and Persistence, Verification

### Community 103 - "RosterManager"
Cohesion: 0.22
Nodes (4): RosterManager, Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective, Tasks

### Community 104 - "Issue 01: Shared Elemental Skill Tree Catalog and Types"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Shared Elemental Skill Tree Catalog and Types, Verification

### Community 105 - ".onCreate"
Cohesion: 0.28
Nodes (5): determineDirection(), getMapConfig(), 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 106 - "Issue 01: Shared Warehouse and Inn Domain Types & Managers"
Cohesion: 0.50
Nodes (3): Issue 01: Shared Warehouse and Inn Domain Types & Managers, Tasks, Verification

### Community 107 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 108 - "Decision"
Cohesion: 0.33
Nodes (5): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status

## Knowledge Gaps
- **41 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 511 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `OverworldRoom`, `BattleScene`, `src/types.ts`, `CharacterModalController`, `OverworldScene.ts`, `shared/src/index.ts`, `battle-engine.ts`, `InventoryModalController`, `EquipmentModalController`, `PlayerRosterState`, `Element`, `packages_shared_src_index_element`, `BattleScene.ts`, `MapConfig`, `3. Architecture & Data Structures`, `RosterModalController`, `SkillTreeModalController`, `.setupUIControllers`, `.createHero`, `getSkillDefinition`, `BattleState.ts`, `RosterManager`, `.onCreate`, `DebugToolbarController`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Combatant` (e.g. with `Tasks` and `Tasks`) actually correct?**
  _`Combatant` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OverworldRoom` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `CharacterSelectModalController`, `BattleScene`, `src/types.ts`, `OverworldEntityManager.ts`, `OverworldNetwork`, `soundManager`, `CharacterModalController`, `OverworldScene.ts`, `ChatController`, `InventoryModalController`, `OverworldRenderer.ts`, `TileCoord`, `EquipmentModalController`, `PlayerRosterState`, `InnStorageModalController`, `MapConfig`, `.isAnyModalOpen`, `3. Architecture & Data Structures`, `WarehouseModalController`, `RosterModalController`, `SkillTreeModalController`, `OverworldEntityManager`, `.setupUIControllers`, `04-client-roaming-beast-renderer-and-interaction`, `2. Requirements`, `DebugToolbarController`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `OverworldScene` (e.g. with `Description` and `Objective`) actually correct?**
  _`OverworldScene` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.07978142076502732 - nodes in this community are weakly interconnected._