import Phaser from 'phaser';
import { OverworldNetwork, type PlayerNetData } from '../network/OverworldNetwork.js';
import { isoToScreen, screenToIso, getIsometricDepth } from '../utils/isometric.js';
import {
  DEFAULT_OVERWORLD_MAP,
  findPath,
  RosterManager,
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
  private rosterModalContainer?: Phaser.GameObjects.Container;
  private rosterButtonText?: Phaser.GameObjects.Text;
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
      if (this.isRosterOpen) return;
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
    this.events.on('resume', (_sys: any, data?: { respawnTile?: TileCoord; capturedBeasts?: Combatant[] }) => {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.network.sendBattleConcluded();

      // Restore Beasts button when returning to Overworld
      const htmlBtn = document.getElementById('btn-roster');
      if (htmlBtn) htmlBtn.style.display = 'flex';

      const zoneDisplay = document.getElementById('zone-display');

      if (data?.capturedBeasts && data.capturedBeasts.length > 0) {
        data.capturedBeasts.forEach(b => {
          const res = RosterManager.addCapturedBeast(this.roster, b);
          if (res.success) {
            this.roster = res.roster;
            if (zoneDisplay) {
              zoneDisplay.innerText = `🎉 Successfully captured ${b.name} and added to Beast Roster!`;
              zoneDisplay.style.color = '#a855f7';
            }
          }
        });
        this.updateRosterButtonLabel();
      }

      if (data?.respawnTile) {
        this.playerTile = { ...data.respawnTile };
        const screenPos = isoToScreen(this.playerTile.x, this.playerTile.y, this.tileWidth, this.tileHeight, this.originX, this.originY);
        this.playerContainer.setPosition(screenPos.x, screenPos.y);
        this.playerContainer.setDepth(getIsometricDepth(this.playerTile.x, this.playerTile.y, 100));
        if (zoneDisplay) {
          zoneDisplay.innerText = '🏡 Respawned at Novice Town. Health & Spirit restored!';
          zoneDisplay.style.color = '#6ee7b7';
        }
      } else {
        if (zoneDisplay && (!data?.capturedBeasts || data.capturedBeasts.length === 0)) {
          zoneDisplay.innerText = 'Returned to Overworld. Exploring...';
        }
      }
    });

    // 7. Setup Beast Roster & Formation button and keyboard shortcuts
    this.createRosterButton();
    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-B', () => this.toggleRosterModal());
      this.input.keyboard.on('keydown-F', () => this.toggleRosterModal());
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
    if (this.isRosterOpen) return;

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

    if (this.isRosterOpen) {
      this.toggleRosterModal();
    }

    // Hide Beasts button during battle
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) htmlBtn.style.display = 'none';

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
  // BEAST ROSTER & FORMATION UI
  // ==========================================

  private createRosterButton() {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.style.display = 'flex';
      htmlBtn.onclick = () => this.toggleRosterModal();
      this.updateRosterButtonLabel();
    }
  }

  private updateRosterButtonLabel() {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.innerHTML = `🐾 BEASTS (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY}) <span style="opacity: 0.75; font-size: 11px;">[B]</span>`;
    }
  }

  private toggleRosterModal() {
    this.isRosterOpen = !this.isRosterOpen;
    if (this.isRosterOpen) {
      this.currentPath = [];
      this.clearDestinationMarker();
      this.renderRosterModal();
    } else {
      if (this.rosterModalContainer) {
        this.rosterModalContainer.destroy();
        this.rosterModalContainer = undefined;
      }
    }
  }

  private renderRosterModal() {
    if (this.rosterModalContainer) {
      this.rosterModalContainer.destroy();
    }

    const { width, height } = this.scale;
    const zoom = this.cameras.main.zoom || 1.0;

    const container = this.add.container(width / 2, height / 2);
    container.setScrollFactor(0);
    container.setDepth(3000);
    container.setScale(1 / zoom);

    // Dim background
    const dim = this.add.rectangle(0, 0, width * zoom, height * zoom, 0x000000, 0.75).setInteractive();
    dim.on('pointerdown', () => { /* prevent click through */ });

    // Modal background
    const modalBg = this.add.rectangle(0, 0, 940, 560, 0x0f172a, 0.98);
    modalBg.setStrokeStyle(3, 0xd4af37, 1);

    // Title
    const title = this.add.text(0, -250, '🐾 BEAST ROSTER & FORMATION GRID', {
      fontSize: '20px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const subtitle = this.add.text(0, -225, 'Manage captured Beasts and configure 2x5 Formation Grid tactics', {
      fontSize: '12px',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    // Close button
    const closeBtn = this.add.rectangle(430, -245, 60, 30, 0x991b1b).setInteractive({ useHandCursor: true });
    const closeBtnText = this.add.text(430, -245, '✕ Close', { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0.5);
    closeBtn.on('pointerdown', () => this.toggleRosterModal());

    container.add([dim, modalBg, title, subtitle, closeBtn, closeBtnText]);

    // ==========================================
    // LEFT COLUMN: BEAST ROSTER
    // ==========================================
    const leftX = -230;
    const rosterHeader = this.add.text(leftX, -190, `BEAST ROSTER (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY})`, {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(rosterHeader);

    const startY = -145;
    this.roster.beasts.slice(0, 4).forEach((beast, idx) => {
      const cardY = startY + idx * 82;
      const isActive = beast.id === this.roster.activeBeastId;

      const cardBg = this.add.rectangle(leftX, cardY, 410, 72, 0x1e293b);
      cardBg.setStrokeStyle(1.5, isActive ? 0xfbbf24 : 0x334155, 1);

      const elemColors: Record<string, string> = {
        Water: '#38bdf8',
        Fire: '#f87171',
        Earth: '#fb923c',
        Wind: '#4ade80'
      };
      const elemColor = elemColors[beast.element] || '#ffffff';

      const nameText = this.add.text(leftX - 190, cardY - 22, `${beast.name} Lv.${beast.level} [${beast.element}]`, {
        fontSize: '12px',
        color: elemColor,
        fontStyle: 'bold'
      });

      const statsText = this.add.text(leftX - 190, cardY - 4, `HP: ${beast.hp}/${beast.maxHp}  SP: ${beast.sp}/${beast.maxSp}`, {
        fontSize: '10px',
        color: '#e2e8f0'
      });

      const attrsText = this.add.text(leftX - 190, cardY + 12, `ATK: ${beast.atk}  DEF: ${beast.def}  AGI: ${beast.agi}`, {
        fontSize: '10px',
        color: '#94a3b8'
      });

      container.add([cardBg, nameText, statsText, attrsText]);

      if (isActive) {
        const activeBadge = this.add.text(leftX + 130, cardY, '⭐ ACTIVE', {
          fontSize: '11px',
          color: '#fbbf24',
          fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        container.add(activeBadge);
      } else {
        const deployBtn = this.add.rectangle(leftX + 135, cardY, 90, 30, 0x0284c7).setInteractive({ useHandCursor: true });
        const deployText = this.add.text(leftX + 135, cardY, 'Deploy', {
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5, 0.5);
        deployBtn.on('pointerdown', () => {
          this.roster = RosterManager.setActiveBeast(this.roster, beast.id);
          this.renderRosterModal();
        });
        container.add([deployBtn, deployText]);
      }
    });

    if (this.roster.beasts.length === 0) {
      const emptyText = this.add.text(leftX, -100, 'No beasts captured yet.\nExplore Whispering Meadow to capture wild beasts!', {
        fontSize: '12px',
        color: '#64748b',
        align: 'center'
      }).setOrigin(0.5, 0.5);
      container.add(emptyText);
    }

    // ==========================================
    // RIGHT COLUMN: 2x5 FORMATION GRID
    // ==========================================
    const rightX = 230;
    const formationHeader = this.add.text(rightX, -190, 'TACTICAL FORMATION (2x5 GRID)', {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Unit selector buttons
    const heroSelected = this.selectedFormationUnitType === 'hero';
    const selHeroBtn = this.add.rectangle(rightX - 95, -150, 160, 32, heroSelected ? 0x1d4ed8 : 0x334155).setInteractive({ useHandCursor: true });
    selHeroBtn.setStrokeStyle(1.5, heroSelected ? 0xfde047 : 0x475569);
    const selHeroText = this.add.text(rightX - 95, -150, '🧙 Move Hero', {
      fontSize: '11px',
      color: heroSelected ? '#ffffff' : '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    selHeroBtn.on('pointerdown', () => {
      this.selectedFormationUnitType = 'hero';
      this.renderRosterModal();
    });

    const activeBeast = this.roster.beasts.find(b => b.id === this.roster.activeBeastId);
    const beastSelected = this.selectedFormationUnitType === 'beast';
    const selBeastBtn = this.add.rectangle(rightX + 95, -150, 160, 32, beastSelected ? 0x059669 : 0x334155).setInteractive({ useHandCursor: true });
    selBeastBtn.setStrokeStyle(1.5, beastSelected ? 0xfde047 : 0x475569);
    const selBeastText = this.add.text(rightX + 95, -150, `🦁 Move ${activeBeast?.name || 'Beast'}`, {
      fontSize: '11px',
      color: beastSelected ? '#ffffff' : '#94a3b8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    selBeastBtn.on('pointerdown', () => {
      this.selectedFormationUnitType = 'beast';
      this.renderRosterModal();
    });

    container.add([formationHeader, selHeroBtn, selHeroText, selBeastBtn, selBeastText]);

    // Front Row Label
    const frontLabel = this.add.text(rightX, -112, '--- FRONT ROW (Intercepts Melee Attacks) ---', {
      fontSize: '11px',
      color: '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(frontLabel);

    // Front Row Slots (col 0..4)
    for (let col = 0; col < 5; col++) {
      const slotX = rightX - 160 + col * 80;
      const slotY = -72;
      this.renderFormationSlotBox(container, slotX, slotY, 'front', col, activeBeast);
    }

    // Back Row Label
    const backLabel = this.add.text(rightX, -22, '--- BACK ROW (Shielded by Front Row) ---', {
      fontSize: '11px',
      color: '#60a5fa',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    container.add(backLabel);

    // Back Row Slots (col 0..4)
    for (let col = 0; col < 5; col++) {
      const slotX = rightX - 160 + col * 80;
      const slotY = 18;
      this.renderFormationSlotBox(container, slotX, slotY, 'back', col, activeBeast);
    }

    // Formation Summary
    const summaryText = this.add.text(rightX, 85,
      `Current Formation:\n🧙 Hero: ${this.roster.formation.heroSlot.row.toUpperCase()} Row, Slot ${this.roster.formation.heroSlot.col}\n🦁 ${activeBeast?.name || 'Beast'}: ${this.roster.formation.beastSlot.row.toUpperCase()} Row, Slot ${this.roster.formation.beastSlot.col}`, {
      fontSize: '11px',
      color: '#e2e8f0',
      align: 'center',
      lineSpacing: 4
    }).setOrigin(0.5, 0.5);

    const tipText = this.add.text(rightX, 150, '💡 TS Online Tactics:\nFront Row intercepts melee attacks, protecting the Back Row\nunit in the same column until the front unit is cleared.', {
      fontSize: '10px',
      color: '#fbbf24',
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5, 0.5);

    // Save & Close Button
    const saveBtn = this.add.rectangle(0, 235, 260, 40, 0xd97706).setInteractive({ useHandCursor: true });
    const saveBtnText = this.add.text(0, 235, '✔️ Confirm & Close', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    saveBtn.on('pointerdown', () => this.toggleRosterModal());

    container.add([summaryText, tipText, saveBtn, saveBtnText]);

    this.rosterModalContainer = container;
  }

  private renderFormationSlotBox(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    row: 'front' | 'back',
    col: number,
    activeBeast?: Combatant
  ) {
    const isHeroHere = this.roster.formation.heroSlot.row === row && this.roster.formation.heroSlot.col === col;
    const isBeastHere = this.roster.formation.beastSlot.row === row && this.roster.formation.beastSlot.col === col;

    const bgColor = isHeroHere ? 0x1d4ed8 : isBeastHere ? 0x059669 : 0x1e293b;
    const strokeColor = isHeroHere ? 0x60a5fa : isBeastHere ? 0x34d399 : 0x334155;

    const slotBox = this.add.rectangle(x, y, 74, 52, bgColor).setInteractive({ useHandCursor: true });
    slotBox.setStrokeStyle(1.5, strokeColor);

    const label = isHeroHere ? '🧙 Hero' : isBeastHere ? `🦁 ${activeBeast?.name?.split(' ')[0] || 'Beast'}` : `Slot ${col}`;
    const slotText = this.add.text(x, y, label, {
      fontSize: '10px',
      color: isHeroHere || isBeastHere ? '#ffffff' : '#64748b',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    slotBox.on('pointerdown', () => {
      this.roster = RosterManager.setFormationSlot(this.roster, this.selectedFormationUnitType, { row, col });
      this.renderRosterModal();
    });

    container.add([slotBox, slotText]);
  }
}
