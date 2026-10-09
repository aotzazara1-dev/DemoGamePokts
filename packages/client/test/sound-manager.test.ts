import { describe, it, expect, beforeEach } from 'vitest';
import { SoundManager, soundManager } from '../src/audio/SoundManager.js';

describe('SoundManager', () => {
  beforeEach(() => {
    soundManager.setMuted(false);
    soundManager.setVolume(0.25);
  });

  it('provides a singleton instance', () => {
    const s1 = SoundManager.getInstance();
    const s2 = soundManager;
    expect(s1).toBe(s2);
  });

  it('manages mute state correctly', () => {
    expect(soundManager.getIsMuted()).toBe(false);

    soundManager.setMuted(true);
    expect(soundManager.getIsMuted()).toBe(true);

    const toggled = soundManager.toggleMute();
    expect(toggled).toBe(false);
    expect(soundManager.getIsMuted()).toBe(false);
  });

  it('clamps volume between 0.0 and 1.0', () => {
    soundManager.setVolume(0.8);
    expect(soundManager.getVolume()).toBe(0.8);

    soundManager.setVolume(1.5);
    expect(soundManager.getVolume()).toBe(1.0);

    soundManager.setVolume(-0.2);
    expect(soundManager.getVolume()).toBe(0.0);
  });

  it('safely invokes all 8-bit sound synthesizers without throwing in test environment', () => {
    expect(() => {
      soundManager.playAttack();
      soundManager.playHit();
      soundManager.playSkill();
      soundManager.playDefend();
      soundManager.playHeal();
      soundManager.playSpRestore();
      soundManager.playRevive();
      soundManager.playCapture();
      soundManager.playCaptureSuccess();
      soundManager.playCaptureFail();
      soundManager.playFlee();
      soundManager.playVictory();
      soundManager.playDefeat();
      soundManager.playButtonClick();
    }).not.toThrow();
  });
});
