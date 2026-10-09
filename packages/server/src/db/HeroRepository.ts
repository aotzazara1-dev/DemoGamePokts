import crypto from 'crypto';
import {
  Element,
  Direction,
  type HeroSummary,
  type CreateHeroPayload,
  type HeroFullSaveState,
  type Combatant,
  type ItemStack,
  type InventoryState,
  type PlayerRosterState,
  InventoryManager
} from '@poktsonline/shared';
import { DatabaseEngine } from './DatabaseEngine.js';

export class HeroRepository {
  public static readonly MAX_HEROES_PER_ACCOUNT = 3;

  constructor(private db: DatabaseEngine) {}

  public getHeroesByAccountId(accountId: string): HeroSummary[] {
    const rows = this.db.query<any>(
      'SELECT * FROM heroes WHERE account_id = ? ORDER BY created_at ASC',
      [accountId]
    );

    return rows.map(r => ({
      id: r.id,
      accountId: r.account_id,
      name: r.name,
      element: r.element as Element,
      level: r.level,
      mapId: r.map_id,
      x: r.x,
      y: r.y,
      direction: r.direction as Direction,
      createdAt: r.created_at
    }));
  }

  public getHeroCountByAccountId(accountId: string): number {
    const row = this.db.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM heroes WHERE account_id = ?',
      [accountId]
    );
    return row?.count ?? 0;
  }

  public createHero(accountId: string, payload: CreateHeroPayload): HeroSummary {
    const currentCount = this.getHeroCountByAccountId(accountId);
    if (currentCount >= HeroRepository.MAX_HEROES_PER_ACCOUNT) {
      throw new Error(`Maximum ${HeroRepository.MAX_HEROES_PER_ACCOUNT} heroes allowed per account`);
    }

    const trimmedName = payload.name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 16) {
      throw new Error('Hero name must be between 3 and 16 characters');
    }

    const heroId = 'hero_' + crypto.randomUUID().slice(0, 8);
    const now = Date.now();
    const mapId = 'novice_town_and_meadow';
    const spawnX = 10;
    const spawnY = 10;
    const direction: Direction = 'down';
    const gold = 200;

    const baseAttributes = {
      hp: 100,
      maxHp: 100,
      sp: 40,
      maxSp: 40,
      atk: 25,
      def: 15,
      int: 10,
      agi: 20
    };

    // 1. Insert Hero Record
    this.db.run(
      `INSERT INTO heroes (
        id, account_id, name, element, level, exp, stat_points,
        allocated_stats, map_id, x, y, direction, gold, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        heroId,
        accountId,
        trimmedName,
        payload.element,
        1, // level
        0, // exp
        0, // stat points
        JSON.stringify(baseAttributes),
        mapId,
        spawnX,
        spawnY,
        direction,
        gold,
        now
      ]
    );

    // 2. Insert Initial Inventory (TS Online Starter)
    const initialInv = InventoryManager.createInitialInventory();
    initialInv.slots.forEach((slot, slotIndex) => {
      if (slot) {
        this.db.run(
          'INSERT INTO hero_inventories (hero_id, slot_index, item_id, quantity) VALUES (?, ?, ?, ?)',
          [heroId, slotIndex, slot.itemId, slot.quantity]
        );
      }
    });

    // 3. Insert Starter Beast (elemental match)
    const starterBeast = this.getStarterBeast(payload.element);
    this.db.run(
      `INSERT INTO hero_rosters (
        hero_id, beast_id, is_active, formation_index, level, exp, hp, sp, attributes
      ) VALUES (?, ?, 1, 2, ?, 0, ?, ?, ?)`,
      [
        heroId,
        starterBeast.id,
        starterBeast.level,
        starterBeast.hp,
        starterBeast.sp,
        JSON.stringify({
          maxHp: starterBeast.maxHp,
          maxSp: starterBeast.maxSp,
          atk: starterBeast.atk,
          def: starterBeast.def,
          int: starterBeast.int,
          agi: starterBeast.agi,
          name: starterBeast.name,
          element: starterBeast.element
        })
      ]
    );

    return {
      id: heroId,
      accountId,
      name: trimmedName,
      element: payload.element,
      level: 1,
      mapId,
      x: spawnX,
      y: spawnY,
      direction,
      createdAt: now
    };
  }

  public getHeroFullState(heroId: string): HeroFullSaveState | null {
    const heroRow = this.db.queryOne<any>('SELECT * FROM heroes WHERE id = ?', [heroId]);
    if (!heroRow) return null;

    let baseAttrs = { hp: 100, maxHp: 100, sp: 40, maxSp: 40, atk: 25, def: 15, int: 10, agi: 20 };
    try {
      baseAttrs = JSON.parse(heroRow.allocated_stats);
    } catch {
      // fallback
    }

    const heroCombatant: Combatant = {
      id: heroRow.id,
      name: heroRow.name,
      isHero: true,
      level: heroRow.level,
      element: heroRow.element as Element,
      exp: heroRow.exp,
      statPoints: heroRow.stat_points,
      ...baseAttrs
    };

    // Load Inventory
    const invRows = this.db.query<any>(
      'SELECT * FROM hero_inventories WHERE hero_id = ? ORDER BY slot_index ASC',
      [heroId]
    );
    const slots: (ItemStack | null)[] = new Array(InventoryManager.INVENTORY_CAPACITY).fill(null);
    invRows.forEach(row => {
      if (row.slot_index >= 0 && row.slot_index < InventoryManager.INVENTORY_CAPACITY) {
        slots[row.slot_index] = {
          itemId: row.item_id,
          quantity: row.quantity
        };
      }
    });

    const inventory: InventoryState = {
      slots,
      gold: heroRow.gold
    };

    // Load Roster
    const rosterRows = this.db.query<any>(
      'SELECT * FROM hero_rosters WHERE hero_id = ? ORDER BY is_active DESC',
      [heroId]
    );

    const beasts: Combatant[] = rosterRows.map(r => {
      let attrs: any = {};
      try {
        attrs = JSON.parse(r.attributes);
      } catch {
        // fallback
      }
      return {
        id: r.beast_id,
        name: attrs.name ?? 'Wild Beast',
        isHero: false,
        level: r.level,
        element: (attrs.element as Element) || Element.Water,
        hp: r.hp,
        maxHp: attrs.maxHp ?? r.hp,
        sp: r.sp,
        maxSp: attrs.maxSp ?? r.sp,
        atk: attrs.atk ?? 20,
        def: attrs.def ?? 15,
        int: attrs.int ?? 10,
        agi: attrs.agi ?? 15,
        exp: r.exp
      };
    });

    const activeRow = rosterRows.find(r => r.is_active === 1);

    const roster: PlayerRosterState = {
      hero: heroCombatant,
      activeBeastId: activeRow ? activeRow.beast_id : beasts[0]?.id,
      beasts,
      formation: {
        heroSlot: { row: 'front', col: 2 },
        beastSlot: { row: 'back', col: 2 }
      }
    };

    return {
      hero: heroCombatant,
      accountId: heroRow.account_id,
      mapId: heroRow.map_id,
      x: heroRow.x,
      y: heroRow.y,
      direction: heroRow.direction as Direction,
      inventory,
      roster,
      createdAt: heroRow.created_at
    };
  }

  public saveHeroState(heroId: string, state: HeroFullSaveState): void {
    const heroAttrs = {
      hp: state.hero.hp,
      maxHp: state.hero.maxHp,
      sp: state.hero.sp,
      maxSp: state.hero.maxSp,
      atk: state.hero.atk,
      def: state.hero.def,
      int: state.hero.int,
      agi: state.hero.agi
    };

    // 1. Update Hero
    this.db.run(
      `UPDATE heroes SET
        level = ?, exp = ?, stat_points = ?, allocated_stats = ?,
        map_id = ?, x = ?, y = ?, direction = ?, gold = ?
      WHERE id = ?`,
      [
        state.hero.level,
        state.hero.exp ?? 0,
        state.hero.statPoints ?? 0,
        JSON.stringify(heroAttrs),
        state.mapId,
        state.x,
        state.y,
        state.direction,
        state.inventory.gold,
        heroId
      ]
    );

    // 2. Update Inventory
    this.db.run('DELETE FROM hero_inventories WHERE hero_id = ?', [heroId]);
    state.inventory.slots.forEach((slot, idx) => {
      if (slot) {
        this.db.run(
          'INSERT INTO hero_inventories (hero_id, slot_index, item_id, quantity) VALUES (?, ?, ?, ?)',
          [heroId, idx, slot.itemId, slot.quantity]
        );
      }
    });

    // 3. Update Roster
    this.db.run('DELETE FROM hero_rosters WHERE hero_id = ?', [heroId]);
    state.roster.beasts.forEach(beast => {
      const isActive = beast.id === state.roster.activeBeastId ? 1 : 0;
      this.db.run(
        `INSERT INTO hero_rosters (
          hero_id, beast_id, is_active, formation_index, level, exp, hp, sp, attributes
        ) VALUES (?, ?, ?, 2, ?, ?, ?, ?, ?)`,
        [
          heroId,
          beast.id,
          isActive,
          beast.level,
          beast.exp ?? 0,
          beast.hp,
          beast.sp,
          JSON.stringify({
            maxHp: beast.maxHp,
            maxSp: beast.maxSp,
            atk: beast.atk,
            def: beast.def,
            int: beast.int,
            agi: beast.agi,
            name: beast.name,
            element: beast.element
          })
        ]
      );
    });
  }

  public deleteHero(heroId: string, accountId: string): boolean {
    const existing = this.db.queryOne<any>(
      'SELECT id FROM heroes WHERE id = ? AND account_id = ?',
      [heroId, accountId]
    );
    if (!existing) return false;

    this.db.run('DELETE FROM hero_inventories WHERE hero_id = ?', [heroId]);
    this.db.run('DELETE FROM hero_rosters WHERE hero_id = ?', [heroId]);
    this.db.run('DELETE FROM heroes WHERE id = ?', [heroId]);
    return true;
  }

  private getStarterBeast(element: Element): Combatant {
    switch (element) {
      case Element.Earth:
        return {
          id: 'beast_starter_earth',
          name: 'Rock Boar',
          isHero: false,
          level: 4,
          element: Element.Earth,
          hp: 85,
          maxHp: 85,
          sp: 20,
          maxSp: 20,
          atk: 22,
          def: 20,
          int: 8,
          agi: 14
        };
      case Element.Fire:
        return {
          id: 'beast_starter_fire',
          name: 'Flame Fox',
          isHero: false,
          level: 4,
          element: Element.Fire,
          hp: 70,
          maxHp: 70,
          sp: 20,
          maxSp: 20,
          atk: 26,
          def: 12,
          int: 14,
          agi: 20
        };
      case Element.Wind:
        return {
          id: 'beast_starter_wind',
          name: 'Gale Hawk',
          isHero: false,
          level: 4,
          element: Element.Wind,
          hp: 65,
          maxHp: 65,
          sp: 25,
          maxSp: 25,
          atk: 21,
          def: 13,
          int: 12,
          agi: 24
        };
      case Element.Water:
      default:
        return {
          id: 'beast_starter_water',
          name: 'Aqua Fin',
          isHero: false,
          level: 4,
          element: Element.Water,
          hp: 75,
          maxHp: 75,
          sp: 25,
          maxSp: 25,
          atk: 20,
          def: 15,
          int: 10,
          agi: 18
        };
    }
  }
}
