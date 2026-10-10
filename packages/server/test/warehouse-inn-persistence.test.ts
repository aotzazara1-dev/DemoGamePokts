import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  Element,
  WarehouseManager,
  InnStorageManager,
} from "@poktsonline/shared";
import { DatabaseEngine } from "../src/db/DatabaseEngine.js";
import { AccountRepository } from "../src/db/AccountRepository.js";
import { HeroRepository } from "../src/db/HeroRepository.js";

describe("Warehouse & Inn Beast Storage Persistence (Issue 02)", () => {
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;
  let accountId: string;

  beforeEach(async () => {
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);

    const account = accountRepo.createRegisteredAccount(
      "vault_tester",
      "hash_pw"
    );
    accountId = account.id;
  });

  afterEach(() => {
    dbEngine.close();
  });

  it("initializes new hero with 40-slot empty warehouse and empty innStorage", () => {
    const summary = heroRepo.createHero(accountId, {
      name: "Storage Hero",
      element: Element.Water,
    });

    const fullState = heroRepo.getHeroFullState(summary.id);
    expect(fullState).not.toBeNull();
    expect(fullState!.warehouse).toBeDefined();
    expect(fullState!.warehouse?.slots.length).toBe(40);
    expect(fullState!.warehouse?.slots.every((s) => s === null)).toBe(true);
    expect(fullState!.warehouse?.gold).toBe(0);

    expect(fullState!.innStorage).toBeDefined();
    expect(fullState!.innStorage?.beasts).toEqual([]);
  });

  it("persists items, gold in warehouse and beasts in innStorage across save and reload", () => {
    const summary = heroRepo.createHero(accountId, {
      name: "Vault Master",
      element: Element.Fire,
    });

    const fullState = heroRepo.getHeroFullState(summary.id)!;

    // 1. Update Warehouse
    fullState.warehouse = WarehouseManager.createInitialWarehouse();
    fullState.warehouse.slots[0] = { itemId: "item_steamed_bun", quantity: 15 };
    fullState.warehouse.slots[1] = { itemId: "item_ginseng", quantity: 5 };
    fullState.warehouse.gold = 1500;

    // 2. Update Inn Storage
    fullState.innStorage = InnStorageManager.createInitialInnStorage();
    fullState.innStorage.beasts.push({
      id: "beast_stored_tiger",
      name: "White Tiger (เสือขาว)",
      isHero: false,
      level: 10,
      element: Element.Wind,
      hp: 120,
      maxHp: 120,
      sp: 40,
      maxSp: 40,
      atk: 35,
      def: 25,
      int: 15,
      agi: 30,
    });

    // Save to SQLite
    heroRepo.saveHeroState(summary.id, fullState);

    // Reload from SQLite
    const reloaded = heroRepo.getHeroFullState(summary.id)!;

    // Check Warehouse
    expect(reloaded.warehouse).toBeDefined();
    expect(reloaded.warehouse?.slots.length).toBe(40);
    expect(reloaded.warehouse?.slots[0]?.itemId).toBe("item_steamed_bun");
    expect(reloaded.warehouse?.slots[0]?.quantity).toBe(15);
    expect(reloaded.warehouse?.slots[1]?.itemId).toBe("item_ginseng");
    expect(reloaded.warehouse?.slots[1]?.quantity).toBe(5);
    expect(reloaded.warehouse?.gold).toBe(1500);

    // Check Inn Storage
    expect(reloaded.innStorage).toBeDefined();
    expect(reloaded.innStorage?.beasts.length).toBe(1);
    expect(reloaded.innStorage?.beasts[0].id).toBe("beast_stored_tiger");
    expect(reloaded.innStorage?.beasts[0].name).toBe("White Tiger (เสือขาว)");
    expect(reloaded.innStorage?.beasts[0].level).toBe(10);
  });
});
