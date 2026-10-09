import type Phaser from 'phaser';
import { type MapConfig, type TileCoord, type PortalDefinition, type NPCDefinition } from '@poktsonline/shared';
import { isoToScreen, getIsometricDepth } from '../utils/isometric.js';
import { type PlayerNetData } from '../network/OverworldNetwork.js';

export interface OverworldEntityManagerConfig {
  tileWidth: number;
  tileHeight: number;
  originX: number;
  originY: number;
  isModalOpen?: () => boolean;
  onPortalClick?: (portal: PortalDefinition) => void;
  onNPCClick?: (npc: NPCDefinition) => void;
  onBeastClick?: (targetX: number, targetY: number, beast: any) => void;
}

const rectContains = (r: { x: number; y: number; width: number; height: number }, x: number, y: number): boolean => {
  return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
};

/**
 * Deep module encapsulating all in-world dynamic entities:
 * Other remote players, authoritative roaming beasts, map portals,
 * interactable NPCs, and comic speech bubbles.
 */
export class OverworldEntityManager {
  private scene: Phaser.Scene;
  private config: OverworldEntityManagerConfig;

  private mapPortals: Phaser.GameObjects.Container[] = [];
  private mapNPCs: Phaser.GameObjects.Container[] = [];
  private otherPlayers: Map<string, { container: Phaser.GameObjects.Container; tile: TileCoord }> = new Map();
  private roamingBeasts: Map<string, { container: Phaser.GameObjects.Container; tile: TileCoord; entity: any }> = new Map();
  private speechBubbles: Map<string, { container: Phaser.GameObjects.Container; timerEvent?: Phaser.Time.TimerEvent }> = new Map();

  constructor(scene: Phaser.Scene, config: OverworldEntityManagerConfig) {
    this.scene = scene;
    this.config = config;
  }

  // ==========================================
  // Map Portals
  // ==========================================

