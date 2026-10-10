import { describe, it, expect } from "vitest";
import {
  ITEM_DATABASE,
  getItemDefinition,
  getItemIcon,
  getItemCategory,
  getItemCategoryLabel,
  InventoryManager,
  LootEngine,
  Combatant,
  Element,
} from "../src/index.js";

describe("Inventory & Consumable System", () => {
  const createMockHero = (
    hp = 60,
    maxHp = 100,
    sp = 20,
    maxSp = 50
  ): Combatant => ({
    id: "hero_test",
    name: "Test Hero",
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
    agi: 14,
  });

  describe("ITEM_DATABASE", () => {
    it("provides definitions for essential consumables and scrolls", () => {
      expect(getItemDefinition("item_steamed_bun")).toBeDefined();
      expect(getItemDefinition("item_herbal_tea")).toBeDefined();
      expect(getItemDefinition("item_vitality_pill")).toBeDefined();
      expect(getItemDefinition("item_phoenix_feather")).toBeDefined();
      expect(getItemDefinition("item_town_scroll")).toBeDefined();
    });

    it("validates Steamed Bun is a +80 HP restore item", () => {
      const bun = getItemDefinition("item_steamed_bun")!;
      expect(bun.type).toBe("hp_restore");
      expect(bun.effectValue).toBe(80);
      expect(bun.usableInCombat).toBe(true);
      expect(bun.usableOnOverworld).toBe(true);
    });

    it("validates Phoenix Feather is a revive item", () => {
      const feather = getItemDefinition("item_phoenix_feather")!;
      expect(feather.type).toBe("revive");
      expect(feather.effectValue).toBe(100);
      expect(feather.usableInCombat).toBe(true);
    });

    it("returns consistent icons for defined items and fallback for unknown items", () => {
      expect(getItemIcon("item_steamed_bun")).toBe("🍎");
      expect(getItemIcon("item_herbal_tea")).toBe("🍵");
      expect(getItemIcon("item_vitality_pill")).toBe("💊");
      expect(getItemIcon("item_phoenix_feather")).toBe("🪶");
      expect(getItemIcon("item_town_scroll")).toBe("📜");
      expect(getItemIcon("unknown_item_id")).toBe("📦");
    });

    it("accurately categorizes items into consumable, equipment, and material", () => {
      // Consumables (items with hp/sp restore, revive, scroll)
      expect(getItemCategory("item_small_herb")).toBe("consumable");
      expect(getItemCategory("item_steamed_bun")).toBe("consumable");
      expect(getItemCategory("item_town_scroll")).toBe("consumable");

      // Equipment (weapons, head, armor, boots, accessories)
      expect(getItemCategory("weapon_sky_piercer")).toBe("equipment");
      expect(getItemCategory("head_iron_circlet")).toBe("equipment");
      expect(getItemCategory("armor_valhalla_plate")).toBe("equipment");

      // Materials (loot drops like fangs, leather, scales)
      expect(getItemCategory("item_beast_fang")).toBe("material");
      expect(getItemCategory("item_boar_leather")).toBe("material");
      expect(getItemCategory("item_serpent_scale")).toBe("material");

      // Fallback for unknown
      expect(getItemCategory("unknown_xyz")).toBe("consumable");

      // Labels
      expect(getItemCategoryLabel("consumable")).toContain("ของใช้");
      expect(getItemCategoryLabel("equipment")).toContain("สวมใส่");
      expect(getItemCategoryLabel("material")).toContain("แมททีเรียล");
    });
  });

  describe("InventoryManager", () => {
    it("creates initial 20-slot inventory with starter items and 200 gold", () => {
      const inv = InventoryManager.createInitialInventory();
      expect(inv.slots.length).toBe(20);
      expect(inv.gold).toBe(200);

      expect(inv.slots[0]).toEqual({ itemId: "item_steamed_bun", quantity: 5 });
      expect(inv.slots[1]).toEqual({ itemId: "item_herbal_tea", quantity: 3 });
      expect(inv.slots[2]).toEqual({
        itemId: "item_phoenix_feather",
        quantity: 1,
      });
      expect(inv.slots[3]).toBeNull();
    });

    it("stacks items onto existing slots before occupying new slots", () => {
      let inv = InventoryManager.createInitialInventory();
      // Initially slot 0 has 5 steamed buns
      const res = InventoryManager.addItem(inv, "item_steamed_bun", 10);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[0]?.quantity).toBe(15);
      expect(res.inventory.slots[3]).toBeNull(); // Did not consume a new slot
    });

    it("occupies next available empty slot when adding new item", () => {
      let inv = InventoryManager.createInitialInventory();
      const res = InventoryManager.addItem(inv, "item_vitality_pill", 4);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[3]).toEqual({
        itemId: "item_vitality_pill",
        quantity: 4,
      });
    });

    it("returns error when inventory is completely full", () => {
      const fullSlots = new Array(20)
        .fill(null)
        .map(() => ({ itemId: "item_town_scroll", quantity: 99 }));
      const fullInv = { slots: fullSlots, gold: 50 };

      const res = InventoryManager.addItem(fullInv, "item_steamed_bun", 1);
      expect(res.success).toBe(false);
      expect(res.reason).toContain("full");
    });

    it("removes item quantity and frees slot when reaching 0", () => {
      let inv = InventoryManager.createInitialInventory();
      // slot 2 has 1 phoenix feather
      const res = InventoryManager.removeItem(inv, "item_phoenix_feather", 1);
      expect(res.success).toBe(true);
      expect(res.inventory.slots[2]).toBeNull();
    });

    it("heals living hero with Steamed Bun up to maxHp and consumes 1 item", () => {
      let inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(60, 100); // 60/100 HP

      const res = InventoryManager.useItemOnCombatant(
        inv,
        "item_steamed_bun",
        hero
      );
      expect(res.success).toBe(true);
      expect(res.target.hp).toBe(100); // 60 + 80 capped at 100
      expect(res.inventory.slots[0]?.quantity).toBe(4); // Was 5
    });

    it("restores SP with Herbal Tea and consumes 1 item", () => {
      let inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(100, 100, 10, 50); // 10/50 SP

      const res = InventoryManager.useItemOnCombatant(
        inv,
        "item_herbal_tea",
        hero
      );
      expect(res.success).toBe(true);
      expect(res.target.sp).toBe(50); // 10 + 50 capped at 50
      expect(res.inventory.slots[1]?.quantity).toBe(2); // Was 3
    });

    it("rejects healing when target is already at full HP", () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(100, 100);

      const res = InventoryManager.useItemOnCombatant(
        inv,
        "item_steamed_bun",
        hero
      );
      expect(res.success).toBe(false);
      expect(res.reason).toContain("full HP");
      expect(inv.slots[0]?.quantity).toBe(5); // Not consumed
    });

    it("rejects food when target is fainted", () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(0, 100);

      const res = InventoryManager.useItemOnCombatant(
        inv,
        "item_steamed_bun",
        hero
      );
      expect(res.success).toBe(false);
      expect(res.reason).toContain("fallen");
    });

    it("revives fallen target with Phoenix Feather", () => {
      const inv = InventoryManager.createInitialInventory();
      const hero = createMockHero(0, 150);

      const res = InventoryManager.useItemOnCombatant(
        inv,
        "item_phoenix_feather",
        hero
      );
      expect(res.success).toBe(true);
      expect(res.target.hp).toBe(100);
      expect(res.inventory.slots[2]).toBeNull(); // Was 1 feather, now 0
    });

    describe("Skill Tomes & Learning", () => {
      it("teaches a skill to combatant and consumes the tome", () => {
        let inv = InventoryManager.createInitialInventory();
        inv = InventoryManager.addItem(
          inv,
          "item_tome_healing_spring",
          1
        ).inventory;
        const hero = createMockHero();

        const res = InventoryManager.useItemOnCombatant(
          inv,
          "item_tome_healing_spring",
          hero
        );
        expect(res.success).toBe(true);
        expect(res.message).toContain("Healing Spring");
        expect(
          InventoryManager.hasItem(res.inventory, "item_tome_healing_spring", 1)
        ).toBe(false);
        expect(
          res.target.skillSlots?.some(
            (s) => s.skillId === "skill_healing_spring"
          )
        ).toBe(true);
      });

      it("rejects learning opposing element skill and does not consume tome", () => {
        let inv = InventoryManager.createInitialInventory();
        inv = InventoryManager.addItem(
          inv,
          "item_tome_rock_throw",
          1
        ).inventory;
        const waterHero = createMockHero(); // Water opposes Earth

        const res = InventoryManager.useItemOnCombatant(
          inv,
          "item_tome_rock_throw",
          waterHero
        );
        expect(res.success).toBe(false);
        expect(res.reason).toContain("opposing Earth energy");
        expect(
          InventoryManager.hasItem(res.inventory, "item_tome_rock_throw", 1)
        ).toBe(true);
      });

      it("teaches into a specific targetSlotIndex and overwrites non-signature slot", () => {
        let inv = InventoryManager.createInitialInventory();
        inv = InventoryManager.addItem(
          inv,
          "item_tome_frost_breath",
          1
        ).inventory;
        const hero = createMockHero();

        const res = InventoryManager.useItemOnCombatant(
          inv,
          "item_tome_frost_breath",
          hero,
          false,
          2
        );
        expect(res.success).toBe(true);
        expect(res.target.skillSlots?.[2].skillId).toBe("skill_frost_breath");
      });

      it("rejects overwriting an innate Signature slot and preserves tome", () => {
        let inv = InventoryManager.createInitialInventory();
        inv = InventoryManager.addItem(
          inv,
          "item_tome_frost_breath",
          1
        ).inventory;
        const hero = createMockHero(); // Slot 0 is hero's signature skill

        const res = InventoryManager.useItemOnCombatant(
          inv,
          "item_tome_frost_breath",
          hero,
          false,
          0
        );
        expect(res.success).toBe(false);
        expect(res.reason).toContain("Signature");
        expect(
          InventoryManager.hasItem(res.inventory, "item_tome_frost_breath", 1)
        ).toBe(true);
      });

      it("rejects learning duplicate skills", () => {
        let inv = InventoryManager.createInitialInventory();
        inv = InventoryManager.addItem(inv, "item_tome_aqua_jet", 1).inventory;
        const hero = createMockHero(); // Water hero already knows aqua_jet in starter slots

        const res = InventoryManager.useItemOnCombatant(
          inv,
          "item_tome_aqua_jet",
          hero
        );
        expect(res.success).toBe(false);
        expect(res.reason).toContain("already knows");
        expect(
          InventoryManager.hasItem(res.inventory, "item_tome_aqua_jet", 1)
        ).toBe(true);
      });
    });

    it("adds and subtracts gold accurately", () => {
      let inv = InventoryManager.createInitialInventory(); // 200 gold
      inv = InventoryManager.addGold(inv, 500);
      expect(inv.gold).toBe(700);
      inv = InventoryManager.addGold(inv, -1000);
      expect(inv.gold).toBe(0); // Floor at 0
    });

    describe("buyItem & sellItem", () => {
      it("successfully purchases items and deducts gold when funds and space are sufficient", () => {
        let inv = InventoryManager.createInitialInventory(); // 200 gold, bun(5), tea(3), feather(1)
        // Steamed Bun price: 20 G each. Buying 3 buns costs 60 G.
        const res = InventoryManager.buyItem(inv, "item_steamed_bun", 3);
        expect(res.success).toBe(true);
        expect(res.inventory.gold).toBe(140); // 200 - 60
        // Existing stack at slot 0 should increase from 5 to 8
        expect(res.inventory.slots[0]?.quantity).toBe(8);
      });

      it("rejects purchase when player does not have enough gold", () => {
        let inv = InventoryManager.createInitialInventory(); // 200 gold
        // Phoenix feather price: 150 G each. Buying 2 feathers costs 300 G > 200 G.
        const res = InventoryManager.buyItem(inv, "item_phoenix_feather", 2);
        expect(res.success).toBe(false);
        expect(res.reason).toContain("Not enough gold");
        expect(res.inventory.gold).toBe(200);
      });

      it("rejects purchase when inventory is full and cannot stack", () => {
        // Fill all 20 slots with max stack
        const fullSlots = new Array(20)
          .fill(null)
          .map(() => ({ itemId: "item_steamed_bun", quantity: 99 }));
        const fullInv = { slots: fullSlots, gold: 5000 };
        const res = InventoryManager.buyItem(fullInv, "item_herbal_tea", 1);
        expect(res.success).toBe(false);
        expect(res.reason).toContain("full");
        expect(res.inventory.gold).toBe(5000);
      });

      it("successfully sells items from inventory, adds gold at 50% price, and removes items", () => {
        let inv = InventoryManager.createInitialInventory(); // 200 gold, slots[0] is 5 buns (20 G each -> sell 10 G)
        const res = InventoryManager.sellItem(inv, 0, 2);
        expect(res.success).toBe(true);
        expect(res.goldEarned).toBe(20); // 2 * 10 G
        expect(res.inventory.gold).toBe(220); // 200 + 20
        expect(res.inventory.slots[0]?.quantity).toBe(3); // 5 - 2
      });

      it("clears slot to null when selling entire quantity", () => {
        let inv = InventoryManager.createInitialInventory(); // slots[2] is 1 feather (150 G -> sell 75 G)
        const res = InventoryManager.sellItem(inv, 2, 1);
        expect(res.success).toBe(true);
        expect(res.goldEarned).toBe(75);
        expect(res.inventory.gold).toBe(275);
        expect(res.inventory.slots[2]).toBeNull();
      });

      it("rejects selling from empty slot or invalid quantity", () => {
        let inv = InventoryManager.createInitialInventory();
        const resEmpty = InventoryManager.sellItem(inv, 10, 1); // slot 10 is null
        expect(resEmpty.success).toBe(false);

        const resExcess = InventoryManager.sellItem(inv, 0, 99); // slot 0 has 5, trying to sell 99
        expect(resExcess.success).toBe(false);
      });
    });
  });

  describe("LootEngine", () => {
    it("calculates gold reward based on defeated enemy level", () => {
      const enemies: Combatant[] = [
        createMockHero(0, 50), // Level 5
        createMockHero(0, 50), // Level 5
      ];
      // Deterministic random always returning 0.5 (level * 25)
      const loot = LootEngine.calculateLoot(enemies, () => 0.5);
      expect(loot.gold).toBe(250); // (5 * 25) + (5 * 25)
    });

    it("drops items when drop roll succeeds", () => {
      const enemies: Combatant[] = [createMockHero(0, 50)];
      // Deterministic sequence:
      // 1. gold roll: 0.5 -> 25
      // 2. drop roll: 0.1 (< 0.45 -> success!)
      // 3. item roll: 0.2 (< 0.50 -> item_steamed_bun)
      const sequence = [0.5, 0.1, 0.2];
      let i = 0;
      const loot = LootEngine.calculateLoot(
        enemies,
        () => sequence[i++ % sequence.length]
      );

      expect(loot.droppedItems.length).toBe(1);
      expect(loot.droppedItems[0]).toEqual({
        itemId: "item_steamed_bun",
        quantity: 1,
      });
    });
  });
});
