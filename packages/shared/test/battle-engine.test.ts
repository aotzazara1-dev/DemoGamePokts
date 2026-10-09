import { describe, it, expect } from 'vitest';
import {
  BattleEngine,
  Element,
  type BattleState,
  type Combatant,
  type TeamActionsMap
} from '../src/index.js';

describe('BattleEngine Turn Resolution (Ticket 02)', () => {
  // Helper to scaffold combatants
  function makeUnit(overrides: Partial<Combatant> & { id: string; name: string }): Combatant {
    return {
      isHero: false,
      level: 10,
      element: Element.Fire,
      hp: 100,
      maxHp: 100,
      sp: 50,
      maxSp: 50,
      atk: 30,
      def: 15,
      int: 10,
      agi: 20,
      ...overrides
    };
  }

  // Helper to create an initial battle state
  function createBattleState(
    alliesFront: (Combatant | null)[] = [null, null, null, null, null],
    alliesBack: (Combatant | null)[] = [null, null, null, null, null],
    enemiesFront: (Combatant | null)[] = [null, null, null, null, null],
    enemiesBack: (Combatant | null)[] = [null, null, null, null, null]
  ): BattleState {
    return {
      round: 1,
      outcome: 'ongoing',
      allies: { front: alliesFront, back: alliesBack },
      enemies: { front: enemiesFront, back: enemiesBack },
      capturedBeastIds: []
    };
  }

  describe('Initiative Order by AGI', () => {
    it('executes actions strictly in descending order of unit AGI', () => {
      const fastHero = makeUnit({ id: 'hero', name: 'Hero', isHero: true, agi: 50 });
      const slowEnemy = makeUnit({ id: 'enemy', name: 'Enemy', agi: 10 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, null, fastHero, null, null],
        [null, null, slowEnemy, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'attack', targetId: 'enemy' },
        enemy: { type: 'attack', targetId: 'hero' }
      };

      const result = BattleEngine.resolveTurn(state, actions, () => 0.5);

      // Hero acted first because AGI 50 > 10
      const attackEvents = result.events.filter(e => e.type === 'attack');
      expect(attackEvents[0].actorId).toBe('hero');
      expect(attackEvents[1].actorId).toBe('enemy');
    });
  });

  describe('Formation Grid & Front Row Melee Shielding', () => {
    it('blocks direct melee physical attacks aimed at a Back Row slot while the Front Row slot in front is occupied', () => {
      const attacker = makeUnit({ id: 'attacker', name: 'Attacker', agi: 30 });
      const frontGuard = makeUnit({ id: 'guard', name: 'Guard', hp: 150, maxHp: 150 });
      const backSniper = makeUnit({ id: 'sniper', name: 'Sniper', hp: 80, maxHp: 80 });

      // Enemy slot 2 has frontGuard and backSniper directly behind it
      const state = createBattleState(
        [null, null, attacker, null, null],
        [null, null, null, null, null],
        [null, null, frontGuard, null, null],
        [null, null, backSniper, null, null]
      );

      const actions: TeamActionsMap = {
        attacker: { type: 'attack', targetId: 'sniper' }
      };

      const result = BattleEngine.resolveTurn(state, actions);

      // Attack on sniper should be blocked
      const blockedEvent = result.events.find(e => e.type === 'blocked');
      expect(blockedEvent).toBeDefined();
      expect(blockedEvent?.actorId).toBe('attacker');
      expect(blockedEvent?.targetId).toBe('sniper');

      // Sniper should have taken 0 damage
      const sniperInNextState = result.nextState.enemies.back[2];
      expect(sniperInNextState?.hp).toBe(80);
    });

    it('allows direct melee attack on Back Row if the Front Row slot ahead of it is empty or defeated', () => {
      const attacker = makeUnit({ id: 'attacker', name: 'Attacker', atk: 35, agi: 30 });
      const backSniper = makeUnit({ id: 'sniper', name: 'Sniper', hp: 80, maxHp: 80, def: 10 });

      // Front row slot 2 is NULL
      const state = createBattleState(
        [null, null, attacker, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, backSniper, null, null]
      );

      const actions: TeamActionsMap = {
        attacker: { type: 'attack', targetId: 'sniper' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      const damageEvent = result.events.find(e => e.type === 'damage' && e.targetId === 'sniper');
      expect(damageEvent).toBeDefined();
      expect(result.nextState.enemies.back[2]?.hp).toBeLessThan(80);
    });
  });

  describe('Combo Attacks (|delta AGI| <= 15)', () => {
    it('merges attacks of allied units targeting the same enemy with delta AGI <= 15 into a single amplified combo event', () => {
      const hero = makeUnit({ id: 'hero', name: 'Hero', atk: 40, agi: 32 });
      const beast = makeUnit({ id: 'beast', name: 'Beast', atk: 30, agi: 30 });
      const boss = makeUnit({ id: 'boss', name: 'Boss', hp: 500, maxHp: 500, def: 20 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, hero, beast, null, null],
        [null, null, boss, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'attack', targetId: 'boss' },
        beast: { type: 'attack', targetId: 'boss' }
      };

      const result = BattleEngine.resolveTurn(state, actions);

      const comboEvent = result.events.find(e => e.type === 'combo');
      expect(comboEvent).toBeDefined();
      expect(comboEvent?.targetId).toBe('boss');
      // Combo damage should reflect combined (atkA + atkB) with 1.8x multiplier
      expect(comboEvent?.value).toBeGreaterThan(60);
    });
  });

  describe('Defend Combat Action', () => {
    it('halves incoming damage when unit is defending', () => {
      const attacker = makeUnit({ id: 'attacker', name: 'Attacker', atk: 30, agi: 40 });
      const defender = makeUnit({ id: 'defender', name: 'Defender', hp: 100, maxHp: 100, def: 10, agi: 10 });

      const state = createBattleState(
        [null, null, attacker, null, null],
        [null, null, null, null, null],
        [null, null, defender, null, null],
        [null, null, null, null, null]
      );

      // Normal damage: (30 * 2) - 10 = 50. With Defend: 50 * 0.5 = 25
      const actions: TeamActionsMap = {
        attacker: { type: 'attack', targetId: 'defender' },
        defender: { type: 'defend' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      const dmgEvent = result.events.find(e => e.type === 'damage' && e.targetId === 'defender');
      expect(dmgEvent?.value).toBe(25);
      expect(result.nextState.enemies.front[2]?.hp).toBe(75);
    });
  });

  describe('Capture Mechanics', () => {
    it('fails capture automatically if Hero level is strictly less than target level', () => {
      const lowLevelHero = makeUnit({ id: 'hero', name: 'Hero', isHero: true, level: 10 });
      const highLevelBeast = makeUnit({ id: 'wild_beast', name: 'Wild Drake', level: 15, hp: 10, maxHp: 100 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, null, lowLevelHero, null, null],
        [null, null, highLevelBeast, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'capture', targetId: 'wild_beast' }
      };

      // Force RNG roll to 0.0 (normally guaranteed success if level requirement met)
      const result = BattleEngine.resolveTurn(state, actions, () => 0.0);
      const failEvent = result.events.find(e => e.type === 'capture_fail');
      expect(failEvent).toBeDefined();
      expect(failEvent?.message).toContain('level is lower');
      expect(result.nextState.capturedBeastIds).toHaveLength(0);
    });

    it('successfully captures an eligible weakened beast and adds it to capturedBeastIds', () => {
      const hero = makeUnit({ id: 'hero', name: 'Hero', isHero: true, level: 15 });
      const wildBeast = makeUnit({ id: 'wild_beast', name: 'Wild Pup', level: 12, hp: 15, maxHp: 100 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, null, hero, null, null],
        [null, null, wildBeast, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'capture', targetId: 'wild_beast' }
      };

      // RNG roll = 0.1 (low roll ensures success against captureChance >= 0.15)
      const result = BattleEngine.resolveTurn(state, actions, () => 0.1);
      const successEvent = result.events.find(e => e.type === 'capture_success');
      expect(successEvent).toBeDefined();
      expect(result.nextState.capturedBeastIds).toContain('wild_beast');
      // Captured beast should be removed/defeated from enemy team
      expect(result.nextState.enemies.front[2]?.hp).toBe(0);
    });
  });

  describe('Battle Outcomes', () => {
    it('declares victory when all enemies are defeated or captured', () => {
      const hero = makeUnit({ id: 'hero', name: 'Hero', isHero: true, atk: 50, agi: 30 });
      const weakEnemy = makeUnit({ id: 'enemy', name: 'Weak Enemy', hp: 10, maxHp: 50, def: 0 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, null, hero, null, null],
        [null, null, weakEnemy, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'attack', targetId: 'enemy' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      expect(result.nextState.outcome).toBe('victory');
    });

    it('declares defeat when all allies are defeated', () => {
      const weakHero = makeUnit({ id: 'hero', name: 'Hero', hp: 10, maxHp: 50, def: 0, agi: 10 });
      const boss = makeUnit({ id: 'boss', name: 'Boss', atk: 50, agi: 30 });

      const state = createBattleState(
        [null, null, null, null, null],
        [null, null, weakHero, null, null],
        [null, null, boss, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        boss: { type: 'attack', targetId: 'hero' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      expect(result.nextState.outcome).toBe('defeat');
    });

    it('evaluates flee action based on enemy AGI', () => {
      const fastHero = makeUnit({ id: 'hero', name: 'Hero', agi: 50 });
      const slowEnemy = makeUnit({ id: 'turtle', name: 'Turtle', agi: 10 });

      const state = createBattleState(
        [null, null, fastHero, null, null],
        [null, null, null, null, null],
        [null, null, slowEnemy, null, null],
        [null, null, null, null, null]
      );

      // Fast hero fleeing slow enemy: escape chance = 0.5 + (50 - 10)*0.02 = 1.3 -> clamped to 0.9 (90%)
      const actions: TeamActionsMap = {
        hero: { type: 'flee' }
      };

      // Guaranteed escape with roll 0.8 (< 0.9)
      const result = BattleEngine.resolveTurn(state, actions, () => 0.8);
      expect(result.nextState.outcome).toBe('escaped');
    });

    it('executes elemental skill, consuming SP and applying multiplier', () => {
      const waterHero = makeUnit({ id: 'hero', name: 'Hero', element: Element.Water, sp: 20, maxSp: 20, atk: 30 });
      const fireEnemy = makeUnit({ id: 'imp', name: 'Flame Imp', element: Element.Fire, def: 10, hp: 100, maxHp: 100 });

      const state = createBattleState(
        [null, null, waterHero, null, null],
        [null, null, null, null, null],
        [null, null, fireEnemy, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'skill', skillId: 'aqua_jet', targetId: 'imp' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      const skillEvent = result.events.find(e => e.type === 'skill');
      expect(skillEvent).toBeDefined();
      expect(result.nextState.allies.front[2]?.sp).toBe(10); // consumed 10 SP
      expect(result.nextState.enemies.front[2]?.hp).toBeLessThan(100);
    });
  });

  describe('Pass Combat Action', () => {
    it('emits pass event and takes no offensive action', () => {
      const hero = makeUnit({ id: 'hero', name: 'Hero', atk: 30 });
      const enemy = makeUnit({ id: 'enemy', name: 'Enemy', hp: 100, maxHp: 100 });

      const state = createBattleState(
        [null, null, hero, null, null],
        [null, null, null, null, null],
        [null, null, enemy, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'pass' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      const passEvent = result.events.find(e => e.type === 'pass');
      expect(passEvent).toBeDefined();
      expect(passEvent?.actorId).toBe('hero');
      expect(result.nextState.enemies.front[2]?.hp).toBe(100); // Unharmed
    });

    it('takes 100% normal damage when targeted while passing', () => {
      const enemy = makeUnit({ id: 'enemy', name: 'Enemy', atk: 30, agi: 40 });
      const hero = makeUnit({ id: 'hero', name: 'Hero', hp: 100, maxHp: 100, def: 10, agi: 10 });

      const state = createBattleState(
        [null, null, hero, null, null],
        [null, null, null, null, null],
        [null, null, enemy, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'pass' },
        enemy: { type: 'attack', targetId: 'hero' }
      };

      const result = BattleEngine.resolveTurn(state, actions);
      // Normal damage = 30 * 2 - 10 = 50. Since pass is NOT defend, takes full 50 damage!
      expect(result.nextState.allies.front[2]?.hp).toBe(50);
    });

    it('allows beast to pass while hero captures wild beast safely', () => {
      const hero = makeUnit({ id: 'hero', name: 'Hero', isHero: true, level: 10 });
      const beast = makeUnit({ id: 'beast', name: 'Beast', isHero: false, atk: 40 });
      const wild = makeUnit({ id: 'wild', name: 'Wild Beast', hp: 10, maxHp: 100, level: 3 });

      const state = createBattleState(
        [null, null, hero, null, null],
        [null, null, beast, null, null],
        [null, null, wild, null, null],
        [null, null, null, null, null]
      );

      const actions: TeamActionsMap = {
        hero: { type: 'capture', targetId: 'wild' },
        beast: { type: 'pass' }
      };

      // Guaranteed capture with roll 0.1 (< capture chance)
      const result = BattleEngine.resolveTurn(state, actions, () => 0.1);
      expect(result.nextState.capturedBeastIds).toContain('wild');
      expect(result.events.some(e => e.type === 'capture_success')).toBe(true);
      expect(result.events.some(e => e.type === 'pass' && e.actorId === 'beast')).toBe(true);
      expect(result.events.some(e => e.type === 'combo')).toBe(false);
    });
  });
});
