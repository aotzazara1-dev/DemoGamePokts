import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1024,
  height: 768,
  pixelArt: true,
  backgroundColor: '#070a13',
  scene: [OverworldScene, BattleScene]
};

export const game = new Phaser.Game(config);
