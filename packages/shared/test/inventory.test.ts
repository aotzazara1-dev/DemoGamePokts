import { describe, it, expect } from 'vitest';
import {
  ITEM_DATABASE,
  getItemDefinition,
  InventoryManager,
  LootEngine,
  Combatant,
  Element
} from '../src/index.js';

describe('Inventory & Consumable System', () => {
  const createMockHero = (hp = 60, maxHp = 100, sp = 20, maxSp = 50): Combatant => ({
    id: 'hero_test',
    name: 'Test Hero',
    isHero: true,
    level: 5,
    element: Element.Water,
    hp,
    maxHp,
    sp,
    maxSp,
    atk: 25,
    def: 15,
    int: 12,
    agi: 14
  });

  describe('ITEM_DATABASE', () => {
    it('provides definitions for essential consumables and scrolls', () => {
      expect(getItemDefinition('item_steamed_bun')).toBeDefined();
      expect(getItemDefinition('item_herbal_tea')).toBeDefined();
      expect(getItemDefinition('item_vitality_pill')).toBeDefined();
      expect(getItemDefinition('item_phoenix_feather')).toBeDefined();
      expect(getItemDefinition('item_town_scroll')).toBeDefined();
    });

    it('validates Steamed Bun is a +80 HP restore item', () => {
      const bun = getItemDefinition('item_steamed_bun')!;
      expect(bun.type).toBe('hp_restore');
      expect(bun.effectValue).toBe(80);
      expect(bun.usableInCombat).toBe(true);
      expect(bun.usableOnOverworld).toBe(true);
    });

    it('validates Phoenix Feather is a revive item', () => {
      const feather = getItemDefinition('item_phoenix_feather')!;
      expect(feather.type).toBe('revive');
      expect(feather.effectValue).toBe(100);
      expect(feather.usableInCombat).toBe(true);
    });
  });

  describe('InventoryManager', () => {
    it('creates initial 20-slot inventory with starter items and 200 gold', () => {
      const inv = InventoryManager.createInitialInventory();
      expect(inv.slots.length).toBe(20);
      expect(inv.gold).toBe(200);

      expect(inv.slots[0]).toEqual({ itemId: 'item_steamed_bun', quantity: 5 });
      expect(inv.slots[1]).toEqual({ itemId: 'item_herbal_tea', quantity: 3 });
      expect(inv.slots[2]).toEqual({ itemId: 'item_phoenix_feather', quantity: 1 });
      expect(inv.slots[3]).toBeNull();
    });

    it('stacks items onto existing slots before occupying new slots', () => {
      let inv = InventoryManager.createInitialInventory();
      // Initially slot 0 has 5 steamed buns
      const res = InventoryManager.addItem(inv, 'item_steamed_bun', 10);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[0]?.quantity).toBe(15);
      expect(res.inventory.slots[3]).toBeNull(); // Did not consume a new slot
    });

    it('occupies next available empty slot when adding new item', () => {
      let inv = InventoryManager.createInitialInventory();
      const res = InventoryManager.addItem(inv, 'item_vitality_pill', 4);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[3]).toEqual({ itemId: 'item_vitality_pill', quantity: 4 });
    });

    it('returns error when inventory is completely full', () => {
      const fullSlots = new Array(20).fill(null).map(() => ({ itemId: 'item_town_scroll', quantity: 99 }));
      const fullInv = { slots: fullSlots, gold: 50 };

      const res = InventoryManager.addItem(fullInv, 'item_steamed_bun', 1);
      expect(res.success).toBe(false);
      expect(res.reason).toContain('full');
    });

    it('removes item quantity and frees slot when reaching 0', () => {
      let inv = InventoryManager.createInitialInventory();
      // slot 2 has 1 phoenix feather
      const res = InventoryManager.removeItem(inv, 'item_phoenix_feather', 1);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[2]).toBeNull();
    });

    it('heals living hero with Steamed Bun up to maxHp and consumes 1 item', () => {
      let inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(60, 100); // 60/100 HP

      const res = InventoryManager.useItemOnCombatant(inv, 'item_steamed_bun', hero);
      expect(res.success).toBe(true);
      expect(res.target.hp).toBe(100); // 60 + 80 capped at 100
      expect(res.inventory.slots[0]?.quantity).toBe(4); // Was 5
    });

    it('restores SP with Herbal Tea and consumes 1 item', () => {
      let inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(100, 100, 10, 50); // 10/50 SP

      const res = InventoryManager.useItemOnCombatant(inv, 'item_herbal_tea', hero);
      expect(res.success).toBe(true);
      expect(res.target.sp).toBe(50); // 10 + 50 capped at 50
      expect(res.inventory.slots[1]?.quantity).toBe(2); // Was 3
    });

    it('rejects healing when target is already at full HP', () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(100, 100);

      const res = InventoryManager.useItemOnCombatant(inv, 'item_steamed_bun', hero);
      expect(res.success).toBe(false);
      expect(res.reason).toContain('full HP');
      expect(inv.slots[0]?.quantity).toBe(5); // Not consumed
    });

    it('rejects food when target is fainted', () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(0, 100);

      const res = InventoryManager.useItemOnCombatant(inv, 'item_steamed_bun', hero);
      expect(res.success).toBe(false);
      expect(res.reason).toContain('fallen');
    });

    it('revives fallen target with Phoenix Feather', () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(0, 150);

      const res = InventoryManager.useItemOnCombatant(inv, 'item_phoenix_feather', hero);
      expect(res.success).toBe(true);
      expect(res.target.hp).toBe(100);
      expect(res.inventory.slots[2]).toBeNull(); // Was 1 feather, now 0
    });

    it('adds and subtracts gold accurately', () => {
      let inv = InventoryManager.createInitialInventory(); // 200 gold
      inv = InventoryManager.addGold(inv, 500);
      expect(inv.gold).toBe(700);
      inv = InventoryManager.addGold(inv, -1000);
      expect(inv.gold).toBe(0); // Floor at 0
    });
  });

  describe('LootEngine', () => {
    it('calculates gold reward based on defeated enemy level', () => {
      const enemies: Combatant[] = [
        createMockHero(0, 50), // Level 5
        createMockHero(0, 50)  // Level 5
      ];
      // Deterministic random always returning 0.5 (level * 25)
      const loot = LootEngine.calculateLoot(enemies, () => 0.5);
      expect(loot.gold).toBe(250); // (5 * 25) + (5 * 25)
    });

    it('drops items when drop roll succeeds', () => {
      const enemies: Combatant[] = [createMockHero(0, 50)];
      // Deterministic sequence:
      // 1. gold roll: 0.5 -> 25
      // 2. drop roll: 0.1 (< 0.45 -> success!)
      // 3. item roll: 0.2 (< 0.50 -> item_steamed_bun)
      const sequence = [0.5, 0.1, 0.2];
      let i = 0;
      const loot = LootEngine.calculateLoot(enemies, () => sequence[i++ % sequence.length]);

      expect(loot.droppedItems.length).toBe(1);
      expect(loot.droppedItems[0]).toEqual({ itemId: 'item_steamed_bun', quantity: 1 });
    });
  });
});
