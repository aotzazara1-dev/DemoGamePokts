import Phaser from 'phaser';
import { OverworldNetwork, type PlayerNetData } from '../network/OverworldNetwork.js';
import { isoToScreen, screenToIso, getIsometricDepth } from '../utils/isometric.js';
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
  type HeroSummary
} from '@poktsonline/shared';
import {
  CharacterModalController,
  RosterModalController,
  InventoryModalController,
  DebugToolbarController,
  DialogueModalController,
  ShopModalController,
  AuthModalController,
  CharacterSelectModalController
} from '../ui/index.js';
import { AuthService } from '../auth/AuthService.js';
import { HeroService } from '../auth/HeroService.js';

export class OverworldScene extends Phaser.Scene {
  private network!: OverworldNetwork;
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

  // Map element containers for multi-map switching
  private mapTiles: Phaser.GameObjects.Image[] = [];
  private mapObstacles: Phaser.GameObjects.Image[] = [];
  private mapPortals: Phaser.GameObjects.Container[] = [];
  private mapNPCs: Phaser.GameObjects.Container[] = [];

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
  private inventoryModal!: InventoryModalController;
  private debugToolbar!: DebugToolbarController;
  private dialogueModal!: DialogueModalController;
  private shopModal!: ShopModalController;
  private authModal!: AuthModalController;
  private charSelectModal!: CharacterSelectModalController;
  private activeHeroSummary: HeroSummary | null = null;

  private otherPlayers: Map<string, { container: Phaser.GameObjects.Container; tile: TileCoord }> = new Map();
  private roamingBeasts: Map<string, { container: Phaser.GameObjects.Container; tile: TileCoord; entity: any }> = new Map();
  private clickedOnInteractive: boolean = false;
  private roamingBeastRemoveBound: boolean = false;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init() {
    this.network = new OverworldNetwork();
  }

  preload() {
    this.load.image('hero_sprite', '/assets/characters/hero_overworld.png');
    this.load.image('hero_portrait', '/assets/characters/hero_portrait.png');
  }

