import Phaser from 'phaser';
import { OverworldNetwork, type PlayerNetData } from '../network/OverworldNetwork.js';
import { isoToScreen, screenToIso, getIsometricDepth } from '../utils/isometric.js';
import {
  DEFAULT_OVERWORLD_MAP,
  findPath,
  RosterManager,
  ProgressionEngine,
  InventoryManager,
  type MapConfig,
  type TileCoord,
  type Combatant,
  type PlayerRosterState,
  type InventoryState,
  type LootReward
} from '@poktsonline/shared';
import {
  CharacterModalController,
  RosterModalController,
  InventoryModalController,
  DebugToolbarController
} from '../ui/index.js';

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
  private moveCooldown = 0;

  // Dual-mode movement state
  private currentPath: TileCoord[] = [];
  private destinationMarker?: Phaser.GameObjects.Graphics;
  private pointerDownTime: number = 0;

  // Beast Roster and Formation state
  private roster: PlayerRosterState = RosterManager.createInitialRoster();

  // Inventory state (20-slot TS Online inventory & Gold)
  private inventory: InventoryState = InventoryManager.createInitialInventory();

  // Deep UI Controllers
  private rosterModal!: RosterModalController;
  private characterModal!: CharacterModalController;
  private inventoryModal!: InventoryModalController;
  private debugToolbar!: DebugToolbarController;

  private otherPlayers: Map<string, { container: Phaser.GameObjects.Container; tile: TileCoord }> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };

  constructor() {
    super({ key: 'OverworldScene' });
  }

  init() {
    this.network = new OverworldNetwork();
  }

  preload() {
    // Generate procedural pixel-art style textures if not present
    this.createProceduralTextures();
  }

  create() {
    // 1. Render Isometric Terrain
    this.renderTilemap();

    // 2. Setup Hero
    this.createPlayerHero();

    // 3. Setup Camera
    this.cameras.main.setBounds(0, 0, 3200, 2400);
    this.cameras.main.startFollow(this.playerContainer, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);

    // 4. Input setup
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D
      }) as any;
    }

    // Click to move (Single-click Pathfinding / Hold-to-walk start)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.rosterModal?.isOpen() || this.characterModal?.isOpen() || this.inventoryModal?.isOpen()) return;
      this.pointerDownTime = this.time.now;
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const isoCoord = screenToIso(worldPoint.x, worldPoint.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
      const targetX = Math.round(isoCoord.tileX);
      const targetY = Math.round(isoCoord.tileY);

      if (targetX === this.playerTile.x && targetY === this.playerTile.y) return;

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

    // 5. Connect to Colyseus Server
    this.connectToServer();

    // 6. Handle returning from battle (including defeat respawn, captured beasts & monster loot)
    this.events.on('resume', (_sys: any, data?: {
      respawnTile?: TileCoord;
      capturedBeasts?: Combatant[];
      expAwarded?: number;
      levelUps?: any[];
      updatedAllies?: Combatant[];
      inventory?: InventoryState;
      loot?: LootReward;
    }) => {
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
        this.inventoryModal.setInventory(this.inventory);
      } else if (data?.inventory) {
        this.inventory = data.inventory;
        this.inventoryModal.setInventory(this.inventory);
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
        this.playerTile = { ...data.respawnTile };
        const screenPos = isoToScreen(this.playerTile.x, this.playerTile.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
        this.playerContainer.setPosition(screenPos.x, screenPos.y);
        this.playerContainer.setDepth(getIsometricDepth(this.playerTile.x, this.playerTile.y, 100));
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

    // 7. Setup Beast Roster & Formation button, Character Profile, Inventory Bag, QA Debug Toolbar
    this.setupUIControllers();

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
      });
    }
  }

  private async connectToServer() {
    try {
      const room = await this.network.connect('ws://localhost:2567', {
        name: 'Hero_' + Math.floor(Math.random() * 1000),
        spawnTile: this.playerTile
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

      // Listen for wild encounter triggers
      this.network.onEncounter((payload) => {
        this.triggerBattleTransition(payload);
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
  }

  private renderTilemap() {
    const map = this.mapConfig;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const isWild = x >= 21;
        const textureKey = isWild ? 'tile_wild' : 'tile_safe';
        const screenPos = isoToScreen(x, y, this.tileWidth, this.tileHeight, this.originX, this.originY);

        const tile = this.add.image(screenPos.x, screenPos.y, textureKey);
        tile.setOrigin(0.5, 0.5);
        tile.setDepth(getIsometricDepth(x, y, -100));

        // Check obstacles
        const isObstacle = map.obstacles.some(o => o.x === x && o.y === y);
        if (isObstacle) {
          const rock = this.add.image(screenPos.x, screenPos.y - 12, 'obstacle_rock');
          rock.setOrigin(0.5, 0.5);
          rock.setDepth(getIsometricDepth(x, y, 10));
        }
      }
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
    const sprite = this.add.image(0, -18, 'hero_sprite');
    // Name Tag
    const nameText = this.add.text(0, -36, 'You (Hero)', {
      fontSize: '11px',
      color: '#38bdf8',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.playerContainer.add([this.playerShadow, sprite, nameText]);
    this.playerContainer.setDepth(getIsometricDepth(this.playerTile.x, this.playerTile.y, 100));
  }

  private addOtherPlayer(sessionId: string, player: PlayerNetData) {
    const screenPos = isoToScreen(player.x, player.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
    const container = this.add.container(screenPos.x, screenPos.y);

    const shadow = this.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);
    const sprite = this.add.image(0, -18, 'remote_hero_sprite');
    const nameText = this.add.text(0, -36, player.name || 'Player', {
      fontSize: '11px',
      color: '#f59e0b',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    container.add([shadow, sprite, nameText]);
    container.setDepth(getIsometricDepth(player.x, player.y, 100));

    this.otherPlayers.set(sessionId, { container, tile: { x: player.x, y: player.y } });
  }

  private updateOtherPlayer(sessionId: string, player: PlayerNetData) {
    const remote = this.otherPlayers.get(sessionId);
    if (!remote) return;

    const screenPos = isoToScreen(player.x, player.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
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

  override update(_time: number, delta: number) {
    if (this.rosterModal?.isOpen() || this.characterModal?.isOpen() || this.inventoryModal?.isOpen()) return;

    // 1. Mouse Hold-to-Move
    const pointer = this.input.activePointer;
    if (pointer.isDown && this.time.now - this.pointerDownTime > 200) {
      // User is holding down the mouse button!
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

    // 3. Keyboard WASD / Cursors
    if (!this.isMoving) {
      if (this.moveCooldown > 0) {
        this.moveCooldown -= delta;
        return;
      }

      let dx = 0;
      let dy = 0;

      if (this.cursors?.left?.isDown || this.wasdKeys?.left?.isDown) {
        dx -= 1;
      } else if (this.cursors?.right?.isDown || this.wasdKeys?.right?.isDown) {
        dx += 1;
      }

      if (this.cursors?.up?.isDown || this.wasdKeys?.up?.isDown) {
        dy -= 1;
      } else if (this.cursors?.down?.isDown || this.wasdKeys?.down?.isDown) {
        dy += 1;
      }

      if (dx !== 0 || dy !== 0) {
        this.currentPath = [];
        this.clearDestinationMarker();
        this.attemptMove(this.playerTile.x + dx, this.playerTile.y + dy);
        this.moveCooldown = 180;
      }
    }
  }

  private stepTowardsPointer(pointer: Phaser.Input.Pointer) {
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
    // Client-side quick boundary check
    if (targetX < 0 || targetX >= this.mapConfig.width || targetY < 0 || targetY >= this.mapConfig.height) {
      this.currentPath = [];
      this.clearDestinationMarker();
      return;
    }

    // Obstacle check
    if (this.mapConfig.obstacles.some(o => o.x === targetX && o.y === targetY)) {
      this.currentPath = [];
      this.clearDestinationMarker();
      return;
    }

    this.isMoving = true;
    this.playerTile = { x: targetX, y: targetY };

    // Update Zone HUD
    const zoneDisplay = document.getElementById('zone-display');
    if (zoneDisplay) {
      const isWild = targetX >= 21;
      zoneDisplay.innerText = isWild
        ? '⚔️ Zone: Whispering Meadow (WILD - Encounter Risk!)'
        : '🏡 Zone: Novice Town (Safe Zone)';
      zoneDisplay.style.color = isWild ? '#f87171' : '#6ee7b7';
    }

    const nextScreenPos = isoToScreen(targetX, targetY, this.tileWidth, this.tileHeight, this.originX, this.originY);

    // Send to authoritative server
    this.network.sendMove(targetX, targetY);

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

        // Check if pointer is still being held down
        const pointer = this.input.activePointer;
        if (pointer.isDown && this.time.now - this.pointerDownTime > 200) {
          this.stepTowardsPointer(pointer);
        } else if (this.currentPath.length > 0) {
          const nextTile = this.currentPath.shift()!;
          this.attemptMove(nextTile.x, nextTile.y);
          if (this.currentPath.length === 0) {
            this.clearDestinationMarker();
          }
        } else {
          this.clearDestinationMarker();
        }
      }
    });
  }

  private triggerBattleTransition(payload: any) {
    this.isMoving = true;
    this.currentPath = [];
    this.clearDestinationMarker();

    this.rosterModal.close();
    this.characterModal.close();
    this.inventoryModal.close();
    this.debugToolbar.close();

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
      },
      onOpen: () => {
        this.currentPath = [];
        this.clearDestinationMarker();
      }
    });

    this.inventoryModal = new InventoryModalController(
      this.inventory,
      this.roster.hero,
      getActiveBeast(),
      {
        onHeroUpdated: (hero) => {
          this.roster.hero = hero;
          this.characterModal.setHero(hero);
        },
        onBeastUpdated: (beast) => {
          const idx = this.roster.beasts.findIndex(b => b.id === beast.id);
          if (idx !== -1) {
            this.roster.beasts[idx] = beast;
            this.rosterModal.setRoster(this.roster);
          }
        },
        onInventoryUpdated: (inv) => {
          this.inventory = inv;
        },
        onWarpTown: () => {
          this.inventoryModal.close();
          this.playerTile = { x: 10, y: 10 };
          const screenPos = isoToScreen(10, 10, this.tileWidth, this.tileHeight, this.originX, this.originY);
          this.playerContainer.setPosition(screenPos.x, screenPos.y);
          this.playerContainer.setDepth(getIsometricDepth(10, 10, 100));
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
        },
        onInstantBattle: (payload) => {
          this.triggerBattleTransition(payload);
        },
        onWarp: (tile, toastMsg, color) => {
          this.playerTile = { ...tile };
          const screenPos = isoToScreen(tile.x, tile.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
          this.playerContainer.setPosition(screenPos.x, screenPos.y);
          this.playerContainer.setDepth(getIsometricDepth(tile.x, tile.y, 100));
          this.showToast(toastMsg, color);
        },
        onShowToast: (msg, color) => {
          this.showToast(msg, color);
        }
      },
      () => this.inventory
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