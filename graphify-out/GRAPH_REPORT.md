# Graph Report - Poktsonline  (2026-10-09)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 792 nodes · 2249 edges · 40 communities (29 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 170 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- HeroRepository.ts
- Element
- BattleScene.ts
- InventoryState
- OverworldEntityManager
- .setupUIControllers
- SoundManager
- OverworldRoom.ts
- client/tsconfig.json
- OverworldScene
- BattleRoom.ts
- shared/src/index.ts
- ChatController
- battle-engine.ts
- Combatant
- MapConfig
- src/types.ts
- .create
- compilerOptions
- package.json
- TileCoord
- OverworldRenderer.ts
- server/package.json
- overworld-engine.ts
- CharacterModalController
- PlayerRosterState
- RosterModalController
- client/package.json
- isometric.ts
- NPCDefinition
- BattleRoom
- shared/package.json
- test-e2e-smoke.js
- dependencies
- devDependencies
- scripts
- dependencies
- scripts

## God Nodes (most connected - your core abstractions)
1. `Combatant` - 57 edges
2. `OverworldScene` - 47 edges
3. `Element` - 45 edges
4. `BattleScene` - 36 edges
5. `InventoryState` - 33 edges
6. `MapConfig` - 29 edges
7. `SoundManager` - 29 edges
8. `vitest` - 29 edges
9. `OverworldEntityManager` - 28 edges
10. `InventoryModalController` - 27 edges

## Surprising Connections (you probably didn't know these)
- `OverworldRoom` --references--> `MapConfig`  [EXTRACTED]
  packages/server/src/rooms/OverworldRoom.ts → packages/shared/src/types.ts
- `OverworldNetwork` --references--> `HeroFullSaveState`  [EXTRACTED]
  packages/client/src/network/OverworldNetwork.ts → packages/shared/src/auth/types.ts
- `HeroFullSaveState` --references--> `Combatant`  [EXTRACTED]
  packages/shared/src/auth/types.ts → packages/shared/src/types.ts
- `HeroFullSaveState` --references--> `Direction`  [EXTRACTED]
  packages/shared/src/auth/types.ts → packages/shared/src/types.ts
- `HeroFullSaveState` --references--> `InventoryState`  [EXTRACTED]
  packages/shared/src/auth/types.ts → packages/shared/src/types.ts

## Import Cycles
- None detected.

## Communities (40 total, 11 thin omitted)

### Community 0 - "HeroRepository.ts"
Cohesion: 0.08
Nodes (16): createAuthRouter(), toAccountSummary(), validateCredentials(), AuthenticatedRequest, createHeroRouter(), PasswordUtils, AccountRecord, AccountRepository (+8 more)

### Community 1 - "Element"
Cohesion: 0.08
Nodes (15): AuthService, HeroService, AuthModalCallbacks, AuthModalController, CharacterSelectCallbacks, CharacterSelectModalController, AccountSummary, AuthSessionResponse (+7 more)

### Community 2 - "BattleScene.ts"
Cohesion: 0.06
Nodes (14): getValidTargets(), config, game, soundBtn, BattleEndCallback, BattleNetwork, TurnResolutionCallback, BattleScene (+6 more)

### Community 3 - "InventoryState"
Cohesion: 0.10
Nodes (10): DebugToolbarCallbacks, InventoryModalCallbacks, InventoryModalController, ShopModalCallbacks, ShopModalController, ShopTab, InventoryManager, getItemDefinition() (+2 more)

### Community 4 - "OverworldEntityManager"
Cohesion: 0.17
Nodes (7): OverworldEntityManager, OverworldEntityManagerConfig, rectContains(), PlayerNetData, getIsometricDepth(), isoToScreen(), PortalDefinition

### Community 7 - "OverworldRoom.ts"
Cohesion: 0.12
Nodes (13): ChatMessageCallback, EncounterCallback, HeroStateLoadedCallback, PlayerCallback, PlayerRemoveCallback, PortalTransitionCallback, OverworldState, PlayerNetworkState (+5 more)

### Community 9 - "client/tsconfig.json"
Cohesion: 0.09
Nodes (19): compilerOptions, noEmit, outDir, rootDir, extends, include, ../../tsconfig.json, compilerOptions (+11 more)

### Community 11 - "BattleRoom.ts"
Cohesion: 0.14
Nodes (7): BattleRoomOptions, BattleRoomState, CombatantNetworkState, BattleEngine, TeamActionsMap, TeamFormation, @colyseus/schema

