import { describe, it, expect } from 'vitest';
import { ProgressionEngine } from '../src/progression/progression-engine.js';
import { Element, type Combatant } from '../src/types.js';

describe('ProgressionEngine', () => {
  const createMockHero = (): Combatant => ({
    id: 'hero_1',
    name: 'Hero',
    isHero: true,
    level: 1,
    exp: 0,
    maxExp: 50,
    statPoints: 0,
    element: Element.Water,
    hp: 100,
    maxHp: 100,
    sp: 30,
    maxSp: 30,
    atk: 20,
    def: 15,
    int: 10,
    agi: 12
  });

  const createMockBeast = (): Combatant => ({
    id: 'beast_1',
    name: 'Aqua Fin',
    isHero: false,
    level: 1,
    exp: 0,
    maxExp: 50,
    statPoints: 0,
    element: Element.Water,
    hp: 60,
    maxHp: 60,
    sp: 20,
    maxSp: 20,
    atk: 15,
    def: 10,
    int: 8,
    agi: 10
  });

  describe('calculateExpToNextLevel', () => {
    it('calculates expected non-linear EXP curve', () => {
      expect(ProgressionEngine.calculateExpToNextLevel(1)).toBe(50);
      expect(ProgressionEngine.calculateExpToNextLevel(2)).toBe(141);
      expect(ProgressionEngine.calculateExpToNextLevel(3)).toBe(259);
      expect(ProgressionEngine.calculateExpToNextLevel(4)).toBe(400);
      expect(ProgressionEngine.calculateExpToNextLevel(5)).toBe(559);
    });

    it('safely handles level <= 0', () => {
      expect(ProgressionEngine.calculateExpToNextLevel(0)).toBe(50);
      expect(ProgressionEngine.calculateExpToNextLevel(-5)).toBe(50);
    });
  });

  describe('calculateEnemyExpReward', () => {
    it('calculates level-scaled enemy rewards', () => {
      expect(ProgressionEngine.calculateEnemyExpReward(1)).toBe(30);
      expect(ProgressionEngine.calculateEnemyExpReward(3)).toBe(90);
      expect(ProgressionEngine.calculateEnemyExpReward(5)).toBe(150);
    });
  });

  describe('addExpToCombatant', () => {
    it('accumulates EXP without leveling up if threshold not reached', () => {
      const hero = createMockHero();
      const res = ProgressionEngine.addExpToCombatant(hero, 25);

      expect(res.leveledUp).toBe(false);
      expect(res.combatant.level).toBe(1);
      expect(res.combatant.exp).toBe(25);
      expect(res.combatant.statPoints).toBe(0);
    });

    it('levels up Hero with 3 stat points and full HP/SP restoration on threshold', () => {
      const hero = createMockHero();
      hero.hp = 10;
      hero.sp = 5;

      // Lv 1 needs 50 EXP. Giving 60 EXP -> level 2, with 10 overflow
      const res = ProgressionEngine.addExpToCombatant(hero, 60);

      expect(res.leveledUp).toBe(true);
      expect(res.levelsGained).toBe(1);
      expect(res.combatant.level).toBe(2);
      expect(res.combatant.exp).toBe(10);
      expect(res.combatant.maxExp).toBe(141);
      expect(res.combatant.statPoints).toBe(3); // Hero gains 3
      expect(res.combatant.maxHp).toBe(115); // +15
      expect(res.combatant.maxSp).toBe(35); // +5
      expect(res.combatant.hp).toBe(115); // full restore
      expect(res.combatant.sp).toBe(35); // full restore
    });

    it('awards 2 stat points to Beasts per level', () => {
      const beast = createMockBeast();
      const res = ProgressionEngine.addExpToCombatant(beast, 50);

      expect(res.leveledUp).toBe(true);
      expect(res.combatant.level).toBe(2);
      expect(res.combatant.statPoints).toBe(2); // Beast gains 2
    });

    it('handles multiple level-ups from a massive EXP influx', () => {
      const hero = createMockHero();
      // Lv 1 needs 50, Lv 2 needs 141 (total 191 to hit Lv 3)
      // Giving 200 EXP -> Level 3, with 9 overflow
      const res = ProgressionEngine.addExpToCombatant(hero, 200);

      expect(res.leveledUp).toBe(true);
      expect(res.levelsGained).toBe(2);
      expect(res.combatant.level).toBe(3);
      expect(res.combatant.exp).toBe(9);
      expect(res.combatant.statPoints).toBe(6); // 3 * 2
      expect(res.combatant.maxHp).toBe(130); // 100 + 30
    });
  });

  describe('allocateStatPoint', () => {
    it('fails when combatant has 0 stat points', () => {
      const hero = createMockHero();
      const res = ProgressionEngine.allocateStatPoint(hero, 'atk');

      expect(res.success).toBe(false);
      expect(res.reason).toContain('No Stat Points available');
      expect(res.combatant.atk).toBe(20);
    });

    it('allocates point to ATK and decrements stat points', () => {
      const hero = createMockHero();
      hero.statPoints = 2;

      const res = ProgressionEngine.allocateStatPoint(hero, 'atk');
      expect(res.success).toBe(true);
      expect(res.combatant.atk).toBe(21);
      expect(res.combatant.statPoints).toBe(1);
    });

    it('allocates point to DEF, increasing DEF by 1 and Max HP by 10', () => {
      const hero = createMockHero();
      hero.statPoints = 1;

      const res = ProgressionEngine.allocateStatPoint(hero, 'def');
      expect(res.success).toBe(true);
      expect(res.combatant.def).toBe(16);
      expect(res.combatant.maxHp).toBe(110);
      expect(res.combatant.statPoints).toBe(0);
    });

    it('allocates point to INT, increasing INT by 1 and Max SP by 5', () => {
      const hero = createMockHero();
      hero.statPoints = 1;

      const res = ProgressionEngine.allocateStatPoint(hero, 'int');
      expect(res.success).toBe(true);
      expect(res.combatant.int).toBe(11);
      expect(res.combatant.maxSp).toBe(35);
      expect(res.combatant.statPoints).toBe(0);
    });

    it('allocates point to AGI, increasing AGI by 1', () => {
      const hero = createMockHero();
      hero.statPoints = 1;

      const res = ProgressionEngine.allocateStatPoint(hero, 'agi');
      expect(res.success).toBe(true);
      expect(res.combatant.agi).toBe(13);
      expect(res.combatant.statPoints).toBe(0);
    });
  });
});
