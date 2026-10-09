import { describe, it, expect } from 'vitest';
import { RosterManager } from '../src/roster/roster-manager.js';
import { Element, type Combatant } from '../src/types.js';

describe('RosterManager', () => {
  it('creates initial roster with Hero and starting Active Beast (Aqua Fin)', () => {
    const roster = RosterManager.createInitialRoster('Aragorn', Element.Fire);

    expect(roster.hero.name).toBe('Aragorn');
    expect(roster.hero.element).toBe(Element.Fire);
    expect(roster.hero.isHero).toBe(true);

    expect(roster.beasts.length).toBe(1);
    expect(roster.beasts[0].name).toBe('Aqua Fin');
    expect(roster.activeBeastId).toBe(roster.beasts[0].id);

    expect(roster.formation.heroSlot).toEqual({ row: 'front', col: 2 });
    expect(roster.formation.beastSlot).toEqual({ row: 'back', col: 2 });
  });

  it('switches Active Beast when beastId exists in roster', () => {
    let roster = RosterManager.createInitialRoster();

    const wildBoar: Combatant = {
      id: 'wild_boar_1',
      name: 'Rock Boar',
      isHero: false,
      level: 4,
      element: Element.Earth,
      hp: 50,
      maxHp: 50,
      sp: 10,
      maxSp: 10,
      atk: 16,
      def: 14,
      int: 6,
      agi: 8
    };

    const addResult = RosterManager.addCapturedBeast(roster, wildBoar);
    expect(addResult.success).toBe(true);
    roster = addResult.roster;
    expect(roster.beasts.length).toBe(2);

    const newBeastId = addResult.addedBeast!.id;
    roster = RosterManager.setActiveBeast(roster, newBeastId);
    expect(roster.activeBeastId).toBe(newBeastId);
  });

  it('ignores setActiveBeast if ID does not exist', () => {
    const roster = RosterManager.createInitialRoster();
    const updated = RosterManager.setActiveBeast(roster, 'non_existent_id');
    expect(updated.activeBeastId).toBe(roster.activeBeastId);
  });

  it('sets formation slot and swaps when colliding with other allied unit', () => {
    let roster = RosterManager.createInitialRoster();
    // Initially: Hero at front 2, Beast at back 2

    // Move Hero to back 1 (no collision)
    roster = RosterManager.setFormationSlot(roster, 'hero', { row: 'back', col: 1 });
    expect(roster.formation.heroSlot).toEqual({ row: 'back', col: 1 });
    expect(roster.formation.beastSlot).toEqual({ row: 'back', col: 2 });

    // Move Hero to back 2 (collides with Beast!)
    roster = RosterManager.setFormationSlot(roster, 'hero', { row: 'back', col: 2 });
    expect(roster.formation.heroSlot).toEqual({ row: 'back', col: 2 });
    // Beast should be swapped to Hero's previous position (back 1)
    expect(roster.formation.beastSlot).toEqual({ row: 'back', col: 1 });
  });

  it('caps beast roster at maximum capacity (10)', () => {
    let roster = RosterManager.createInitialRoster(); // 1 beast

    for (let i = 1; i < 10; i++) {
      const mockBeast: Combatant = {
        id: `mock_${i}`,
        name: `Beast ${i}`,
        isHero: false,
        level: 2,
        element: Element.Wind,
        hp: 30,
        maxHp: 30,
        sp: 10,
        maxSp: 10,
        atk: 10,
        def: 5,
        int: 5,
        agi: 10
      };
      const res = RosterManager.addCapturedBeast(roster, mockBeast);
      expect(res.success).toBe(true);
      roster = res.roster;
    }

    expect(roster.beasts.length).toBe(10);

    // 11th beast should fail
    const overflowBeast: Combatant = {
      id: 'overflow',
      name: 'Overflow Beast',
      isHero: false,
      level: 1,
      element: Element.Water,
      hp: 10,
      maxHp: 10,
      sp: 5,
      maxSp: 5,
      atk: 5,
      def: 5,
      int: 5,
      agi: 5
    };

    const failResult = RosterManager.addCapturedBeast(roster, overflowBeast);
    expect(failResult.success).toBe(false);
    expect(failResult.reason).toContain('full');
    expect(failResult.roster.beasts.length).toBe(10);
  });

  it('builds TeamFormation accurately matching formation coordinates', () => {
    let roster = RosterManager.createInitialRoster();
    // Move Beast to front 0, Hero to back 4
    roster = RosterManager.setFormationSlot(roster, 'beast', { row: 'front', col: 0 });
    roster = RosterManager.setFormationSlot(roster, 'hero', { row: 'back', col: 4 });

    const formation = RosterManager.buildTeamFormation(roster);

    expect(formation.front[0]?.name).toBe('Aqua Fin');
    expect(formation.front[2]).toBeNull();

    expect(formation.back[4]?.name).toBe('Hero');
    expect(formation.back[2]).toBeNull();
  });
});
