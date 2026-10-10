import Phaser from "phaser";
import {
  OverworldNetwork,
  type PlayerNetData,
} from "../network/OverworldNetwork.js";
import {
  isoToScreen,
  screenToIso,
  getIsometricDepth,
} from "../utils/isometric.js";
import {
  DEFAULT_OVERWORLD_MAP,
  getMapConfig,
  MAP_DATABASE,
  findPath,
  OverworldEngine,
  RosterManager,
  ProgressionEngine,
  InventoryManager,
  RoamingBeastManager,
  EquipmentManager,
  getItemDefinition,
  type EquipmentSlot,
  type RoamingBeastEntity,
  type MapConfig,
  type TileCoord,
  type Direction,
  type Combatant,
  type PlayerRosterState,
  type InventoryState,
  type LootReward,
  type PortalDefinition,
  type NPCDefinition,
  type HeroSummary,
  type SyncHeroStatePayload,
} from "@poktsonline/shared";
import {
  CharacterModalController,
  RosterModalController,
  InventoryModalController,
  EquipmentModalController,
  DebugToolbarController,
  DialogueModalController,
  ShopModalController,
  AuthModalController,
  CharacterSelectModalController,
  MinimapController,
  ChatController,
} from "../ui/index.js";
import { AuthService } from "../auth/AuthService.js";
import { HeroService } from "../auth/HeroService.js";
import { OverworldRenderer } from "../renderer/OverworldRenderer.js";
import { OverworldEntityManager } from "../entities/OverworldEntityManager.js";

export class OverworldScene extends Phaser.Scene {
  private network!: OverworldNetwork;
  private mapRenderer!: OverworldRenderer;
  private entityManager!: OverworldEntityManager;

  private mapConfig: MapConfig = DEFAULT_OVERWORLD_MAP;
  private tileWidth = 64;
  private tileHeight = 32;
  private originX = 1600;
  private originY = 200;

  private playerTile: TileCoord = { x: 10, y: 10 };
  private playerContainer!: Phaser.GameObjects.Container;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private isMoving = false;
  private isTransitioning = false;
  private moveCooldown = 0;

  // Dual-mode movement state
  private currentPath: TileCoord[] = [];
  private destinationMarker?: Phaser.GameObjects.Graphics;
  private pointerDownTime: number = 0;
  private pendingNPCInteraction: NPCDefinition | null = null;

  // Beast Roster and Formation state
  private roster: PlayerRosterState = RosterManager.createInitialRoster();

  // Inventory state (20-slot TS Online inventory & Gold)
  private inventory: InventoryState = InventoryManager.createInitialInventory();