  create() {
    // Generate procedural pixel-art style textures if not loaded via preload
    this.createProceduralTextures();

    // 1. Render Isometric Terrain
    this.renderTilemap();

    // 2. Setup Hero
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
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAnyModalOpen()) return;
      if (this.clickedOnInteractive) {
        this.clickedOnInteractive = false;
        return;
      }
      this.pointerDownTime = this.time.now;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const isoCoord = screenToIso(worldPoint.x, worldPoint.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
      const targetX = Math.round(isoCoord.tileX);
      const targetY = Math.round(isoCoord.tileY);

      // Check if clicked directly on an NPC
      const targetNPC = this.mapConfig.npcs?.find(
        n => n.position.x === targetX && n.position.y === targetY
      );
      if (targetNPC) {
        this.navigateToNPC(targetNPC);
        return;
      }

      this.pendingNPCInteraction = null;

      // Check if clicked directly on a roaming beast
      const targetBeast = Array.from(this.roamingBeasts.values()).find(
        b => b.tile.x === targetX && b.tile.y === targetY && b.container.visible
      );
      if (targetBeast) {
        this.navigateToRoamingBeast(targetBeast.tile.x, targetBeast.tile.y, targetBeast.entity);
        return;
      }

      if (targetX === this.playerTile.x && targetY === this.playerTile.y) return;

      // Check if clicked directly on a portal
      const targetPortal = this.mapConfig.portals?.find(
        p => p.position.x === targetX && p.position.y === targetY
      );
      if (targetPortal) {
        this.navigateToPortal(targetPortal);
        return;
      }

      // Compute A* Path
      const path = findPath(this.playerTile, { x: targetX, y: targetY }, this.mapConfig);
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
    this.events.on('resume', (_sys: any, data?: {
      respawnTile?: TileCoord;
      capturedBeasts?: Combatant[];
      expAwarded?: number;
      levelUps?: any[];
      updatedAllies?: Combatant[];
      inventory?: InventoryState;
      loot?: LootReward;
    }) => {
      this.isMoving = false;
      this.isTransitioning = false;
      this.currentPath = [];
      this.clearDestinationMarker();
      this.network.sendBattleConcluded();

      // Restore HUD elements and buttons when returning to Overworld
      const uiOverlay = document.getElementById('ui-overlay');
      if (uiOverlay) uiOverlay.style.display = 'block';
      this.rosterModal.setButtonVisible(true);
      this.characterModal.setButtonVisible(true);
      this.inventoryModal.setButtonVisible(true);
      this.debugToolbar.setVisible(true);

      const zoneDisplay = document.getElementById('zone-display');

      // Sync progression updates from server or fallback
      if (data?.updatedAllies && data.updatedAllies.length > 0) {
        data.updatedAllies.forEach(updated => {
          if (updated.isHero) {
            this.roster.hero = { ...this.roster.hero, ...updated };
          } else {
            const idx = this.roster.beasts.findIndex(b => b.id === updated.id);
            if (idx !== -1) {
              this.roster.beasts[idx] = { ...this.roster.beasts[idx], ...updated };
            }
          }
        });
      } else if (data?.expAwarded && data.expAwarded > 0) {
        const progHero = ProgressionEngine.addExpToCombatant(this.roster.hero, data.expAwarded);
        this.roster.hero = progHero.combatant;

        const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);
        if (activeBeast) {
          const progBeast = ProgressionEngine.addExpToCombatant(activeBeast, data.expAwarded);
          const idx = this.roster.beasts.findIndex(b => b.id === activeBeast.id);
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
          this.inventory = InventoryManager.addGold(this.inventory, data.loot.gold);
        }
        if (data.loot.droppedItems && data.loot.droppedItems.length > 0) {
          data.loot.droppedItems.forEach(drop => {
            const addRes = InventoryManager.addItem(this.inventory, drop.itemId, drop.quantity);
            if (addRes.success) {
              this.inventory = addRes.inventory;
            }
          });
        }
      }

      if (data?.inventory || data?.loot || data?.expAwarded) {
        this.inventoryModal.setInventory(this.inventory);
        this.shopModal?.setInventory(this.inventory);
        this.network.sendSyncHeroState({
          inventory: this.inventory,
          roster: this.roster
        });
      }

      if (data?.levelUps && data.levelUps.length > 0 && zoneDisplay) {
        zoneDisplay.innerText = data.levelUps.map(l => `🎉 LEVEL UP! ${l.name} Lv.${l.newLevel}! (+${l.statPointsGained} Stat Points)`).join(' | ');
        zoneDisplay.style.color = '#fbbf24';
      }

      if (data?.capturedBeasts && data.capturedBeasts.length > 0) {
        data.capturedBeasts.forEach(b => {
          const res = RosterManager.addCapturedBeast(this.roster, b);
          if (res.success) {
            this.roster = res.roster;
            if (zoneDisplay && (!data?.levelUps || data.levelUps.length === 0)) {
              zoneDisplay.innerText = `🎉 Successfully captured ${b.name} and added to Beast Roster!`;
              zoneDisplay.style.color = '#a855f7';
            }
          }
        });
      }

      if (data?.respawnTile) {
        this.transitionToMap('novice_town_and_meadow', data.respawnTile, 'Novice Town');
        this.network.sendWarpTown();
        if (zoneDisplay && (!data?.levelUps || data.levelUps.length === 0)) {
          zoneDisplay.innerText = '🏡 Respawned at Novice Town. Health & Spirit restored!';
          zoneDisplay.style.color = '#6ee7b7';
        }
      } else {
        if (zoneDisplay && (!data?.capturedBeasts || data.capturedBeasts.length === 0) && (!data?.levelUps || data.levelUps.length === 0)) {
          zoneDisplay.innerText = 'Returned to Overworld. Exploring...';
        }
      }

      const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);
      this.rosterModal.setRoster(this.roster);
      this.characterModal.setHero(this.roster.hero);
      this.inventoryModal.setHero(this.roster.hero);
      this.inventoryModal.setActiveBeast(activeBeast);
    });

    // 7. Setup Beast Roster & Formation button, Character Profile, Inventory, QA Debug Toolbar
    this.setupUIControllers();

    // 8. Auth & Character Selection Initial Flow
    const authService = AuthService.getInstance();
    if (!authService.getToken()) {
      this.authModal.open('login');
    } else {
      this.charSelectModal.open();
    }

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-B', () => {
        if (this.scene.isPaused()) return;
        this.rosterModal.toggle();
      });
      this.input.keyboard.on('keydown-F', () => {
        if (this.scene.isPaused()) return;
        this.rosterModal.toggle();
      });
      this.input.keyboard.on('keydown-C', () => {
        if (this.scene.isPaused()) return;
        this.characterModal.toggle();
      });
      this.input.keyboard.on('keydown-I', () => {
        if (this.scene.isPaused()) return;
        this.inventoryModal.toggle();
      });
      this.input.keyboard.on('keydown-T', () => {
        if (this.scene.isPaused()) return;
        this.debugToolbar.toggle();
      });
      this.input.keyboard.on('keydown-BACKTICK', () => {
        if (this.scene.isPaused()) return;
        this.debugToolbar.toggle();
      });
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.scene.isPaused()) return;
        this.rosterModal.close();
        this.characterModal.close();
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
      this.rosterModal?.isOpen() ||
      this.characterModal?.isOpen() ||
      this.inventoryModal?.isOpen() ||
      this.debugToolbar?.isOpen() ||
      this.dialogueModal?.isOpen() ||
      this.shopModal?.isOpen() ||
      this.authModal?.isOpen() ||
      this.charSelectModal?.isOpen()
    );
  }

  private async connectToServer(options: { heroId?: string; sessionToken?: string; name?: string } = {}) {
    try {
      const authService = AuthService.getInstance();
      const sessionToken = options.sessionToken || authService.getToken() || undefined;
      const heroId = options.heroId || this.activeHeroSummary?.id || undefined;
      const playerName = options.name || this.activeHeroSummary?.name || 'Hero_' + Math.floor(Math.random() * 1000);

      const room = await this.network.connect('ws://localhost:2567', {
        name: playerName,
        spawnTile: this.playerTile,
        sessionToken,
        heroId
      });

      // Synchronize full hero state when loaded from SQLite server
      this.network.onHeroStateLoaded((state: any) => {
        if (!state) return;

        if (state.inventory) {
          this.inventory = state.inventory;
          this.inventoryModal?.setInventory(this.inventory);
          this.shopModal?.setInventory(this.inventory);
        }

        if (state.roster) {
          this.roster = state.roster;
          this.rosterModal?.setRoster(this.roster);
          this.characterModal?.setHero(this.roster.hero);
          const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);
          this.inventoryModal?.setHero(this.roster.hero);
          this.inventoryModal?.setActiveBeast(activeBeast);
        }

        if (state.hero) {
          this.roster.hero = { ...this.roster.hero, ...state.hero };
          this.characterModal?.setHero(this.roster.hero);
          this.characterModal?.updateHeroStatusBar();
        }

        if (state.mapId && state.mapId !== this.mapConfig.id) {
          this.transitionToMap(state.mapId, { x: state.x, y: state.y }, `Loaded ${state.hero.name}`);
        } else if (state.x !== undefined && state.y !== undefined) {
          this.playerTile = { x: state.x, y: state.y };
          const screenPos = isoToScreen(state.x, state.y, this.originX, this.originY, this.tileWidth, this.tileHeight);
          this.playerContainer.setPosition(screenPos.x, screenPos.y);
          this.playerContainer.setDepth(getIsometricDepth(state.x, state.y, 100));
        }
      });

      // Listen for remote players
      room.state.players.onAdd((player: PlayerNetData, sessionId: string) => {
        if (sessionId === room.sessionId) return;
        this.addOtherPlayer(sessionId, player);

        player.onChange = () => {
          this.updateOtherPlayer(sessionId, player);
        };
      });

      room.state.players.onRemove((_player: PlayerNetData, sessionId: string) => {
        this.removeOtherPlayer(sessionId);
      });

      // Listen to room state updates on every state change patch
      room.onStateChange((state: any) => {
        if (state?.players) {
          state.players.forEach((player: any, sessionId: string) => {
            if (sessionId !== room.sessionId) {
              if (this.otherPlayers.has(sessionId)) {
                this.updateOtherPlayer(sessionId, player);
              } else {
                this.addOtherPlayer(sessionId, player);
              }
            }
          });
        }

        if (state?.roamingBeasts) {
          const activeIds = new Set<string>();
          state.roamingBeasts.forEach((beast: any, beastId: string) => {
            activeIds.add(beastId);
            if (this.roamingBeasts.has(beastId)) {
              this.updateRoamingBeast(beastId, beast);
            } else {
              this.addRoamingBeast(beastId, beast);
            }
          });

          // Clean up any beasts no longer in state
          this.roamingBeasts.forEach((_, id) => {
            if (!activeIds.has(id)) {
              this.removeRoamingBeast(id);
            }
          });

          if (!this.roamingBeastRemoveBound && (state.roamingBeasts as any).onRemove) {
            this.roamingBeastRemoveBound = true;
            (state.roamingBeasts as any).onRemove((_beast: any, beastId: string) => {
              this.removeRoamingBeast(beastId);
            });
          }
        }
      });

      // Listen for wild encounter triggers
      this.network.onEncounter((payload) => {
        this.triggerBattleTransition(payload);
      });

      // Listen for multi-map portal transitions
      this.network.onPortalTransition((payload) => {
        this.transitionToMap(payload.targetMapId, payload.targetPosition, payload.portalName);
      });
    } catch (err) {
      console.warn('[OverworldScene] Could not connect to authoritative server. Running offline exploration mode.', err);
    }
  }

  private createProceduralTextures() {
    // Safe Town Tile (Cobblestone beige)
    if (!this.textures.exists('tile_safe')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3a4b3d, 1);
      g.fillPoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ]);
      g.lineStyle(1, 0x5a705e, 0.7);
      g.strokePoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ], true);
      g.generateTexture('tile_safe', 64, 32);
      g.destroy();
    }

    // Wild Grass Tile (Lush emerald green)
    if (!this.textures.exists('tile_wild')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e3a24, 1);
      g.fillPoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ]);
      g.lineStyle(1, 0x2e5937, 0.7);
      g.strokePoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ], true);
      g.generateTexture('tile_wild', 64, 32);
      g.destroy();
    }

    // Cave Slate Floor Tile (Dark subterranean stone)
    if (!this.textures.exists('tile_cave')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e293b, 1);
      g.fillPoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ]);
      g.lineStyle(1, 0x334155, 0.8);
      g.strokePoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ], true);
      g.generateTexture('tile_cave', 64, 32);
      g.destroy();
    }

    // Forest Bamboo Moss Tile (Rich emerald green)
    if (!this.textures.exists('tile_forest')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x064e3b, 1);
      g.fillPoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ]);
      g.lineStyle(1, 0x059669, 0.8);
      g.strokePoints([
        new Phaser.Geom.Point(32, 0),
        new Phaser.Geom.Point(64, 16),
        new Phaser.Geom.Point(32, 32),
        new Phaser.Geom.Point(0, 16)
      ], true);
      g.generateTexture('tile_forest', 64, 32);
      g.destroy();
    }

    // Portal Rune Texture (Pulsing mystical circle)
    if (!this.textures.exists('portal_rune')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Outer ring
      g.lineStyle(2, 0x38bdf8, 1);
      g.strokeCircle(24, 24, 20);
      // Inner circle glow
      g.fillStyle(0x0284c7, 0.45);
      g.fillCircle(24, 24, 16);
      g.lineStyle(1, 0xa5f3fc, 0.9);
      g.strokeCircle(24, 24, 10);
      g.generateTexture('portal_rune', 48, 48);
      g.destroy();
    }

    // Obstacle Rock
    if (!this.textures.exists('obstacle_rock')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x475569, 1);
      g.fillCircle(16, 16, 14);
      g.fillStyle(0x64748b, 1);
      g.fillCircle(14, 13, 10);
      g.generateTexture('obstacle_rock', 32, 32);
      g.destroy();
    }

    // Hero Sprite
    if (!this.textures.exists('hero_sprite')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Cloak
      g.fillStyle(0x2563eb, 1);
      g.fillRect(8, 14, 16, 18);
      // Head
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      // Headband
      g.fillStyle(0xd97706, 1);
      g.fillRect(10, 6, 12, 3);
      g.generateTexture('hero_sprite', 32, 32);
      g.destroy();
    }

    // Hero Back View (Walking up/North - Back of Wuxia Robe)
    if (!this.textures.exists('hero_back')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Robe Back (Royal blue martial robe)
      g.fillStyle(0x1d4ed8, 1);
      g.fillRect(3, 14, 20, 24);
      // Dark seam line down center of back
      g.fillStyle(0x1e3a8a, 1);
      g.fillRect(12, 14, 2, 24);
      // Waist sash belt (gold / amber)
      g.fillStyle(0xd97706, 1);
      g.fillRect(2, 24, 22, 4);
      // Trailing sash ends
      g.fillStyle(0xb45309, 1);
      g.fillRect(11, 28, 4, 8);
      // Trousers
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(5, 38, 6, 6);
      g.fillRect(15, 38, 6, 6);
      // Boots
      g.fillStyle(0x78350f, 1);
      g.fillRect(4, 44, 7, 4);
      g.fillRect(15, 44, 7, 4);
      // Head Back (Dark Hair)
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(13, 10, 8);
      // High Ponytail / Topknot
      g.fillStyle(0x020617, 1);
      g.fillEllipse(13, 3, 5, 8);
      // Headband Ribbon (Amber/gold)
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(10, 5, 6, 3);
      g.fillRect(11, 8, 4, 8);
      g.generateTexture('hero_back', 26, 48);
      g.destroy();
    }

    // Hero Back-Diagonal View (Walking North-East / North-West - 3/4 Back View)
    if (!this.textures.exists('hero_back_diag')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // 3/4 Back Robe
      g.fillStyle(0x1d4ed8, 1);
      g.beginPath();
      g.moveTo(3, 14);
      g.lineTo(23, 16);
      g.lineTo(21, 38);
      g.lineTo(5, 38);
      g.closePath();
      g.fill();
      // Waist sash belt
      g.fillStyle(0xd97706, 1);
      g.fillRect(3, 24, 20, 4);
      // Trailing sash at side
      g.fillStyle(0xb45309, 1);
      g.fillRect(7, 28, 4, 7);
      // Trousers & Boots
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(5, 38, 6, 6);
      g.fillRect(14, 38, 6, 6);
      g.fillStyle(0x78350f, 1);
      g.fillRect(4, 44, 7, 4);
      g.fillRect(14, 44, 7, 4);
      // Head 3/4 back
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(14, 10, 8);
      // Edge of cheek
      g.fillStyle(0xfde047, 1);
      g.fillRect(20, 10, 2, 4);
      // Ponytail angled backwards
      g.fillStyle(0x020617, 1);
      g.fillEllipse(10, 4, 5, 8);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(8, 6, 4, 7);
      g.generateTexture('hero_back_diag', 26, 48);
      g.destroy();
    }

    // Hero Side Profile View (Walking East / West)
    if (!this.textures.exists('hero_side')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Side Robe silhouette
      g.fillStyle(0x2563eb, 1);
      g.fillRect(4, 14, 16, 24);
      // Belt
      g.fillStyle(0xd97706, 1);
      g.fillRect(3, 24, 17, 4);
      // Side arm
      g.fillStyle(0x1d4ed8, 1);
      g.fillRect(10, 16, 5, 14);
      // Trousers & Boot
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(8, 38, 7, 6);
      g.fillStyle(0x78350f, 1);
      g.fillRect(7, 44, 10, 4);
      // Head profile
      g.fillStyle(0xfde047, 1);
      g.fillCircle(14, 10, 7);
      // Hair back
      g.fillStyle(0x0f172a, 1);
      g.fillRect(6, 4, 8, 12);
      // Headband
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(7, 7, 13, 3);
      // Eye
      g.fillStyle(0x000000, 1);
      g.fillRect(17, 10, 2, 2);
      g.generateTexture('hero_side', 26, 48);
      g.destroy();
    }

    // Remote Hero Sprite
    if (!this.textures.exists('remote_hero_sprite')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xd97706, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 6);
      g.generateTexture('remote_hero_sprite', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('remote_hero_back')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb45309, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(16, 8, 6);
      g.generateTexture('remote_hero_back', 32, 32);
      g.destroy();
    }

    if (!this.textures.exists('remote_hero_side')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xd97706, 1);
      g.fillRect(10, 14, 12, 18);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 5);
      g.generateTexture('remote_hero_side', 32, 32);
      g.destroy();
    }

    // Merchant NPC Texture (Green robe, gold coin hat, merchant pack)
    if (!this.textures.exists('npc_merchant')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Robe
      g.fillStyle(0x059669, 1);
      g.fillRect(8, 14, 16, 18);
      // Gold belt / sash
      g.fillStyle(0xfacc15, 1);
      g.fillRect(8, 20, 16, 3);
      // Satchel / coin pouch
      g.fillStyle(0x78350f, 1);
      g.fillRect(18, 21, 6, 6);
      // Head
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 9, 6);
      // Merchant Hat (TS Online style round hat with red jewel)
      g.fillStyle(0x0f172a, 1);
      g.fillRect(9, 4, 14, 4);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(16, 5, 2);
      g.generateTexture('npc_merchant', 32, 32);
      g.destroy();
    }

    // Elder NPC Texture (Sage/White robe, silver beard, topknot)
    if (!this.textures.exists('npc_elder')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Robe (White / Silver with navy trim)
      g.fillStyle(0xf1f5f9, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0x3b82f6, 1);
      g.fillRect(14, 14, 4, 18);
      // Wooden staff in hand
      g.fillStyle(0x78350f, 1);
      g.fillRect(24, 6, 2, 26);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(25, 6, 3); // staff gem
      // Head
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 9, 6);
      // White hair / topknot
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 4, 3);
      // Long White Beard
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(13, 11, 19, 11, 16, 18);
      g.generateTexture('npc_elder', 32, 32);
      g.destroy();
    }

    // Leaf Sprite (Wind - cute green forest spirit with leaf ears)
    if (!this.textures.exists('beast_leaf_sprite')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x10b981, 1);
      g.fillCircle(16, 18, 11);
      g.fillStyle(0x34d399, 1);
      g.fillTriangle(10, 10, 6, 2, 14, 8);
      g.fillTriangle(22, 10, 26, 2, 18, 8);
      g.fillStyle(0x064e3b, 1);
      g.fillCircle(13, 17, 2);
      g.fillCircle(19, 17, 2);
      g.fillStyle(0xf472b6, 0.8);
      g.fillCircle(10, 20, 2);
      g.fillCircle(22, 20, 2);
      g.generateTexture('beast_leaf_sprite', 32, 32);
      g.destroy();
    }

    // Rock Boar (Earth - sturdy brown wild boar with white tusks)
    if (!this.textures.exists('beast_rock_boar')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78350f, 1);
      g.fillRoundedRect(6, 12, 20, 14, 4);
      g.fillStyle(0xb45309, 1);
      g.fillRoundedRect(18, 16, 8, 8, 2);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(20, 16, 23, 10, 22, 16);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(15, 15, 2);
      g.generateTexture('beast_rock_boar', 32, 32);
      g.destroy();
    }

    // Iron Beetle (Earth - armored obsidian beetle with pincer horn)
    if (!this.textures.exists('beast_iron_beetle')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x334155, 1);
      g.fillCircle(16, 18, 11);
      g.fillStyle(0x64748b, 1);
      g.fillRect(10, 14, 12, 4);
      g.fillStyle(0x94a3b8, 1);
      g.fillTriangle(14, 10, 16, 2, 18, 10);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(13, 16, 2);
      g.fillCircle(19, 16, 2);
      g.generateTexture('beast_iron_beetle', 32, 32);
      g.destroy();
    }

    // Cave Serpent (Water - blue slithering subterranean snake)
    if (!this.textures.exists('beast_cave_serpent')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(16, 18, 10);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(20, 14, 7);
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(22, 12, 2);
      g.fillStyle(0xef4444, 1);
      g.fillRect(25, 14, 4, 1.5);
      g.generateTexture('beast_cave_serpent', 32, 32);
      g.destroy();
    }

    // Bamboo Panda (Wind - playful black & white bear with bamboo)
    if (!this.textures.exists('beast_bamboo_panda')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf8fafc, 1);
      g.fillCircle(16, 18, 11);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(9, 9, 4);
      g.fillCircle(23, 9, 4);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(12, 17, 3);
      g.fillCircle(20, 17, 3);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 17, 1);
      g.fillCircle(20, 17, 1);
      g.fillStyle(0x22c55e, 1);
      g.fillRect(23, 16, 3, 12);
      g.generateTexture('beast_bamboo_panda', 32, 32);
      g.destroy();
    }

    // Crimson Fox (Fire - fiery orange agile fox with flame tail)
    if (!this.textures.exists('beast_crimson_fox')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xe11d48, 1);
      g.fillRoundedRect(8, 14, 16, 12, 4);
      g.fillStyle(0xf43f5e, 1);
      g.fillTriangle(8, 14, 6, 6, 12, 12);
      g.fillTriangle(20, 12, 24, 6, 22, 14);
      g.fillStyle(0xfb923c, 1);
      g.fillCircle(6, 20, 5);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(4, 20, 2.5);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(18, 16, 2);
      g.generateTexture('beast_crimson_fox', 32, 32);
      g.destroy();
    }

    // Generic Wild Enemy fallback
    if (!this.textures.exists('combat_wild')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb91c1c, 1);
      g.fillRoundedRect(8, 14, 16, 14, 4);
      g.fillStyle(0xf87171, 1);
      g.fillTriangle(10, 14, 16, 6, 22, 14);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(13, 18, 2);
      g.fillCircle(19, 18, 2);
      g.generateTexture('combat_wild', 32, 32);
      g.destroy();
    }
  }

  private renderTilemap() {
    // Clear previous map elements
    this.mapTiles.forEach(t => t.destroy());
    this.mapTiles = [];
    this.mapObstacles.forEach(o => o.destroy());
    this.mapObstacles = [];
    this.mapPortals.forEach(p => p.destroy());
    this.mapPortals = [];
    this.mapNPCs.forEach(n => n.destroy());
    this.mapNPCs = [];

    const map = this.mapConfig;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        let textureKey = 'tile_safe';
        if (map.theme === 'cave') {
          textureKey = 'tile_cave';
        } else if (map.theme === 'forest') {
          textureKey = 'tile_forest';
        } else {
          const isWild = map.zones.some(
            z => z.type === 'wild' && x >= z.bounds.minX && x <= z.bounds.maxX && y >= z.bounds.minY && y <= z.bounds.maxY
          );
          textureKey = isWild ? 'tile_wild' : 'tile_safe';
        }

        const screenPos = isoToScreen(x, y, this.tileWidth, this.tileHeight, this.originX, this.originY);

        const tile = this.add.image(screenPos.x, screenPos.y, textureKey);
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(getIsometricDepth(x, y, -100));
        this.mapTiles.push(tile);

        // Check obstacles
        const isObstacle = map.obstacles.some(o => o.x === x && o.y === y);
        if (isObstacle) {
          const rock = this.add.image(screenPos.x, screenPos.y - 12, 'obstacle_rock');
          rock.setOrigin(0.5, 0.5);
          rock.setDepth(getIsometricDepth(x, y, 10));
          this.mapObstacles.push(rock);
        }
      }
    }

    // Render Portal Markers
    if (map.portals && map.portals.length > 0) {
      map.portals.forEach(portal => {
        const screenPos = isoToScreen(
          portal.position.x,
          portal.position.y,
          this.tileWidth,
          this.tileHeight,
          this.originX,
          this.originY
        );

        const portalContainer = this.add.container(screenPos.x, screenPos.y);

        // Glowing portal rune
        const rune = this.add.image(0, 0, 'portal_rune');
        rune.setOrigin(0.5, 0.5);

        // Pulsing glow animation
        this.tweens.add({
          targets: rune,
          scale: { from: 0.85, to: 1.15 },
          alpha: { from: 0.7, to: 1.0 },
          duration: 900,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Floating portal name banner
        const nameLabel = this.add.text(0, -28, `🌀 ${portal.name}`, {
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#38bdf8',
          stroke: '#0f172a',
          strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Make portal rune and label directly interactive with hand cursor
        portalContainer.setSize(96, 64);
        portalContainer.setInteractive(new Phaser.Geom.Rectangle(-48, -38, 96, 64), Phaser.Geom.Rectangle.Contains);
        portalContainer.input!.cursor = 'pointer';

        portalContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (this.isAnyModalOpen()) return;
          pointer.event.stopPropagation();
          this.navigateToPortal(portal);
        });

        nameLabel.setInteractive({ useHandCursor: true });
        nameLabel.on('pointerover', () => {
          nameLabel.setColor('#facc15');
          nameLabel.setScale(1.08);
        });
        nameLabel.on('pointerout', () => {
          nameLabel.setColor('#38bdf8');
          nameLabel.setScale(1.0);
        });
        nameLabel.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (this.isAnyModalOpen()) return;
          pointer.event.stopPropagation();
          this.navigateToPortal(portal);
        });

        portalContainer.add([rune, nameLabel]);
        portalContainer.setDepth(getIsometricDepth(portal.position.x, portal.position.y, 40));
        this.mapPortals.push(portalContainer);
      });
    }

    // Render NPCs
    if (map.npcs && map.npcs.length > 0) {
      map.npcs.forEach(npc => {
        const screenPos = isoToScreen(
          npc.position.x,
          npc.position.y,
          this.tileWidth,
          this.tileHeight,
          this.originX,
          this.originY
        );

        const npcContainer = this.add.container(screenPos.x, screenPos.y);

        // Shadow
        const shadow = this.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);

        // Sprite
        const sprite = this.add.image(0, -18, npc.spriteKey || 'hero_sprite');

        // Speech bubble indicator (floating icon)
        const bubbleBg = this.add.circle(0, -42, 11, 0x0f172a, 0.85);
        bubbleBg.setStrokeStyle(1.5, 0x38bdf8);
        const bubbleIcon = this.add.text(0, -42, npc.avatarIcon || '💬', {
          fontSize: '11px'
        }).setOrigin(0.5, 0.5);

        // Floating bounce animation on bubble
        this.tweens.add({
          targets: [bubbleBg, bubbleIcon],
          y: '-=4',
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Name and title badge
        const nameText = this.add.text(0, -29, `${npc.name}`, {
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#facc15',
          stroke: '#0f172a',
          strokeThickness: 3
        }).setOrigin(0.5, 0.5);

        // Interactive hit area (generous clickable area)
        npcContainer.setSize(64, 64);
        npcContainer.setInteractive(new Phaser.Geom.Rectangle(-32, -48, 64, 64), Phaser.Geom.Rectangle.Contains);
        npcContainer.input!.cursor = 'pointer';

        npcContainer.on('pointerover', () => {
          sprite.setScale(1.1);
          nameText.setColor('#38bdf8');
          bubbleBg.setStrokeStyle(2, 0xfacc15);
        });

        npcContainer.on('pointerout', () => {
          sprite.setScale(1.0);
          nameText.setColor('#facc15');
          bubbleBg.setStrokeStyle(1.5, 0x38bdf8);
        });

        npcContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
          if (this.isAnyModalOpen()) return;
          pointer.event.stopPropagation();
          this.navigateToNPC(npc);
        });

        npcContainer.add([shadow, sprite, bubbleBg, bubbleIcon, nameText]);
        npcContainer.setDepth(getIsometricDepth(npc.position.x, npc.position.y, 45));
        this.mapNPCs.push(npcContainer);
      });
    }
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
      { x: -1, y: -1 }
    ];

    let bestPath: TileCoord[] | null = null;
    let bestTarget: TileCoord | null = null;

    for (const offset of neighborOffsets) {
      const candidate: TileCoord = {
        x: npc.position.x + offset.x,
        y: npc.position.y + offset.y
      };

      // Check within bounds
      if (candidate.x < 0 || candidate.x >= this.mapConfig.width || candidate.y < 0 || candidate.y >= this.mapConfig.height) {
        continue;
      }

      // Check not an obstacle
      const isObstacle = this.mapConfig.obstacles.some(o => o.x === candidate.x && o.y === candidate.y);
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
      this.showToast(`💬 เข้าใกล้ ${npc.name} แล้วคลิกคุยได้เลย`, '#38bdf8');
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
    if (this.playerTile.x === portal.position.x && this.playerTile.y === portal.position.y) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.transitionToMap(portal.targetMapId, portal.targetPosition, portal.name);
      if (this.network.getRoom()) {
        this.network.sendWarpPortal(portal.targetMapId, portal.targetPosition, portal.name);
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

  public transitionToMap(targetMapId: string, targetPosition: TileCoord, portalName?: string) {
    if (this.isTransitioning) return;
    if (this.mapConfig && this.mapConfig.id === targetMapId && this.playerTile.x === targetPosition.x && this.playerTile.y === targetPosition.y) {
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
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.mapConfig = getMapConfig(targetMapId);
      this.playerTile = { ...targetPosition };

      this.renderTilemap();

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
        this.playerContainer.setDepth(getIsometricDepth(this.playerTile.x, this.playerTile.y, 100));
      }

      this.cameras.main.centerOn(screenPos.x, screenPos.y);
      this.updateZoneHud();

      // Filter remote players for the new map
      const room = this.network.getRoom();
      if (room) {
        this.otherPlayers.forEach((other, sessionId) => {
          const p = room.state.players.get(sessionId);
          const isSameMap = p && (!p.mapId || p.mapId === this.mapConfig.id);
          other.container.setVisible(!!isSameMap);
        });
      }

      // Filter roaming beasts for the new map
      this.roamingBeasts.forEach(remote => {
        const isSameMap = remote.entity.mapId === this.mapConfig.id && !remote.entity.inCombat;
        remote.container.setVisible(isSameMap);
      });

      if (portalName) {
        this.showToast(`✨ Entered ${this.mapConfig.name}!`, '#38bdf8');
      }

      this.cameras.main.fadeIn(250, 0, 0, 0);
      this.cameras.main.once('camerafadeincomplete', () => {
        this.isTransitioning = false;
        this.isMoving = false;
      });
    });
  }

  private updateZoneHud() {
    const zoneDisplay = document.getElementById('zone-display');
    if (!zoneDisplay) return;

    const zone = this.mapConfig.zones.find(
      z =>
        this.playerTile.x >= z.bounds.minX &&
        this.playerTile.x <= z.bounds.maxX &&
        this.playerTile.y >= z.bounds.minY &&
        this.playerTile.y <= z.bounds.maxY
    );

    if (zone) {
      if (zone.type === 'wild') {
        zoneDisplay.innerText = `⚔️ ${this.mapConfig.name} - ${zone.name} (WILD - Encounter Risk!)`;
        zoneDisplay.style.color = '#f87171';
      } else {
        zoneDisplay.innerText = `🏡 ${this.mapConfig.name} - ${zone.name} (Safe Zone)`;
        zoneDisplay.style.color = '#6ee7b7';
      }
    } else {
      zoneDisplay.innerText = `📍 ${this.mapConfig.name}`;
      zoneDisplay.style.color = '#38bdf8';
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
    const sprite = this.add.image(0, -22, 'hero_sprite');
    sprite.setName('hero_sprite_image');
    // Name Tag
    const nameText = this.add.text(0, -48, 'You (Hero)', {
      fontSize: '11px',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.playerContainer.add([this.playerShadow, sprite, nameText]);
    this.playerContainer.setDepth(getIsometricDepth(this.playerTile.x, this.playerTile.y, 100));

    // Idle breathing animation
    this.tweens.add({
      targets: sprite,
      scaleY: 1.03,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private updateHeroDirectionalSprite(screenDx: number, screenDy: number) {
    if (!this.playerContainer) return;
    const heroImg = this.playerContainer.getByName('hero_sprite_image') as Phaser.GameObjects.Image;
    if (!heroImg) return;

    // Moving upwards on screen -> Back Views
    if (screenDy < -6) {
      if (screenDx > 8) {
        // Up-Right: Back-Diagonal
        heroImg.setTexture('hero_back_diag');
        heroImg.setFlipX(false);
      } else if (screenDx < -8) {
        // Up-Left: Back-Diagonal (Flipped)
        heroImg.setTexture('hero_back_diag');
        heroImg.setFlipX(true);
      } else {
        // Straight Up: Back View
        heroImg.setTexture('hero_back');
        heroImg.setFlipX(false);
      }
    }
    // Moving downwards on screen -> Front Views
    else if (screenDy > 6) {
      if (screenDx > 8) {
        // Down-Right: Front-Diagonal
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(false);
      } else if (screenDx < -8) {
        // Down-Left: Front-Diagonal (Flipped)
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(true);
      } else {
        // Straight Down: Front View
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(false);
      }
    }
    // Moving horizontally -> Side Views
    else {
      if (screenDx > 0) {
        heroImg.setTexture('hero_side');
        heroImg.setFlipX(false);
      } else if (screenDx < 0) {
        heroImg.setTexture('hero_side');
        heroImg.setFlipX(true);
      }
    }
  }

  private addOtherPlayer(sessionId: string, player: PlayerNetData) {
    const playerMap = player.mapId || 'novice_town_and_meadow';
    const isSameMap = playerMap === this.mapConfig.id;
    const screenPos = isoToScreen(player.x, player.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
    const container = this.add.container(screenPos.x, screenPos.y);

    const shadow = this.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);
    const sprite = this.add.image(0, -18, 'remote_hero_sprite');
    sprite.setName('remote_hero_sprite');
    const nameText = this.add.text(0, -36, player.name || 'Player', {
      fontSize: '11px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    container.add([shadow, sprite, nameText]);
    container.setDepth(getIsometricDepth(player.x, player.y, 100));
    container.setVisible(isSameMap);

    this.otherPlayers.set(sessionId, { container, tile: { x: player.x, y: player.y } });
  }

  private updateOtherPlayer(sessionId: string, player: PlayerNetData) {
    const remote = this.otherPlayers.get(sessionId);
    if (!remote) return;

    const playerMap = player.mapId || 'novice_town_and_meadow';
    const isSameMap = playerMap === this.mapConfig.id;
    const wasVisible = remote.container.visible;
    remote.container.setVisible(isSameMap);
    if (!isSameMap) return;

    const screenPos = isoToScreen(player.x, player.y, this.tileWidth, this.tileHeight, this.originX, this.originY);

    // Update remote player directional sprite
    const spr = remote.container.getByName('remote_hero_sprite') as Phaser.GameObjects.Image;
    if (spr) {
      if (player.direction === 'up') {
        spr.setTexture('remote_hero_back');
        spr.setFlipX(false);
      } else if (player.direction === 'left') {
        spr.setTexture('remote_hero_side');
        spr.setFlipX(true);
      } else if (player.direction === 'right') {
        spr.setTexture('remote_hero_side');
        spr.setFlipX(false);
      } else {
        spr.setTexture('remote_hero_sprite');
        spr.setFlipX(false);
      }
    }

    // If player arrived from another map or warped across large distance, snap immediately
    const dx = Math.abs(player.x - remote.tile.x);
    const dy = Math.abs(player.y - remote.tile.y);
    if (!wasVisible || dx > 1 || dy > 1) {
      this.tweens.killTweensOf(remote.container);
      remote.container.setPosition(screenPos.x, screenPos.y);
      remote.tile = { x: player.x, y: player.y };
      remote.container.setDepth(getIsometricDepth(player.x, player.y, 100));
      return;
    }

    this.tweens.add({
      targets: remote.container,
      x: screenPos.x,
      y: screenPos.y,
      duration: 180,
      ease: 'Linear',
      onComplete: () => {
        remote.tile = { x: player.x, y: player.y };
        remote.container.setDepth(getIsometricDepth(player.x, player.y, 100));
      }
    });
  }

  private removeOtherPlayer(sessionId: string) {
    const remote = this.otherPlayers.get(sessionId);
    if (remote) {
      remote.container.destroy();
      this.otherPlayers.delete(sessionId);
    }
  }

  private addRoamingBeast(beastId: string, beast: any) {
    if (this.roamingBeasts.has(beastId)) return;

    const isSameMap = beast.mapId === this.mapConfig.id && !beast.inCombat;
    const screenPos = isoToScreen(beast.x, beast.y, this.tileWidth, this.tileHeight, this.originX, this.originY);

    const container = this.add.container(screenPos.x, screenPos.y);

    // Shadow
    const shadow = this.add.ellipse(0, 0, 22, 11, 0x000000, 0.35);

    // Beast sprite
    const textureKey = this.getBeastTextureKey(beast.templateId, beast.element);
    const sprite = this.add.image(0, -18, textureKey);
    sprite.setName('beast_sprite');

    // Bobbing / breathing animation
    this.tweens.add({
      targets: sprite,
      y: '-=3',
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Level & Name badge
    const elemColor = this.getElementColor(beast.element);
    const nameLabel = this.add.text(0, -38, `Lv.${beast.level} ${beast.name}`, {
      fontSize: '10px',
      fontStyle: 'bold',
      color: elemColor,
      stroke: '#0f172a',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    container.add([shadow, sprite, nameLabel]);
    container.setDepth(getIsometricDepth(beast.x, beast.y, 80));
    container.setVisible(isSameMap);

    // Clickable hit area
    container.setSize(56, 56);
    container.setInteractive(new Phaser.Geom.Rectangle(-28, -42, 56, 56), Phaser.Geom.Rectangle.Contains);
    container.input!.cursor = 'pointer';

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isAnyModalOpen()) return;
      pointer.event.stopPropagation();
      this.clickedOnInteractive = true;
      const cur = this.roamingBeasts.get(beastId);
      const bx = cur ? cur.tile.x : beast.x;
      const by = cur ? cur.tile.y : beast.y;
      this.navigateToRoamingBeast(bx, by, beast);
    });

    this.roamingBeasts.set(beastId, {
      container,
      tile: { x: beast.x, y: beast.y },
      entity: beast
    });
  }

  private updateRoamingBeast(beastId: string, beast: any) {
    let remote = this.roamingBeasts.get(beastId);
    if (!remote) {
      this.addRoamingBeast(beastId, beast);
      remote = this.roamingBeasts.get(beastId);
      if (!remote) return;
    }

    remote.entity = beast;

    const isSameMap = beast.mapId === this.mapConfig.id && !beast.inCombat;
    const wasVisible = remote.container.visible;
    remote.container.setVisible(isSameMap);
    if (!isSameMap) return;

    const screenPos = isoToScreen(beast.x, beast.y, this.tileWidth, this.tileHeight, this.originX, this.originY);

    // Flip horizontally when changing direction
    const dx = beast.x - remote.tile.x;
    if (dx !== 0) {
      const spr = remote.container.getByName('beast_sprite') as Phaser.GameObjects.Image;
      if (spr) {
        spr.setFlipX(dx < 0);
      }
    }

    if (beast.x === remote.tile.x && beast.y === remote.tile.y && wasVisible) {
      return;
    }

    if (!wasVisible || Math.abs(dx) > 1 || Math.abs(beast.y - remote.tile.y) > 1) {
      this.tweens.killTweensOf(remote.container);
      remote.container.setPosition(screenPos.x, screenPos.y);
      remote.tile = { x: beast.x, y: beast.y };
      remote.container.setDepth(getIsometricDepth(beast.x, beast.y, 80));
      return;
    }

    this.tweens.killTweensOf(remote.container);
    remote.tile = { x: beast.x, y: beast.y };
    this.tweens.add({
      targets: remote.container,
      x: screenPos.x,
      y: screenPos.y,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        remote.container.setDepth(getIsometricDepth(beast.x, beast.y, 80));
      }
    });
  }

  private removeRoamingBeast(beastId: string) {
    const remote = this.roamingBeasts.get(beastId);
    if (remote) {
      remote.container.destroy();
      this.roamingBeasts.delete(beastId);
    }
  }

  private navigateToRoamingBeast(targetX: number, targetY: number, beast: any) {
    if (this.isTransitioning) return;

    // A. If already on the exact tile:
    if (this.playerTile.x === targetX && this.playerTile.y === targetY) {
      if (!this.network.getRoom()) {
        const combatant = RoamingBeastManager.convertRoamingBeastToCombatant(beast);
        this.triggerBattleTransition({
          encounter: { zoneId: beast.zoneId, wildEnemies: [combatant] },
          playerPosition: { x: targetX, y: targetY }
        });
      } else {
        this.network.sendMove(targetX, targetY, this.mapConfig.id);
      }
      return;
    }

    // B. If adjacent (distance = 1):
    const dist = Math.abs(this.playerTile.x - targetX) + Math.abs(this.playerTile.y - targetY);
    if (dist === 1) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.attemptMove(targetX, targetY);
      return;
    }

    // C. Pathfind towards the beast's tile:
    const path = findPath(this.playerTile, { x: targetX, y: targetY }, this.mapConfig);
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

  private getBeastTextureKey(templateId: string, _element: string): string {
    const specificKey = `beast_${templateId}`;
    if (this.textures.exists(specificKey)) {
      return specificKey;
    }
    return 'combat_wild';
  }

  private getElementColor(element: string): string {
    switch (element?.toLowerCase()) {
      case 'wind': return '#34d399';
      case 'fire': return '#f87171';
      case 'water': return '#38bdf8';
      case 'earth': return '#fbbf24';
      default: return '#facc15';
    }
  }

  override update(_time: number, delta: number) {
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
    const isoCoord = screenToIso(worldPoint.x, worldPoint.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
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
    const pos = isoToScreen(tileX, tileY, this.tileWidth, this.tileHeight, this.originX, this.originY);
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
      loop: -1
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
    if (targetX < 0 || targetX >= this.mapConfig.width || targetY < 0 || targetY >= this.mapConfig.height) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();
      return;
    }

    // Obstacle check
    if (this.mapConfig.obstacles.some(o => o.x === targetX && o.y === targetY)) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();
      return;
    }

    const currentScreen = isoToScreen(this.playerTile.x, this.playerTile.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
    const nextScreenPos = isoToScreen(targetX, targetY, this.tileWidth, this.tileHeight, this.originX, this.originY);

    const screenDx = nextScreenPos.x - currentScreen.x;
    const screenDy = nextScreenPos.y - currentScreen.y;

    // 1. Ragnarok Online Directional Sprite (Front, Back, Back-Diagonal, Side)
    this.updateHeroDirectionalSprite(screenDx, screenDy);

    // 2. Ragnarok Online Step Bobbing & Dynamic Foot Shadow
    const heroImg = this.playerContainer ? this.playerContainer.getByName('hero_sprite_image') as Phaser.GameObjects.Image : null;
    if (heroImg) {
      this.tweens.killTweensOf(heroImg);
      this.tweens.add({
        targets: heroImg,
        y: -26,
        yoyo: true,
        duration: 85,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }

    if (this.playerShadow) {
      this.tweens.killTweensOf(this.playerShadow);
      this.tweens.add({
        targets: this.playerShadow,
        scaleX: 0.82,
        scaleY: 0.82,
        yoyo: true,
        duration: 85,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };

    this.updateZoneHud();

    // Check if stepping on a portal
    const portal = this.mapConfig.portals?.find(p => p.position.x === targetX && p.position.y === targetY);
    if (portal) {
      this.currentPath = [];
      this.pendingNPCInteraction = null;
      this.clearDestinationMarker();

      // If running offline exploration without server, transition directly
      if (!this.network.getRoom()) {
        this.transitionToMap(portal.targetMapId, portal.targetPosition, portal.name);
        return;
      }
    }

    // Send to authoritative server with active mapId for robust synchronization
    this.network.sendMove(targetX, targetY, this.mapConfig.id);

    // If offline exploration mode without active server, roll grass encounters locally
    if (!this.network.getRoom() && !portal) {
      const offlinePlayerState = {
        playerId: 'local_hero',
        position: { x: this.playerTile.x, y: this.playerTile.y },
        facingDirection: 'down' as Direction,
        stepsInCurrentZone: 0
      };
      const offlineResult = OverworldEngine.movePlayer(offlinePlayerState, { x: targetX, y: targetY }, this.mapConfig);
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
      ease: 'Power1',
      onComplete: () => {
        this.isMoving = false;
        this.playerContainer.setDepth(getIsometricDepth(targetX, targetY, 100));

        if (heroImg) {
          heroImg.setY(-22);
          // Restore gentle idle breathing
          this.tweens.killTweensOf(heroImg);
          this.tweens.add({
            targets: heroImg,
            scaleY: 1.03,
            duration: 1100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
        if (this.playerShadow) {
          this.tweens.killTweensOf(this.playerShadow);
          this.playerShadow.setScale(1.0);
        }

        if (portal) {
          this.transitionToMap(portal.targetMapId, portal.targetPosition, portal.name);
          if (this.network.getRoom()) {
            this.network.sendWarpPortal(portal.targetMapId, portal.targetPosition, portal.name);
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
      }
    });
  }

  private triggerBattleTransition(payload: any) {
    this.isMoving = true;
    this.currentPath = [];
    this.pendingNPCInteraction = null;
    this.clearDestinationMarker();

    this.rosterModal.close();
    this.characterModal.close();
    this.inventoryModal.close();
    this.debugToolbar.close();
    this.dialogueModal?.close();
    this.shopModal?.close();

    // Hide Overworld HUD and buttons during battle
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) uiOverlay.style.display = 'none';
    this.rosterModal.setButtonVisible(false);
    this.characterModal.setButtonVisible(false);
    this.inventoryModal.setButtonVisible(false);
    this.debugToolbar.setVisible(false);

    // Flash screen and spin transition
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.shake(300, 0.015);

    this.time.delayedCall(450, () => {
      this.scene.pause();
      this.scene.launch('BattleScene', {
        encounter: payload.encounter,
        network: this.network,
        roster: this.roster,
        alliesFormation: RosterManager.buildTeamFormation(this.roster),
        inventory: this.inventory
      });
    });
  }

  // ==========================================
  // UI CONTROLLERS SETUP
  // ==========================================

  private setupUIControllers(): void {
    const getActiveBeast = () => this.roster.beasts.find(b => b.id === this.roster.activeBeastId);

    this.characterModal = new CharacterModalController(this.roster.hero, {
      onHeroUpdated: (hero) => {
        this.roster.hero = hero;
        this.inventoryModal?.setHero(hero);
        this.network.sendSyncHeroState({ hero: this.roster.hero });
      },
      onOpen: () => {
        this.currentPath = [];
        this.clearDestinationMarker();
      }
    });

    this.rosterModal = new RosterModalController(this.roster, {
      onRosterUpdated: (newRoster) => {
        this.roster = newRoster;
        this.inventoryModal?.setActiveBeast(getActiveBeast());
        this.network.sendSyncHeroState({ roster: this.roster });
      },
      onOpen: () => {
        this.currentPath = [];
        this.clearDestinationMarker();
      }
    });

    this.dialogueModal = new DialogueModalController({
      onOpenShop: (npc) => {
        this.shopModal.open(npc);
      },
      onHeal: (npc) => {
        this.roster = RosterManager.restoreFullParty(this.roster);
        this.characterModal.setHero(this.roster.hero);
        this.rosterModal.setRoster(this.roster);
        this.inventoryModal.setHero(this.roster.hero);
        this.inventoryModal.setActiveBeast(getActiveBeast());
        this.network.sendSyncHeroState({ roster: this.roster });
        this.showToast(`💖 ${npc.name} ได้ฟื้นฟูพลังชีวิตและจิตวิญญาณให้ทีมของคุณเต็ม 100%!`, '#34d399');
      },
      onClose: () => {}
    });

    this.shopModal = new ShopModalController(this.inventory, {
      onInventoryUpdated: (newInv) => {
        this.inventory = newInv;
        this.inventoryModal.setInventory(newInv);
        this.network.sendSyncHeroState({ inventory: this.inventory });
      },
      onShowToast: (msg, color) => {
        this.showToast(msg, color);
      },
      onClose: () => {}
    });

    this.inventoryModal = new InventoryModalController(
      this.inventory,
      this.roster.hero,
      getActiveBeast(),
      {
        onHeroUpdated: (hero) => {
          this.roster.hero = hero;
          this.characterModal.setHero(hero);
          this.network.sendSyncHeroState({ hero: this.roster.hero });
        },
        onBeastUpdated: (beast) => {
          const idx = this.roster.beasts.findIndex(b => b.id === beast.id);
          if (idx !== -1) {
            this.roster.beasts[idx] = beast;
            this.rosterModal.setRoster(this.roster);
            this.network.sendSyncHeroState({ roster: this.roster });
          }
        },
        onInventoryUpdated: (inv) => {
          this.inventory = inv;
          this.shopModal?.setInventory(inv);
          this.network.sendSyncHeroState({ inventory: this.inventory });
        },
        onWarpTown: () => {
          this.inventoryModal.close();
          this.network.sendWarpTown();
          this.transitionToMap('novice_town_and_meadow', { x: 10, y: 10 }, 'Town Teleport');
          this.showToast('🏡 Teleported to Novice Town via Town Scroll!', '#6ee7b7');
        },
        onOpen: () => {
          this.currentPath = [];
          this.clearDestinationMarker();
        }
      }
    );

    this.debugToolbar = new DebugToolbarController(
      () => this.roster.hero,
      () => this.roster,
      {
        onHeroUpdated: (hero) => {
          this.roster.hero = hero;
          this.characterModal.setHero(hero);
          this.inventoryModal.setHero(hero);
        },
        onRosterUpdated: (newRoster) => {
          this.roster = newRoster;
          this.rosterModal.setRoster(newRoster);
          this.inventoryModal.setActiveBeast(getActiveBeast());
        },
        onInventoryUpdated: (newInv) => {
          this.inventory = newInv;
          this.inventoryModal.setInventory(newInv);
          this.shopModal?.setInventory(newInv);
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
            this.transitionToMap(tile.mapId, { x: tile.x, y: tile.y }, toastMsg);
            if (tile.mapId === 'novice_town_and_meadow' && tile.x === 10 && tile.y === 10) {
              this.network.sendWarpTown();
            }
          } else {
            this.playerTile = { x: tile.x, y: tile.y };
            const screenPos = isoToScreen(tile.x, tile.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
            if (this.playerContainer) {
              this.tweens.killTweensOf(this.playerContainer);
              this.playerContainer.setPosition(screenPos.x, screenPos.y);
              this.playerContainer.setDepth(getIsometricDepth(tile.x, tile.y, 100));
            }
            this.network.sendMove(tile.x, tile.y);
          }
          this.showToast(toastMsg, color);
        },
        onShowToast: (msg, color) => {
          this.showToast(msg, color);
        }
      },
      () => this.inventory
    );

    this.authModal = new AuthModalController(AuthService.getInstance(), {
      onAuthenticated: (account) => {
        this.showToast(`🎉 Logged in as ${account.username || 'Guest'}!`, '#38bdf8');
        this.charSelectModal.open();
      },
      onClose: () => {}
    });

    this.charSelectModal = new CharacterSelectModalController(
      HeroService.getInstance(),
      AuthService.getInstance(),
      {
        onHeroSelected: async (hero) => {
          this.activeHeroSummary = hero;
          this.showToast(`⚔️ Playing as ${hero.name} Lv.${hero.level} [${hero.element}]!`, '#38bdf8');
          await this.connectToServer({
            heroId: hero.id,
            sessionToken: AuthService.getInstance().getToken() || undefined,
            name: hero.name
          });
        },
        onOpenLinkAccount: () => {
          this.authModal.open('link');
        },
        onClose: () => {}
      }
    );
  }

  private showToast(msg: string, color: string = '#6ee7b7'): void {
    const zoneDisplay = document.getElementById('zone-display');
    if (zoneDisplay) {
      zoneDisplay.innerText = msg;
      zoneDisplay.style.color = color;
    }
  }
}