# .setupUIControllers

> 29 nodes · cohesion 0.11

## Key Concepts

- **.setupUIControllers()** (50 connections) — `packages/client/src/scenes/OverworldScene.ts`
- **.connectToServer()** (23 connections) — `packages/client/src/scenes/OverworldScene.ts`
- **OverworldNetwork** (22 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.isAnyModalOpen()** (14 connections) — `packages/client/src/scenes/OverworldScene.ts`
- **.navigateToTile()** (6 connections) — `packages/client/src/scenes/OverworldScene.ts`
- **.setActiveBeast()** (6 connections) — `packages/client/src/ui/InventoryModalController.ts`
- **.setHero()** (6 connections) — `packages/client/src/ui/InventoryModalController.ts`
- **.syncHeroSaveState()** (5 connections) — `packages/client/src/scenes/OverworldScene.ts`
- **.connect()** (3 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.sendSyncHeroState()** (3 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.sendWarpTown()** (3 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.setupRoomListeners()** (3 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.isOpen()** (3 connections) — `packages/client/src/ui/AuthModalController.ts`
- **.isOpen()** (3 connections) — `packages/client/src/ui/CharacterSelectModalController.ts`
- **.isOpen()** (3 connections) — `packages/client/src/ui/DialogueModalController.ts`
- **overworld-network.test.ts** (3 connections) — `packages/client/test/overworld-network.test.ts`
- **.getSessionId()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.onChatMessage()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.onEncounter()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.onHeroStateLoaded()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.onPortalTransition()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.sendBattleConcluded()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.sendChatMessage()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.setRoom()** (2 connections) — `packages/client/src/network/OverworldNetwork.ts`
- **.init()** (2 connections) — `packages/client/src/scenes/OverworldScene.ts`
- *... and 4 more nodes in this community*

## Relationships

- [OverworldScene](OverworldScene.md) (19 shared connections)
- [InventoryState](InventoryState.md) (14 shared connections)
- [.create](create.md) (13 shared connections)
- [OverworldEntityManager](OverworldEntityManager.md) (10 shared connections)
- [Element](Element.md) (9 shared connections)
- [CharacterModalController](CharacterModalController.md) (5 shared connections)
- [OverworldRoom.ts](OverworldRoom.ts.md) (4 shared connections)
- [RosterModalController](RosterModalController.md) (4 shared connections)
- [ChatController](ChatController.md) (4 shared connections)
- [TileCoord](TileCoord.md) (3 shared connections)
- [NPCDefinition](NPCDefinition.md) (2 shared connections)
- [Combatant](Combatant.md) (2 shared connections)

## Source Files

- `packages/client/src/network/OverworldNetwork.ts`
- `packages/client/src/scenes/OverworldScene.ts`
- `packages/client/src/ui/AuthModalController.ts`
- `packages/client/src/ui/CharacterModalController.ts`
- `packages/client/src/ui/CharacterSelectModalController.ts`
- `packages/client/src/ui/DialogueModalController.ts`
- `packages/client/src/ui/InventoryModalController.ts`
- `packages/client/src/ui/RosterModalController.ts`
- `packages/client/test/overworld-network.test.ts`

## Audit Trail

- EXTRACTED: 82 (60%)
- INFERRED: 55 (40%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*