### Community 12 - "shared/src/index.ts"
Cohesion: 0.20
Nodes (6): ChatControllerOptions, MinimapControllerOptions, MinimapEntities, MinimapEntity, ChatChannel, vitest

### Community 14 - "battle-engine.ts"
Cohesion: 0.17
Nodes (8): ELEMENTAL_SKILLS, SkillDefinition, calculateDamage(), canTriggerCombo(), ELEMENT_ADVANTAGES, getElementMultiplier(), BattleOutcome, TurnResolutionResult

### Community 15 - "Combatant"
Cohesion: 0.24
Nodes (5): CharacterModalCallbacks, LevelUpResult, ProgressionEngine, StatAllocationResult, Combatant

### Community 16 - "MapConfig"
Cohesion: 0.26
Nodes (7): PathfindingOptions, RoamingBeastManager, Direction, EncounterPoolEntry, MapConfig, RoamingBeastEntity, ZoneDefinition

### Community 17 - "src/types.ts"
Cohesion: 0.16
Nodes (12): ITEM_DATABASE, LootEngine, Attributes, BattleEventType, ItemDefinition, ItemStack, ItemType, LootReward (+4 more)

### Community 19 - "compilerOptions"
Cohesion: 0.12
Nodes (15): compilerOptions, declaration, declarationMap, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, module, moduleResolution (+7 more)

### Community 20 - "package.json"
Cohesion: 0.13
Nodes (14): devDependencies, typescript, vitest, name, private, scripts, build, client (+6 more)

### Community 22 - "OverworldRenderer.ts"
Cohesion: 0.19
Nodes (3): OverworldRenderer, OverworldRendererConfig, IsometricConfig

### Community 23 - "server/package.json"
Cohesion: 0.14
Nodes (13): main, name, private, type, version, colyseus, @colyseus/ws-transport, sql.js (+5 more)

### Community 24 - "overworld-engine.ts"
Cohesion: 0.23
Nodes (7): determineDirection(), DEFAULT_OVERWORLD_MAP, getMapConfig(), MAP_DATABASE, OverworldEngine, MovementResult, PlayerOverworldState

### Community 26 - "PlayerRosterState"
Cohesion: 0.29
Nodes (4): RosterModalCallbacks, RosterManager, FormationSlot, PlayerRosterState

### Community 28 - "client/package.json"
Cohesion: 0.18
Nodes (10): devDependencies, happy-dom, vite, @poktsonline/shared, name, private, type, version (+2 more)

### Community 29 - "isometric.ts"
Cohesion: 0.24
Nodes (4): IsometricGrid, IsoTileCoord, ScreenCoord, screenToIso()

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

### Community 36 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, preview, test

### Community 37 - "dependencies"
Cohesion: 0.50
Nodes (4): dependencies, colyseus.js, phaser, @poktsonline/shared

### Community 38 - "scripts"
Cohesion: 0.50
Nodes (4): scripts, build, start, test

## Knowledge Gaps
- **13 isolated node(s):** `Earth`, `Fire`, `Water`, `Wind`, `typescript` (+8 more)
  These have ≤1 connection - possible missing edges. (Counts symbols only; 187 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Combatant` connect `Combatant` to `HeroRepository.ts`, `Element`, `BattleScene.ts`, `InventoryState`, `.setupUIControllers`, `OverworldRoom.ts`, `OverworldScene.ts`, `BattleRoom.ts`, `battle-engine.ts`, `MapConfig`, `src/types.ts`, `.create`, `overworld-engine.ts`, `CharacterModalController`, `PlayerRosterState`, `RosterModalController`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **What connects `Earth`, `Fire`, `Water` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `HeroRepository.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08439897698209718 - nodes in this community are weakly interconnected._
- **Why does `OverworldScene` connect `OverworldScene` to `Element`, `BattleScene.ts`, `InventoryState`, `OverworldEntityManager`, `.setupUIControllers`, `OverworldScene.ts`, `ChatController`, `MapConfig`, `.create`, `TileCoord`, `OverworldRenderer.ts`, `CharacterModalController`, `PlayerRosterState`, `RosterModalController`, `NPCDefinition`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Element` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Why does `SoundManager` connect `SoundManager` to `BattleScene.ts`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `BattleScene.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._