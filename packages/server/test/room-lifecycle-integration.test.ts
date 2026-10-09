import { describe, it, expect, afterEach } from 'vitest';
import { OverworldRoom, DEFAULT_OVERWORLD_MAP } from '../src/rooms/OverworldRoom.js';
import { BattleRoom } from '../src/rooms/BattleRoom.js';
import { Element, type Combatant } from '@poktsonline/shared';

describe('Room Lifecycle & Battle Integration', () => {
  const roomsToClean: any[] = [];

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

  afterEach(() => {
    roomsToClean.forEach(room => {
      room.clock?.stop();
      clearTimeout(room['_autoDisposeTimeout']);
      clearInterval(room['_patchInterval']);
    });
    roomsToClean.length = 0;
  });

  it('completes the full loop: Overworld exploration -> Encounter -> BattleRoom combat -> Overworld restoration', () => {
    // 1. Setup OverworldRoom
    const overworld = new OverworldRoom();
    overworld.onCreate({ mapConfig: DEFAULT_OVERWORLD_MAP });
    roomsToClean.push(overworld);

    // Player joins overworld at (20, 25) (border of Novice Town and Whispering Meadow)
    const client = createMockClient('player_sess_1');
    overworld.onJoin(client as any, { name: 'ValiantTrainer', spawnTile: { x: 20, y: 25 } });

    const playerNet = overworld.state.players.get('player_sess_1')!;
    expect(playerNet.x).toBe(20);
    expect(playerNet.y).toBe(25);
    expect(playerNet.inBattle).toBe(false);

    // Force encounter on step into wild zone
    overworld.rng = () => 0.0;

    // 2. Step into Whispering Meadow (x: 21, y: 25)
    (overworld as any).onMessageHandlers['move'](client, { targetX: 21, targetY: 25 });

    expect(playerNet.x).toBe(21);
    expect(playerNet.y).toBe(25);
    expect(playerNet.inBattle).toBe(true);

    const encounterMsg = client.messages.find(m => m.type === 'encounter');
    expect(encounterMsg).toBeDefined();
    expect(encounterMsg?.payload.encounter.wildEnemies.length).toBeGreaterThan(0);

    const wildEnemies: Combatant[] = encounterMsg?.payload.encounter.wildEnemies;

    // 3. Instantiate BattleRoom with Player's Hero + Beast and the Wild Enemies
    const hero: Combatant = {
      id: 'hero_1',
      name: 'Valiant',
      isHero: true,
      level: 5,
      element: Element.Water,
      hp: 120,
      maxHp: 120,
      sp: 40,
      maxSp: 40,
      atk: 30,
      def: 20,
      int: 15,
      agi: 25
    };

    const beast: Combatant = {
      id: 'beast_1',
      name: 'River Turtle',
      isHero: false,
      level: 4,
      element: Element.Water,
      hp: 80,
      maxHp: 80,
      sp: 20,
      maxSp: 20,
      atk: 22,
      def: 25,
      int: 10,
      agi: 15
    };

    const battleRoom = new BattleRoom();
    battleRoom.onCreate({
      playerCombatants: [hero, beast],
      wildEnemies: wildEnemies
    });
    roomsToClean.push(battleRoom);

    battleRoom.onJoin(client as any);

    expect(battleRoom.state.phase).toBe('action');
    expect(battleRoom.state.combatants.size).toBe(2 + wildEnemies.length);

    // 4. Player selects attack for both units targeting the frontline wild enemy
    const targetEnemyId = wildEnemies[0].id;
    (battleRoom as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'hero_1',
      action: { type: 'attack', targetId: targetEnemyId }
    });
    (battleRoom as any).onMessageHandlers['selectAction'](client, {
      combatantId: 'beast_1',
      action: { type: 'attack', targetId: targetEnemyId }
    });

    // 5. Turn automatically resolves and victory is achieved
    expect(battleRoom.state.phase).toBe('victory');
    const defeatedEnemy = battleRoom.state.combatants.get(targetEnemyId);
    expect(defeatedEnemy?.isAlive).toBe(false);

    // 6. Player notifies Overworld that battle concluded
    (overworld as any).onMessageHandlers['battleConcluded'](client);
    expect(playerNet.inBattle).toBe(false);
    expect(playerNet.x).toBe(21);
    expect(playerNet.y).toBe(25);

    // Player can move again in Overworld!
    overworld.rng = () => 0.99; // no encounter
    (overworld as any).onMessageHandlers['move'](client, { targetX: 22, targetY: 25 });
    expect(playerNet.x).toBe(22);
    expect(playerNet.y).toBe(25);
  });
});
