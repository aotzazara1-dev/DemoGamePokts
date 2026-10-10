// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CharacterModalController } from "../src/ui/CharacterModalController.js";
import { RosterModalController } from "../src/ui/RosterModalController.js";
import { InventoryModalController } from "../src/ui/InventoryModalController.js";
import {
  type Combatant,
  type PlayerRosterState,
  type InventoryState,
  EquipmentManager,
} from "@poktsonline/shared";

describe("Equipment UI Controllers", () => {
  let sampleHero: Combatant;
  let sampleRoster: PlayerRosterState;
  let sampleInventory: InventoryState;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="character-modal" class="modal">
        <div id="hero-quick-info"></div>
        <div id="char-name"></div>
        <div id="char-element"></div>
        <div id="char-level"></div>
        <div id="char-exp-bar"></div>
        <div id="char-exp-text"></div>
        <div id="char-hp"></div>
        <div id="char-sp"></div>
        <div id="char-stat-pts"></div>
        <div id="val-atk"></div>
        <div id="val-def"></div>
        <div id="val-int"></div>
        <div id="val-agi"></div>
        <div id="val-hp"></div>
        <div id="val-sp"></div>
        <div id="hero-equipment-slots"></div>
        <button id="btn-character-status"></button>
        <button id="btn-close-char-modal"></button>
        <button id="btn-close-char-bottom"></button>
      </div>

      <div id="roster-modal" class="modal">
        <button id="btn-roster-formation"></button>
        <button id="btn-close-roster-modal"></button>
        <button id="btn-close-roster-bottom"></button>
        <div id="beast-list-container"></div>
        <div id="formation-grid"></div>
        <button id="btn-select-hero"></button>
        <button id="btn-select-beast"></button>
      </div>

      <div id="inventory-modal" class="modal">
        <button id="btn-inventory"></button>
        <div id="inv-grid-container"></div>
        <div id="inv-inspector-empty"></div>
        <div id="inv-inspector-details" style="display: none;">
          <span id="inv-detail-icon"></span>
          <span id="inv-detail-name"></span>
          <span id="inv-detail-badge"></span>
          <span id="inv-detail-desc"></span>
          <span id="inv-detail-price"></span>
          <span id="inv-detail-qty"></span>
          <span id="inv-hero-hp-label"></span>
          <span id="inv-beast-hp-label"></span>
          <span id="inv-hero-equip-label"></span>
          <span id="inv-beast-equip-label"></span>
          <div id="inv-target-title"></div>
          <button id="btn-use-item-scroll"></button>
          <button id="btn-use-item-hero"></button>
          <button id="btn-use-item-beast"></button>
          <button id="btn-equip-item-hero"></button>
          <button id="btn-equip-item-beast"></button>
          <button id="btn-drop-item"></button>
          <div id="inv-feedback-msg"></div>
        </div>
      </div>
    `;

    sampleHero = {
      id: "hero_1",
      name: "Li Xiao Long",
      level: 10,
      exp: 120,
      maxExp: 1000,
      hp: 150,
      maxHp: 150,
      sp: 50,
      maxSp: 50,
      element: "fire",
      baseAtk: 20,
      baseDef: 15,
      baseInt: 10,
      baseAgi: 12,
      atk: 20,
      def: 15,
      int: 10,
      agi: 12,
      statPoints: 5,
      equipment: EquipmentManager.createEmptyEquipment(),
    };

    const sampleChampion: Combatant = {
      id: "beast_lubu",
      name: "Lu Bu (ลิโป้)",
      level: 10,
      exp: 0,
      maxExp: 1000,
      hp: 200,
      maxHp: 200,
      sp: 60,
      maxSp: 60,
      element: "fire",
      baseAtk: 30,
      baseDef: 20,
      baseInt: 8,
      baseAgi: 15,
      atk: 30,
      def: 20,
      int: 8,
      agi: 15,
      equipment: EquipmentManager.createEmptyEquipment(),
    };

    sampleRoster = {
      hero: sampleHero,
      beasts: [sampleChampion],
      activeBeastId: "beast_lubu",
      formation: {
        heroPosition: { row: 1, col: 0 },
        beastPositions: {
          beast_lubu: { row: 0, col: 0 },
        },
      },
    };

    sampleInventory = {
      slots: [
        { itemId: "weapon_bronze_gladius", quantity: 1 },
        { itemId: "acc_draupnir_ring", quantity: 1 },
      ],
      gold: 500,
    };
  });

  describe("CharacterModalController Paperdoll", () => {
    it("renders 5 empty paperdoll slots when hero has no equipment", () => {
      const controller = new CharacterModalController(sampleHero);
      controller.toggle(true);

      const slots = document.querySelectorAll(
        "#hero-equipment-slots .paperdoll-slot"
      );
      expect(slots.length).toBe(5);
      slots.forEach((slot) => {
        expect(slot.classList.contains("empty")).toBe(true);
        expect(slot.textContent).toContain("[Empty]");
      });
    });

    it("renders equipped slots and triggers onUnequipItem callback on click", () => {
      const onUnequipItem = vi.fn();
      sampleHero.equipment = {
        weapon: "weapon_bronze_gladius",
        head: "head_iron_circlet",
      };
      // Effective stats with weapon_bronze_gladius (+12 ATK) & head_iron_circlet (+8 DEF, +15 Max SP)
      sampleHero = EquipmentManager.applyEquipmentToCombatant(
        sampleHero,
        sampleHero.equipment
      );

      const controller = new CharacterModalController(sampleHero, {
        onUnequipItem,
      });
      controller.toggle(true);

      const weaponSlot = document.querySelector(
        '#hero-equipment-slots .paperdoll-slot[data-slot="weapon"]'
      );
      expect(weaponSlot).not.toBeNull();
      expect(weaponSlot?.classList.contains("equipped")).toBe(true);
      expect(weaponSlot?.textContent).toContain("Bronze Gladius");

      // Click to unequip weapon
      (weaponSlot as HTMLElement).click();
      expect(onUnequipItem).toHaveBeenCalledWith("weapon");

      // Stat label should display (+bonus)
      const atkEl = document.getElementById("val-atk");
      expect(atkEl?.innerHTML).toContain("(+12)");
    });
  });

  describe("RosterModalController Paperdoll", () => {
    it("renders champion equipment slots and triggers onUnequipChampionItem", () => {
      const onUnequipChampionItem = vi.fn();
      const champion = sampleRoster.beasts[0];
      champion.equipment = {
        accessory: "acc_draupnir_ring",
      };
      sampleRoster.beasts[0] = EquipmentManager.applyEquipmentToCombatant(
        champion,
        champion.equipment
      );

      const controller = new RosterModalController(sampleRoster, {
        onUnequipChampionItem,
      });
      controller.toggle(true);

      const beastCard = document.querySelector(
        "#beast-list-container .beast-item"
      );
      expect(beastCard).not.toBeNull();

      const ringSlot = beastCard?.querySelector(".btn-beast-slot.equipped");
      expect(ringSlot).not.toBeNull();
      expect(ringSlot?.textContent).toContain("Draupnir");

      (ringSlot as HTMLElement).click();
      expect(onUnequipChampionItem).toHaveBeenCalledWith(
        "beast_lubu",
        "accessory"
      );
    });
  });

  describe("InventoryModalController Equipment Flow", () => {
    it("switches inspector to equipment mode and triggers onEquipItem for Hero and Champion", () => {
      const onEquipItem = vi.fn();
      const activeChampion = sampleRoster.beasts[0];

      const controller = new InventoryModalController(
        sampleInventory,
        sampleHero,
        activeChampion,
        { onEquipItem }
      );
      controller.toggle(true);

      // Click first inventory slot (weapon_bronze_gladius)
      const slots = document.querySelectorAll("#inv-grid-container .inv-slot");
      expect(slots.length).toBeGreaterThan(0);
      (slots[0] as HTMLElement).click();

      // Check Equip buttons are visible and labels populated
      const btnEquipHero = document.getElementById(
        "btn-equip-item-hero"
      ) as HTMLButtonElement;
      const btnEquipBeast = document.getElementById(
        "btn-equip-item-beast"
      ) as HTMLButtonElement;
      const targetTitle = document.getElementById("inv-target-title");

      expect(targetTitle?.textContent).toContain("Equip Target");
      expect(btnEquipHero.style.display).toBe("flex");
      expect(btnEquipBeast.style.display).toBe("flex");

      // Click equip on Hero
      btnEquipHero.click();
      expect(onEquipItem).toHaveBeenCalledWith(
        "weapon_bronze_gladius",
        "hero",
        undefined
      );

      // Click equip on Champion
      btnEquipBeast.click();
      expect(onEquipItem).toHaveBeenCalledWith(
        "weapon_bronze_gladius",
        "champion",
        "beast_lubu"
      );
    });
  });
});