  // Deep UI Controllers
  private rosterModal!: RosterModalController;
  private characterModal!: CharacterModalController;
  private equipmentModal!: EquipmentModalController;
  private inventoryModal!: InventoryModalController;
  private debugToolbar!: DebugToolbarController;
  private dialogueModal!: DialogueModalController;
  private shopModal!: ShopModalController;
  private authModal!: AuthModalController;
  private charSelectModal!: CharacterSelectModalController;
  private minimapController?: MinimapController;
  private chatController?: ChatController;
  private minimapUpdateTimer: number = 0;
  private activeHeroSummary: HeroSummary | null = null;
  private playerFacing: Direction = "down";
  private clickedOnInteractive: boolean = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: "OverworldScene" });
  }

  init() {
    this.network = new OverworldNetwork();
  }

  preload() {
    this.load.image("hero_sprite", "/assets/characters/hero_overworld.png");
    this.load.image("hero_portrait", "/assets/characters/hero_portrait.png");
  }

  create() {
    // 1. Initialize Deep Renderer & Procedural Textures
    this.mapRenderer = new OverworldRenderer(this, {
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      originX: this.originX,
      originY: this.originY,
    });
    this.mapRenderer.initTextures();

    // 2. Initialize Deep Dynamic Entity Manager
    this.entityManager = new OverworldEntityManager(this, {
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      originX: this.originX,
      originY: this.originY,
      isModalOpen: () => this.isAnyModalOpen(),
      onPortalClick: (portal) => this.navigateToPortal(portal),
      onNPCClick: (npc) => this.navigateToNPC(npc),
      onBeastClick: (bx, by, beast) => {
        this.clickedOnInteractive = true;
        this.navigateToRoamingBeast(bx, by, beast);
      },
    });

    // 3. Render Isometric Terrain & Entities
    this.renderTilemap();

    // 4. Setup Hero
    this.createPlayerHero();
    this.updateZoneHud();

    // 3. Setup Camera
    this.cameras.main.setBounds(0, 0, 3200, 2400);
    this.cameras.main.startFollow(this.playerContainer, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);

    // 4. Input setup (Arrow Keys cursor navigation; WASD liberated for other actions)
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    // Click to move (Single-click Pathfinding / Hold-to-walk start)
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.isAnyModalOpen()) return;
      if (this.clickedOnInteractive) {
        this.clickedOnInteractive = false;
        return;
      }
      this.pointerDownTime = this.time.now;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const isoCoord = screenToIso(
        worldPoint.x,
        worldPoint.y,
        this.tileWidth,
        this.tileHeight,
        this.originX,
        this.originY
      );
      const targetX = Math.round(isoCoord.tileX);
      const targetY = Math.round(isoCoord.tileY);

      // Check if clicked directly on an NPC
      const targetNPC = this.mapConfig.npcs?.find(
        (n) => n.position.x === targetX && n.position.y === targetY
      );
      if (targetNPC) {
        this.navigateToNPC(targetNPC);
        return;
      }

      this.pendingNPCInteraction = null;

      // Check if clicked directly on a roaming beast
      const targetBeast = this.entityManager.findVisibleBeastAt(
        targetX,
        targetY
      );
      if (targetBeast) {
        this.navigateToRoamingBeast(
          targetBeast.tile.x,
          targetBeast.tile.y,
          targetBeast.entity
        );
        return;
      }

      if (targetX === this.playerTile.x && targetY === this.playerTile.y)
        return;

      // Check if clicked directly on a portal
      const targetPortal = this.mapConfig.portals?.find(
        (p) => p.position.x === targetX && p.position.y === targetY
      );
      if (targetPortal) {
        this.navigateToPortal(targetPortal);
        return;
      }

      // Compute A* Path
      const path = findPath(
        this.playerTile,
        { x: targetX, y: targetY },
        this.mapConfig
      );
      if (path && path.length > 1) {
        this.currentPath = path.slice(1);
        this.showDestinationMarker(targetX, targetY);
        if (!this.isMoving) {
          const next = this.currentPath.shift()!;
          this.attemptMove(next.x, next.y);
        }
      }
    });

    // 5. Connect to Colyseus Server deferred to hero selection flow

    // 6. Handle returning from battle (including defeat respawn, captured beasts & wild beast loot)
    this.events.on(
      "resume",
      (
        _sys: any,
        data?: {
          respawnTile?: TileCoord;
          capturedBeasts?: Combatant[];
          expAwarded?: number;
          levelUps?: any[];
          updatedAllies?: Combatant[];
          inventory?: InventoryState;
          loot?: LootReward;
        }
      ) => {
        this.isMoving = false;
        this.isTransitioning = false;
        this.currentPath = [];
        this.clearDestinationMarker();
        this.network.sendBattleConcluded();

        // Restore HUD elements and buttons when returning to Overworld
        const uiOverlay = document.getElementById("ui-overlay");
        if (uiOverlay) uiOverlay.style.display = "block";
        this.minimapController?.setVisible(true);
        this.chatController?.setVisible(true);
        this.rosterModal.setButtonVisible(true);
        this.characterModal.setButtonVisible(true);
        this.inventoryModal.setButtonVisible(true);
        this.debugToolbar.setVisible(true);

        if (data?.expAwarded || data?.loot) {
          const gold = data.loot?.gold || 0;
          const exp = data.expAwarded || 0;
          this.chatController?.addMessage({
            id: `sys_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            senderId: "SYSTEM",
            senderName: "System",
            channel: "system",
            text: `⚔️ Victory! Gained ${exp} EXP and ${gold} Gold.`,
            timestamp: Date.now(),
          });
        }

        const zoneDisplay = document.getElementById("zone-display");

        // Sync progression updates from server or fallback
        if (data?.updatedAllies && data.updatedAllies.length > 0) {
          data.updatedAllies.forEach((updated) => {
            if (updated.isHero) {
              this.roster.hero = { ...this.roster.hero, ...updated };
            } else {
              const idx = this.roster.beasts.findIndex(
                (b) => b.id === updated.id
              );
              if (idx !== -1) {
                this.roster.beasts[idx] = {
                  ...this.roster.beasts[idx],
                  ...updated,
                };
              }
            }
          });
        } else if (data?.expAwarded && data.expAwarded > 0) {
          const progHero = ProgressionEngine.addExpToCombatant(
            this.roster.hero,
            data.expAwarded
          );
          this.roster.hero = progHero.combatant;

          const activeBeast = this.roster.beasts.find(
            (b) => b.id === this.roster.activeBeastId
          );
          if (activeBeast) {
            const progBeast = ProgressionEngine.addExpToCombatant(
              activeBeast,
              data.expAwarded
            );
            const idx = this.roster.beasts.findIndex(
              (b) => b.id === activeBeast.id
            );
            if (idx !== -1) this.roster.beasts[idx] = progBeast.combatant;
          }
        }

        // Sync inventory (combat item consumption)
        if (data?.inventory) {
          this.inventory = data.inventory;
        }

        // Sync loot drop (Gold + Items)
        if (data?.loot) {
          if (data.loot.gold > 0) {
            this.inventory = InventoryManager.addGold(
              this.inventory,
              data.loot.gold
            );
          }
          if (data.loot.droppedItems && data.loot.droppedItems.length > 0) {
            data.loot.droppedItems.forEach((drop) => {
              const addRes = InventoryManager.addItem(
                this.inventory,
                drop.itemId,
                drop.quantity
              );
              if (addRes.success) {
                this.inventory = addRes.inventory;
              }
            });
          }
        }

        if (data?.inventory || data?.loot || data?.expAwarded) {
          this.inventoryModal.setInventory(this.inventory);
          this.shopModal?.setInventory(this.inventory);
          this.syncHeroSaveState({
            inventory: this.inventory,
            roster: this.roster,
          });
        }

        if (data?.levelUps && data.levelUps.length > 0 && zoneDisplay) {
          zoneDisplay.innerText = data.levelUps
            .map(
              (l) =>
                `🎉 LEVEL UP! ${l.name} Lv.${l.newLevel}! (+${l.statPointsGained} Stat Points)`
            )
            .join(" | ");
          zoneDisplay.style.color = "#fbbf24";
        }

        if (data?.capturedBeasts && data.capturedBeasts.length > 0) {
          data.capturedBeasts.forEach((b) => {
            const res = RosterManager.addCapturedBeast(this.roster, b);
            if (res.success) {
              this.roster = res.roster;
              if (
                zoneDisplay &&
                (!data?.levelUps || data.levelUps.length === 0)
              ) {
                zoneDisplay.innerText = `🎉 Successfully captured ${b.name} and added to Beast Roster!`;
                zoneDisplay.style.color = "#a855f7";
              }
            }
          });
        }

        if (data?.respawnTile) {
          this.transitionToMap(
            "novice_town_and_meadow",
            data.respawnTile,
            "Novice Town"
          );
          this.network.sendWarpTown();
          if (zoneDisplay && (!data?.levelUps || data.levelUps.length === 0)) {
            zoneDisplay.innerText =
              "🏡 Respawned at Novice Town. Health & Spirit restored!";
            zoneDisplay.style.color = "#6ee7b7";
          }
        } else {
          if (
            zoneDisplay &&
            (!data?.capturedBeasts || data.capturedBeasts.length === 0) &&
            (!data?.levelUps || data.levelUps.length === 0)
          ) {
            zoneDisplay.innerText = "Returned to Overworld. Exploring...";
          }
        }

        const activeBeast = this.roster.beasts.find(
          (b) => b.id === this.roster.activeBeastId
        );
        this.rosterModal.setRoster(this.roster);
        this.characterModal.setHero(this.roster.hero);
        this.inventoryModal.setHero(this.roster.hero);
        this.inventoryModal.setActiveBeast(activeBeast);
      }
    );

    // 7. Setup Beast Roster & Formation button, Character Profile, Inventory, QA Debug Toolbar
    this.setupUIControllers();

    // 8. Auth & Character Selection Initial Flow
    const authService = AuthService.getInstance();
    if (!authService.getToken()) {
      this.authModal.open("login");
    } else {
      this.charSelectModal.open();
    }

    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-B", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.rosterModal.toggle();
      });
      this.input.keyboard.on("keydown-F", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.rosterModal.toggle();
      });
      this.input.keyboard.on("keydown-C", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.characterModal.toggle();
      });
      this.input.keyboard.on("keydown-E", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.equipmentModal.toggle();
      });
      this.input.keyboard.on("keydown-I", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.inventoryModal.toggle();
      });
      this.input.keyboard.on("keydown-T", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.debugToolbar.toggle();
      });
      this.input.keyboard.on("keydown-BACKTICK", () => {
        if (this.scene.isPaused() || this.chatController?.isChatInputFocused())
          return;
        this.debugToolbar.toggle();
      });
      this.input.keyboard.on("keydown-ESC", () => {
        if (this.scene.isPaused()) return;
        if (this.chatController?.isChatInputFocused()) {
          this.chatController.blurInput();
          return;
        }
        this.rosterModal.close();
        this.characterModal.close();
        this.equipmentModal.close();
        this.inventoryModal.close();
        this.debugToolbar.close();
        this.dialogueModal?.close();
        this.shopModal?.close();
        this.authModal?.close();
        this.charSelectModal?.close();
      });
    }
  }

  public isAnyModalOpen(): boolean {
    return !!(
      this.chatController?.isChatInputFocused() ||
      this.rosterModal?.isOpen() ||
      this.characterModal?.isOpen() ||
      this.equipmentModal?.isOpen() ||
      this.inventoryModal?.isOpen() ||
      this.debugToolbar?.isOpen() ||
      this.dialogueModal?.isOpen() ||
      this.shopModal?.isOpen() ||
      this.authModal?.isOpen() ||
      this.charSelectModal?.isOpen()
    );
  }

  public syncHeroSaveState(delta: Partial<SyncHeroStatePayload>): void {
    this.network.sendSyncHeroState(delta);
  }

  private async connectToServer(
    options: { heroId?: string; sessionToken?: string; name?: string } = {}
  ) {
    try {
      const authService = AuthService.getInstance();
      const sessionToken =
        options.sessionToken || authService.getToken() || undefined;
      const heroId = options.heroId || this.activeHeroSummary?.id || undefined;
      const playerName =
        options.name ||
        this.activeHeroSummary?.name ||
        "Hero_" + Math.floor(Math.random() * 1000);

      const room = await this.network.connect("ws://localhost:2567", {
        name: playerName,
        spawnTile: this.playerTile,
        sessionToken,
        heroId,
      });

      // Synchronize full hero state when loaded from SQLite server
      this.network.onHeroStateLoaded((state: any) => {
        if (!state) return;

        if (state.inventory) {
          this.inventory = state.inventory;
          this.inventoryModal?.setInventory(this.inventory);
          this.equipmentModal?.setInventory(this.inventory);
          this.shopModal?.setInventory(this.inventory);
        }

        if (state.roster) {
          this.roster = state.roster;
          this.rosterModal?.setRoster(this.roster);
          this.characterModal?.setHero(this.roster.hero);
          this.equipmentModal?.setHero(this.roster.hero);
          this.equipmentModal?.setRoster(this.roster);
          const activeBeast = this.roster.beasts.find(
            (b) => b.id === this.roster.activeBeastId
          );
          this.inventoryModal?.setHero(this.roster.hero);
          this.inventoryModal?.setActiveBeast(activeBeast);
        }

        if (state.hero) {
          this.roster.hero = { ...this.roster.hero, ...state.hero };
          this.characterModal?.setHero(this.roster.hero);
          this.equipmentModal?.setHero(this.roster.hero);
          this.characterModal?.updateHeroStatusBar();
        }

        if (state.mapId && state.mapId !== this.mapConfig.id) {
          this.transitionToMap(
            state.mapId,
            { x: state.x, y: state.y },
            `Loaded ${state.hero.name}`
          );
        } else if (state.x !== undefined && state.y !== undefined) {
          this.playerTile = { x: state.x, y: state.y };
          const screenPos = isoToScreen(
            state.x,
            state.y,
            this.tileWidth,
            this.tileHeight,
            this.originX,
            this.originY
          );
          this.playerContainer.setPosition(screenPos.x, screenPos.y);
          this.playerContainer.setDepth(
            getIsometricDepth(state.x, state.y, 100)
          );
          this.cameras.main.centerOn(screenPos.x, screenPos.y);
        }
      });

      // Listen for remote players
      room.state.players.onAdd((player: PlayerNetData, sessionId: string) => {
        if (sessionId === room.sessionId) return;
        this.entityManager.addOtherPlayer(sessionId, player, this.mapConfig.id);

        player.onChange = () => {
          this.entityManager.updateOtherPlayer(
            sessionId,
            player,
            this.mapConfig.id
          );
        };
      });

      room.state.players.onRemove(
        (_player: PlayerNetData, sessionId: string) => {
          this.entityManager.removeOtherPlayer(sessionId);
        }
      );

      // Listen to room state updates on every state change patch
      room.onStateChange((state: any) => {
        if (state?.players) {
          this.entityManager.syncPlayers(
            state.players,
            room.sessionId,
            this.mapConfig.id
          );
        }

        if (state?.roamingBeasts) {
          this.entityManager.syncBeasts(state.roamingBeasts, this.mapConfig.id);
        }
      });

      // Listen for wild encounter triggers
      this.network.onEncounter((payload) => {
        this.triggerBattleTransition(payload);
      });

      // Listen for multi-map portal transitions
      this.network.onPortalTransition((payload) => {
        this.transitionToMap(
          payload.targetMapId,
          payload.targetPosition,
          payload.portalName
        );
      });

      // Listen for authoritative equipment updates
      this.network.onEquipmentUpdated((payload) => {
        if (!payload) return;
        if (payload.inventory) {
          this.inventory = payload.inventory;
        }
        if (payload.targetType === "hero" && payload.target) {
          this.roster.hero = payload.target;
        } else if (
          payload.targetType === "champion" &&
          payload.championId &&
          payload.target
        ) {
          const idx = this.roster.beasts.findIndex(
            (b) => b.id === payload.championId
          );
          if (idx !== -1) {
            this.roster.beasts[idx] = payload.target;
          }
        }
        const activeBeast = this.roster.beasts.find(
          (b) => b.id === this.roster.activeBeastId
        );
        this.characterModal?.setHero(this.roster.hero);
        this.rosterModal?.setRoster(this.roster);
        this.equipmentModal?.setHero(this.roster.hero);
        this.equipmentModal?.setRoster(this.roster);
        this.equipmentModal?.setInventory(this.inventory);
        this.inventoryModal?.setInventory(this.inventory);
        this.inventoryModal?.setHero(this.roster.hero);
        this.inventoryModal?.setActiveBeast(activeBeast);
        this.shopModal?.setInventory(this.inventory);
      });
    } catch (err) {
      console.warn(
        "[OverworldScene] Could not connect to authoritative server. Running offline exploration mode.",
        err
      );
    }
  }

  private renderTilemap() {
    this.mapRenderer.renderTilemap(this.mapConfig);
    this.entityManager.renderPortals(this.mapConfig.portals || []);
    this.entityManager.renderNPCs(this.mapConfig.npcs || []);
  }

  private navigateToNPC(npc: NPCDefinition) {
    if (this.isTransitioning) return;

    // Check if player is already on an adjacent tile (distance <= 1)
    const dx = Math.abs(npc.position.x - this.playerTile.x);
    const dy = Math.abs(npc.position.y - this.playerTile.y);
    if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();
      this.openNPCDialogue(npc);
      return;
    }

    // Candidate adjacent tiles around the NPC
    const neighborOffsets = [
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    let bestPath: TileCoord[] | null = null;
    let bestTarget: TileCoord | null = null;

    for (const offset of neighborOffsets) {
      const candidate: TileCoord = {
        x: npc.position.x + offset.x,
        y: npc.position.y + offset.y,
      };

      // Check within bounds
      if (
        candidate.x < 0 ||
        candidate.x >= this.mapConfig.width ||
        candidate.y < 0 ||
        candidate.y >= this.mapConfig.height
      ) {
        continue;
      }

      // Check not an obstacle
      const isObstacle = this.mapConfig.obstacles.some(
        (o) => o.x === candidate.x && o.y === candidate.y
      );
      if (isObstacle) continue;

      const path = findPath(this.playerTile, candidate, this.mapConfig);
      if (path && path.length > 0) {
        if (!bestPath || path.length < bestPath.length) {
          bestPath = path;
          bestTarget = candidate;
        }
      }
    }

    if (bestPath && bestTarget && bestPath.length > 1) {
      this.pendingNPCInteraction = npc;
      this.currentPath = bestPath.slice(1);
      this.showDestinationMarker(bestTarget.x, bestTarget.y);
      if (!this.isMoving) {
        const next = this.currentPath.shift()!;
        this.attemptMove(next.x, next.y);
      }
    } else {
      this.showToast(`💬 เข้าใกล้ ${npc.name} แล้วคลิกคุยได้เลย`, "#38bdf8");
    }
  }

  private openNPCDialogue(npc: NPCDefinition) {
    this.currentPath = [];
    this.pendingNPCInteraction = null;
    this.clearDestinationMarker();
    this.dialogueModal.open(npc);
  }

  private navigateToPortal(portal: PortalDefinition) {
    if (this.isTransitioning) return;

    // If player is already on the portal tile, trigger warp directly
    if (
      this.playerTile.x === portal.position.x &&
      this.playerTile.y === portal.position.y
    ) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.transitionToMap(
        portal.targetMapId,
        portal.targetPosition,
        portal.name
      );
      if (this.network.getRoom()) {
        this.network.sendWarpPortal(
          portal.targetMapId,
          portal.targetPosition,
          portal.name
        );
      }
      return;
    }

    // If player is adjacent (1 tile cardinal or diagonal), step directly onto portal
    const dx = Math.abs(portal.position.x - this.playerTile.x);
    const dy = Math.abs(portal.position.y - this.playerTile.y);
    if (dx <= 1 && dy <= 1) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.attemptMove(portal.position.x, portal.position.y);
      return;
    }

    // Otherwise, compute A* Path towards portal tile
    const path = findPath(this.playerTile, portal.position, this.mapConfig);
    if (path && path.length > 1) {
      this.currentPath = path.slice(1);
      this.showDestinationMarker(portal.position.x, portal.position.y);
      if (!this.isMoving) {
        const next = this.currentPath.shift()!;
        this.attemptMove(next.x, next.y);
      }
    }
  }

  public transitionToMap(
    targetMapId: string,
    targetPosition: TileCoord,
    portalName?: string
  ) {
    if (this.isTransitioning) return;
    if (
      this.mapConfig &&
      this.mapConfig.id === targetMapId &&
      this.playerTile.x === targetPosition.x &&
      this.playerTile.y === targetPosition.y
    ) {
      return;
    }
    this.isTransitioning = true;
    this.currentPath = [];
    this.clearDestinationMarker();
    this.dialogueModal?.close();
    this.shopModal?.close();
    this.pendingNPCInteraction = null;

    if (this.playerContainer) {
      this.tweens.killTweensOf(this.playerContainer);
    }
    this.isMoving = false;

    // Safety timeout to ensure transition lock is always freed even if camera events drop
    this.time.delayedCall(500, () => {
      this.isTransitioning = false;
      this.isMoving = false;
    });

    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.mapConfig = getMapConfig(targetMapId);
      this.playerTile = { ...targetPosition };

      this.renderTilemap();
      this.minimapController?.setMapConfig(this.mapConfig);
      this.chatController?.addMessage({
        id: `sys_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        senderId: "SYSTEM",
        senderName: "System",
        channel: "system",
        text: `🗺️ Entered ${this.mapConfig.name}`,
        timestamp: Date.now(),
      });

      const screenPos = isoToScreen(
        this.playerTile.x,
        this.playerTile.y,
        this.tileWidth,
        this.tileHeight,
        this.originX,
        this.originY
      );

      if (this.playerContainer) {
        this.tweens.killTweensOf(this.playerContainer);
        this.playerContainer.setPosition(screenPos.x, screenPos.y);
        this.playerContainer.setDepth(
          getIsometricDepth(this.playerTile.x, this.playerTile.y, 100)
        );
      }

      this.cameras.main.centerOn(screenPos.x, screenPos.y);
      this.updateZoneHud();

      this.entityManager.filterEntitiesForMap(
        this.mapConfig.id,
        this.network.getRoom()
      );

      if (portalName) {
        this.showToast(`✨ Entered ${this.mapConfig.name}!`, "#38bdf8");
      }

      this.cameras.main.fadeIn(250, 0, 0, 0);
      this.cameras.main.once("camerafadeincomplete", () => {
        this.isTransitioning = false;
        this.isMoving = false;
      });
    });
  }

  private updateZoneHud() {
    const zoneDisplay = document.getElementById("zone-display");
    if (!zoneDisplay) return;

    const zone = this.mapConfig.zones.find(
      (z) =>
        this.playerTile.x >= z.bounds.minX &&
        this.playerTile.x <= z.bounds.maxX &&
        this.playerTile.y >= z.bounds.minY &&
        this.playerTile.y <= z.bounds.maxY
    );

    if (zone) {
      if (zone.type === "wild") {
        zoneDisplay.innerText = `⚔️ ${this.mapConfig.name} - ${zone.name} (WILD - Encounter Risk!)`;
        zoneDisplay.style.color = "#f87171";
      } else {
        zoneDisplay.innerText = `🏡 ${this.mapConfig.name} - ${zone.name} (Safe Zone)`;
        zoneDisplay.style.color = "#6ee7b7";
      }
    } else {
      zoneDisplay.innerText = `📍 ${this.mapConfig.name}`;
      zoneDisplay.style.color = "#38bdf8";
    }
  }

  private createPlayerHero() {
    const screenPos = isoToScreen(
      this.playerTile.x,
      this.playerTile.y,
      this.tileWidth,
      this.tileHeight,
      this.originX,
      this.originY
    );

    this.playerContainer = this.add.container(screenPos.x, screenPos.y);

    // Shadow
    this.playerShadow = this.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);
    // Sprite
    const sprite = this.add.image(0, -22, "hero_sprite");
    sprite.setName("hero_sprite_image");
    // Name Tag
    const nameText = this.add
      .text(0, -48, "You (Hero)", {
        fontSize: "11px",
        color: "#38bdf8",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0.5);

    this.playerContainer.add([this.playerShadow, sprite, nameText]);
    this.playerContainer.setDepth(
      getIsometricDepth(this.playerTile.x, this.playerTile.y, 100)
    );

    // Idle breathing animation
    this.tweens.add({
      targets: sprite,
      scaleY: 1.03,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private navigateToRoamingBeast(targetX: number, targetY: number, beast: any) {
    if (this.isTransitioning) return;

    // A. If already on the exact tile:
    if (this.playerTile.x === targetX && this.playerTile.y === targetY) {
      if (!this.network.getRoom()) {
        const combatant =
          RoamingBeastManager.convertRoamingBeastToCombatant(beast);
        this.triggerBattleTransition({
          encounter: { zoneId: beast.zoneId, wildEnemies: [combatant] },
          playerPosition: { x: targetX, y: targetY },
        });
      } else {
        this.network.sendMove(targetX, targetY, this.mapConfig.id);
      }
      return;
    }

    // B. If adjacent (distance = 1):
    const dist =
      Math.abs(this.playerTile.x - targetX) +
      Math.abs(this.playerTile.y - targetY);
    if (dist === 1) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.attemptMove(targetX, targetY);
      return;
    }

    // C. Pathfind towards the beast's tile:
    const path = findPath(
      this.playerTile,
      { x: targetX, y: targetY },
      this.mapConfig
    );
    if (path && path.length > 1) {
      this.pendingNPCInteraction = null;
      this.currentPath = path.slice(1);
      this.showDestinationMarker(targetX, targetY);
      if (!this.isMoving && this.currentPath.length > 0) {
        const next = this.currentPath.shift()!;
        this.attemptMove(next.x, next.y);
      }
    }
  }

  override update(_time: number, delta: number) {
    this.minimapUpdateTimer += delta;
    if (this.minimapUpdateTimer >= 150) {
      this.minimapUpdateTimer = 0;
      this.updateMinimap();
    }

    if (this.isAnyModalOpen()) return;

    // 1. Mouse Hold-to-Move
    const pointer = this.input.activePointer;
    if (pointer.isDown && this.time.now - this.pointerDownTime > 200) {
      // User is holding down the mouse button!
      this.pendingNPCInteraction = null;
      this.currentPath = [];
      this.clearDestinationMarker();

      if (!this.isMoving) {
        this.stepTowardsPointer(pointer);
      }
      return;
    }

    // 2. Click-to-Destination Path Queue
    if (!this.isMoving && this.currentPath.length > 0) {
      const nextTile = this.currentPath.shift()!;
      this.attemptMove(nextTile.x, nextTile.y);
      if (this.currentPath.length === 0) {
        this.clearDestinationMarker();
      }
      return;
    }

    // 3. Keyboard Arrow Keys
    if (!this.isMoving) {
      if (this.moveCooldown > 0) {
        this.moveCooldown -= delta;
        return;
      }

      let dx = 0;
      let dy = 0;

      if (this.cursors?.left?.isDown) {
        dx -= 1;
      } else if (this.cursors?.right?.isDown) {
        dx += 1;
      }

      if (this.cursors?.up?.isDown) {
        dy -= 1;
      } else if (this.cursors?.down?.isDown) {
        dy += 1;
      }

      if (dx !== 0 || dy !== 0) {
        this.pendingNPCInteraction = null;
        this.currentPath = [];
        this.clearDestinationMarker();
        this.attemptMove(this.playerTile.x + dx, this.playerTile.y + dy);
        this.moveCooldown = 180;
      }
    }
  }

  private stepTowardsPointer(pointer: Phaser.Input.Pointer) {
    this.pendingNPCInteraction = null;
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const isoCoord = screenToIso(
      worldPoint.x,
      worldPoint.y,
      this.tileWidth,
      this.tileHeight,
      this.originX,
      this.originY
    );
    const targetX = Math.round(isoCoord.tileX);
    const targetY = Math.round(isoCoord.tileY);

    const dx = Math.sign(targetX - this.playerTile.x);
    const dy = Math.sign(targetY - this.playerTile.y);

    if (dx !== 0 || dy !== 0) {
      this.attemptMove(this.playerTile.x + dx, this.playerTile.y + dy);
    }
  }

  private showDestinationMarker(tileX: number, tileY: number) {
    if (!this.destinationMarker) {
      this.destinationMarker = this.add.graphics();
    }
    this.destinationMarker.clear();
    const pos = isoToScreen(
      tileX,
      tileY,
      this.tileWidth,
      this.tileHeight,
      this.originX,
      this.originY
    );
    this.destinationMarker.setPosition(pos.x, pos.y);
    this.destinationMarker.setDepth(getIsometricDepth(tileX, tileY, -50));
    this.destinationMarker.lineStyle(2, 0x38bdf8, 0.9);
    this.destinationMarker.fillStyle(0x38bdf8, 0.2);

    const hw = this.tileWidth / 2;
    const hh = this.tileHeight / 2;
    this.destinationMarker.beginPath();
    this.destinationMarker.moveTo(0, -hh / 2);
    this.destinationMarker.lineTo(hw / 2, 0);
    this.destinationMarker.lineTo(0, hh / 2);
    this.destinationMarker.lineTo(-hw / 2, 0);
    this.destinationMarker.closePath();
    this.destinationMarker.strokePath();
    this.destinationMarker.fillPath();

    this.destinationMarker.setVisible(true);
    this.destinationMarker.setAlpha(1);

    this.tweens.killTweensOf(this.destinationMarker);
    this.tweens.add({
      targets: this.destinationMarker,
      alpha: { from: 0.9, to: 0.3 },
      scale: { from: 1.0, to: 1.15 },
      duration: 350,
      yoyo: true,
      loop: -1,
    });
  }

  private clearDestinationMarker() {
    if (this.destinationMarker) {
      this.destinationMarker.setVisible(false);
      this.tweens.killTweensOf(this.destinationMarker);
    }
  }

  private attemptMove(targetX: number, targetY: number) {
    if (this.isTransitioning) return;

    // Client-side quick boundary check
    if (
      targetX < 0 ||
      targetX >= this.mapConfig.width ||
      targetY < 0 ||
      targetY >= this.mapConfig.height
    ) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();
      return;
    }

    // Obstacle check
    if (
      this.mapConfig.obstacles.some((o) => o.x === targetX && o.y === targetY)
    ) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();
      return;
    }

    const currentScreen = isoToScreen(
      this.playerTile.x,
      this.playerTile.y,
      this.tileWidth,
      this.tileHeight,
      this.originX,
      this.originY
    );
    const nextScreenPos = isoToScreen(
      targetX,
      targetY,
      this.tileWidth,
      this.tileHeight,
      this.originX,
      this.originY
    );

    const screenDx = nextScreenPos.x - currentScreen.x;
    const screenDy = nextScreenPos.y - currentScreen.y;

    // 1. Ragnarok Online Directional Sprite (Front, Back, Back-Diagonal, Side)
    this.playerFacing = this.mapRenderer.updateHeroDirectionalSprite(
      this.playerContainer,
      screenDx,
      screenDy
    );

    // 2. Ragnarok Online Step Bobbing & Dynamic Foot Shadow
    this.mapRenderer.playStepBobbing(this.playerContainer, this.playerShadow);

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };

    this.updateZoneHud();

    // Check if stepping on a portal
    const portal = this.mapConfig.portals?.find(
      (p) => p.position.x === targetX && p.position.y === targetY
    );
    if (portal) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();

      // If running offline exploration without server, transition directly
      if (!this.network.getRoom()) {
        this.transitionToMap(
          portal.targetMapId,
          portal.targetPosition,
          portal.name
        );
        return;
      }
    }

    // Send to authoritative server with active mapId for robust synchronization
    this.network.sendMove(targetX, targetY, this.mapConfig.id);

    // If offline exploration mode without active server, roll grass encounters locally
    if (!this.network.getRoom() && !portal) {
      const offlinePlayerState = {
        playerId: "local_hero",
        position: { x: this.playerTile.x, y: this.playerTile.y },
        facingDirection: "down" as Direction,
        stepsInCurrentZone: 0,
      };
      const offlineResult = OverworldEngine.movePlayer(
        offlinePlayerState,
        { x: targetX, y: targetY },
        this.mapConfig
      );
      if (offlineResult.encounterTriggered && offlineResult.encounter) {
        this.time.delayedCall(190, () => {
          this.triggerBattleTransition(offlineResult);
        });
      }
    }

    // Smooth movement tween
    this.tweens.add({
      targets: this.playerContainer,
      x: nextScreenPos.x,
      y: nextScreenPos.y,
      duration: 180,
      ease: "Power1",
      onComplete: () => {
        this.isMoving = false;
        this.playerContainer.setDepth(getIsometricDepth(targetX, targetY, 100));

        this.mapRenderer.resetHeroIdle(this.playerContainer, this.playerShadow);

        if (portal) {
          this.transitionToMap(
            portal.targetMapId,
            portal.targetPosition,
            portal.name
          );
          if (this.network.getRoom()) {
            this.network.sendWarpPortal(
              portal.targetMapId,
              portal.targetPosition,
              portal.name
            );
          }
          return;
        }

        // Check if reached NPC interaction distance (adjacent tile)
        if (this.pendingNPCInteraction) {
          const dx = Math.abs(this.pendingNPCInteraction.position.x - targetX);
          const dy = Math.abs(this.pendingNPCInteraction.position.y - targetY);
          if (dx <= 1 && dy <= 1) {
            const npc = this.pendingNPCInteraction;
            this.pendingNPCInteraction = null;
            this.currentPath = [];
            this.clearDestinationMarker();
            this.openNPCDialogue(npc);
            return;
          }
        }

        // Check if pointer is still being held down
        const pointer = this.input.activePointer;
        if (pointer.isDown && this.time.now - this.pointerDownTime > 200) {
          this.pendingNPCInteraction = null;
          this.stepTowardsPointer(pointer);
        } else if (this.currentPath.length > 0) {
          const nextTile = this.currentPath.shift()!;
          this.attemptMove(nextTile.x, nextTile.y);
          if (this.currentPath.length === 0) {
            this.clearDestinationMarker();
          }
        } else {
          this.pendingNPCInteraction = null;
          this.clearDestinationMarker();
        }
      },
    });
  }

  private triggerBattleTransition(payload: any) {
    this.isMoving = true;
    this.currentPath = [];
    this.pendingNPCInteraction = null;
    this.clearDestinationMarker();

    this.rosterModal.close();
    this.characterModal.close();
    this.equipmentModal.close();
    this.inventoryModal.close();
    this.debugToolbar.close();
    this.dialogueModal?.close();
    this.shopModal?.close();

    // Hide Overworld HUD and buttons during battle
    const uiOverlay = document.getElementById("ui-overlay");
    if (uiOverlay) uiOverlay.style.display = "none";
    this.minimapController?.setVisible(false);
    this.chatController?.setVisible(false);
    this.rosterModal.setButtonVisible(false);
    this.characterModal.setButtonVisible(false);
    this.equipmentModal.setButtonVisible(false);
    this.inventoryModal.setButtonVisible(false);
    this.debugToolbar.setVisible(false);

    // Flash screen and spin transition
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.shake(300, 0.015);

    this.time.delayedCall(450, () => {
      this.scene.pause();
      this.scene.launch("BattleScene", {
        encounter: payload.encounter,
        network: this.network,
        roster: this.roster,
        alliesFormation: RosterManager.buildTeamFormation(this.roster),
        inventory: this.inventory,
      });
    });
  }

  // ==========================================
  // UI CONTROLLERS SETUP
  // ==========================================

  private setupUIControllers(): void {
    const getActiveBeast = () =>
      this.roster.beasts.find((b) => b.id === this.roster.activeBeastId);

    this.characterModal = new CharacterModalController(this.roster.hero, {
      onHeroUpdated: (hero) => {
        this.roster.hero = hero;
        this.equipmentModal?.setHero(hero);
        this.inventoryModal?.setHero(hero);
        this.syncHeroSaveState({ hero: this.roster.hero });
      },
      onOpen: () => {
        this.currentPath = [];
        this.clearDestinationMarker();
      },
    });

    this.equipmentModal = new EquipmentModalController(
      this.roster.hero,
      this.roster,
      this.inventory,
      {
        onEquipItem: (itemId, targetType, championId) => {
          const target =
            targetType === "hero"
              ? this.roster.hero
              : this.roster.beasts.find((b) => b.id === championId);
          if (!target) return;

          if (this.network.getRoom()) {
            this.network.sendEquipItem({ targetType, championId, itemId });
          } else {
            const curEq =
              target.equipment || EquipmentManager.createEmptyEquipment();
            const res = EquipmentManager.equipItem(
              this.inventory,
              curEq,
              itemId,
              target.level
            );
            if (res.success) {
              this.inventory = res.inventory;
              const updatedTarget = EquipmentManager.applyEquipmentToCombatant(
                target,
                res.equipment
              );
              if (targetType === "hero") {
                this.roster.hero = updatedTarget;
                this.characterModal.setHero(this.roster.hero);
              } else {
                const idx = this.roster.beasts.findIndex(
                  (b) => b.id === championId
                );
                if (idx !== -1) {
                  this.roster.beasts[idx] = updatedTarget;
                }
                this.rosterModal.setRoster(this.roster);
              }
              this.equipmentModal.setHero(this.roster.hero);
              this.equipmentModal.setRoster(this.roster);
              this.equipmentModal.setInventory(this.inventory);
              this.inventoryModal.setInventory(this.inventory);
              this.inventoryModal.setHero(this.roster.hero);
              this.inventoryModal.setActiveBeast(getActiveBeast());
              this.syncHeroSaveState({
                hero: this.roster.hero,
                roster: this.roster,
                inventory: this.inventory,
              });
              const def = getItemDefinition(itemId);
              this.showToast(
                `⚔️ สวมใส่ ${def?.name || itemId} ให้กับ ${target.name} สำเร็จ!`,
                "#34d399"
              );
            } else {
              this.showToast(
                `❌ ${res.reason || "ไม่สามารถสวมใส่อุปกรณ์ได้"}`,
                "#f87171"
              );
            }
          }
        },
        onUnequipItem: (targetType, championId, slot) => {
          const target =
            targetType === "hero"
              ? this.roster.hero
              : this.roster.beasts.find((b) => b.id === championId);
          if (!target || !target.equipment?.[slot]) return;

          if (this.network.getRoom()) {
            this.network.sendUnequipItem({ targetType, championId, slot });
          } else {
            const curEq =
              target.equipment || EquipmentManager.createEmptyEquipment();
            const res = EquipmentManager.unequipItem(
              this.inventory,
              curEq,
              slot
            );
            if (res.success) {
              this.inventory = res.inventory;
              const updatedTarget = EquipmentManager.applyEquipmentToCombatant(
                target,
                res.equipment
              );
              if (targetType === "hero") {
                this.roster.hero = updatedTarget;
                this.characterModal.setHero(this.roster.hero);
              } else {
                const idx = this.roster.beasts.findIndex(
                  (b) => b.id === championId
                );
                if (idx !== -1) {
                  this.roster.beasts[idx] = updatedTarget;
                }
                this.rosterModal.setRoster(this.roster);
              }
              this.equipmentModal.setHero(this.roster.hero);
              this.equipmentModal.setRoster(this.roster);
              this.equipmentModal.setInventory(this.inventory);
              this.inventoryModal.setInventory(this.inventory);
              this.inventoryModal.setHero(this.roster.hero);
              this.inventoryModal.setActiveBeast(getActiveBeast());
              this.syncHeroSaveState({
                hero: this.roster.hero,
                roster: this.roster,
                inventory: this.inventory,
              });
              this.showToast(`🛡️ ถอดอุปกรณ์ ${slot} เรียบร้อย!`, "#38bdf8");
            } else {
              this.showToast(
                `❌ ${res.reason || "ไม่สามารถถอดอุปกรณ์ได้"}`,
                "#f87171"
              );
            }
          }
        },
        onOpen: () => {
          this.currentPath = [];
          this.clearDestinationMarker();
        },
      }
    );

    this.rosterModal = new RosterModalController(this.roster, {
      onRosterUpdated: (newRoster) => {
        this.roster = newRoster;
        this.inventoryModal?.setActiveBeast(getActiveBeast());
        this.syncHeroSaveState({ roster: this.roster });
      },
      onUnequipChampionItem: (championId: string, slot: EquipmentSlot) => {
        const champ = this.roster.beasts.find((b) => b.id === championId);
        if (!champ || !champ.equipment?.[slot]) return;

        if (this.network.getRoom()) {
          this.network.sendUnequipItem({
            targetType: "champion",
            championId,
            slot,
          });
        } else {
          const curEq =
            champ.equipment || EquipmentManager.createEmptyEquipment();
          const res = EquipmentManager.unequipItem(this.inventory, curEq, slot);
          if (res.success) {
            this.inventory = res.inventory;
            const updatedChamp = EquipmentManager.applyEquipmentToCombatant(
              champ,
              res.equipment
            );
            const idx = this.roster.beasts.findIndex(
              (b) => b.id === championId
            );
            if (idx !== -1) {
              this.roster.beasts[idx] = updatedChamp;
            }
            this.rosterModal.setRoster(this.roster);
            this.equipmentModal?.setRoster(this.roster);
            this.equipmentModal?.setInventory(this.inventory);
            this.inventoryModal.setInventory(this.inventory);
            this.inventoryModal.setActiveBeast(getActiveBeast());
            this.syncHeroSaveState({
              roster: this.roster,
              inventory: this.inventory,
            });
            this.showToast(
              `🛡️ ${champ.name} ถอดอุปกรณ์ ${slot} เรียบร้อย!`,
              "#38bdf8"
            );
          } else {
            this.showToast(
              `❌ ${res.reason || "ไม่สามารถถอดอุปกรณ์ได้"}`,
              "#f87171"
            );
          }
        }
      },
      onOpen: () => {
        this.currentPath = [];
        this.clearDestinationMarker();
      },
    });

    this.dialogueModal = new DialogueModalController({
      onOpenShop: (npc) => {
        this.shopModal.open(npc);
      },
      onHeal: (npc) => {
        this.roster = RosterManager.restoreFullParty(this.roster);
        this.characterModal.setHero(this.roster.hero);
        this.rosterModal.setRoster(this.roster);
        this.equipmentModal?.setHero(this.roster.hero);
        this.equipmentModal?.setRoster(this.roster);
        this.inventoryModal.setHero(this.roster.hero);
        this.inventoryModal.setActiveBeast(getActiveBeast());
        this.syncHeroSaveState({ roster: this.roster });
        this.showToast(
          `💖 ${npc.name} ได้ฟื้นฟูพลังชีวิตและจิตวิญญาณให้ทีมของคุณเต็ม 100%!`,
          "#34d399"
        );
      },
      onClose: () => {},
    });

    this.shopModal = new ShopModalController(this.inventory, {
      onInventoryUpdated: (newInv) => {
        this.inventory = newInv;
        this.inventoryModal.setInventory(newInv);
        this.equipmentModal?.setInventory(newInv);
        this.syncHeroSaveState({ inventory: this.inventory });
      },
      onShowToast: (msg, color) => {
        this.showToast(msg, color);
      },
      onClose: () => {},
    });

    this.inventoryModal = new InventoryModalController(
      this.inventory,
      this.roster.hero,
      getActiveBeast(),
      {
        onHeroUpdated: (hero) => {
          this.roster.hero = hero;
          this.characterModal.setHero(hero);
          this.equipmentModal?.setHero(hero);
          this.syncHeroSaveState({ hero: this.roster.hero });
        },
        onBeastUpdated: (beast) => {
          const idx = this.roster.beasts.findIndex((b) => b.id === beast.id);
          if (idx !== -1) {
            this.roster.beasts[idx] = beast;
            this.rosterModal.setRoster(this.roster);
            this.equipmentModal?.setRoster(this.roster);
            this.syncHeroSaveState({ roster: this.roster });
          }
        },
        onEquipItem: (
          itemId: string,
          targetType: "hero" | "champion",
          championId?: string
        ) => {
          const target =
            targetType === "hero"
              ? this.roster.hero
              : this.roster.beasts.find((b) => b.id === championId);
          if (!target) return;

          if (this.network.getRoom()) {
            this.network.sendEquipItem({ targetType, championId, itemId });
          } else {
            const curEq =
              target.equipment || EquipmentManager.createEmptyEquipment();
            const res = EquipmentManager.equipItem(
              this.inventory,
              curEq,
              itemId,
              target.level
            );
            if (res.success) {
              this.inventory = res.inventory;
              const updatedTarget = EquipmentManager.applyEquipmentToCombatant(
                target,
                res.equipment
              );
              if (targetType === "hero") {
                this.roster.hero = updatedTarget;
                this.characterModal.setHero(this.roster.hero);
              } else {
                const idx = this.roster.beasts.findIndex(
                  (b) => b.id === championId
                );
                if (idx !== -1) {
                  this.roster.beasts[idx] = updatedTarget;
                }
                this.rosterModal.setRoster(this.roster);
              }
              this.equipmentModal.setHero(this.roster.hero);
              this.equipmentModal.setRoster(this.roster);
              this.equipmentModal.setInventory(this.inventory);
              this.inventoryModal.setInventory(this.inventory);
              this.inventoryModal.setHero(this.roster.hero);
              this.inventoryModal.setActiveBeast(getActiveBeast());
              this.syncHeroSaveState({
                hero: this.roster.hero,
                roster: this.roster,
                inventory: this.inventory,
              });
              const def = getItemDefinition(itemId);
              this.showToast(
                `⚔️ สวมใส่ ${def?.name || itemId} ให้กับ ${target.name} สำเร็จ!`,
                "#34d399"
              );
            } else {
              this.showToast(
                `❌ ${res.reason || "ไม่สามารถสวมใส่อุปกรณ์ได้"}`,
                "#f87171"
              );
            }
          }
        },
        onInventoryUpdated: (inv) => {
          this.inventory = inv;
          this.shopModal?.setInventory(inv);
          this.equipmentModal?.setInventory(inv);
          this.syncHeroSaveState({ inventory: this.inventory });
        },
        onWarpTown: () => {
          this.inventoryModal.close();
          this.network.sendWarpTown();
          this.transitionToMap(
            "novice_town_and_meadow",
            { x: 10, y: 10 },
            "Town Teleport"
          );
          this.showToast(
            "🏡 Teleported to Novice Town via Town Scroll!",
            "#6ee7b7"
          );
        },
        onOpen: () => {
          this.currentPath = [];
          this.clearDestinationMarker();
        },
      }
    );

    this.debugToolbar = new DebugToolbarController(
      () => this.roster.hero,
      () => this.roster,
      {
        onHeroUpdated: (hero) => {
          this.roster.hero = hero;
          this.characterModal.setHero(hero);
          this.equipmentModal?.setHero(hero);
          this.inventoryModal.setHero(hero);
        },
        onRosterUpdated: (newRoster) => {
          this.roster = newRoster;
          this.rosterModal.setRoster(newRoster);
          this.equipmentModal?.setRoster(newRoster);
          this.inventoryModal.setActiveBeast(getActiveBeast());
        },
        onInventoryUpdated: (newInv) => {
          this.inventory = newInv;
          this.inventoryModal.setInventory(newInv);
          this.equipmentModal?.setInventory(newInv);
          this.shopModal?.setInventory(newInv);
          this.syncHeroSaveState({ inventory: this.inventory });
        },
        onInstantBattle: (payload) => {
          this.triggerBattleTransition(payload);
        },
        onWarp: (tile, toastMsg, color) => {
          this.inventoryModal.close();
          this.debugToolbar.close();
          this.currentPath = [];
          this.clearDestinationMarker();

          if (tile.mapId && tile.mapId !== this.mapConfig.id) {
            this.transitionToMap(
              tile.mapId,
              { x: tile.x, y: tile.y },
              toastMsg
            );
            if (
              tile.mapId === "novice_town_and_meadow" &&
              tile.x === 10 &&
              tile.y === 10
            ) {
              this.network.sendWarpTown();
            }
          } else {
            this.playerTile = { x: tile.x, y: tile.y };
            const screenPos = isoToScreen(
              tile.x,
              tile.y,
              this.tileWidth,
              this.tileHeight,
              this.originX,
              this.originY
            );
            if (this.playerContainer) {
              this.tweens.killTweensOf(this.playerContainer);
              this.playerContainer.setPosition(screenPos.x, screenPos.y);
              this.playerContainer.setDepth(
                getIsometricDepth(tile.x, tile.y, 100)
              );
            }
            this.network.sendMove(tile.x, tile.y);
          }
          this.showToast(toastMsg, color);
        },
        onShowToast: (msg, color) => {
          this.showToast(msg, color);
        },
      },
      () => this.inventory
    );

    this.authModal = new AuthModalController(AuthService.getInstance(), {
      onAuthenticated: (account) => {
        this.showToast(
          `🎉 Logged in as ${account.username || "Guest"}!`,
          "#38bdf8"
        );
        this.charSelectModal.open();
      },
      onClose: () => {},
    });

    this.charSelectModal = new CharacterSelectModalController(
      HeroService.getInstance(),
      AuthService.getInstance(),
      {
        onHeroSelected: async (hero) => {
          this.activeHeroSummary = hero;
          this.chatController?.setCurrentHeroName(hero.name);
          this.showToast(
            `⚔️ Playing as ${hero.name} Lv.${hero.level} [${hero.element}]!`,
            "#38bdf8"
          );
          await this.connectToServer({
            heroId: hero.id,
            sessionToken: AuthService.getInstance().getToken() || undefined,
            name: hero.name,
          });
        },
        onOpenLinkAccount: () => {
          this.authModal.open("link");
        },
        onClose: () => {},
      }
    );

    // Setup Minimap Radar Controller
    const minimapCanvas = document.getElementById(
      "minimap-canvas"
    ) as HTMLCanvasElement;
    if (minimapCanvas) {
      this.minimapController = new MinimapController({
        canvas: minimapCanvas,
        mapNameEl: document.getElementById("minimap-map-name"),
        coordsEl: document.getElementById("minimap-coords"),
        containerEl: document.getElementById("minimap-container"),
        onNavigate: (tileX, tileY) => {
          if (this.isAnyModalOpen()) return;
          this.navigateToTile(tileX, tileY);
        },
      });
      this.minimapController.setMapConfig(this.mapConfig);
    }

    // Setup In-Game Chat System Controller
    const chatOverlay = document.getElementById("chat-overlay");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input") as HTMLInputElement;
    if (chatOverlay && chatMessages && chatInput) {
      this.chatController = new ChatController({
        containerEl: chatOverlay,
        messagesContainerEl: chatMessages,
        inputEl: chatInput,
        formEl: document.getElementById("chat-input-form") as HTMLFormElement,
        tabAllBtn: document.getElementById("chat-tab-all") as HTMLButtonElement,
        tabSystemBtn: document.getElementById(
          "chat-tab-system"
        ) as HTMLButtonElement,
        currentHeroName: this.roster.hero.name,
        onSendMessage: (text, channel) => {
          this.network.sendChatMessage(text, channel);
        },
        isGameModalOpen: () => {
          return !!(
            this.authModal?.isOpen() ||
            this.charSelectModal?.isOpen() ||
            this.dialogueModal?.isOpen() ||
            this.shopModal?.isOpen()
          );
        },
      });

      this.network.onChatMessage((payload) => {
        this.chatController?.addMessage(payload);
        if (payload.channel === "map") {
          if (payload.senderId === this.network.getSessionId()) {
            this.entityManager.showSpeechBubble(
              this.playerContainer,
              payload.text,
              "player"
            );
          } else {
            const remote = this.entityManager.getOtherPlayer(payload.senderId);
            if (remote && remote.container.visible) {
              this.entityManager.showSpeechBubble(
                remote.container,
                payload.text,
                payload.senderId
              );
            }
          }
        }
      });
    }
  }

  private showToast(msg: string, color: string = "#6ee7b7"): void {
    const zoneDisplay = document.getElementById("zone-display");
    if (zoneDisplay) {
      zoneDisplay.innerText = msg;
      zoneDisplay.style.color = color;
    }
  }

  public navigateToTile(targetX: number, targetY: number): void {
    if (this.isAnyModalOpen() || this.isTransitioning) return;
    this.pendingNPCInteraction = null;
    const path = findPath(
      this.playerTile,
      { x: targetX, y: targetY },
      this.mapConfig
    );
    if (path && path.length > 1) {
      this.currentPath = path.slice(1);
      this.showDestinationMarker(targetX, targetY);
      if (!this.isMoving && this.currentPath.length > 0) {
        const next = this.currentPath.shift()!;
        this.attemptMove(next.x, next.y);
      }
    }
  }

  private updateMinimap(): void {
    if (!this.minimapController) return;
    const blips = this.entityManager.getMinimapBlips(this.mapConfig);
    this.minimapController.updatePlayer(this.playerTile, this.playerFacing);
    this.minimapController.render(blips);
  }
}
