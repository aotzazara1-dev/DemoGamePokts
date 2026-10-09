import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Element } from '@poktsonline/shared';
import { DatabaseEngine } from '../src/db/DatabaseEngine.js';
import { AccountRepository } from '../src/db/AccountRepository.js';
import { HeroRepository } from '../src/db/HeroRepository.js';

describe('Database Engine & Repositories (Ticket 01)', () => {
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;

  beforeEach(async () => {
    // In-memory database for fast, isolated tests
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);
  });

  afterEach(() => {
    dbEngine.close();
  });

  describe('Schema Migrations', () => {
    it('creates all required tables on initialization', () => {
      const tables = dbEngine.getTables();
      expect(tables).toContain('accounts');
      expect(tables).toContain('sessions');
      expect(tables).toContain('heroes');
      expect(tables).toContain('hero_inventories');
      expect(tables).toContain('hero_rosters');
    });
  });

  describe('AccountRepository', () => {
    it('creates and finds guest accounts', () => {
      const guestToken = 'guest_uuid_12345';
      const account = accountRepo.createGuestAccount(guestToken);

      expect(account.id).toBeDefined();
      expect(account.isGuest).toBe(true);
      expect(account.username).toBeNull();

      const found = accountRepo.findAccountByGuestToken(guestToken);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(account.id);
    });

    it('creates and finds registered accounts', () => {
      const account = accountRepo.createRegisteredAccount('martial_hero', 'scrypt_hash_abc');

      expect(account.id).toBeDefined();
      expect(account.isGuest).toBe(false);
      expect(account.username).toBe('martial_hero');

      const found = accountRepo.findAccountByUsername('martial_hero');
      expect(found).not.toBeNull();
      expect(found?.id).toBe(account.id);
      expect(found?.passwordHash).toBe('scrypt_hash_abc');
    });

    it('prevents duplicate usernames', () => {
      accountRepo.createRegisteredAccount('swordsman', 'hash1');
      expect(() => {
        accountRepo.createRegisteredAccount('swordsman', 'hash2');
      }).toThrow(/UNIQUE constraint failed|already exists/i);
    });

    it('links guest account to permanent username and password', () => {
      const guest = accountRepo.createGuestAccount('guest_token_link');
      expect(guest.isGuest).toBe(true);

      const success = accountRepo.linkGuestAccount(guest.id, 'upgraded_hero', 'hashed_pass');
      expect(success).toBe(true);

      const updated = accountRepo.findAccountById(guest.id);
      expect(updated?.isGuest).toBe(false);
      expect(updated?.username).toBe('upgraded_hero');
    });

    it('creates and validates session tokens', () => {
      const account = accountRepo.createRegisteredAccount('session_tester', 'pass_hash');
      const token = accountRepo.createSession(account.id, 3600 * 1000);

      const validated = accountRepo.validateSession(token);
      expect(validated).not.toBeNull();
      expect(validated?.id).toBe(account.id);

      const invalid = accountRepo.validateSession('fake_token');
      expect(invalid).toBeNull();
    });
  });

  describe('HeroRepository', () => {
    it('creates a new hero with elemental starter beast and initial inventory', () => {
      const account = accountRepo.createGuestAccount('guest_for_hero');
      const hero = heroRepo.createHero(account.id, {
        name: 'XiaoLong',
        element: Element.Water
      });

      expect(hero.id).toBeDefined();
      expect(hero.name).toBe('XiaoLong');
      expect(hero.element).toBe(Element.Water);
      expect(hero.level).toBe(1);
      expect(hero.mapId).toBe('novice_town_and_meadow');
      expect(hero.x).toBe(10);
      expect(hero.y).toBe(10);

      // Verify full state loading
      const fullState = heroRepo.getHeroFullState(hero.id);
      expect(fullState).not.toBeNull();
      expect(fullState?.hero.name).toBe('XiaoLong');
      expect(fullState?.inventory.slots.length).toBe(20);
      expect(fullState?.roster.beasts.length).toBeGreaterThan(0);
      expect(fullState?.roster.activeBeastId).toBeDefined();
    });

    it('enforces maximum 3 heroes per account', () => {
      const account = accountRepo.createGuestAccount('multi_hero_tester');

      heroRepo.createHero(account.id, { name: 'Hero1', element: Element.Fire });
      heroRepo.createHero(account.id, { name: 'Hero2', element: Element.Earth });
      heroRepo.createHero(account.id, { name: 'Hero3', element: Element.Wind });

      const heroes = heroRepo.getHeroesByAccountId(account.id);
      expect(heroes.length).toBe(3);

      expect(() => {
        heroRepo.createHero(account.id, { name: 'Hero4', element: Element.Water });
      }).toThrow(/Maximum 3 heroes allowed/i);
    });

    it('saves updated hero position, inventory, and gold', () => {
      const account = accountRepo.createGuestAccount('save_tester');
      const hero = heroRepo.createHero(account.id, { name: 'Wanderer', element: Element.Fire });

      const fullState = heroRepo.getHeroFullState(hero.id)!;
      fullState.x = 25;
      fullState.y = 18;
      fullState.mapId = 'misty_forest';
      fullState.direction = 'up-left';
      fullState.inventory.gold = 500;
      fullState.hero.level = 2;
      fullState.hero.exp = 150;

      heroRepo.saveHeroState(hero.id, fullState);

      const reloaded = heroRepo.getHeroFullState(hero.id)!;
      expect(reloaded.x).toBe(25);
      expect(reloaded.y).toBe(18);
      expect(reloaded.mapId).toBe('misty_forest');
      expect(reloaded.direction).toBe('up-left');
      expect(reloaded.inventory.gold).toBe(500);
      expect(reloaded.hero.level).toBe(2);
      expect(reloaded.hero.exp).toBe(150);
    });

    it('deletes hero and cascades related inventories and rosters', () => {
      const account = accountRepo.createGuestAccount('delete_tester');
      const hero = heroRepo.createHero(account.id, { name: 'DoomedHero', element: Element.Earth });

      expect(heroRepo.getHeroesByAccountId(account.id).length).toBe(1);

      const deleted = heroRepo.deleteHero(hero.id, account.id);
      expect(deleted).toBe(true);

      expect(heroRepo.getHeroesByAccountId(account.id).length).toBe(0);
      expect(heroRepo.getHeroFullState(hero.id)).toBeNull();
    });
  });
});
