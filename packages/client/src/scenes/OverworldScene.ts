import Phaser from 'phaser';
import { OverworldNetwork, type PlayerNetData } from '../network/OverworldNetwork.js';
import { isoToScreen, screenToIso, getIsometricDepth } from '../utils/isometric.js';
import {
  DEFAULT_OVERWORLD_MAP,
  findPath,
  RosterManager,
  ProgressionEngine,
  Element,
  type MapConfig,
  type TileCoord,
  type Combatant,
  type PlayerRosterState
} from '@poktsonline/shared';

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
  private isRosterOpen: boolean = false;
  private isCharacterModalOpen: boolean = false;
  private selectedFormationUnitType: 'hero' | 'beast' = 'hero';

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
      if (this.isRosterOpen || this.isCharacterModalOpen) return;
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

    // 6. Handle returning from battle (including defeat respawn & captured beasts)
    this.events.on('resume', (_sys: any, data?: {
      respawnTile?: TileCoord;
      capturedBeasts?: Combatant[];
      expAwarded?: number;
      levelUps?: any[];
      updatedAllies?: Combatant[];
    }) => {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.network.sendBattleConcluded();

      // Restore HUD elements and buttons when returning to Overworld
      const uiOverlay = document.getElementById('ui-overlay');
      if (uiOverlay) uiOverlay.style.display = 'block';
      const htmlBtn = document.getElementById('btn-roster');
      if (htmlBtn) htmlBtn.style.display = 'flex';
      const charBtn = document.getElementById('btn-character-status');
      if (charBtn) charBtn.style.display = 'block';
      const debugBtn = document.getElementById('btn-toggle-debug');
      if (debugBtn) debugBtn.style.display = 'flex';

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

      this.updateRosterButtonLabel();
      this.updateHeroStatusBar();
    });

    // 7. Setup Beast Roster & Formation button, Character Profile, QA Debug Toolbar
    this.createRosterButton();
    this.setupRosterModalDOM();
    this.setupCharacterModalDOM();
    this.setupDebugToolbarDOM();
    this.updateHeroStatusBar();

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-B', () => {
        if (this.scene.isPaused()) return;
        this.toggleRosterModal();
      });
      this.input.keyboard.on('keydown-F', () => {
        if (this.scene.isPaused()) return;
        this.toggleRosterModal();
      });
      this.input.keyboard.on('keydown-C', () => {
        if (this.scene.isPaused()) return;
        this.toggleCharacterModal();
      });
      this.input.keyboard.on('keydown-T', () => {
        if (this.scene.isPaused()) return;
        const panel = document.getElementById('debug-panel');
        if (panel) panel.classList.toggle('open');
      });
      this.input.keyboard.on('keydown-BACKTICK', () => {
        if (this.scene.isPaused()) return;
        const panel = document.getElementById('debug-panel');
        if (panel) panel.classList.toggle('open');
      });
      this.input.keyboard.on('keydown-ESC', () => {
        if (this.scene.isPaused()) return;
        this.toggleRosterModal(false);
        this.toggleCharacterModal(false);
        const panel = document.getElementById('debug-panel');
        if (panel) panel.classList.remove('open');
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
    if (this.isRosterOpen || this.isCharacterModalOpen) return;

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

    this.toggleRosterModal(false);
    this.toggleCharacterModal(false);
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) debugPanel.classList.remove('open');

    // Hide Overworld HUD and buttons during battle
    const uiOverlay = document.getElementById('ui-overlay');
    if (uiOverlay) uiOverlay.style.display = 'none';
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) htmlBtn.style.display = 'none';
    const charBtn = document.getElementById('btn-character-status');
    if (charBtn) charBtn.style.display = 'none';
    const debugBtn = document.getElementById('btn-toggle-debug');
    if (debugBtn) debugBtn.style.display = 'none';

    // Flash screen and spin transition
    this.cameras.main.flash(400, 255, 255, 255);
    this.cameras.main.shake(300, 0.015);

    this.time.delayedCall(450, () => {
      this.scene.pause();
      this.scene.launch('BattleScene', {
        encounter: payload.encounter,
        network: this.network,
        roster: this.roster,
        alliesFormation: RosterManager.buildTeamFormation(this.roster)
      });
    });
  }

  // ==========================================
  // BEAST ROSTER & FORMATION UI (DOM OVERLAY)
  // ==========================================

  private createRosterButton() {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.style.display = 'flex';
      htmlBtn.onclick = () => this.toggleRosterModal();
      this.updateRosterButtonLabel();
    }
  }

  private setupRosterModalDOM() {
    const btnClose = document.getElementById('btn-close-modal');
    if (btnClose) btnClose.onclick = () => this.toggleRosterModal(false);

    const btnConfirm = document.getElementById('btn-confirm-formation');
    if (btnConfirm) btnConfirm.onclick = () => this.toggleRosterModal(false);

    const modal = document.getElementById('roster-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggleRosterModal(false);
        }
      };
    }
  }

  private updateRosterButtonLabel() {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.innerHTML = `🐾 BEASTS (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY}) <span style="opacity: 0.75; font-size: 11px;">[B]</span>`;
    }
  }

  public toggleRosterModal(forceOpen?: boolean) {
    if (this.scene.isPaused() && forceOpen !== false) return;
    const modal = document.getElementById('roster-modal');
    if (!modal) return;

    if (forceOpen !== undefined) {
      this.isRosterOpen = forceOpen;
    } else {
      this.isRosterOpen = !this.isRosterOpen;
    }

    if (this.isRosterOpen) {
      this.currentPath = [];
      this.clearDestinationMarker();
      modal.classList.add('open');
      this.renderRosterModalDOM();
    } else {
      modal.classList.remove('open');
    }
  }

  private renderRosterModalDOM() {
    const modal = document.getElementById('roster-modal');
    if (!modal || !this.isRosterOpen) return;

    // 1. Capacity header
    const capacityHeader = document.getElementById('roster-capacity-header');
    if (capacityHeader) {
      capacityHeader.innerText = `BEAST ROSTER (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY})`;
    }

    // 2. Beast List
    const beastContainer = document.getElementById('beast-list-container');
    if (beastContainer) {
      beastContainer.innerHTML = '';
      if (this.roster.beasts.length === 0) {
        beastContainer.innerHTML = `
          <div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
            No beasts captured yet.<br>Explore Whispering Meadow to capture wild beasts!
          </div>
        `;
      } else {
        this.roster.beasts.forEach((beast) => {
          const isActive = beast.id === this.roster.activeBeastId;
          const card = document.createElement('div');
          card.className = `beast-item ${isActive ? 'active' : ''}`;

          card.innerHTML = `
            <div class="beast-info">
              <div class="beast-name-row">
                <span style="color: ${this.getElementColor(beast.element)};">${beast.name}</span>
                <span style="font-size: 11px; color: #94a3b8;">Lv.${beast.level}</span>
                <span class="badge-element badge-${beast.element}">${this.getElementIcon(beast.element)} ${beast.element}</span>
              </div>
              <div class="beast-bars">
                <span>HP: ${beast.hp}/${beast.maxHp}</span> &bull; <span>SP: ${beast.sp}/${beast.maxSp}</span> &bull; <span>EXP: ${beast.exp ?? 0}/${beast.maxExp ?? ProgressionEngine.calculateExpToNextLevel(beast.level)}</span>
              </div>
              <div class="beast-stats-row">
                <span>ATK: ${beast.atk}</span>
                <span>DEF: ${beast.def}</span>
                <span>INT: ${beast.int || 10}</span>
                <span>AGI: ${beast.agi}</span>
              </div>
              ${(beast.statPoints ?? 0) > 0 ? `
                <div style="margin-top: 4px; display: flex; align-items: center; gap: 4px; font-size: 10px; color: #fbbf24;">
                  <span>⭐ ${beast.statPoints} Pts:</span>
                  <button class="beast-stat-btn" data-attr="atk" data-id="${beast.id}">+ATK</button>
                  <button class="beast-stat-btn" data-attr="def" data-id="${beast.id}">+DEF</button>
                  <button class="beast-stat-btn" data-attr="int" data-id="${beast.id}">+INT</button>
                  <button class="beast-stat-btn" data-attr="agi" data-id="${beast.id}">+AGI</button>
                </div>
              ` : ''}
            </div>
            <div>
              ${isActive 
                ? '<div class="badge-active-beast">⭐ ACTIVE</div>' 
                : `<button class="btn-deploy-beast" data-id="${beast.id}">⚡ Deploy</button>`
              }
            </div>
          `;

          const deployBtn = card.querySelector<HTMLButtonElement>('.btn-deploy-beast');
          if (deployBtn) {
            deployBtn.onclick = (e) => {
              e.stopPropagation();
              this.roster = RosterManager.setActiveBeast(this.roster, beast.id);
              this.updateRosterButtonLabel();
              this.renderRosterModalDOM();
            };
          }

          const statBtns = card.querySelectorAll<HTMLButtonElement>('.beast-stat-btn');
          statBtns.forEach(btn => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const attr = btn.getAttribute('data-attr') as 'atk' | 'def' | 'int' | 'agi';
              const res = ProgressionEngine.allocateStatPoint(beast, attr);
              if (res.success) {
                const idx = this.roster.beasts.findIndex(b => b.id === beast.id);
                if (idx !== -1) this.roster.beasts[idx] = res.combatant;
                this.renderRosterModalDOM();
              }
            };
          });

          beastContainer.appendChild(card);
        });
      }
    }

    // 3. Unit Selector Buttons
    const btnHero = document.getElementById('btn-select-hero');
    const btnBeast = document.getElementById('btn-select-beast');
    const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);

    if (btnHero) {
      btnHero.className = `btn-unit-select ${this.selectedFormationUnitType === 'hero' ? 'selected-hero' : ''}`;
      btnHero.onclick = () => {
        this.selectedFormationUnitType = 'hero';
        this.renderRosterModalDOM();
      };
    }

    if (btnBeast) {
      btnBeast.className = `btn-unit-select ${this.selectedFormationUnitType === 'beast' ? 'selected-beast' : ''}`;
      btnBeast.innerText = `🦁 Move ${activeBeast?.name || 'Active Beast'}`;
      btnBeast.onclick = () => {
        this.selectedFormationUnitType = 'beast';
        this.renderRosterModalDOM();
      };
    }

    // 4. Formation Grid Slots
    this.renderGridSlotsRow('front', document.getElementById('grid-front-row'), activeBeast);
    this.renderGridSlotsRow('back', document.getElementById('grid-back-row'), activeBeast);

    // 5. Summary Text
    const summaryText = document.getElementById('formation-summary-text');
    if (summaryText) {
      summaryText.innerHTML = `
        <b>Current Formation:</b> 
        🧙 Hero: <span style="color: #60a5fa;">${this.roster.formation.heroSlot.row.toUpperCase()} [Col ${this.roster.formation.heroSlot.col}]</span> &bull; 
        🦁 ${activeBeast?.name || 'Beast'}: <span style="color: #34d399;">${this.roster.formation.beastSlot.row.toUpperCase()} [Col ${this.roster.formation.beastSlot.col}]</span>
      `;
    }
  }

  private renderGridSlotsRow(row: 'front' | 'back', rowEl: HTMLElement | null, activeBeast?: Combatant) {
    if (!rowEl) return;
    rowEl.innerHTML = '';

    for (let col = 0; col < 5; col++) {
      const isHeroHere = this.roster.formation.heroSlot.row === row && this.roster.formation.heroSlot.col === col;
      const isBeastHere = this.roster.formation.beastSlot.row === row && this.roster.formation.beastSlot.col === col;

      const slotBox = document.createElement('div');
      slotBox.className = `slot-box ${isHeroHere ? 'hero-slot' : isBeastHere ? 'beast-slot' : ''}`;

      if (isHeroHere) {
        slotBox.innerHTML = '<div>🧙 Hero</div><div style="font-size: 9px; opacity: 0.85;">Lv.5</div>';
      } else if (isBeastHere) {
        slotBox.innerHTML = `<div>🦁 ${activeBeast?.name?.split(' ')[0] || 'Beast'}</div><div style="font-size: 9px; opacity: 0.85;">Lv.${activeBeast?.level || 1}</div>`;
      } else {
        slotBox.innerHTML = `<div>Slot ${col}</div><div style="font-size: 9px; opacity: 0.5;">Empty</div>`;
      }

      slotBox.onclick = () => {
        this.roster = RosterManager.setFormationSlot(this.roster, this.selectedFormationUnitType, { row, col });
        this.renderRosterModalDOM();
      };

      rowEl.appendChild(slotBox);
    }
  }

  private getElementColor(element: Element): string {
    switch (element) {
      case Element.Water: return '#38bdf8';
      case Element.Fire: return '#f87171';
      case Element.Earth: return '#fb923c';
      case Element.Wind: return '#4ade80';
      default: return '#e2e8f0';
    }
  }

  private getElementIcon(element: Element): string {
    switch (element) {
      case Element.Water: return '💧';
      case Element.Fire: return '🔥';
      case Element.Earth: return '🌍';
      case Element.Wind: return '🌪️';
      default: return '✨';
    }
  }

  // ==========================================
  // HERO CHARACTER STATUS & STAT ALLOCATION UI
  // ==========================================

  private setupCharacterModalDOM() {
    const btnStatus = document.getElementById('btn-character-status');
    if (btnStatus) btnStatus.onclick = () => this.toggleCharacterModal();

    const btnClose = document.getElementById('btn-close-char-modal');
    if (btnClose) btnClose.onclick = () => this.toggleCharacterModal(false);

    const btnDone = document.getElementById('btn-close-char-bottom');
    if (btnDone) btnDone.onclick = () => this.toggleCharacterModal(false);

    const modal = document.getElementById('character-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggleCharacterModal(false);
        }
      };
    }

    // Attach click listeners to stat allocation buttons
    const plusBtns = document.querySelectorAll<HTMLButtonElement>('#character-modal .btn-stat-plus');
    plusBtns.forEach(btn => {
      btn.onclick = () => {
        const attr = btn.getAttribute('data-attr') as 'atk' | 'def' | 'int' | 'agi';
        const res = ProgressionEngine.allocateStatPoint(this.roster.hero, attr);
        if (res.success) {
          this.roster.hero = res.combatant;
          this.renderCharacterModalDOM();
          this.updateHeroStatusBar();
        }
      };
    });
  }

  public toggleCharacterModal(forceOpen?: boolean) {
    if (this.scene.isPaused() && forceOpen !== false) return;
    const modal = document.getElementById('character-modal');
    if (!modal) return;

    if (forceOpen !== undefined) {
      this.isCharacterModalOpen = forceOpen;
    } else {
      this.isCharacterModalOpen = !this.isCharacterModalOpen;
    }

    if (this.isCharacterModalOpen) {
      this.currentPath = [];
      this.clearDestinationMarker();
      modal.classList.add('open');
      this.renderCharacterModalDOM();
    } else {
      modal.classList.remove('open');
    }
  }

  private renderCharacterModalDOM() {
    const modal = document.getElementById('character-modal');
    if (!modal || !this.isCharacterModalOpen) return;

    const hero = this.roster.hero;
    const maxExp = hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const expPercent = Math.min(100, Math.floor((exp / maxExp) * 100));
    const statPoints = hero.statPoints ?? 0;

    const nameTitle = document.getElementById('char-name-title');
    if (nameTitle) nameTitle.innerText = `${hero.name} Lv.${hero.level} [${hero.element}]`;

    const expText = document.getElementById('char-exp-text');
    if (expText) expText.innerText = `EXP: ${exp} / ${maxExp} (${expPercent}%)`;

    const expBar = document.getElementById('char-exp-bar');
    if (expBar) expBar.style.width = `${expPercent}%`;

    const pointsBadge = document.getElementById('char-stat-points-val');
    if (pointsBadge) {
      pointsBadge.innerText = `${statPoints} Points Available`;
      pointsBadge.style.color = statPoints > 0 ? '#fbbf24' : '#94a3b8';
      pointsBadge.style.borderColor = statPoints > 0 ? '#fbbf24' : '#475569';
    }

    // Values
    const elAtk = document.getElementById('val-atk');
    if (elAtk) elAtk.innerText = `${hero.atk}`;

    const elDef = document.getElementById('val-def');
    if (elDef) elDef.innerText = `${hero.def}`;

    const elInt = document.getElementById('val-int');
    if (elInt) elInt.innerText = `${hero.int}`;

    const elAgi = document.getElementById('val-agi');
    if (elAgi) elAgi.innerText = `${hero.agi}`;

    const elHp = document.getElementById('val-hp');
    if (elHp) elHp.innerText = `${hero.hp} / ${hero.maxHp}`;

    const elSp = document.getElementById('val-sp');
    if (elSp) elSp.innerText = `${hero.sp} / ${hero.maxSp}`;

    // Enable/disable plus buttons
    const plusBtns = document.querySelectorAll<HTMLButtonElement>('#character-modal .btn-stat-plus');
    plusBtns.forEach(btn => {
      btn.disabled = statPoints <= 0;
    });
  }

  private updateHeroStatusBar() {
    const hero = this.roster.hero;
    const maxExp = hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const statPoints = hero.statPoints ?? 0;

    const quickInfo = document.getElementById('hero-quick-info');
    if (quickInfo) {
      const ptsNote = statPoints > 0 ? ` <span style="color: #fbbf24; font-weight: bold;">⭐ ${statPoints} PTS!</span>` : '';
      quickInfo.innerHTML = `🧙 ${hero.name} Lv.${hero.level} (${exp}/${maxExp} EXP)${ptsNote}`;
    }
  }

  // ==========================================
  // QA DEVELOPER TOOLBAR (DEBUG CHEATS)
  // ==========================================

  private setupDebugToolbarDOM() {
    const btnToggle = document.getElementById('btn-toggle-debug');
    const panel = document.getElementById('debug-panel');
    const btnClose = document.getElementById('btn-close-debug');

    if (btnToggle && panel) {
      btnToggle.onclick = () => {
        panel.classList.toggle('open');
      };
    }

    if (btnClose && panel) {
      btnClose.onclick = () => {
        panel.classList.remove('open');
      };
    }

    const showToast = (msg: string, color: string = '#6ee7b7') => {
      const zoneDisplay = document.getElementById('zone-display');
      if (zoneDisplay) {
        zoneDisplay.innerText = msg;
        zoneDisplay.style.color = color;
      }
    };

    // 1. +500 EXP (Hero)
    const btnExp500 = document.getElementById('dbg-exp-500');
    if (btnExp500) {
      btnExp500.onclick = () => {
        const prog = ProgressionEngine.addExpToCombatant(this.roster.hero, 500);
        this.roster.hero = prog.combatant;
        this.updateHeroStatusBar();
        this.renderCharacterModalDOM();
        showToast(`⚡ Added +500 EXP to Hero! (Total: ${this.roster.hero.exp}/${this.roster.hero.maxExp} Lv.${this.roster.hero.level})`, '#facc15');
      };
    }

    // 2. +500 EXP (Active Beast)
    const btnExpBeast = document.getElementById('dbg-exp-beast');
    if (btnExpBeast) {
      btnExpBeast.onclick = () => {
        const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);
        if (activeBeast) {
          const prog = ProgressionEngine.addExpToCombatant(activeBeast, 500);
          const idx = this.roster.beasts.findIndex(b => b.id === activeBeast.id);
          if (idx !== -1) this.roster.beasts[idx] = prog.combatant;
          this.renderRosterModalDOM();
          showToast(`🦁 Added +500 EXP to ${activeBeast.name}! (Lv.${prog.combatant.level})`, '#38bdf8');
        } else {
          showToast('No active beast deployed!', '#ef4444');
        }
      };
    }

    // 3. Instant Level Up
    const btnLvlUp = document.getElementById('dbg-level-up');
    if (btnLvlUp) {
      btnLvlUp.onclick = () => {
        const needed = (this.roster.hero.maxExp ?? 500) - (this.roster.hero.exp ?? 0);
        const prog = ProgressionEngine.addExpToCombatant(this.roster.hero, Math.max(1, needed));
        this.roster.hero = prog.combatant;
        this.updateHeroStatusBar();
        this.renderCharacterModalDOM();
        showToast(`🎉 Level Up! Hero is now Lv.${this.roster.hero.level}! (+${prog.statPointsGained} Stat Points)`, '#fbbf24');
      };
    }

    // 4. +5 Stat Points
    const btnStatPts = document.getElementById('dbg-stat-points');
    if (btnStatPts) {
      btnStatPts.onclick = () => {
        this.roster.hero.statPoints = (this.roster.hero.statPoints ?? 0) + 5;
        this.updateHeroStatusBar();
        this.renderCharacterModalDOM();
        showToast(`⭐ Added +5 Stat Points! Total: ${this.roster.hero.statPoints}`, '#fbbf24');
      };
    }

    // 5. Full Heal
    const btnHeal = document.getElementById('dbg-full-heal');
    if (btnHeal) {
      btnHeal.onclick = () => {
        this.roster.hero.hp = this.roster.hero.maxHp;
        this.roster.hero.sp = this.roster.hero.maxSp;
        this.roster.beasts.forEach(b => {
          b.hp = b.maxHp;
          b.sp = b.maxSp;
        });
        this.renderCharacterModalDOM();
        this.renderRosterModalDOM();
        showToast('💖 Full Heal! Health & Spirit restored to 100% for all units.', '#4ade80');
      };
    }

    // 6. Hurt Hero (-40 HP)
    const btnHurt = document.getElementById('dbg-hurt-hero');
    if (btnHurt) {
      btnHurt.onclick = () => {
        this.roster.hero.hp = Math.max(1, this.roster.hero.hp - 40);
        this.renderCharacterModalDOM();
        showToast(`🩸 Hero took 40 damage! HP: ${this.roster.hero.hp}/${this.roster.hero.maxHp}`, '#ef4444');
      };
    }

    // 7. Add Beasts
    const addMockBeast = (name: string, element: Element, atk: number, def: number) => {
      const mock: Combatant = {
        id: `beast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        isHero: false,
        level: Math.max(1, this.roster.hero.level - 1),
        element,
        hp: 70,
        maxHp: 70,
        sp: 30,
        maxSp: 30,
        atk,
        def,
        int: 10,
        agi: 14
      };
      const res = RosterManager.addCapturedBeast(this.roster, mock);
      if (res.success) {
        this.roster = res.roster;
        this.updateRosterButtonLabel();
        this.renderRosterModalDOM();
        showToast(`🐾 Added ${name} [${element}] to Beast Roster!`, '#a855f7');
      } else {
        showToast(res.reason || 'Roster full!', '#ef4444');
      }
    };

    document.getElementById('dbg-add-fire-beast')?.addEventListener('click', () => addMockBeast('Flame Imp', Element.Fire, 24, 12));
    document.getElementById('dbg-add-wind-beast')?.addEventListener('click', () => addMockBeast('Gale Hawk', Element.Wind, 20, 10));
    document.getElementById('dbg-add-earth-beast')?.addEventListener('click', () => addMockBeast('Rock Boar', Element.Earth, 18, 22));
    document.getElementById('dbg-add-water-beast')?.addEventListener('click', () => addMockBeast('Aqua Serpent', Element.Water, 22, 15));

    // 8. Instant Battle Encounter
    const btnBattle = document.getElementById('dbg-instant-battle');
    if (btnBattle) {
      btnBattle.onclick = () => {
        panel?.classList.remove('open');
        this.triggerBattleTransition({
          encounter: {
            wildEnemies: [
              {
                id: `wild_test_1`,
                name: 'Wild Flame Imp',
                isHero: false,
                level: this.roster.hero.level,
                element: Element.Fire,
                hp: 55,
                maxHp: 55,
                sp: 20,
                maxSp: 20,
                atk: 18,
                def: 12,
                int: 10,
                agi: 12
              },
              {
                id: `wild_test_2`,
                name: 'Wild Rock Boar',
                isHero: false,
                level: this.roster.hero.level,
                element: Element.Earth,
                hp: 65,
                maxHp: 65,
                sp: 15,
                maxSp: 15,
                atk: 16,
                def: 20,
                int: 8,
                agi: 10
              }
            ]
          }
        });
      };
    }

    // 9. Teleport Town
    const btnWarpTown = document.getElementById('dbg-warp-town');
    if (btnWarpTown) {
      btnWarpTown.onclick = () => {
        this.playerTile = { x: 10, y: 10 };
        const screenPos = isoToScreen(10, 10, this.tileWidth, this.tileHeight, this.originX, this.originY);
        this.playerContainer.setPosition(screenPos.x, screenPos.y);
        this.playerContainer.setDepth(getIsometricDepth(10, 10, 100));
        showToast('🏡 Teleported to Novice Town (Safe Zone)', '#6ee7b7');
      };
    }

    // 10. Teleport Meadow
    const btnWarpMeadow = document.getElementById('dbg-warp-meadow');
    if (btnWarpMeadow) {
      btnWarpMeadow.onclick = () => {
        this.playerTile = { x: 23, y: 10 };
        const screenPos = isoToScreen(23, 10, this.tileWidth, this.tileHeight, this.originX, this.originY);
        this.playerContainer.setPosition(screenPos.x, screenPos.y);
        this.playerContainer.setDepth(getIsometricDepth(23, 10, 100));
        showToast('🌾 Teleported to Whispering Meadow (Wild Encounter Zone)', '#f59e0b');
      };
    }
  }
}

