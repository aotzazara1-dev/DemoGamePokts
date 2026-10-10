# Graph Report - Poktsonline  (2026-10-10)

## Corpus Check
- 200 files · ~203,750 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 23 file(s) not represented in the graph (top: .css 14, (none) 5, .bat 4)

## Summary
- 1386 nodes · 3445 edges · 114 communities (81 shown, 33 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 397 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c65b2acd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- OverworldRoom
- CharacterSelectModalController
- BattleScene
- EquipmentManager
- OverworldEntityManager
- .setupUIControllers
- soundManager
- server/src/index.ts
- CharacterModalController
- client/tsconfig.json
- OverworldScene
- overworld-engine.test.ts
- RosterModalController.ts
- battle-engine.ts
- ChatController
- RoamingBeastNetworkState
- InventoryModalController
- OverworldRenderer
- Implementation Decisions
- compilerOptions
- package.json
- MinimapController
- EquipmentModalController
- 01: Shared Equipment Types and Catalog
- shared/src/index.ts
- SkillTreeModalController.ts
- getItemDefinition
- BattleRoom.ts
- OverworldRoom.ts
- MapConfig
- client/package.json
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- AccountRepository
- 05: Full System Verification and Smoke Test
- 3. Architecture & Data Structures
- check-god-files.mjs
- server/package.json
- NPCDefinition
- server/tsconfig.json
- shared/tsconfig.json
- AGENTS.md
- Domain Docs
- Issue tracker: Local Markdown
- Feature Specification: Inventory & Consumable Item System
- BattleEngine
- InventoryState
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
- BattleScene.ts
- 18. Mock Boundaries and Testing Conventions
- Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution
- Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards
- Coding Standards
- PlayerNetworkState
- Issue 05: Inventory Category Tabs Filtering (Consumables, Equipment, Materials)
- Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling
- .movePlayer
- 04-client-roaming-beast-renderer-and-interaction
- 02: Equipment Manager and Stat Calculation
- Issue 01: Inventory Domain Model, InventoryManager & LootEngine
- 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity
- 06: Dedicated Equipment Modal [E] and Unit Switcher
- Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions
- Issue 02: Skill Tomes and Inventory Learning Integration
- Issue 03: BattleEngine Skill Resolution and Damage Calculation
- Issue 04: BattleScene Skill Menu Controller and Roster Skill Slots
- getSkillDefinition
- getItemIcon
- src/types.ts
- skills.ts
- PlayerRosterState
- CombatAction
- .onCreate
- 2. Requirements
- 2. Requirements
- Decision
- DebugToolbarController
- Issue 02: Skill Tree Manager and Progression Engine
- Issue 03: Server Persistence and Hero State
- Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation
- Requirements

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 104 edges
2. `Element` - 61 edges
3. `OverworldScene` - 59 edges
4. `InventoryState` - 46 edges
5. `InventoryModalController` - 42 edges
6. `getItemDefinition()` - 41 edges
7. `BattleScene` - 40 edges
8. `vitest` - 38 edges
9. `OverworldRoom` - 37 edges
10. `MapConfig` - 35 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)` --references--> `OverworldScene`  [INFERRED]
  .scratch/level-progression/spec.md → packages/client/src/scenes/OverworldScene.ts
- `2.3 Client Presentation & Interaction` --references--> `OverworldScene`  [INFERRED]
  .scratch/roaming-wild-beasts/spec.md → packages/client/src/scenes/OverworldScene.ts
- `Tasks` --references--> `InventoryModalController`  [INFERRED]
  .scratch/inventory-system/issues/03-inventory-modal-controller-and-styling.md → packages/client/src/ui/InventoryModalController.ts
- `Requirements` --references--> `InventoryModalController`  [INFERRED]
  .scratch/multi-map-portals/issues/03-client-tilemap-theming-portal-rendering-and-transitions.md → packages/client/src/ui/InventoryModalController.ts
- `2.5 UI & User Experience` --references--> `SkillTreeModalController`  [INFERRED]
  .scratch/elemental-skill-tree/spec.md → packages/client/src/ui/SkillTreeModalController.ts

## Import Cycles
- None detected.

## Communities (114 total, 33 thin omitted)

### Community 0 - "OverworldRoom"
Cohesion: 0.12
Nodes (15): createHeroRouter(), HeroRepository, createServer(), OverworldRoom, HeroFullSaveState, Tasks, 2.4 Server & Persistence, 03: Server Persistence and Colyseus Room Messages (+7 more)

### Community 1 - "CharacterSelectModalController"
Cohesion: 0.08
Nodes (11): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+3 more)

### Community 2 - "BattleScene"
Cohesion: 0.06
Nodes (16): getValidTargets(), BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene, BattleSkillMenuController, CombatActionType, colyseus.js (+8 more)

### Community 3 - "EquipmentManager"
Cohesion: 0.18
Nodes (13): EquipmentModalCallbacks, EquipmentManager, SKILL_TOMES, Attributes, EntityEquipment, EquipmentSlot, EquipmentStats, ItemDefinition (+5 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.09
Nodes (15): 1. Parameters & Primitive Types, OverworldEntityManager, OverworldEntityManagerConfig, rectContains(), PlayerNetData, OverworldRendererConfig, getIsometricDepth(), IsometricConfig (+7 more)

### Community 7 - "server/src/index.ts"
Cohesion: 0.22
Nodes (5): AuthenticatedRequest, AccountRecord, cors, express, supertest

### Community 9 - "client/tsconfig.json"
Cohesion: 0.25
Nodes (7): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json

### Community 10 - "OverworldScene"
Cohesion: 0.22
Nodes (3): OverworldScene, findPath(), 03: Chief Valkyrie Brunhilde and Apocalypse Announcer Heimdall NPCs

### Community 11 - "overworld-engine.test.ts"
Cohesion: 0.14
Nodes (4): DEFAULT_OVERWORLD_MAP, MAP_DATABASE, OverworldEngine, 3. Deep Module: `OverworldEngine` (Shared/Server)

### Community 12 - "RosterModalController.ts"
Cohesion: 0.16
Nodes (4): EQUIP_ICONS, EQUIP_SLOTS, ShopTab, ITEM_DATABASE

### Community 13 - "battle-engine.ts"
Cohesion: 0.19
Nodes (9): BattleSkillExecutor, ADR-0021, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), ADR-0021, BattleEvent (+1 more)

### Community 14 - "ChatController"
Cohesion: 0.07
Nodes (22): 1. Minimap Radar Architecture, 2. In-Game Chat System Architecture, Minimap Radar and In-Game Chat System Architecture, ChatController, ChatControllerOptions, ChatChannel, ChatMessagePayload, SendChatMessagePayload (+14 more)

### Community 15 - "RoamingBeastNetworkState"
Cohesion: 0.19
Nodes (8): Authoritative Roaming Wild Beasts and Overworld Collision Encounters, OverworldState, RoamingBeastNetworkState, @colyseus/schema, 02-colyseus-roaming-beast-schema-and-ai, Answer, Description, 2.2 Server AI & State Synchronization

### Community 16 - "InventoryModalController"
Cohesion: 0.20
Nodes (5): InventoryModalController, getItemCategory(), getItemCategoryLabel(), ItemCategory, ItemStack

### Community 17 - "OverworldRenderer"
Cohesion: 0.13
Nodes (9): 17. Record of Ragnarok Theme Pivot - Isekai Traveler, Gods/Einherjar Roster, and Valkyrie Völundr Mechanics, Consequences, Context, Decision, Negative, Positive, Status, OverworldRenderer (+1 more)

### Community 18 - "Implementation Decisions"
Cohesion: 0.40
Nodes (5): 1. Architectural Structure, 2. Deep Module: `BattleEngine` (Shared/Server), 4. Room Management (Server), 5. In-Memory Data and Seed Definitions, Implementation Decisions

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.08
Nodes (24): devDependencies, husky, lint-staged, prettier, typescript, vitest, name, private (+16 more)

### Community 23 - "01: Shared Equipment Types and Catalog"
Cohesion: 0.40
Nodes (4): 01: Shared Equipment Types and Catalog, Blocked By: None, Description, Status: resolved

### Community 24 - "shared/src/index.ts"
Cohesion: 0.13
Nodes (10): MinimapControllerOptions, MinimapEntities, MinimapEntity, CreateHeroPayload, Element, Earth, Fire, Water (+2 more)

### Community 25 - "SkillTreeModalController.ts"
Cohesion: 0.11
Nodes (12): SkillTreeModalCallbacks, ADR-0008, ADR-0020, ELEMENTAL_SKILL_TREES, getElementalSkillTree(), ADR-0008, ADR-0020, ElementalSkillTreeConfig (+4 more)

### Community 27 - "BattleRoom.ts"
Cohesion: 0.14
Nodes (7): BattleRoomOptions, BattleRoomState, CombatantNetworkState, BattleState, TeamActionsMap, TeamFormation, 02: Deep BattleEngine and Turn Resolution

### Community 28 - "OverworldRoom.ts"
Cohesion: 0.16
Nodes (11): ChatMessageCallback, EncounterCallback, EquipmentUpdatedCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, determineDirection() (+3 more)

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

### Community 35 - "AccountRepository"
Cohesion: 0.23
Nodes (5): createAuthRouter(), toAccountSummary(), validateCredentials(), PasswordUtils, AccountRepository

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
Cohesion: 0.04
Nodes (46): dependencies, colyseus, @colyseus/schema, @colyseus/ws-transport, cors, express, @poktsonline/shared, sql.js (+38 more)

### Community 41 - "NPCDefinition"
Cohesion: 0.26
Nodes (4): DialogueModalCallbacks, DialogueModalController, NPCDefinition, NPCDialogueOption

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

### Community 48 - "BattleEngine"
Cohesion: 0.22
Nodes (9): BattleEngine, 3. Authoritative Combat Integration (@poktsonline/server), Further Notes, Out of Scope, Problem Statement, Solution, Spec: Poktsonline Core Gameplay and Battle Loop (MVP), Testing Decisions (+1 more)

### Community 49 - "InventoryState"
Cohesion: 0.26
Nodes (6): ShopModalCallbacks, InventoryManager, ShopManager, ADR-0020, InventoryState, Tasks

### Community 50 - "Combatant"
Cohesion: 0.21
Nodes (9): CharacterModalCallbacks, InventoryModalCallbacks, findSkillTreeNode(), LevelUpResult, ProgressionEngine, StatAllocationResult, SkillTreeManager, Combatant (+1 more)

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
Cohesion: 0.18
Nodes (6): RosterModalController, 04: Client UI Paperdoll and Modals Integration, Acceptance Criteria, Blocked By: 03-server-persistence-and-room-messages.md, Description, Status: closed

### Community 55 - "SkillTreeModalController"
Cohesion: 0.20
Nodes (6): SkillTreeModalController, SkillTreeNode, Description, Issue 04: Client Skill Tree Modal Controller and HUD, Tasks, Verification

### Community 65 - "ADR 0008: Four Branching Elemental Skill Trees"
Cohesion: 0.40
Nodes (4): ADR 0008: Four Branching Elemental Skill Trees, Context, Decision, Progression & Skill Points

### Community 78 - "20. Anti-God Files Architecture and Mandatory Graphify-First Navigation"
Cohesion: 0.33
Nodes (5): 20. Anti-God Files Architecture and Mandatory Graphify-First Navigation, Consequences, Context, Decision, Status

### Community 80 - "BattleScene.ts"
Cohesion: 0.17
Nodes (6): config, game, soundBtn, BattleSkillMenuCallbacks, ADR-0020, phaser

### Community 81 - "18. Mock Boundaries and Testing Conventions"
Cohesion: 0.33
Nodes (5): 18. Mock Boundaries and Testing Conventions, Consequences, Context, Decision, Status

### Community 82 - "Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution"
Cohesion: 0.50
Nodes (3): Issue 02: Authoritative Battle Room EXP Distribution & Victory Resolution, Objective, Tasks

### Community 83 - "Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards"
Cohesion: 0.40
Nodes (4): Description, Issue 02: Battle Engine Item Action & BattleRoom Loot Rewards, Tasks, Verification

### Community 84 - "Coding Standards"
Cohesion: 0.50
Nodes (3): 2. Monorepo Architecture & Contracts, 3. Client State & Lifecycle, Coding Standards

### Community 85 - "PlayerNetworkState"
Cohesion: 0.17
Nodes (10): PlayerNetworkState, Issue 02: Colyseus Server Multi-Map State and Portal Warp Synchronization, Objective, Requirements, 1. Domain Types & Map Configurations (`@poktsonline/shared`), 3. Server Multiplayer Synchronization (`@poktsonline/server`), 4. Client Multi-Map Rendering & Visuals (`@poktsonline/client`), Overview (+2 more)

### Community 86 - "Issue 05: Inventory Category Tabs Filtering (Consumables, Equipment, Materials)"
Cohesion: 0.33
Nodes (5): Blocked By: 03-inventory-modal-controller-and-styling.md, Description, Issue 05: Inventory Category Tabs Filtering (Consumables, Equipment, Materials), Status: closed, Tasks

### Community 87 - "Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling"
Cohesion: 0.40
Nodes (4): Description, Issue 03: Inventory Modal Controller, HTML Grid & Scoped Styling, Tasks, Verification

### Community 88 - ".movePlayer"
Cohesion: 0.15
Nodes (10): MovementResult, PlayerOverworldState, Issue 01: Shared Portal Types, Map Database, and Overworld Engine Detection, Objective, Requirements, 2. Overworld Engine Portal Resolution (`@poktsonline/shared`), 03: Overworld Navigation and Encounter Engine, 05-dual-encounter-coexistence-and-testing (+2 more)

### Community 89 - "04-client-roaming-beast-renderer-and-interaction"
Cohesion: 0.50
Nodes (3): 04-client-roaming-beast-renderer-and-interaction, Answer, Description

### Community 90 - "02: Equipment Manager and Stat Calculation"
Cohesion: 0.33
Nodes (5): 02: Equipment Manager and Stat Calculation, Acceptance Criteria, Blocked By: 01-shared-equipment-types-and-catalog.md, Description, Status: resolved

### Community 91 - "Issue 01: Inventory Domain Model, InventoryManager & LootEngine"
Cohesion: 0.50
Nodes (3): Description, Issue 01: Inventory Domain Model, InventoryManager & LootEngine, Verification

### Community 92 - "21. 5-Slot Skill System, Signature Skills, and Elemental Affinity"
Cohesion: 0.33
Nodes (5): 21. 5-Slot Skill System, Signature Skills, and Elemental Affinity, Consequences, Context, Decision, Status

### Community 93 - "06: Dedicated Equipment Modal [E] and Unit Switcher"
Cohesion: 0.33
Nodes (5): 06: Dedicated Equipment Modal [E] and Unit Switcher, Acceptance Criteria, Blocked By: 04-client-ui-paperdoll-and-modals.md, Description, Status: closed

### Community 94 - "Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions"
Cohesion: 0.50
Nodes (3): Issue 03: Client Themed Tilemaps, Portal Visuals, and Smooth Transitions, Objective, Requirements

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
Cohesion: 0.28
Nodes (6): getSkillDefinition(), getSkillDisplayName(), SkillDefinition, SkillManager, CombatantSkillSlot, 2.1 Shared Data & Types (`@poktsonline/shared`)

### Community 100 - "getItemIcon"
Cohesion: 0.15
Nodes (10): getItemIcon(), LootEngine, LootReward, 01: Shared Ragnarok Champions Roster and Divine Item Database, 1. Overview, 2.1 Shared Data & Types (`@poktsonline/shared`), 2.3 Client Visuals & Presentation (`@poktsonline/client`), 2.4 Verification & Polish (+2 more)

### Community 101 - "src/types.ts"
Cohesion: 0.15
Nodes (12): SkillSlotResult, SkillUnlockResult, ADR-0008, ADR-0020, ADR-0021, BattleEventType, BattleOutcome, MapTheme (+4 more)

### Community 102 - "skills.ts"
Cohesion: 0.17
Nodes (7): ELEMENTAL_SKILLS, SKILL_DATABASE, SkillCategory, TREE_SKILLS, ADR-0008, ADR-0020, ItemType

### Community 103 - "PlayerRosterState"
Cohesion: 0.22
Nodes (5): DebugToolbarCallbacks, RosterModalCallbacks, RosterManager, FormationSlot, PlayerRosterState

### Community 104 - "CombatAction"
Cohesion: 0.17
Nodes (10): CombatAction, Blocked By: None, Description, Issue 01: Shared Skill Types, Catalog, and SkillManager Deep Module, Status: open, Tasks, 1. Overview, 2.2 Battle Engine Integration (`packages/shared/src/battle/battle-engine.ts`) (+2 more)

### Community 105 - ".onCreate"
Cohesion: 0.32
Nodes (4): getMapConfig(), 03-server-encounter-trigger-and-respawn, Answer, Description

### Community 106 - "2. Requirements"
Cohesion: 0.25
Nodes (7): 1. Overview, 2.1 Domain & Data Model, 2.2 Unlock & Prerequisite Rules, 2.3 Integration with 5-Slot Skill System, 2.5 UI & User Experience, 2. Requirements, Specification: Elemental Skill Tree for Hero (ADR 0008)

### Community 107 - "2. Requirements"
Cohesion: 0.29
Nodes (6): 1. Overview, 2.1 Shared Data & Types, 2.3 Client Presentation & Interaction, 2.4 Dual Encounter Coexistence, 2. Requirements, Specification: Roaming Wild Beasts and Dual Encounter System

### Community 108 - "Decision"
Cohesion: 0.33
Nodes (5): 19. Equipment and Völundr System for Hero and Champions, Consequences, Context, Decision, Status

### Community 110 - "Issue 02: Skill Tree Manager and Progression Engine"
Cohesion: 0.50
Nodes (3): Description, Issue 02: Skill Tree Manager and Progression Engine, Verification

### Community 111 - "Issue 03: Server Persistence and Hero State"
Cohesion: 0.50
Nodes (3): Description, Issue 03: Server Persistence and Hero State, Verification

### Community 112 - "Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation"
Cohesion: 0.50
Nodes (3): Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation, Objective, Tasks

### Community 113 - "Requirements"
Cohesion: 0.50
Nodes (3): Context, Requirements, Ticket 02: Minimap Radar Canvas and Click Navigation

## Knowledge Gaps
- **35 isolated node(s):** `husky`, `lint-staged`, `prettier`, `typescript`, `@poktsonline/shared` (+30 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 481 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `OverworldRoom`, `BattleScene`, `EquipmentManager`, `.setupUIControllers`, `CharacterModalController`, `overworld-engine.test.ts`, `RosterModalController.ts`, `battle-engine.ts`, `InventoryModalController`, `EquipmentModalController`, `shared/src/index.ts`, `SkillTreeModalController.ts`, `BattleRoom.ts`, `OverworldRoom.ts`, `MapConfig`, `BattleRoom`, `3. Architecture & Data Structures`, `InventoryState`, `SkillTreeModalController`, `BattleScene.ts`, `getSkillDefinition`, `OverworldScene.ts`, `getItemIcon`, `src/types.ts`, `PlayerRosterState`, `CombatAction`, `.onCreate`, `DebugToolbarController`, `Issue 01: Core Progression Engine, EXP Formulas & Stat Allocation`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Combatant` (e.g. with `Tasks` and `Tasks`) actually correct?**
  _`Combatant` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `husky`, `lint-staged`, `prettier` to the rest of the system?**
  _35 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `OverworldRoom` be split into smaller, more focused modules?**
  _Cohesion score 0.12413793103448276 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `CharacterSelectModalController`, `BattleScene`, `OverworldEntityManager`, `.setupUIControllers`, `CharacterModalController`, `ChatController`, `InventoryModalController`, `OverworldRenderer`, `MinimapController`, `EquipmentModalController`, `getItemDefinition`, `MapConfig`, `.isAnyModalOpen`, `3. Architecture & Data Structures`, `NPCDefinition`, `InventoryState`, `RosterModalController`, `SkillTreeModalController`, `BattleScene.ts`, `04-client-roaming-beast-renderer-and-interaction`, `OverworldScene.ts`, `PlayerRosterState`, `2. Requirements`, `DebugToolbarController`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `OverworldScene` (e.g. with `Description` and `Objective`) actually correct?**
  _`OverworldScene` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `CharacterSelectModalController` be split into smaller, more focused modules?**
  _Cohesion score 0.08022598870056497 - nodes in this community are weakly interconnected._