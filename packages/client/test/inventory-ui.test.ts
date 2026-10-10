// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { InventoryModalController } from "../src/ui/InventoryModalController.js";
import {
  type Combatant,
  type InventoryState,
  Element,
} from "@poktsonline/shared";

describe("InventoryModalController Category Tabs & Filtering", () => {
  let sampleHero: Combatant;
  let sampleInventory: InventoryState;
  let controller: InventoryModalController;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="btn-inventory"></button>
      <button id="btn-quick-inventory"></button>
      <button id="header-btn-inventory"></button>

      <div id="inventory-modal">
        <button id="btn-close-inv-modal"></button>
        <button id="btn-close-inv-bottom"></button>

        <div class="inventory-category-tabs">
          <button type="button" class="inv-tab-btn active" data-category="all">
            <span>All</span>
            <span class="inv-tab-count">(0)</span>
          </button>
          <button type="button" class="inv-tab-btn" data-category="consumable">
            <span>Consumables</span>
            <span class="inv-tab-count">(0)</span>
          </button>
          <button type="button" class="inv-tab-btn" data-category="equipment">
            <span>Equipment</span>
            <span class="inv-tab-count">(0)</span>
          </button>
          <button type="button" class="inv-tab-btn" data-category="material">
            <span>Materials</span>
            <span class="inv-tab-count">(0)</span>
          </button>
        </div>

        <span id="inv-capacity-header"></span>
        <div id="inv-grid-container"></div>
        <span id="inv-gold-val"></span>

        <div id="inv-inspector-empty"></div>
        <div id="inv-inspector-details" style="display: none;">
          <div id="inv-detail-icon"></div>
          <div id="inv-detail-name"></div>
          <span id="inv-detail-cat-badge"></span>
          <span id="inv-detail-badge"></span>
          <div id="inv-detail-desc"></div>
          <span id="inv-detail-price"></span>
          <span id="inv-detail-qty"></span>

          <span id="inv-hero-hp-label"></span>
          <span id="inv-beast-hp-label"></span>
          <div id="inv-target-title"></div>

          <button id="btn-use-item-scroll"></button>
          <button id="btn-use-item-hero"></button>
          <button id="btn-use-item-beast"></button>
          <button id="btn-equip-item-hero"></button>
          <button id="btn-equip-item-beast"></button>
          <button id="btn-drop-item"></button>
        </div>

        <div id="inv-feedback-msg"></div>
      </div>
    `;

    sampleHero = {
      id: "hero_1",
      name: "Guan Ping",
      isHero: true,
      level: 10,
      element: Element.Water,
      hp: 120,
      maxHp: 150,
      sp: 40,
      maxSp: 60,
      atk: 45,
      def: 25,
      int: 20,
      agi: 18,
    };

    // 20-slot inventory with a mix of items
    sampleInventory = {
      gold: 500,
      slots: [
        { itemId: "item_steamed_bun", quantity: 5 }, // consumable
        { itemId: "weapon_sky_piercer", quantity: 1 }, // equipment
        { itemId: "item_beast_fang", quantity: 3 }, // material
        { itemId: "item_herbal_tea", quantity: 2 }, // consumable
        { itemId: "armor_valhalla_plate", quantity: 1 }, // equipment
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    };

    controller = new InventoryModalController(sampleInventory, sampleHero);
  });

  it("calculates accurate category counts across categories", () => {
    const counts = controller.getCategoryCounts();
    expect(counts.all).toBe(5);
    expect(counts.consumable).toBe(2); // bun + herbal tea
    expect(counts.equipment).toBe(2); // sky piercer + valhalla plate
    expect(counts.material).toBe(1); // beast fang
  });

  it("updates category tab badges with correct numbers", () => {
    controller.updateHeaderBadge();
    const countSpans = document.querySelectorAll(".inv-tab-count");
    expect(countSpans[0].textContent).toBe("(5)"); // all
    expect(countSpans[1].textContent).toBe("(2)"); // consumable
    expect(countSpans[2].textContent).toBe("(2)"); // equipment
    expect(countSpans[3].textContent).toBe("(1)"); // material
  });

  it("renders all 20 slots by default when active category is 'all'", () => {
    controller.toggle(true);
    const slots = document.querySelectorAll(".inv-slot");
    expect(slots.length).toBe(20);

    // Slot 0 has bun, Slot 1 has spear, Slot 2 has fang
    expect(slots[0].classList.contains("cat-consumable")).toBe(true);
    expect(slots[1].classList.contains("cat-equipment")).toBe(true);
    expect(slots[2].classList.contains("cat-material")).toBe(true);
    expect(slots[5].classList.contains("empty")).toBe(true);
  });

  it("filters and gathers matching items when switching to 'consumable'", () => {
    controller.toggle(true);
    controller.setCategory("consumable");
    expect(controller.getActiveCategory()).toBe("consumable");

    const header = document.getElementById("inv-capacity-header");
    expect(header?.innerText).toContain("2 ชิ้น");

    // Matching items (bun, tea) are placed at the beginning with #slot badge
    const slots = document.querySelectorAll(".inv-slot");
    expect(slots[0].classList.contains("cat-consumable")).toBe(true);
    expect(slots[0].querySelector(".inv-slot-num-badge")?.textContent).toBe(
      "#1"
    );
    expect(slots[1].classList.contains("cat-consumable")).toBe(true);
    expect(slots[1].querySelector(".inv-slot-num-badge")?.textContent).toBe(
      "#4"
    );

    // Other non-matching items are not rendered in this view
    expect(document.querySelector(".cat-equipment")).toBeNull();
    expect(document.querySelector(".cat-material")).toBeNull();
  });

  it("shows an empty state notice when category has 0 items", () => {
    // Inventory with 0 materials
    const noMatInventory: InventoryState = {
      gold: 100,
      slots: [
        { itemId: "item_steamed_bun", quantity: 1 },
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    };
    controller.setInventory(noMatInventory);
    controller.toggle(true);
    controller.setCategory("material");

    const emptyNotice = document.querySelector(".inv-category-empty");
    expect(emptyNotice).not.toBeNull();
    expect(emptyNotice?.textContent).toContain("ไม่มีไอเทมในหมวด");
  });

  it("displays category badge in inspector and handles material inspector view", () => {
    controller.toggle(true);
    // Click on Slot 2 (beast fang - material) in 'all' view
    const slots = document.querySelectorAll<HTMLElement>(".inv-slot");
    slots[2].click();

    const inspector = document.getElementById("inv-inspector-details");
    expect(inspector?.style.display).toBe("flex");

    const catBadge = document.getElementById("inv-detail-cat-badge");
    expect(catBadge?.textContent).toContain("แมททีเรียล");
    expect(catBadge?.classList.contains("badge-cat-material")).toBe(true);

    const targetTitle = document.getElementById("inv-target-title");
    expect(targetTitle?.textContent).toContain("วัตถุดิบ");
  });

  it("resets selection when switching to a category that doesn't contain the selected item", () => {
    controller.toggle(true);
    // Select Slot 1 (equipment) in 'all' view
    const slots = document.querySelectorAll<HTMLElement>(".inv-slot");
    slots[1].click();
    expect(
      document.getElementById("inv-inspector-details")?.style.display
    ).toBe("flex");

    // Switch to 'consumable' category
    controller.setCategory("consumable");
    // Since selected item is equipment, inspector should reset to empty box
    expect(
      document.getElementById("inv-inspector-details")?.style.display
    ).toBe("none");
    expect(document.getElementById("inv-inspector-empty")?.style.display).toBe(
      "flex"
    );
  });

  it("clicking category tab button triggers category change", () => {
    controller.toggle(true);
    const tabEquipment = document.querySelector<HTMLButtonElement>(
      '.inv-tab-btn[data-category="equipment"]'
    );
    expect(tabEquipment).not.toBeNull();
    tabEquipment?.click();

    expect(controller.getActiveCategory()).toBe("equipment");
    expect(tabEquipment?.classList.contains("active")).toBe(true);
  });

  it("handles Skill Tome inspection displaying hero/beast targets and learns skill without town teleport", () => {
    const onWarpTown = vi.fn();
    const tomeInventory: InventoryState = {
      gold: 100,
      slots: [
        { itemId: "item_tome_aqua_jet", quantity: 1 },
        ...new Array(19).fill(null),
      ],
    };
    const testController = new InventoryModalController(
      tomeInventory,
      sampleHero,
      { onWarpTown }
    );
    testController.toggle(true);

    const slot0 = document.querySelector<HTMLElement>(".inv-slot");
    slot0?.click();

    const targetTitle = document.getElementById("inv-target-title");
    expect(targetTitle?.textContent).toContain("เรียนรู้วิชา");

    const btnScroll = document.getElementById("btn-use-item-scroll");
    expect(btnScroll?.style.display).toBe("none");

    const btnHero = document.getElementById(
      "btn-use-item-hero"
    ) as HTMLButtonElement;
    expect(btnHero?.style.display).toBe("flex");

    // Click use on hero
    btnHero?.click();
    expect(onWarpTown).not.toHaveBeenCalled();
  });
});