  public renderPortals(portals: PortalDefinition[]): void {
    this.clearPortals();
    if (!portals || portals.length === 0) return;

    portals.forEach(portal => {
      const screenPos = isoToScreen(
        portal.position.x,
        portal.position.y,
        this.config.tileWidth,
        this.config.tileHeight,
        this.config.originX,
        this.config.originY
      );

      const portalContainer = this.scene.add.container(screenPos.x, screenPos.y);

      // Glowing portal rune
      const rune = this.scene.add.image(0, 0, 'portal_rune');
      rune.setOrigin(0.5, 0.5);

      // Pulsing glow animation
      this.scene.tweens.add({
        targets: rune,
        scale: { from: 0.85, to: 1.15 },
        alpha: { from: 0.7, to: 1.0 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Floating portal name banner
      const nameLabel = this.scene.add.text(0, -28, `🌀 ${portal.name}`, {
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#38bdf8',
        stroke: '#0f172a',
        strokeThickness: 3
      }).setOrigin(0.5, 0.5);

      // Make portal rune and label directly interactive with hand cursor
      portalContainer.setSize(96, 64);
      portalContainer.setInteractive({
        hitArea: { x: -48, y: -38, width: 96, height: 64 },
        hitAreaCallback: rectContains,
        useHandCursor: true
      });
      if (portalContainer.input) {
        portalContainer.input.cursor = 'pointer';
      }

      portalContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (this.config.isModalOpen && this.config.isModalOpen()) return;
        if (pointer?.event) pointer.event.stopPropagation();
        this.config.onPortalClick?.(portal);
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
        if (this.config.isModalOpen && this.config.isModalOpen()) return;
        if (pointer?.event) pointer.event.stopPropagation();
        this.config.onPortalClick?.(portal);
      });

      portalContainer.add([rune, nameLabel]);
      portalContainer.setDepth(getIsometricDepth(portal.position.x, portal.position.y, 40));
      this.mapPortals.push(portalContainer);
    });
  }

  public clearPortals(): void {
    this.mapPortals.forEach(p => p.destroy());
    this.mapPortals = [];
  }

  // ==========================================
  // Map NPCs
  // ==========================================

  public renderNPCs(npcs: NPCDefinition[]): void {
    this.clearNPCs();
    if (!npcs || npcs.length === 0) return;

    npcs.forEach(npc => {
      const screenPos = isoToScreen(
        npc.position.x,
        npc.position.y,
        this.config.tileWidth,
        this.config.tileHeight,
        this.config.originX,
        this.config.originY
      );

      const npcContainer = this.scene.add.container(screenPos.x, screenPos.y);

      // Shadow
      const shadow = this.scene.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);

      // Sprite
      const sprite = this.scene.add.image(0, -18, npc.spriteKey || 'hero_sprite');

      // Speech bubble indicator (floating icon)
      const bubbleBg = this.scene.add.circle(0, -42, 11, 0x0f172a, 0.85);
      bubbleBg.setStrokeStyle(1.5, 0x38bdf8);
      const bubbleIcon = this.scene.add.text(0, -42, npc.avatarIcon || '💬', {
        fontSize: '11px'
      }).setOrigin(0.5, 0.5);

      // Floating bounce animation on bubble
      this.scene.tweens.add({
        targets: [bubbleBg, bubbleIcon],
        y: '-=4',
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Name and title badge
      const nameText = this.scene.add.text(0, -29, `${npc.name}`, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#facc15',
        stroke: '#0f172a',
        strokeThickness: 3
      }).setOrigin(0.5, 0.5);

      // Interactive hit area
      npcContainer.setSize(64, 64);
      npcContainer.setInteractive({
        hitArea: { x: -32, y: -48, width: 64, height: 64 },
        hitAreaCallback: rectContains,
        useHandCursor: true
      });
      if (npcContainer.input) {
        npcContainer.input.cursor = 'pointer';
      }

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
        if (this.config.isModalOpen && this.config.isModalOpen()) return;
        if (pointer?.event) pointer.event.stopPropagation();
        this.config.onNPCClick?.(npc);
      });

      npcContainer.add([shadow, sprite, bubbleBg, bubbleIcon, nameText]);
      npcContainer.setDepth(getIsometricDepth(npc.position.x, npc.position.y, 45));
      this.mapNPCs.push(npcContainer);
    });
  }

  public clearNPCs(): void {
    this.mapNPCs.forEach(n => n.destroy());
    this.mapNPCs = [];
  }

  // ==========================================
  // Remote Players
  // ==========================================

  public addOtherPlayer(sessionId: string, player: PlayerNetData, currentMapId: string): void {
    if (this.otherPlayers.has(sessionId)) return;

    const playerMap = player.mapId || 'novice_town_and_meadow';
    const isSameMap = playerMap === currentMapId;
    const screenPos = isoToScreen(player.x, player.y, this.config.tileWidth, this.config.tileHeight, this.config.originX, this.config.originY);
    const container = this.scene.add.container(screenPos.x, screenPos.y);

    const shadow = this.scene.add.ellipse(0, 0, 24, 12, 0x000000, 0.4);
    const sprite = this.scene.add.image(0, -18, 'remote_hero_sprite');
    sprite.setName('remote_hero_sprite');
    const nameText = this.scene.add.text(0, -36, player.name || 'Player', {
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

  public updateOtherPlayer(sessionId: string, player: PlayerNetData, currentMapId: string): void {
    const remote = this.otherPlayers.get(sessionId);
    if (!remote) return;

    const playerMap = player.mapId || 'novice_town_and_meadow';
    const isSameMap = playerMap === currentMapId;
    const wasVisible = remote.container.visible;
    remote.container.setVisible(isSameMap);
    if (!isSameMap) return;

    const screenPos = isoToScreen(player.x, player.y, this.config.tileWidth, this.config.tileHeight, this.config.originX, this.config.originY);

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

    // Snap if large jump or became visible
    const dx = Math.abs(player.x - remote.tile.x);
    const dy = Math.abs(player.y - remote.tile.y);
    if (!wasVisible || dx > 1 || dy > 1) {
      this.scene.tweens.killTweensOf(remote.container);
      remote.container.setPosition(screenPos.x, screenPos.y);
      remote.tile = { x: player.x, y: player.y };
      remote.container.setDepth(getIsometricDepth(player.x, player.y, 100));
      return;
    }

    this.scene.tweens.add({
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

  public removeOtherPlayer(sessionId: string): void {
    const remote = this.otherPlayers.get(sessionId);
    if (remote) {
      remote.container.destroy();
      this.otherPlayers.delete(sessionId);
    }
  }

  public getOtherPlayer(sessionId: string): { container: Phaser.GameObjects.Container; tile: TileCoord } | undefined {
    return this.otherPlayers.get(sessionId);
  }

  // ==========================================
  // Roaming Beasts
  // ==========================================

  public addRoamingBeast(beastId: string, beast: any, currentMapId: string): void {
    if (this.roamingBeasts.has(beastId)) return;

    const isSameMap = beast.mapId === currentMapId && !beast.inCombat;
    const screenPos = isoToScreen(beast.x, beast.y, this.config.tileWidth, this.config.tileHeight, this.config.originX, this.config.originY);

    const container = this.scene.add.container(screenPos.x, screenPos.y);

    // Shadow
    const shadow = this.scene.add.ellipse(0, 0, 22, 11, 0x000000, 0.35);

    // Beast sprite
    const textureKey = this.getBeastTextureKey(beast.templateId, beast.element);
    const sprite = this.scene.add.image(0, -18, textureKey);
    sprite.setName('beast_sprite');

    // Bobbing / breathing animation
    this.scene.tweens.add({
      targets: sprite,
      y: '-=3',
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Level & Name badge
    const elemColor = this.getElementColor(beast.element);
    const nameLabel = this.scene.add.text(0, -38, `Lv.${beast.level} ${beast.name}`, {
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
    container.setInteractive({
      hitArea: { x: -28, y: -42, width: 56, height: 56 },
      hitAreaCallback: rectContains,
      useHandCursor: true
    });
    if (container.input) {
      container.input.cursor = 'pointer';
    }

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.config.isModalOpen && this.config.isModalOpen()) return;
      if (pointer?.event) pointer.event.stopPropagation();
      const cur = this.roamingBeasts.get(beastId);
      const bx = cur ? cur.tile.x : beast.x;
      const by = cur ? cur.tile.y : beast.y;
      this.config.onBeastClick?.(bx, by, beast);
    });

    this.roamingBeasts.set(beastId, {
      container,
      tile: { x: beast.x, y: beast.y },
      entity: beast
    });
  }

  public updateRoamingBeast(beastId: string, beast: any, currentMapId: string): void {
    let remote = this.roamingBeasts.get(beastId);
    if (!remote) {
      this.addRoamingBeast(beastId, beast, currentMapId);
      remote = this.roamingBeasts.get(beastId);
      if (!remote) return;
    }

    remote.entity = beast;

    const isSameMap = beast.mapId === currentMapId && !beast.inCombat;
    const wasVisible = remote.container.visible;
    remote.container.setVisible(isSameMap);
    if (!isSameMap) return;

    const screenPos = isoToScreen(beast.x, beast.y, this.config.tileWidth, this.config.tileHeight, this.config.originX, this.config.originY);

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
      this.scene.tweens.killTweensOf(remote.container);
      remote.container.setPosition(screenPos.x, screenPos.y);
      remote.tile = { x: beast.x, y: beast.y };
      remote.container.setDepth(getIsometricDepth(beast.x, beast.y, 80));
      return;
    }

    this.scene.tweens.killTweensOf(remote.container);
    remote.tile = { x: beast.x, y: beast.y };
    this.scene.tweens.add({
      targets: remote.container,
      x: screenPos.x,
      y: screenPos.y,
      duration: 300,
      ease: 'Linear',
      onComplete: () => {
        remote?.container.setDepth(getIsometricDepth(beast.x, beast.y, 80));
      }
    });
  }

  public removeRoamingBeast(beastId: string): void {
    const remote = this.roamingBeasts.get(beastId);
    if (remote) {
      remote.container.destroy();
      this.roamingBeasts.delete(beastId);
    }
  }

  public getRoamingBeast(beastId: string): { container: Phaser.GameObjects.Container; tile: TileCoord; entity: any } | undefined {
    return this.roamingBeasts.get(beastId);
  }

  public findVisibleBeastAt(targetX: number, targetY: number): { container: Phaser.GameObjects.Container; tile: TileCoord; entity: any } | undefined {
    return Array.from(this.roamingBeasts.values()).find(
      b => b.tile.x === targetX && b.tile.y === targetY && b.container.visible
    );
  }

  public syncPlayers(players: any, mySessionId: string, currentMapId: string): void {
    if (!players) return;
    const activeIds = new Set<string>();
    players.forEach((player: any, sessionId: string) => {
      if (sessionId !== mySessionId) {
        activeIds.add(sessionId);
        if (this.otherPlayers.has(sessionId)) {
          this.updateOtherPlayer(sessionId, player, currentMapId);
        } else {
          this.addOtherPlayer(sessionId, player, currentMapId);
        }
      }
    });

    this.otherPlayers.forEach((_, id) => {
      if (!activeIds.has(id)) {
        this.removeOtherPlayer(id);
      }
    });
  }

  public syncBeasts(roamingBeasts: any, currentMapId: string): void {
    if (!roamingBeasts) return;
    const activeIds = new Set<string>();
    roamingBeasts.forEach((beast: any, beastId: string) => {
      activeIds.add(beastId);
      if (this.roamingBeasts.has(beastId)) {
        this.updateRoamingBeast(beastId, beast, currentMapId);
      } else {
        this.addRoamingBeast(beastId, beast, currentMapId);
      }
    });

    this.roamingBeasts.forEach((_, id) => {
      if (!activeIds.has(id)) {
        this.removeRoamingBeast(id);
      }
    });
  }

  // ==========================================
  // Cross-Map Filter
  // ==========================================

  public filterEntitiesForMap(targetMapId: string, room?: any): void {
    if (room && room.state && room.state.players) {
      this.otherPlayers.forEach((other, sessionId) => {
        const p = room.state.players.get(sessionId);
        const isSameMap = p && (!p.mapId || p.mapId === targetMapId);
        other.container.setVisible(!!isSameMap);
      });
    }

    this.roamingBeasts.forEach(remote => {
      const isSameMap = remote.entity.mapId === targetMapId && !remote.entity.inCombat;
      remote.container.setVisible(isSameMap);
    });
  }

  // ==========================================
  // Speech Bubbles
  // ==========================================

  public showSpeechBubble(targetContainer: Phaser.GameObjects.Container, text: string, senderKey?: string): void {
    if (!targetContainer || !targetContainer.active) return;
    const key = senderKey || (targetContainer as any).name || `${targetContainer.x}_${targetContainer.y}`;
    const existing = this.speechBubbles.get(key);
    if (existing) {
      existing.timerEvent?.remove();
      existing.container.destroy();
      this.speechBubbles.delete(key);
    }

    const bubble = this.scene.add.container(0, -68);

    const displayStr = text.length > 36 ? text.slice(0, 34) + '...' : text;
    const bubbleText = this.scene.add.text(0, 0, displayStr, {
      fontSize: '11px',
      color: '#0f172a',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: 140 }
    }).setOrigin(0.5, 0.5);

    const paddingX = 10;
    const paddingY = 6;
    const bw = Math.max(36, bubbleText.width + paddingX * 2);
    const bh = Math.max(22, bubbleText.height + paddingY * 2);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0xffffff, 0.96);
    bg.lineStyle(1.5, 0x0284c7, 1);
    bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);
    bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 6);

    // Tail triangle pointing down to character's head
    bg.beginPath();
    bg.moveTo(-5, bh / 2);
    bg.lineTo(0, bh / 2 + 6);
    bg.lineTo(5, bh / 2);
    bg.closePath();
    bg.fillPath();
    bg.strokePath();

    bubble.add([bg, bubbleText]);
    targetContainer.add(bubble);

    // Pop-in animation
    bubble.setScale(0.3);
    this.scene.tweens.add({
      targets: bubble,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Back.easeOut'
    });

    const timerEvent = this.scene.time.delayedCall(4500, () => {
      this.scene.tweens.add({
        targets: bubble,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          bubble.destroy();
          this.speechBubbles.delete(key);
        }
      });
    });

    this.speechBubbles.set(key, { container: bubble, timerEvent });
  }

  // ==========================================
  // Minimap Blip Aggregator
  // ==========================================

  public getMinimapBlips(currentMapConfig: MapConfig): {
    beasts: { x: number; y: number }[];
    otherPlayers: { x: number; y: number }[];
    npcs: { x: number; y: number }[];
    portals: { x: number; y: number }[];
  } {
    const beasts: { x: number; y: number }[] = [];
    this.roamingBeasts.forEach(b => {
      if (b.container.visible) {
        beasts.push({ x: b.tile.x, y: b.tile.y });
      }
    });

    const otherPlayers: { x: number; y: number }[] = [];
    this.otherPlayers.forEach(p => {
      if (p.container.visible) {
        otherPlayers.push({ x: p.tile.x, y: p.tile.y });
      }
    });

    const npcs = (currentMapConfig.npcs || []).map(n => ({ x: n.position.x, y: n.position.y }));
    const portals = (currentMapConfig.portals || []).map(p => ({ x: p.position.x, y: p.position.y }));

    return { beasts, otherPlayers, npcs, portals };
  }

  // ==========================================
  // Private Helpers
  // ==========================================

  private getBeastTextureKey(templateId: string, _element: string): string {
    const specificKey = `beast_${templateId}`;
    if (this.scene.textures.exists(specificKey)) {
      return specificKey;
    }
    const simplified = templateId.replace(/^champion_starter_/, '').replace(/^champion_/, '');
    const simplifiedKey = `beast_${simplified}`;
    if (this.scene.textures.exists(simplifiedKey)) {
      return simplifiedKey;
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

  public destroy(): void {
    this.clearPortals();
    this.clearNPCs();
    this.otherPlayers.forEach(p => p.container.destroy());
    this.otherPlayers.clear();
    this.roamingBeasts.forEach(b => b.container.destroy());
    this.roamingBeasts.clear();
    this.speechBubbles.forEach(b => {
      b.timerEvent?.remove();
      b.container.destroy();
    });
    this.speechBubbles.clear();
  }
}
