import Phaser from 'phaser';
import { OverworldScene } from './scenes/OverworldScene.js';
import { BattleScene } from './scenes/BattleScene.js';

import { soundManager } from './audio/SoundManager.js';

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
if ((import.meta as any).env?.DEV || typeof window !== 'undefined') {
  (window as any).__PHASER_GAME__ = game;
}

// Setup Header Sound Toggle Button
const soundBtn = document.getElementById('header-btn-sound');
if (soundBtn) {
  const updateSoundBtn = () => {
    const isMuted = soundManager.getIsMuted();
    soundBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
    soundBtn.style.color = isMuted ? '#94a3b8' : '#38bdf8';
  };
  updateSoundBtn();

  soundBtn.addEventListener('click', () => {
    soundManager.toggleMute();
    updateSoundBtn();
    if (!soundManager.getIsMuted()) {
      soundManager.playButtonClick();
    }
  });
}

