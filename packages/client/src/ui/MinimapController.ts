import type { MapConfig, TileCoord } from '@poktsonline/shared';

export interface MinimapEntity {
  x: number;
  y: number;
  name?: string;
}

export interface MinimapEntities {
  portals?: MinimapEntity[];
  npcs?: MinimapEntity[];
  beasts?: MinimapEntity[];
  otherPlayers?: MinimapEntity[];
}

export interface MinimapControllerOptions {
  canvas: HTMLCanvasElement;
  mapNameEl?: HTMLElement | null;
  coordsEl?: HTMLElement | null;
  containerEl?: HTMLElement | null;
  onNavigate?: (tileX: number, tileY: number) => void;
}

export class MinimapController {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private mapNameEl?: HTMLElement | null;
  private coordsEl?: HTMLElement | null;
  private containerEl?: HTMLElement | null;
  private onNavigate?: (tileX: number, tileY: number) => void;

  private mapConfig?: MapConfig;
  private currentTile: TileCoord = { x: 0, y: 0 };
  private currentFacing: string = 'down';
  private latestEntities: MinimapEntities = {};
  private obstacleSet: Set<string> = new Set();

  constructor(options: MinimapControllerOptions) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.mapNameEl = options.mapNameEl;
    this.coordsEl = options.coordsEl;
    this.containerEl = options.containerEl;
    this.onNavigate = options.onNavigate;

    this.setupListeners();
  }

  private setupListeners(): void {
    this.canvas.addEventListener('click', (event: MouseEvent) => {
      if (!this.mapConfig || !this.onNavigate) return;
      const rect = this.canvas.getBoundingClientRect();
      const pixelX = event.clientX - rect.left;
      const pixelY = event.clientY - rect.top;

      // Account for CSS scale vs actual canvas width/height
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const targetTile = this.screenToTile(pixelX * scaleX, pixelY * scaleY);
      this.onNavigate(targetTile.x, targetTile.y);
    });
  }

  public screenToTile(pixelX: number, pixelY: number): TileCoord {
    if (!this.mapConfig || this.canvas.width === 0 || this.canvas.height === 0) {
      return { x: 0, y: 0 };
    }
    const tileX = Math.floor((pixelX / this.canvas.width) * this.mapConfig.width);
    const tileY = Math.floor((pixelY / this.canvas.height) * this.mapConfig.height);

    return {
      x: Math.max(0, Math.min(this.mapConfig.width - 1, tileX)),
      y: Math.max(0, Math.min(this.mapConfig.height - 1, tileY))
    };
  }

  public tileToScreen(tileX: number, tileY: number): { x: number; y: number } {
    if (!this.mapConfig) return { x: 0, y: 0 };
    const stepX = this.canvas.width / this.mapConfig.width;
    const stepY = this.canvas.height / this.mapConfig.height;
    return {
      x: (tileX + 0.5) * stepX,
      y: (tileY + 0.5) * stepY
    };
  }

  public setMapConfig(config: MapConfig): void {
    this.mapConfig = config;
    this.obstacleSet.clear();
    for (const obs of config.obstacles) {
      this.obstacleSet.add(`${obs.x},${obs.y}`);
    }

    if (this.mapNameEl) {
      this.mapNameEl.textContent = config.name;
    }

    this.render();
  }

  public updatePlayer(tile: TileCoord, facingDirection: string = 'down'): void {
    this.currentTile = { x: Math.round(tile.x), y: Math.round(tile.y) };
    this.currentFacing = facingDirection;

    if (this.coordsEl) {
      this.coordsEl.textContent = `(${this.currentTile.x}, ${this.currentTile.y})`;
    }
  }

  public setVisible(visible: boolean): void {
    if (this.containerEl) {
      this.containerEl.style.display = visible ? 'block' : 'none';
    }
  }

  public render(entities?: MinimapEntities): void {
    if (!this.ctx || !this.mapConfig) return;
    if (entities) {
      this.latestEntities = entities;
    }

    const { width: mapW, height: mapH } = this.mapConfig;
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const stepX = canvasW / mapW;
    const stepY = canvasH / mapH;

    // 1. Clear & draw background base terrain
    let bgColor = '#142820'; // Default meadow
    if (this.mapConfig.theme === 'cave') bgColor = '#18181b';
    else if (this.mapConfig.theme === 'forest') bgColor = '#0f291e';

    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Draw safe zones
    if (this.mapConfig.zones) {
      for (const zone of this.mapConfig.zones) {
        if (zone.type === 'safe') {
          this.ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          const zx = zone.bounds.minX * stepX;
          const zy = zone.bounds.minY * stepY;
          const zw = (zone.bounds.maxX - zone.bounds.minX + 1) * stepX;
          const zh = (zone.bounds.maxY - zone.bounds.minY + 1) * stepY;
          this.ctx.fillRect(zx, zy, zw, zh);
        }
      }
    }

    // 3. Draw obstacles
    this.ctx.fillStyle = '#0f172a';
    for (const obs of this.mapConfig.obstacles) {
      this.ctx.fillRect(obs.x * stepX, obs.y * stepY, Math.max(1, stepX), Math.max(1, stepY));
    }

    // 4. Draw portals
    const portals = this.latestEntities.portals || (this.mapConfig.portals ? this.mapConfig.portals.map(p => ({ x: p.position.x, y: p.position.y })) : []);
    this.ctx.fillStyle = '#a855f7';
    for (const portal of portals) {
      const p = this.tileToScreen(portal.x, portal.y);
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, Math.max(2.5, stepX * 0.9), 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 5. Draw NPCs
    if (this.latestEntities.npcs) {
      this.ctx.fillStyle = '#eab308';
      for (const npc of this.latestEntities.npcs) {
        const p = this.tileToScreen(npc.x, npc.y);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(2.5, stepX * 0.8), 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 6. Draw Roaming Beasts
    if (this.latestEntities.beasts) {
      this.ctx.fillStyle = '#ef4444';
      for (const beast of this.latestEntities.beasts) {
        const p = this.tileToScreen(beast.x, beast.y);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(2, stepX * 0.7), 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 7. Draw Other Players
    if (this.latestEntities.otherPlayers) {
      this.ctx.fillStyle = '#06b6d4';
      for (const other of this.latestEntities.otherPlayers) {
        const p = this.tileToScreen(other.x, other.y);
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, Math.max(2.5, stepX * 0.8), 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // 8. Draw Player (Hero) - Pulsing bright green with white border
    const heroScreen = this.tileToScreen(this.currentTile.x, this.currentTile.y);
    const heroRadius = Math.max(3.5, stepX * 1.1);

    // Outer glow ring
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.5;
    this.ctx.fillStyle = '#22c55e';

    this.ctx.beginPath();
    this.ctx.arc(heroScreen.x, heroScreen.y, heroRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Direction tick
    const tickLen = heroRadius + 2.5;
    let dx = 0;
    let dy = 0;
    if (this.currentFacing.includes('right')) dx = 1;
    if (this.currentFacing.includes('left')) dx = -1;
    if (this.currentFacing.includes('down')) dy = 1;
    if (this.currentFacing.includes('up')) dy = -1;
    if (dx === 0 && dy === 0) dy = 1;

    this.ctx.strokeStyle = '#facc15';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(heroScreen.x, heroScreen.y);
    this.ctx.lineTo(heroScreen.x + dx * tickLen, heroScreen.y + dy * tickLen);
    this.ctx.stroke();
  }
}
