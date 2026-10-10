// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { WarehouseModalController } from "../src/ui/WarehouseModalController.js";
import { InnStorageModalController } from "../src/ui/InnStorageModalController.js";
import {
  InventoryState,
  WarehouseState,
  PlayerRosterState,
  InnStorageState,
  WarehouseManager,
  InnStorageManager,
  InventoryManager,
  Element,
  Combatant,
} from "@poktsonline/shared";

describe("WarehouseModalController", () => {
  let inventory: InventoryState;
  let warehouse: WarehouseState;
  let controller: WarehouseModalController;
  let onInventoryUpdatedMock: ReturnType<typeof vi.fn>;
  let onWarehouseUpdatedMock: ReturnType<typeof vi.fn>;
  let onShowToastMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="warehouse-modal">
        <button id="btn-close-warehouse-modal"></button>
        <button id="btn-close-warehouse-bottom"></button>

        <div id="wh-inv-capacity"></div>
        <div id="wh-inv-gold-val"></div>
        <button id="btn-deposit-gold"></button>
        <div id="wh-inv-grid"></div>

        <div id="wh-selected-icon"></div>
        <div id="wh-selected-name"></div>
        <div id="wh-selected-desc"></div>
        <input id="wh-transfer-qty" type="number" value="1" />
        <button id="wh-qty-max-btn"></button>
        <button id="btn-transfer-to-warehouse"></button>
        <button id="btn-transfer-to-inventory"></button>

        <div id="wh-storage-capacity"></div>
        <div id="wh-storage-gold-val"></div>
        <button id="btn-withdraw-gold"></button>
        <div id="wh-storage-grid"></div>

        <div id="wh-gold-dialog" style="display: none;">
          <h3 id="wh-gold-dialog-title"></h3>
          <p id="wh-gold-dialog-desc"></p>
          <input id="wh-gold-input" type="number" />
          <button id="wh-gold-max-btn"></button>
          <button id="btn-wh-gold-cancel"></button>
          <button id="btn-wh-gold-confirm"></button>
        </div>
      </div>
    `;

    inventory = InventoryManager.createInitialInventory();
    inventory.slots.fill(null);
    inventory.gold = 500;
    // Add 10 Small Herbs
    inventory.slots[0] = { itemId: "item_small_herb", quantity: 10 };

    warehouse = WarehouseManager.createInitialWarehouse();
    warehouse.gold = 1000;
    // Add 5 Ginseng in warehouse slot 0
    warehouse.slots[0] = { itemId: "item_ginseng", quantity: 5 };

    onInventoryUpdatedMock = vi.fn();
    onWarehouseUpdatedMock = vi.fn();
    onShowToastMock = vi.fn();

    controller = new WarehouseModalController(inventory, warehouse, {
      onInventoryUpdated: onInventoryUpdatedMock,
      onWarehouseUpdated: onWarehouseUpdatedMock,
      onShowToast: onShowToastMock,
    });
  });

  it("opens and renders capacities, gold, and item grids", () => {
    controller.open();
    expect(controller.isOpen()).toBe(true);

    const invCap = document.getElementById("wh-inv-capacity");
    expect(invCap?.textContent).toBe("1 / 20");

    const whCap = document.getElementById("wh-storage-capacity");
    expect(whCap?.textContent).toBe("1 / 40");

    const invGold = document.getElementById("wh-inv-gold-val");
    expect(invGold?.textContent).toContain("500");

    const whGold = document.getElementById("wh-storage-gold-val");
    expect(whGold?.textContent).toContain("1,000");

    const invGrid = document.getElementById("wh-inv-grid");
    const invSlots = invGrid?.querySelectorAll(".wh-slot");
    expect(invSlots?.length).toBe(20);

    const whGrid = document.getElementById("wh-storage-grid");
    const whSlots = whGrid?.querySelectorAll(".wh-slot");
    expect(whSlots?.length).toBe(40);
  });

  it("selects slot in inventory and deposits item into warehouse", () => {
    controller.open();

    const invGrid = document.getElementById("wh-inv-grid");
    const firstSlot = invGrid?.querySelectorAll(".wh-slot")[0] as HTMLElement;
    expect(firstSlot).toBeDefined();

    firstSlot.click();

    const selectedName = document.getElementById("wh-selected-name");
    expect(selectedName?.textContent).toContain("Ambrosia Dew");

    const btnToWh = document.getElementById(
      "btn-transfer-to-warehouse"
    ) as HTMLButtonElement;
    expect(btnToWh.disabled).toBe(false);

    // Set qty to 3
    const qtyInput = document.getElementById(
      "wh-transfer-qty"
    ) as HTMLInputElement;
    qtyInput.value = "3";
    qtyInput.dispatchEvent(new Event("change"));

    btnToWh.click();

    expect(onInventoryUpdatedMock).toHaveBeenCalled();
    expect(onWarehouseUpdatedMock).toHaveBeenCalled();
    expect(onShowToastMock).toHaveBeenCalledWith(
      expect.stringContaining("ฝากเข้าคลัง"),
      "#34d399"
    );
  });

  it("withdraws item from warehouse back into inventory", () => {
    controller.open();

    const whGrid = document.getElementById("wh-storage-grid");
    const firstWhSlot = whGrid?.querySelectorAll(".wh-slot")[0] as HTMLElement;
    firstWhSlot.click();

    const btnToInv = document.getElementById(
      "btn-transfer-to-inventory"
    ) as HTMLButtonElement;
    expect(btnToInv.disabled).toBe(false);

    btnToInv.click();

    expect(onInventoryUpdatedMock).toHaveBeenCalled();
    expect(onWarehouseUpdatedMock).toHaveBeenCalled();
    expect(onShowToastMock).toHaveBeenCalledWith(
      expect.stringContaining("ถอนใส่กระเป๋า"),
      "#34d399"
    );
  });

  it("deposits gold into warehouse", () => {
    controller.open();

    const btnDepGold = document.getElementById(
      "btn-deposit-gold"
    ) as HTMLElement;
    btnDepGold.click();

    const dialog = document.getElementById("wh-gold-dialog");
    expect(dialog?.style.display).toBe("flex");

    const input = document.getElementById("wh-gold-input") as HTMLInputElement;
    input.value = "200";

    const btnConfirm = document.getElementById(
      "btn-wh-gold-confirm"
    ) as HTMLElement;
    btnConfirm.click();

    expect(onInventoryUpdatedMock).toHaveBeenCalled();
    expect(onWarehouseUpdatedMock).toHaveBeenCalled();
    expect(dialog?.style.display).toBe("none");
    expect(onShowToastMock).toHaveBeenCalledWith(
      expect.stringContaining("200 G"),
      "#fbbf24"
    );
  });

  it("withdraws gold from warehouse", () => {
    controller.open();

    const btnWithGold = document.getElementById(
      "btn-withdraw-gold"
    ) as HTMLElement;
    btnWithGold.click();

    const dialog = document.getElementById("wh-gold-dialog");
    expect(dialog?.style.display).toBe("flex");

    const input = document.getElementById("wh-gold-input") as HTMLInputElement;
    input.value = "300";

    const btnConfirm = document.getElementById(
      "btn-wh-gold-confirm"
    ) as HTMLElement;
    btnConfirm.click();

    expect(onInventoryUpdatedMock).toHaveBeenCalled();
    expect(onWarehouseUpdatedMock).toHaveBeenCalled();
    expect(dialog?.style.display).toBe("none");
    expect(onShowToastMock).toHaveBeenCalledWith(
      expect.stringContaining("300 G"),
      "#fbbf24"
    );
  });
});

describe("InnStorageModalController", () => {
  let roster: PlayerRosterState;
  let innStorage: InnStorageState;
  let controller: InnStorageModalController;
  let onRosterUpdatedMock: ReturnType<typeof vi.fn>;
  let onInnStorageUpdatedMock: ReturnType<typeof vi.fn>;
  let onShowToastMock: ReturnType<typeof vi.fn>;

  const createDummyCombatant = (
    id: string,
    name: string,
    hp = 50,
    maxHp = 100
  ): Combatant => ({
    id,
    name,
    isHero: false,
    level: 5,
    element: Element.Water,
    hp,
    maxHp,
    sp: 20,
    maxSp: 50,
    atk: 25,
    def: 20,
    int: 15,
    agi: 10,
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="inn-storage-modal">
        <button id="btn-close-inn-modal"></button>
        <button id="btn-close-inn-bottom"></button>
        <div id="inn-roster-count"></div>
        <div id="inn-roster-list"></div>
        <div id="inn-storage-count"></div>
        <div id="inn-storage-list"></div>
      </div>
    `;

    const hero: Combatant = {
      id: "hero_1",
      name: "Hero",
      isHero: true,
      level: 10,
      element: Element.Earth,
      hp: 100,
      maxHp: 100,
      sp: 50,
      maxSp: 50,
      atk: 30,
      def: 20,
      int: 10,
      agi: 15,
    };

    const beastA = createDummyCombatant("beast_a", "Beast Alpha", 30, 100);
    const beastB = createDummyCombatant("beast_b", "Beast Beta", 40, 100);

    roster = {
      hero,
      activeBeastId: "beast_a",
      beasts: [beastA, beastB],
      formation: {
        heroSlot: { row: "front", col: 2 },
        beastSlot: { row: "front", col: 3 },
      },
    };

    innStorage = InnStorageManager.createInitialInnStorage();
    const storedBeast = createDummyCombatant(
      "beast_c",
      "Beast Gamma",
      100,
      100
    );
    innStorage.beasts.push(storedBeast);

    onRosterUpdatedMock = vi.fn();
    onInnStorageUpdatedMock = vi.fn();
    onShowToastMock = vi.fn();

    controller = new InnStorageModalController(roster, innStorage, {
      onRosterUpdated: onRosterUpdatedMock,
      onInnStorageUpdated: onInnStorageUpdatedMock,
      onShowToast: onShowToastMock,
    });
  });

  it("opens and renders roster and inn daycare lists", () => {
    controller.open();
    expect(controller.isOpen()).toBe(true);

    const rosterCount = document.getElementById("inn-roster-count");
    expect(rosterCount?.textContent).toBe("2 / 10");

    const storageCount = document.getElementById("inn-storage-count");
    expect(storageCount?.textContent).toBe("1 / 30");

    const rosterList = document.getElementById("inn-roster-list");
    const rosterCards = rosterList?.querySelectorAll(".inn-beast-card");
    expect(rosterCards?.length).toBe(2);

    const storageList = document.getElementById("inn-storage-list");
    const storageCards = storageList?.querySelectorAll(".inn-beast-card");
    expect(storageCards?.length).toBe(1);
  });

  it("deposits active beast, auto-promotes reserve beast to active, and fully heals deposited beast", () => {
    controller.open();

    const rosterList = document.getElementById("inn-roster-list");
    const depositBtn = rosterList?.querySelectorAll(
      ".btn-deposit-beast"
    )[0] as HTMLButtonElement;
    expect(depositBtn.disabled).toBe(false);

    depositBtn.click();

    expect(onRosterUpdatedMock).toHaveBeenCalled();
    expect(onInnStorageUpdatedMock).toHaveBeenCalled();

    const updatedRoster: PlayerRosterState =
      onRosterUpdatedMock.mock.calls[0][0];
    const updatedInn: InnStorageState =
      onInnStorageUpdatedMock.mock.calls[0][0];

    // Only beast_b remains in roster and is promoted to active
    expect(updatedRoster.beasts.length).toBe(1);
    expect(updatedRoster.activeBeastId).toBe("beast_b");

    // beast_a is now in inn daycare and 100% healed
    expect(updatedInn.beasts.length).toBe(2);
    const deposited = updatedInn.beasts.find((b) => b.id === "beast_a");
    expect(deposited?.hp).toBe(deposited?.maxHp);
    expect(deposited?.sp).toBe(deposited?.maxSp);
  });

  it("disables deposit button when roster has only 1 beast", () => {
    // Leave only 1 beast in roster
    roster.beasts = [roster.beasts[0]];
    controller.setRoster(roster);
    controller.open();

    const rosterList = document.getElementById("inn-roster-list");
    const depositBtn = rosterList?.querySelector(
      ".btn-deposit-beast"
    ) as HTMLButtonElement;
    expect(depositBtn.disabled).toBe(true);
  });

  it("withdraws beast from inn storage into roster", () => {
    controller.open();

    const storageList = document.getElementById("inn-storage-list");
    const withdrawBtn = storageList?.querySelector(
      ".btn-withdraw-beast"
    ) as HTMLButtonElement;
    expect(withdrawBtn.disabled).toBe(false);

    withdrawBtn.click();

    expect(onRosterUpdatedMock).toHaveBeenCalled();
    expect(onInnStorageUpdatedMock).toHaveBeenCalled();

    const updatedRoster: PlayerRosterState =
      onRosterUpdatedMock.mock.calls[0][0];
    const updatedInn: InnStorageState =
      onInnStorageUpdatedMock.mock.calls[0][0];

    expect(updatedRoster.beasts.length).toBe(3);
    expect(updatedInn.beasts.length).toBe(0);
  });
});
