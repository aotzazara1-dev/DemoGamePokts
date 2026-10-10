import { describe, it, expect } from "vitest";
import {
  ITEM_DATABASE,
  getItemDefinition,
  getItemIcon,
} from "../src/inventory/item-database.js";
import {
  type EquipmentSlot,
  type Attributes,
  type InventoryState,
  Element,
} from "../src/types.js";
import { EquipmentManager } from "../src/equipment/equipment-manager.js";
import { InventoryManager } from "../src/inventory/inventory-manager.js";

describe("Equipment Types and Catalog", () => {
  it("defines equipment items for all 5 equipment slots", () => {
    const slots: EquipmentSlot[] = [
      "weapon",
      "head",
      "armor",
      "boots",
      "accessory",
    ];
    const foundSlots = new Set<EquipmentSlot>();

    Object.values(ITEM_DATABASE).forEach((item) => {
      if (item.type === "equipment" && item.slot) {
        foundSlots.add(item.slot);
      }
    });

    slots.forEach((slot) => {
      expect(
        foundSlots.has(slot),
        `Expected item catalog to include slot: ${slot}`
      ).toBe(true);
    });
  });

  it("correctly retrieves equipment items and verifies stats", () => {
    const skyPiercer = getItemDefinition("weapon_sky_piercer");
    expect(skyPiercer).toBeDefined();
    expect(skyPiercer?.type).toBe("equipment");
    expect(skyPiercer?.slot).toBe("weapon");
    expect(skyPiercer?.stats?.atk).toBe(26);
    expect(skyPiercer?.stats?.agi).toBe(6);
    expect(skyPiercer?.requiredLevel).toBe(4);

    const hermes = getItemDefinition("boots_hermes_sandals");
    expect(hermes?.slot).toBe("boots");
    expect(hermes?.stats?.agi).toBe(16);

    const draupnir = getItemDefinition("acc_draupnir_ring");
    expect(draupnir?.slot).toBe("accessory");
    expect(draupnir?.stats?.atk).toBe(8);
    expect(draupnir?.stats?.def).toBe(8);
  });

  it("returns distinct emojis for equipment slot icons", () => {
    expect(getItemIcon("weapon_sky_piercer")).toBe("⚔️");
    expect(getItemIcon("head_valkyrie_winged_helm")).toBe("🪖");
    expect(getItemIcon("armor_valhalla_plate")).toBe("🛡️");
    expect(getItemIcon("boots_hermes_sandals")).toBe("👢");
    expect(getItemIcon("acc_draupnir_ring")).toBe("💍");
  });
});

