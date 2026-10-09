import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Element, type TileCoord, type Direction } from '@poktsonline/shared';
import { DatabaseEngine } from '../src/db/DatabaseEngine.js';
import { AccountRepository } from '../src/db/AccountRepository.js';
import { HeroRepository } from '../src/db/HeroRepository.js';
import { OverworldRoom } from '../src/rooms/OverworldRoom.js';

describe('OverworldRoom Auth & Full State Persistence (Ticket 04)', () => {
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;
  let room: OverworldRoom;

  beforeEach(async () => {
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);

    room = new OverworldRoom();
    room.onCreate({
      accountRepo,
      heroRepo
    } as any);
  });

  afterEach(() => {
    room.onDispose();
    dbEngine.close();
  });

  it('authenticates player, spawns at saved coordinates, and sends full state', async () => {
    // 1. Create registered account & hero
    const account = accountRepo.createRegisteredAccount('ZhangWuji', 'password123');
    const sessionToken = accountRepo.createSession(account.id);
    const hero = heroRepo.createHero(account.id, {
      name: 'ZhangWuji',
      element: Element.Fire
    });

    const messagesSent: any[] = [];
    const mockClient: any = {
      sessionId: 'sess_1',
      send: (type: string, data: any) => {
        messagesSent.push({ type, data });
      }
    };

    // 2. Join OverworldRoom with credentials
    room.onJoin(mockClient, {
      sessionToken,
      heroId: hero.id
    });

    const player = room.state.players.get('sess_1');
    expect(player).toBeDefined();
    expect(player?.name).toBe('ZhangWuji');
    expect(player?.x).toBe(10);
    expect(player?.y).toBe(10);
    expect(player?.mapId).toBe('valhalla_coliseum');

    // 3. Verify heroStateLoaded message was sent
    const stateLoadedMsg = messagesSent.find(m => m.type === 'heroStateLoaded');
    expect(stateLoadedMsg).toBeDefined();
    expect(stateLoadedMsg.data.hero.name).toBe('ZhangWuji');
    expect(stateLoadedMsg.data.hero.element).toBe(Element.Fire);
    expect(stateLoadedMsg.data.inventory.slots.length).toBe(20);
    expect(stateLoadedMsg.data.roster.beasts.length).toBeGreaterThan(0);
  });

  it('auto-saves player position and state on disconnect', async () => {
    const account = accountRepo.createRegisteredAccount('GuoJing', 'password123');
    const sessionToken = accountRepo.createSession(account.id);
    const hero = heroRepo.createHero(account.id, {
      name: 'GuoJing',
      element: Element.Earth
    });

    const mockClient: any = {
      sessionId: 'sess_2',
      send: () => {}
    };

    room.onJoin(mockClient, {
      sessionToken,
      heroId: hero.id
    });

    const player = room.state.players.get('sess_2')!;
    // Simulate player movement to tile (14, 18) and updated direction
    player.x = 14;
    player.y = 18;
    player.direction = 'right';

    // Simulate saving state update (e.g. earned gold)
    room.handleSaveHeroState(mockClient, {
      gold: 750
    });

    // Player disconnects
    room.onLeave(mockClient);

    // Verify SQLite was updated
    const savedState = heroRepo.getHeroFullState(hero.id)!;
    expect(savedState.x).toBe(14);
    expect(savedState.y).toBe(18);
    expect(savedState.direction).toBe('right');
    expect(savedState.inventory.gold).toBe(750);
  });

  it('rejects join when sessionToken is invalid or does not own hero', async () => {
    const account1 = accountRepo.createRegisteredAccount('OwnerA', 'pass1');
    const token1 = accountRepo.createSession(account1.id);
    const hero1 = heroRepo.createHero(account1.id, { name: 'HeroA', element: Element.Water });

    const account2 = accountRepo.createRegisteredAccount('OwnerB', 'pass2');
    const token2 = accountRepo.createSession(account2.id);

    const mockClient: any = {
      sessionId: 'sess_bad',
      send: () => {},
      leave: () => {}
    };

    // Attempt to join someone else's hero using token2
    expect(() => {
      room.onJoin(mockClient, {
        sessionToken: token2,
        heroId: hero1.id
      });
    }).toThrow(/unauthorized|not found/i);
  });

  it('persists coordinates and mapId to SQLite immediately on warpTown transition', async () => {
    const account = accountRepo.createRegisteredAccount('WarpUser', 'password123');
    const sessionToken = accountRepo.createSession(account.id);
    const hero = heroRepo.createHero(account.id, {
      name: 'WarpUser',
      element: Element.Wind
    });

    const mockClient: any = {
      sessionId: 'sess_warp',
      send: () => {}
    };

    room.onJoin(mockClient, { sessionToken, heroId: hero.id });

    // Set player position away from town
    const player = room.state.players.get('sess_warp')!;
    player.x = 22;
    player.y = 35;
    player.mapId = 'misty_forest';

    // Trigger warpTown
    (room as any).onMessageHandlers['warpTown'](mockClient);

    // Verify room state was updated to town
    expect(player.mapId).toBe('novice_town_and_meadow');
    expect(player.x).toBe(10);
    expect(player.y).toBe(10);

    // Verify SQLite was persisted immediately without needing disconnect
    const savedState = heroRepo.getHeroFullState(hero.id)!;
    expect(savedState.mapId).toBe('novice_town_and_meadow');
    expect(savedState.x).toBe(10);
    expect(savedState.y).toBe(10);
  });
});

