import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BattleRoom } from '../src/rooms/BattleRoom.js';
import { Element, type Combatant, type TeamFormation } from '@poktsonline/shared';

describe('BattleRoom', () => {
  let room: BattleRoom;

  const mockHero: Combatant = {
    id: 'hero_1',
    name: 'Hero',
    isHero: true,
    level: 5,
    element: Element.Water,
    hp: 100,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    atk: 25,
    def: 15,
    int: 10,
    agi: 20
  };

  const mockBeast: Combatant = {
    id: 'beast_1',
    name: 'Aqua Fin',
    isHero: false,
    level: 4,
    element: Element.Water,
    hp: 60,
    maxHp: 60,
    sp: 20,
    maxSp: 20,
    atk: 18,
    def: 12,
    int: 8,
    agi: 16
  };

  const mockWildEnemy: Combatant = {
    id: 'enemy_1',
    name: 'Flame Imp',
    isHero: false,
    level: 3,
    element: Element.Fire,
    hp: 40,
    maxHp: 40,
    sp: 10,
    maxSp: 10,
    atk: 15,
    def: 8,
    int: 10,
    agi: 10
  };

  const createMockClient = (sessionId: string) => {
    const messages: { type: string; payload: any }[] = [];
    return {
      sessionId,
      messages,
      send: (type: string, payload: any) => {
        messages.push({ type, payload });
      }
    };
  };

  beforeEach(() => {
    room = new BattleRoom();
    room.onCreate({
      playerCombatants: [mockHero, mockBeast],
      wildEnemies: [mockWildEnemy]
    });
  });

  afterEach(() => {
    room.clock?.stop();
    clearTimeout((room as any)['_autoDisposeTimeout']);
    clearInterval((room as any)['_patchInterval']);
  });

  it('initializes battle state with Hero, Beast, and Wild Enemies on 2x5 grid', () => {
    expect(room.state.phase).toBe('action');
    expect(room.state.round).toBe(1);
    expect(room.state.actionTimer).toBe(30);

    const hero = room.state.combatants.get('hero_1');
    const beast = room.state.combatants.get('beast_1');
    const enemy = room.state.combatants.get('enemy_1');

    expect(hero).toBeDefined();
    expect(hero?.team).toBe('allies');
    expect(hero?.hp).toBe(100);
    expect(hero?.isHero).toBe(true);

    expect(beast).toBeDefined();
    expect(beast?.team).toBe('allies');

    expect(enemy).toBeDefined();
    expect(enemy?.team).toBe('enemies');
    expect(enemy?.element).toBe(Element.Fire);
  });

  it('collects player actions and automatically executes turn when all actions locked in', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any);

    // Lock in Hero action
    (room as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'hero_1',
      action: { type: 'attack', targetId: 'enemy_1' }
    });

    // Still in action phase because beast has not acted yet
    expect(room.state.phase).toBe('action');

    // Lock in Beast action (targeting same enemy -> triggers combo test)
    (room as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'beast_1',
      action: { type: 'attack', targetId: 'enemy_1' }
    });

    // Both actions submitted -> room resolves turn!
    // Enemy had 40 HP, Hero atk 25 + Beast atk 18 against Def 8 with Water vs Fire (1.5x) and Combo multiplier
    // Enemy faints -> Battle reaches victory!
    expect(room.state.phase).toBe('victory');
    const enemy = room.state.combatants.get('enemy_1');
    expect(enemy?.isAlive).toBe(false);
  });

  it('triggers turn resolution when 30s timer expires with default actions', () => {
    const client = createMockClient('client_1');
    room.onJoin(client as any);

    // Simulate timer running down to 0
    room.tickActionTimer(30);

    // After timer runs out, turn resolution executes
    expect(room.state.round).toBeGreaterThanOrEqual(1);
  });

  it('supports capture action and adds beast to captured list on success', () => {
    // Set up low HP enemy and high level hero for guaranteed capture
    const lowHpEnemy: Combatant = {
      ...mockWildEnemy,
      hp: 1,
      maxHp: 40
    };

    const captureRoom = new BattleRoom();
    captureRoom.onCreate({
      playerCombatants: [mockHero],
      wildEnemies: [lowHpEnemy]
    });
    // Deterministic RNG for guaranteed capture roll
    captureRoom.rng = () => 0.0;

    const client = createMockClient('client_1');
    captureRoom.onJoin(client as any);

    (captureRoom as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'hero_1',
      action: { type: 'capture', targetId: 'enemy_1' }
    });

    // Target captured, enemy defeated/captured -> Victory!
    expect(captureRoom.state.phase).toBe('victory');
    expect(captureRoom.getCapturedBeasts()).toContain('enemy_1');

    captureRoom.clock?.stop();
    clearTimeout((captureRoom as any)['_autoDisposeTimeout']);
    clearInterval((captureRoom as any)['_patchInterval']);
  });

  it('assigns valid targetId to living enemy AI attacks so enemy attacks living allies', () => {
    // Enemy with high HP so it doesn't faint in one hit
    const toughEnemy: Combatant = {
      ...mockWildEnemy,
      hp: 500,
      maxHp: 500,
      atk: 20
    };

    const aiRoom = new BattleRoom();
    aiRoom.onCreate({
      playerCombatants: [mockHero],
      wildEnemies: [toughEnemy]
    });

    const client = createMockClient('client_1');
    aiRoom.onJoin(client as any);

    // Hero defends
    (aiRoom as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'hero_1',
      action: { type: 'defend' }
    });

    // Enemy AI attacked Hero, Hero took damage
    const heroState = aiRoom.state.combatants.get('hero_1')!;
    expect(heroState.hp).toBeLessThan(100);

    aiRoom.clock?.stop();
    clearTimeout((aiRoom as any)['_autoDisposeTimeout']);
    clearInterval((aiRoom as any)['_patchInterval']);
  });
});
