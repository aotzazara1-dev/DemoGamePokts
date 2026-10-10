// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CharacterModalController } from "../src/ui/CharacterModalController.js";
import { EquipmentModalController } from "../src/ui/EquipmentModalController.js";
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
      <!-- Character Status Modal [C] -->
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
        <button id="btn-character-status"></button>
        <button id="btn-close-char-modal"></button>
        <button id="btn-close-char-bottom"></button>
      </div>

      <!-- Dedicated Equipment Modal [E] -->
      <div id="equipment-modal" class="modal">
        <button id="btn-equipment"></button>
        <button id="header-btn-equipment"></button>
        <button id="btn-close-equipment-modal"></button>
        <button id="btn-close-equipment-bottom"></button>
        <div id="eq-unit-list"></div>
        <div id="eq-selected-title"></div>
        <div id="eq-selected-stats"></div>
        <div id="eq-slots-container"></div>
        <div id="eq-bag-list"></div>
      </div>

      <!-- Roster Modal [B/F] -->
      <div id="roster-modal" class="modal">
        <button id="btn-roster-formation"></button>
        <button id="btn-close-roster-modal"></button>
        <button id="btn-close-roster-bottom"></button>
        <div id="beast-list-container"></div>
        <div id="formation-grid"></div>
        <button id="btn-select-hero"></button>
        <button id="btn-select-beast"></button>
      </div>

      <!-- Inventory Modal [I] -->
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

  describe("CharacterModalController Status View [C]", () => {
    it("renders hero stats and bonus indicators cleanly without paperdoll slots", () => {
      sampleHero.equipment = {
        weapon: "weapon_bronze_gladius",
        head: "head_iron_circlet",
      };
      sampleHero = EquipmentManager.applyEquipmentToCombatant(
        sampleHero,
        sampleHero.equipment
      );

      const controller = new CharacterModalController(sampleHero);
      controller.toggle(true);

      // Stat label should display (+bonus)
      const atkEl = document.getElementById("val-atk");
      expect(atkEl?.innerHTML).toContain("(+12)");

      const defEl = document.getElementById("val-def");
      expect(defEl?.innerHTML).toContain("(+8)");
    });
  });

  describe("EquipmentModalController [E]", () => {
    it("renders 5 empty paperdoll slots when hero has no equipment", () => {
      const controller = new EquipmentModalController(
        sampleHero,
        sampleRoster,
        sampleInventory
      );
      controller.toggle(true);

      const slots = document.querySelectorAll(
        "#eq-slots-container .eq-slot-card"
      );
      expect(slots.length).toBe(5);
      slots.forEach((slot) => {
        expect(slot.classList.contains("empty")).toBe(true);
        expect(slot.textContent).toContain("ช่องว่าง");
      });
    });

    it("renders equipped slots and triggers onUnequipItem for Hero", () => {
      const onUnequipItem = vi.fn();
      sampleHero.equipment = {
        weapon: "weapon_bronze_gladius",
        head: "head_iron_circlet",
      };
      sampleHero = EquipmentManager.applyEquipmentToCombatant(
        sampleHero,
        sampleHero.equipment
      );

      const controller = new EquipmentModalController(
        sampleHero,
        sampleRoster,
        sampleInventory,
        { onUnequipItem }
      );
      controller.toggle(true);

      const weaponCard = document.querySelector(
        '#eq-slots-container .eq-slot-card[data-slot="weapon"]'
      );
      expect(weaponCard).not.toBeNull();
      expect(weaponCard?.classList.contains("equipped")).toBe(true);
      expect(weaponCard?.textContent).toContain("Bronze Gladius");

      // Click to unequip weapon
      const unequipBtn = weaponCard?.querySelector(
        ".btn-eq-unequip"
      ) as HTMLButtonElement;
      expect(unequipBtn).not.toBeNull();
      unequipBtn.click();

      expect(onUnequipItem).toHaveBeenCalledWith("hero", undefined, "weapon");
    });

    it("switches to champion and allows equipping/unequipping for champion", () => {
      const onUnequipItem = vi.fn();
      const onEquipItem = vi.fn();

      const champion = sampleRoster.beasts[0];
      champion.equipment = {
        accessory: "acc_draupnir_ring",
      };
      sampleRoster.beasts[0] = EquipmentManager.applyEquipmentToCombatant(
        champion,
        champion.equipment
      );

      const controller = new EquipmentModalController(
        sampleHero,
        sampleRoster,
        sampleInventory,
        { onUnequipItem, onEquipItem }
      );
      controller.toggle(true);

      // Select Champion in unit list
      const unitCards = document.querySelectorAll(
        "#eq-unit-list .eq-unit-card"
      );
      expect(unitCards.length).toBe(2);
      (unitCards[1] as HTMLElement).click();

      // Check header title changed to Lu Bu
      const titleEl = document.getElementById("eq-selected-title");
      expect(titleEl?.textContent).toContain("Lu Bu");

      // Check champion's equipped accessory
      const accCard = document.querySelector(
        '#eq-slots-container .eq-slot-card[data-slot="accessory"]'
      );
      expect(accCard?.classList.contains("equipped")).toBe(true);
      expect(accCard?.textContent).toContain("Draupnir");

      // Click unequip on champion
      const unequipBtn = accCard?.querySelector(
        ".btn-eq-unequip"
      ) as HTMLButtonElement;
      unequipBtn.click();
      expect(onUnequipItem).toHaveBeenCalledWith(
        "champion",
        "beast_lubu",
        "accessory"
      );

      // Equip item from quick bag to champion
      const bagItems = document.querySelectorAll("#eq-bag-list .eq-bag-item");
      expect(bagItems.length).toBe(2);
      const equipBtn = bagItems[0].querySelector(
        ".btn-eq-action"
      ) as HTMLButtonElement;
      equipBtn.click();
      expect(onEquipItem).toHaveBeenCalledWith(
        "weapon_bronze_gladius",
        "champion",
        "beast_lubu"
      );
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