describe("EquipmentManager", () => {
  const baseStats: Attributes = {
    hp: 100,
    maxHp: 100,
    sp: 40,
    maxSp: 40,
    atk: 25,
    def: 15,
    int: 10,
    agi: 20,
  };

  it("creates empty equipment state for all 5 slots", () => {
    const eq = EquipmentManager.createEmptyEquipment();
    expect(eq.weapon).toBeNull();
    expect(eq.head).toBeNull();
    expect(eq.armor).toBeNull();
    expect(eq.boots).toBeNull();
    expect(eq.accessory).toBeNull();
  });

  it("calculates effective attributes by summing base stats and gear bonuses", () => {
    const eq = EquipmentManager.createEmptyEquipment();
    eq.weapon = "weapon_bronze_gladius"; // +12 ATK
    eq.head = "head_iron_circlet"; // +8 DEF, +15 Max SP
    eq.boots = "boots_leather_boots"; // +6 AGI, +4 DEF

    const effective = EquipmentManager.calculateEffectiveAttributes(
      baseStats,
      eq
    );
    expect(effective.atk).toBe(25 + 12);
    expect(effective.def).toBe(15 + 8 + 4);
    expect(effective.agi).toBe(20 + 6);
    expect(effective.maxSp).toBe(40 + 15);
    expect(effective.maxHp).toBe(100);
  });

  it("checks level requirements when equipping items", () => {
    const highLevelWeapon = getItemDefinition("weapon_sky_piercer")!; // Req Lv 4
    expect(EquipmentManager.canEquip(highLevelWeapon, 2).canEquip).toBe(false);
    expect(EquipmentManager.canEquip(highLevelWeapon, 5).canEquip).toBe(true);
  });

  it("equips an item into an empty slot and removes from inventory", () => {
    let inv = InventoryManager.createInitialInventory();
    inv = InventoryManager.addItem(inv, "weapon_bronze_gladius", 1).inventory;
    expect(InventoryManager.hasItem(inv, "weapon_bronze_gladius", 1)).toBe(
      true
    );

    const eq = EquipmentManager.createEmptyEquipment();
    const result = EquipmentManager.equipItem(
      inv,
      eq,
      "weapon_bronze_gladius",
      1
    );

    expect(result.success).toBe(true);
    expect(result.equipment.weapon).toBe("weapon_bronze_gladius");
    expect(result.swappedItemId).toBeNull();
    expect(
      InventoryManager.hasItem(result.inventory, "weapon_bronze_gladius", 1)
    ).toBe(false);
  });

  it("swaps previous gear back to inventory when slot is already occupied", () => {
    let inv = InventoryManager.createInitialInventory();
    inv = InventoryManager.addItem(inv, "weapon_bronze_gladius", 1).inventory;
    inv = InventoryManager.addItem(inv, "weapon_monohoshizao", 1).inventory;

    // First equip bronze gladius
    let eq = EquipmentManager.createEmptyEquipment();
    const res1 = EquipmentManager.equipItem(
      inv,
      eq,
      "weapon_bronze_gladius",
      1
    );
    eq = res1.equipment;
    inv = res1.inventory;

    // Now equip monohoshizao (Lv 4)
    const res2 = EquipmentManager.equipItem(inv, eq, "weapon_monohoshizao", 5);
    expect(res2.success).toBe(true);
    expect(res2.equipment.weapon).toBe("weapon_monohoshizao");
    expect(res2.swappedItemId).toBe("weapon_bronze_gladius");

    // Bronze gladius should be returned to inventory
    expect(
      InventoryManager.hasItem(res2.inventory, "weapon_bronze_gladius", 1)
    ).toBe(true);
    expect(
      InventoryManager.hasItem(res2.inventory, "weapon_monohoshizao", 1)
    ).toBe(false);
  });

  it("unequips gear back into inventory", () => {
    let inv = InventoryManager.createInitialInventory();
    const eq = EquipmentManager.createEmptyEquipment();
    eq.head = "head_iron_circlet";

    const result = EquipmentManager.unequipItem(inv, eq, "head");
    expect(result.success).toBe(true);
    expect(result.equipment.head).toBeNull();
    expect(result.unequippedItemId).toBe("head_iron_circlet");
    expect(
      InventoryManager.hasItem(result.inventory, "head_iron_circlet", 1)
    ).toBe(true);
  });

  it("fails to unequip when inventory is completely full", () => {
    // Fill all 20 slots
    const slots = new Array(20).fill(null).map((_, i) => ({
      itemId: `item_filler_${i}`,
      quantity: 1,
    }));
    const fullInv: InventoryState = { slots, gold: 100 };

    const eq = EquipmentManager.createEmptyEquipment();
    eq.armor = "armor_valhalla_plate";

    const result = EquipmentManager.unequipItem(fullInv, eq, "armor");
    expect(result.success).toBe(false);
    expect(result.equipment.armor).toBe("armor_valhalla_plate");
    expect(result.reason).toContain("full");
  });

  it("applies equipment to a Combatant preserving base stats", () => {
    const combatant = {
      id: "c1",
      name: "Lu Bu",
      isHero: false,
      level: 5,
      element: Element.Fire,
      ...baseStats,
    };

    const eq = EquipmentManager.createEmptyEquipment();
    eq.weapon = "weapon_sky_piercer"; // +26 ATK, +6 AGI

    const updated = EquipmentManager.applyEquipmentToCombatant(combatant, eq);
    expect(updated.atk).toBe(25 + 26);
    expect(updated.agi).toBe(20 + 6);
    expect(updated.baseAttributes?.atk).toBe(25);
    expect(updated.equipment?.weapon).toBe("weapon_sky_piercer");
  });
});
