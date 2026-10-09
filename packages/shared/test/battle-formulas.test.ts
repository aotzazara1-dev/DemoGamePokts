import { describe, it, expect } from 'vitest';
import {
  Element,
  getElementMultiplier,
  calculateDamage,
  canTriggerCombo,
  type Combatant
} from '../src/index.js';

describe('Battle Formulas & Elemental Rules (Ticket 01)', () => {
  describe('Elemental Advantage Cycle (Earth > Water > Fire > Wind > Earth)', () => {
    it('applies 1.5x damage on elemental advantage', () => {
      expect(getElementMultiplier(Element.Earth, Element.Water)).toBe(1.5);
      expect(getElementMultiplier(Element.Water, Element.Fire)).toBe(1.5);
      expect(getElementMultiplier(Element.Fire, Element.Wind)).toBe(1.5);
      expect(getElementMultiplier(Element.Wind, Element.Earth)).toBe(1.5);
    });

    it('applies 0.7x damage on elemental disadvantage', () => {
      expect(getElementMultiplier(Element.Water, Element.Earth)).toBe(0.7);
      expect(getElementMultiplier(Element.Fire, Element.Water)).toBe(0.7);
      expect(getElementMultiplier(Element.Wind, Element.Fire)).toBe(0.7);
      expect(getElementMultiplier(Element.Earth, Element.Wind)).toBe(0.7);
    });

    it('applies 1.0x damage on neutral / identical element matchups', () => {
      expect(getElementMultiplier(Element.Fire, Element.Fire)).toBe(1.0);
      expect(getElementMultiplier(Element.Earth, Element.Fire)).toBe(1.0);
      expect(getElementMultiplier(Element.Water, Element.Wind)).toBe(1.0);
    });
  });

  describe('Subtractive Physical Damage Calculation', () => {
    it('calculates standard subtractive damage: max(1, (atk * 2) - def) * elementMultiplier * comboMultiplier', () => {
      // Base: atk=40, def=20 -> (40 * 2) - 20 = 60
      const dmg = calculateDamage(40, 20, 1.0, 1.0);
      expect(dmg).toBe(60);
    });

    it('applies elemental multiplier to damage', () => {
      // Base: (40 * 2) - 20 = 60 * 1.5 = 90
      const dmg = calculateDamage(40, 20, 1.5, 1.0);
      expect(dmg).toBe(90);
    });

    it('applies combo multiplier to damage', () => {
      // Base: (40 * 2) - 20 = 60 * 1.0 * 1.8 = 108
      const dmg = calculateDamage(40, 20, 1.0, 1.8);
      expect(dmg).toBe(108);
    });

    it('enforces floor of 1 damage when target defense exceeds attack power', () => {
      // (10 * 2) - 100 = -80 -> clamped to 1
      const dmg = calculateDamage(10, 100, 1.0, 1.0);
      expect(dmg).toBe(1);
    });
  });

  describe('Combo Detection Threshold (|delta AGI| <= 15)', () => {
    const baseUnitA: Combatant = {
      id: 'unit_a',
      name: 'Hero',
      isHero: true,
      level: 15,
      element: Element.Fire,
      hp: 200,
      maxHp: 200,
      sp: 50,
      maxSp: 50,
      atk: 40,
      def: 20,
      int: 15,
      agi: 30,
      action: { type: 'attack', targetId: 'enemy_1' }
    };

    const baseUnitB: Combatant = {
      id: 'unit_b',
      name: 'Beast',
      isHero: false,
      level: 14,
      element: Element.Fire,
      hp: 150,
      maxHp: 150,
      sp: 30,
      maxSp: 30,
      atk: 35,
      def: 18,
      int: 10,
      agi: 28,
      action: { type: 'attack', targetId: 'enemy_1' }
    };

    it('triggers combo when units target same enemy and AGI difference is <= 15', () => {
      // agi difference: |30 - 28| = 2 <= 15
      expect(canTriggerCombo(baseUnitA, baseUnitB)).toBe(true);
    });

    it('triggers combo at exactly 15 AGI difference', () => {
      const fastHero = { ...baseUnitA, agi: 45 };
      const slowBeast = { ...baseUnitB, agi: 30 };
      // |45 - 30| = 15 <= 15
      expect(canTriggerCombo(fastHero, slowBeast)).toBe(true);
    });

    it('fails combo when AGI difference is strictly greater than 15', () => {
      const veryFastHero = { ...baseUnitA, agi: 50 };
      const slowBeast = { ...baseUnitB, agi: 30 };
      // |50 - 30| = 20 > 15
      expect(canTriggerCombo(veryFastHero, slowBeast)).toBe(false);
    });

    it('fails combo when units target different enemies', () => {
      const unitBDiffTarget = {
        ...baseUnitB,
        action: { type: 'attack' as const, targetId: 'enemy_2' }
      };
      expect(canTriggerCombo(baseUnitA, unitBDiffTarget)).toBe(false);
    });

    it('fails combo when one of the units selects a non-attack action', () => {
      const defendingUnit = {
        ...baseUnitB,
        action: { type: 'defend' as const }
      };
      expect(canTriggerCombo(baseUnitA, defendingUnit)).toBe(false);
    });

    it('fails combo if either unit is defeated (HP <= 0)', () => {
      const fallenHero = { ...baseUnitA, hp: 0 };
      expect(canTriggerCombo(fallenHero, baseUnitB)).toBe(false);
    });
  });
});
