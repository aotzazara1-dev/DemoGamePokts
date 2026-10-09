import type Phaser from 'phaser';
import { type MapConfig, type Direction, type TileCoord } from '@poktsonline/shared';
import { isoToScreen, getIsometricDepth, type IsometricConfig } from '../utils/isometric.js';

export interface OverworldRendererConfig {
  tileWidth: number;
  tileHeight: number;
  originX: number;
  originY: number;
}

/**
 * Deep rendering module encapsulating procedural texture synthesis,
 * isometric tilemap rendering, and directional hero sprite animations.
 */
export class OverworldRenderer {
  private scene: Phaser.Scene;
  private config: OverworldRendererConfig;
  private mapTiles: Phaser.GameObjects.Image[] = [];
  private mapObstacles: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, config: OverworldRendererConfig) {
    this.scene = scene;
    this.config = config;
  }

  public initTextures(): void {
    // 1. Safe Town Tile
    if (!this.scene.textures.exists('tile_safe')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3a4b3d, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1, 0x526e57, 0.7);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      g.generateTexture('tile_safe', 64, 32);
      g.destroy();
    }

    // 2. Wild Grass Tile
    if (!this.scene.textures.exists('tile_wild')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e3a24, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1, 0x2e5937, 0.7);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      g.generateTexture('tile_wild', 64, 32);
      g.destroy();
    }

    // 3. Cave Slate Floor Tile
    if (!this.scene.textures.exists('tile_cave')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e293b, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1, 0x334155, 0.8);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      g.generateTexture('tile_cave', 64, 32);
      g.destroy();
    }

    // 4. Forest Bamboo Moss Tile
    if (!this.scene.textures.exists('tile_forest')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x14532d, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1, 0x166534, 0.8);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      g.generateTexture('tile_forest', 64, 32);
      g.destroy();
    }

    // 4.1 Valhalla Coliseum Marble Tile
    if (!this.scene.textures.exists('tile_coliseum')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x334155, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1.5, 0xf59e0b, 0.85);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      // Inner celestial diamond accent
      g.lineStyle(1, 0xfde047, 0.4);
      g.strokePoints([
        { x: 32, y: 6 },
        { x: 52, y: 16 },
        { x: 32, y: 26 },
        { x: 12, y: 16 }
      ], true);
      g.generateTexture('tile_coliseum', 64, 32);
      g.destroy();
    }

    // 4.2 Asgard Sanctuary Sacred World Tree Tile
    if (!this.scene.textures.exists('tile_sanctuary')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x064e3b, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1.5, 0x10b981, 0.8);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      // Golden leaf speckles
      g.fillStyle(0xfde047, 0.7);
      g.fillCircle(32, 12, 1.5);
      g.fillCircle(24, 18, 1.5);
      g.fillCircle(40, 18, 1.5);
      g.generateTexture('tile_sanctuary', 64, 32);
      g.destroy();
    }

    // 4.3 Helheim Abyss Violet Basalt Tile
    if (!this.scene.textures.exists('tile_abyss')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x180d2b, 1);
      g.fillPoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ]);
      g.lineStyle(1.5, 0x9333ea, 0.8);
      g.strokePoints([
        { x: 32, y: 0 },
        { x: 64, y: 16 },
        { x: 32, y: 32 },
        { x: 0, y: 16 }
      ], true);
      // Nether vein highlight
      g.lineStyle(1, 0xc084fc, 0.5);
      g.strokePoints([{ x: 20, y: 14 }, { x: 44, y: 18 }]);
      g.generateTexture('tile_abyss', 64, 32);
      g.destroy();
    }

    // 5. Portal Rune Texture
    if (!this.scene.textures.exists('portal_rune')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.lineStyle(2, 0x38bdf8, 1);
      g.strokeCircle(24, 24, 20);
      g.fillStyle(0x0284c7, 0.45);
      g.fillCircle(24, 24, 16);
      g.lineStyle(1, 0xa5f3fc, 0.9);
      g.strokeCircle(24, 24, 10);
      g.generateTexture('portal_rune', 48, 48);
      g.destroy();
    }

    // 6. Obstacle Boulder / Stalagmite
    if (!this.scene.textures.exists('obstacle_rock')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x475569, 1);
      g.fillCircle(16, 16, 12);
      g.fillStyle(0x64748b, 1);
      g.fillCircle(14, 13, 10);
      g.generateTexture('obstacle_rock', 32, 32);
      g.destroy();
    }

    // 7. Hero Sprite (Front)
    if (!this.scene.textures.exists('hero_sprite')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x2563eb, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0xd97706, 1);
      g.fillRect(10, 6, 12, 3);
      g.generateTexture('hero_sprite', 32, 32);
      g.destroy();
    }

    // 8. Hero Back View (Walking up/North)
    if (!this.scene.textures.exists('hero_back')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1d4ed8, 1);
      g.fillRect(3, 14, 20, 24);
      g.fillStyle(0x1e3a8a, 1);
      g.fillRect(12, 14, 2, 24);
      g.fillStyle(0xd97706, 1);
      g.fillRect(2, 24, 22, 4);
      g.fillStyle(0xb45309, 1);
      g.fillRect(11, 28, 4, 8);
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(5, 38, 6, 6);
      g.fillRect(15, 38, 6, 6);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(13, 8, 8);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(13, 6, 7);
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(10, 1, 6, 5, 2);
      g.fillStyle(0xb45309, 1);
      g.fillRect(11, 6, 4, 10);
      g.generateTexture('hero_back', 26, 46);
      g.destroy();
    }

    // 9. Hero Back-Diagonal View (Walking Up-Right)
    if (!this.scene.textures.exists('hero_back_diag')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1d4ed8, 1);
      g.fillPoints([
        { x: 5, y: 14 },
        { x: 23, y: 14 },
        { x: 21, y: 38 },
        { x: 4, y: 38 }
      ], true);
      g.fillStyle(0x1e3a8a, 1);
      g.fillRect(15, 14, 2, 24);
      g.fillStyle(0xd97706, 1);
      g.fillRect(3, 24, 21, 4);
      g.fillStyle(0xb45309, 1);
      g.fillRect(14, 28, 5, 9);
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(6, 38, 6, 6);
      g.fillRect(14, 38, 6, 6);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(14, 8, 8);
      g.fillStyle(0x1e293b, 1);
      g.fillCircle(15, 6, 7);
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(12, 1, 6, 5, 2);
      g.fillStyle(0xb45309, 1);
      g.fillRect(13, 6, 5, 11);
      g.generateTexture('hero_back_diag', 26, 46);
      g.destroy();
    }

    // 10. Hero Side View (Walking East/West)
    if (!this.scene.textures.exists('hero_side')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1d4ed8, 1);
      g.fillRect(6, 14, 14, 24);
      g.fillStyle(0x2563eb, 1);
      g.fillRect(12, 14, 7, 24);
      g.fillStyle(0xd97706, 1);
      g.fillRect(5, 24, 16, 4);
      g.fillStyle(0xb45309, 1);
      g.fillRect(8, 28, 4, 8);
      g.fillStyle(0x1e1b4b, 1);
      g.fillRect(8, 38, 7, 6);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(12, 8, 8);
      g.fillStyle(0xffedd5, 1);
      g.fillCircle(15, 8, 5);
      g.fillStyle(0xd97706, 1);
      g.fillRoundedRect(9, 1, 6, 5, 2);
      g.fillStyle(0xb45309, 1);
      g.fillRect(8, 6, 4, 10);
      g.generateTexture('hero_side', 24, 46);
      g.destroy();
    }

    // 11. Remote Player Avatar
    if (!this.scene.textures.exists('remote_hero_sprite')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0284c7, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0x0369a1, 1);
      g.fillRect(10, 6, 12, 3);
      g.generateTexture('remote_hero_sprite', 32, 32);
      g.destroy();
    }

    if (!this.scene.textures.exists('remote_hero_back')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb45309, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(16, 8, 6);
      g.generateTexture('remote_hero_back', 32, 32);
      g.destroy();
    }

    if (!this.scene.textures.exists('remote_hero_side')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xd97706, 1);
      g.fillRect(10, 14, 12, 18);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 5);
      g.generateTexture('remote_hero_side', 32, 32);
      g.destroy();
    }

    // 12. NPC Textures
    if (!this.scene.textures.exists('npc_merchant')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x059669, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(8, 20, 16, 3);
      g.fillStyle(0x78350f, 1);
      g.fillRect(18, 21, 6, 6);
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 9, 6);
      g.fillStyle(0x0f172a, 1);
      g.fillRect(9, 4, 14, 4);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(16, 5, 2);
      g.generateTexture('npc_merchant', 32, 32);
      g.destroy();
    }

    if (!this.scene.textures.exists('npc_elder')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf1f5f9, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0x3b82f6, 1);
      g.fillRect(14, 14, 4, 18);
      g.fillStyle(0x78350f, 1);
      g.fillRect(24, 6, 2, 26);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(25, 6, 3);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 9, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 4, 3);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(13, 11, 19, 11, 16, 18);
      g.generateTexture('npc_elder', 32, 32);
      g.destroy();
    }

    // Brunhilde (Chief Valkyrie Strategist)
    if (!this.scene.textures.exists('npc_brunhilde')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Silver & Cobalt Valkyrie Armor
      g.fillStyle(0x1e293b, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0x0284c7, 1);
      g.fillRect(10, 14, 12, 14);
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(12, 16, 8, 10);
      // Face
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      // Valkyrie Winged Headpiece / Hair
      g.fillStyle(0x0f172a, 1);
      g.fillRect(8, 3, 16, 4);
      g.fillStyle(0x38bdf8, 1);
      g.fillTriangle(6, 8, 2, 2, 8, 4); // Left wing
      g.fillTriangle(26, 8, 30, 2, 24, 4); // Right wing
      // Slender rapier at side
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(23, 18, 2, 14);
      g.generateTexture('npc_brunhilde', 32, 32);
      g.destroy();
    }

    // Heimdall (Apocalypse Announcer & Gjallarhorn Keeper)
    if (!this.scene.textures.exists('npc_heimdall')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Crimson Announcer Tunic
      g.fillStyle(0xb91c1c, 1);
      g.fillRect(8, 14, 16, 18);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(8, 20, 16, 3);
      // Face
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 6);
      // Spiky golden crown/hair
      g.fillStyle(0xfacc15, 1);
      g.fillTriangle(10, 6, 12, 1, 14, 6);
      g.fillTriangle(14, 6, 16, 0, 18, 6);
      g.fillTriangle(18, 6, 20, 1, 22, 6);
      // Golden Curved Horn (Gjallarhorn)
      g.fillStyle(0xfacc15, 1);
      g.fillRect(20, 15, 7, 3);
      g.fillCircle(27, 14, 4);
      g.fillStyle(0xd97706, 1);
      g.fillCircle(27, 14, 2);
      g.generateTexture('npc_heimdall', 32, 32);
      g.destroy();
    }

    // 13. Beast Textures
    this.initBeastTextures();
  }

  private initBeastTextures(): void {
    // Leaf Sprite (Wind)
    if (!this.scene.textures.exists('beast_leaf_sprite')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x10b981, 1);
      g.fillCircle(16, 18, 10);
      g.fillStyle(0x34d399, 1);
      g.fillTriangle(16, 2, 8, 14, 24, 14);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(12, 17, 2.5);
      g.fillCircle(20, 17, 2.5);
      g.generateTexture('beast_leaf_sprite', 32, 32);
      g.destroy();
    }

    // Rock Boar (Earth)
    if (!this.scene.textures.exists('beast_rock_boar')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
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

    // Iron Beetle (Earth)
    if (!this.scene.textures.exists('beast_iron_beetle')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
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

    // Rock Golem (Earth)
    if (!this.scene.textures.exists('beast_rock_golem')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x78716c, 1);
      g.fillRoundedRect(6, 10, 20, 18, 4);
      g.fillStyle(0xa8a29e, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(13, 8, 2);
      g.fillCircle(19, 8, 2);
      g.generateTexture('beast_rock_golem', 32, 32);
      g.destroy();
    }

    // Cave Serpent (Water)
    if (!this.scene.textures.exists('beast_cave_serpent')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
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

    // Bamboo Panda (Wind)
    if (!this.scene.textures.exists('beast_bamboo_panda')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf8fafc, 1);
      g.fillCircle(16, 18, 11);
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(9, 9, 4);
      g.fillCircle(23, 9, 4);
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

    // Crimson Fox (Fire)
    if (!this.scene.textures.exists('beast_crimson_fox')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xe11d48, 1);
      g.fillRoundedRect(8, 14, 16, 12, 4);
      g.fillStyle(0xf43f5e, 1);
      g.fillTriangle(8, 14, 6, 6, 12, 12);
      g.fillTriangle(20, 12, 24, 6, 22, 14);
      g.fillStyle(0xfb923c, 1);
      g.fillCircle(6, 20, 5);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(4, 20, 2.5);
      g.fillCircle(18, 16, 2);
      g.generateTexture('beast_crimson_fox', 32, 32);
      g.destroy();
    }

    // ==========================================
    // Record of Ragnarok Champions & Mythological Entities
    // ==========================================

    // Thor (God of Thunder / Norse)
    if (!this.scene.textures.exists('beast_thor')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Red cape & black armor
      g.fillStyle(0xb91c1c, 1);
      g.fillRect(6, 14, 20, 15);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(10, 14, 12, 14);
      // Face & long red hair
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0xdc2626, 1);
      g.fillRect(8, 2, 16, 5);
      g.fillRect(6, 6, 4, 10);
      g.fillRect(22, 6, 4, 10);
      // Mjolnir Hammer (Heavy iron block + lightning)
      g.fillStyle(0x64748b, 1);
      g.fillRect(23, 14, 8, 8);
      g.fillStyle(0x78350f, 1);
      g.fillRect(26, 21, 2, 8);
      g.fillStyle(0x38bdf8, 1); // Spark
      g.fillCircle(27, 14, 2);
      g.generateTexture('beast_thor', 32, 32);
      g.destroy();
    }

    // Lu Bu (The Strongest Mortal / Sky Piercer)
    if (!this.scene.textures.exists('beast_lu_bu')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Dark dragon armor & red sash
      g.fillStyle(0x0f172a, 1);
      g.fillRect(8, 14, 16, 15);
      g.fillStyle(0xb91c1c, 1);
      g.fillRect(8, 20, 16, 3);
      // Face & imposing gaze
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0x000000, 1);
      g.fillRect(9, 4, 14, 3);
      // Pheasant Feathers Crown
      g.fillStyle(0xd97706, 1);
      g.fillTriangle(11, 4, 6, -2, 13, 3);
      g.fillTriangle(21, 4, 26, -2, 19, 3);
      // Sky Piercer Halberd
      g.fillStyle(0x78350f, 1);
      g.fillRect(25, 4, 2, 26);
      g.fillStyle(0x94a3b8, 1);
      g.fillTriangle(26, 2, 22, 8, 30, 8);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(26, 9, 2);
      g.generateTexture('beast_lu_bu', 32, 32);
      g.destroy();
    }

    // Sasaki Kojiro (History's Greatest Loser / Swallow Blade)
    if (!this.scene.textures.exists('beast_kojiro')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Green samurai haori & grey hakama
      g.fillStyle(0x059669, 1);
      g.fillRect(8, 14, 16, 12);
      g.fillStyle(0x475569, 1);
      g.fillRect(9, 24, 14, 6);
      // Face & tied topknot
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0x78350f, 1);
      g.fillCircle(16, 3, 3);
      g.fillRect(10, 4, 12, 3);
      // Long Nodachi Blade
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(23, 2, 2, 28);
      g.fillStyle(0xd97706, 1);
      g.fillRect(21, 20, 6, 2);
      g.generateTexture('beast_kojiro', 32, 32);
      g.destroy();
    }

    // Adam (The First Man / Eyes of the Lord)
    if (!this.scene.textures.exists('beast_adam')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Radiant Golden Aura
      g.fillStyle(0xfef08a, 0.4);
      g.fillCircle(16, 16, 14);
      // Athletic body & leaf belt
      g.fillStyle(0xffedd5, 1);
      g.fillRect(10, 14, 12, 14);
      g.fillStyle(0x16a34a, 1);
      g.fillRect(8, 24, 16, 4);
      // Face & Blonde hair
      g.fillStyle(0xffedd5, 1);
      g.fillCircle(16, 8, 6);
      g.fillStyle(0xfacc15, 1);
      g.fillCircle(16, 6, 6);
      // Glowing Eyes of the Lord
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(14, 8, 1.5);
      g.fillCircle(18, 8, 1.5);
      g.generateTexture('beast_adam', 32, 32);
      g.destroy();
    }

    // Zeus (God Father of Cosmos / Greek)
    if (!this.scene.textures.exists('beast_zeus')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Muscular torso & white toga
      g.fillStyle(0xfef3c7, 1);
      g.fillRect(8, 12, 16, 12);
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 22, 16, 8);
      // Face & wild white beard
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 7, 5);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 10, 5); // Beard
      // Golden laurel & lightning sparks
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(11, 4, 10, 2);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(7, 14, 2);
      g.fillCircle(25, 14, 2);
      g.generateTexture('beast_zeus', 32, 32);
      g.destroy();
    }

    // Shiva (God of Destruction / Hindu)
    if (!this.scene.textures.exists('beast_shiva')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Indigo skin & 4 arms
      g.fillStyle(0x4338ca, 1);
      g.fillRect(10, 12, 12, 14);
      g.fillRect(5, 13, 6, 4);  // Extra upper arms
      g.fillRect(21, 13, 6, 4);
      g.fillRect(4, 19, 6, 4);  // Extra lower arms
      g.fillRect(22, 19, 6, 4);
      // Flame crown & yellow pants
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(9, 23, 14, 7);
      // Face & third eye
      g.fillStyle(0x6366f1, 1);
      g.fillCircle(16, 7, 6);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(16, 6, 1.5); // Third eye
      g.generateTexture('beast_shiva', 32, 32);
      g.destroy();
    }

    // Buddha (The Enlightened One)
    if (!this.scene.textures.exists('beast_buddha')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      // Modern white tank & golden drape
      g.fillStyle(0xffffff, 1);
      g.fillRect(10, 13, 12, 10);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(8, 21, 16, 9);
      // Face & cyan topknot
      g.fillStyle(0xfde047, 1);
      g.fillCircle(16, 7, 6);
      g.fillStyle(0x06b6d4, 1);
      g.fillCircle(16, 2, 4); // Bun
      // Sunglasses
      g.fillStyle(0x000000, 1);
      g.fillRect(12, 6, 8, 3);
      // Six Realms Staff
      g.fillStyle(0xfacc15, 1);
      g.fillRect(24, 4, 2, 26);
      g.fillCircle(25, 4, 4);
      g.generateTexture('beast_buddha', 32, 32);
      g.destroy();
    }

    // Valkyrie Scout
    if (!this.scene.textures.exists('beast_valkyrie_scout')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0284c7, 1);
      g.fillRect(10, 14, 12, 14);
      g.fillStyle(0x38bdf8, 0.85);
      g.fillTriangle(6, 16, 1, 8, 10, 12);
      g.fillTriangle(26, 16, 31, 8, 22, 12);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(16, 8, 5);
      g.generateTexture('beast_valkyrie_scout', 32, 32);
      g.destroy();
    }

    // Fenrir Pup
    if (!this.scene.textures.exists('beast_fenrir_pup')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x334155, 1);
      g.fillRoundedRect(7, 13, 18, 13, 3);
      g.fillStyle(0x475569, 1);
      g.fillTriangle(9, 13, 8, 7, 13, 13);
      g.fillTriangle(23, 13, 24, 7, 19, 13);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(12, 16, 2);
      g.fillCircle(20, 16, 2);
      g.generateTexture('beast_fenrir_pup', 32, 32);
      g.destroy();
    }

    // Cerberus Hound
    if (!this.scene.textures.exists('beast_cerberus_hound')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0f172a, 1);
      g.fillRoundedRect(6, 14, 20, 14, 4);
      // Three heads
      g.fillCircle(10, 10, 5);
      g.fillCircle(16, 8, 5);
      g.fillCircle(22, 10, 5);
      // Glowing fiery eyes
      g.fillStyle(0xf97316, 1);
      g.fillCircle(9, 9, 1.5);
      g.fillCircle(15, 7, 1.5);
      g.fillCircle(21, 9, 1.5);
      g.generateTexture('beast_cerberus_hound', 32, 32);
      g.destroy();
    }

    // Níðhöggr Chaos Serpent
    if (!this.scene.textures.exists('beast_chaos_serpent')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x581c87, 1);
      g.fillCircle(16, 18, 10);
      g.fillStyle(0x7e22ce, 1);
      g.fillCircle(20, 13, 7);
      g.fillStyle(0xc084fc, 1);
      g.fillCircle(22, 11, 2);
      g.fillStyle(0xef4444, 1);
      g.fillRect(25, 13, 5, 2);
      g.generateTexture('beast_chaos_serpent', 32, 32);
      g.destroy();
    }

    // Celestial Pegasus
    if (!this.scene.textures.exists('beast_pegasus_steed')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xf8fafc, 1);
      g.fillRoundedRect(7, 13, 18, 13, 4);
      g.fillCircle(22, 10, 6);
      g.fillStyle(0x38bdf8, 0.7);
      g.fillTriangle(10, 15, 2, 4, 16, 10); // Wing
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(23, 9, 2);
      g.generateTexture('beast_pegasus_steed', 32, 32);
      g.destroy();
    }

    // Huginn Thunder Raven
    if (!this.scene.textures.exists('beast_thunder_raven')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1e1b4b, 1);
      g.fillCircle(16, 17, 9);
      g.fillTriangle(8, 18, 1, 10, 14, 14);  // Left wing
      g.fillTriangle(24, 18, 31, 10, 18, 14); // Right wing
      g.fillStyle(0x38bdf8, 1);
      g.fillTriangle(16, 15, 24, 17, 16, 19); // Lightning beak
      g.generateTexture('beast_thunder_raven', 32, 32);
      g.destroy();
    }

    // Generic Wild Enemy fallback
    if (!this.scene.textures.exists('combat_wild')) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
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

  public renderTilemap(mapConfig: MapConfig): void {
    // Clear previous map elements
    this.mapTiles.forEach(t => t.destroy());
    this.mapTiles = [];
    this.mapObstacles.forEach(o => o.destroy());
    this.mapObstacles = [];

    const defaultThemeTexture =
      mapConfig.theme === 'coliseum' ? 'tile_coliseum' :
      mapConfig.theme === 'sanctuary' ? 'tile_sanctuary' :
      mapConfig.theme === 'abyss' ? 'tile_abyss' :
      mapConfig.theme === 'cave' ? 'tile_cave' :
      mapConfig.theme === 'forest' ? 'tile_forest' : 'tile_wild';

    for (let x = 0; x < mapConfig.width; x++) {
      for (let y = 0; y < mapConfig.height; y++) {
        const isSafe = mapConfig.zones.some(z =>
          z.type === 'safe' &&
          x >= z.bounds.minX && x <= z.bounds.maxX &&
          y >= z.bounds.minY && y <= z.bounds.maxY
        );
        const texture = isSafe
          ? (mapConfig.theme === 'coliseum' ? 'tile_coliseum' : 'tile_safe')
          : defaultThemeTexture;
        const screenPos = isoToScreen(x, y, this.config.tileWidth, this.config.tileHeight, this.config.originX, this.config.originY);

        const tile = this.scene.add.image(screenPos.x, screenPos.y, texture);
        tile.setDepth(getIsometricDepth(x, y, 0));
        this.mapTiles.push(tile);

        if (mapConfig.obstacles.some(o => o.x === x && o.y === y)) {
          const obs = this.scene.add.image(screenPos.x, screenPos.y - 8, 'obstacle_rock');
          obs.setDepth(getIsometricDepth(x, y, 10));
          this.mapObstacles.push(obs);
        }
      }
    }
  }

  public getMapTilesCount(): number {
    return this.mapTiles.length;
  }

  public updateHeroDirectionalSprite(playerContainer: Phaser.GameObjects.Container, screenDx: number, screenDy: number): Direction {
    if (!playerContainer) return 'down';
    const heroImg = playerContainer.getByName('hero_sprite_image') as Phaser.GameObjects.Image;
    if (!heroImg) return 'down';

    // Moving upwards on screen -> Back Views
    if (screenDy < -6) {
      if (screenDx > 8) {
        heroImg.setTexture('hero_back_diag');
        heroImg.setFlipX(false);
        return 'up-right';
      } else if (screenDx < -8) {
        heroImg.setTexture('hero_back_diag');
        heroImg.setFlipX(true);
        return 'up-left';
      } else {
        heroImg.setTexture('hero_back');
        heroImg.setFlipX(false);
        return 'up';
      }
    }
    // Moving downwards on screen -> Front Views
    else if (screenDy > 6) {
      if (screenDx > 8) {
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(false);
        return 'down-right';
      } else if (screenDx < -8) {
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(true);
        return 'down-left';
      } else {
        heroImg.setTexture('hero_sprite');
        heroImg.setFlipX(false);
        return 'down';
      }
    }
    // Moving horizontally -> Side Views
    else {
      if (screenDx > 0) {
        heroImg.setTexture('hero_side');
        heroImg.setFlipX(false);
        return 'right';
      } else if (screenDx < 0) {
        heroImg.setTexture('hero_side');
        heroImg.setFlipX(true);
        return 'left';
      }
    }
    return 'down';
  }

  public playStepBobbing(playerContainer: Phaser.GameObjects.Container, playerShadow?: Phaser.GameObjects.Ellipse): void {
    const heroImg = playerContainer.getByName('hero_sprite_image') as Phaser.GameObjects.Image;
    if (heroImg) {
      this.scene.tweens.killTweensOf(heroImg);
      this.scene.tweens.add({
        targets: heroImg,
        y: -26,
        yoyo: true,
        duration: 85,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }

    if (playerShadow) {
      this.scene.tweens.killTweensOf(playerShadow);
      this.scene.tweens.add({
        targets: playerShadow,
        scaleX: 0.82,
        scaleY: 0.82,
        yoyo: true,
        duration: 85,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  public resetHeroIdle(playerContainer?: Phaser.GameObjects.Container, playerShadow?: Phaser.GameObjects.Ellipse): void {
    if (!playerContainer) return;
    const heroImg = playerContainer.getByName('hero_sprite_image') as Phaser.GameObjects.Image;
    if (heroImg) {
      heroImg.setY(-22);
      this.scene.tweens.killTweensOf(heroImg);
      this.scene.tweens.add({
        targets: heroImg,
        scaleY: 1.03,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    if (playerShadow) {
      this.scene.tweens.killTweensOf(playerShadow);
      playerShadow.setScale(1.0);
    }
  }

  public destroy(): void {
    this.mapTiles.forEach(t => t.destroy());
    this.mapTiles = [];
    this.mapObstacles.forEach(o => o.destroy());
    this.mapObstacles = [];
  }
}
