import { describe, it, expect, beforeEach } from "vitest";
import { InnStorageManager } from "../src/roster/inn-storage-manager.js";
import { RosterManager } from "../src/roster/roster-manager.js";
import {
  PlayerRosterState,
  InnStorageState,
  Element,
  Combatant,
} from "../src/types.js";

describe("InnStorageManager", () => {
  let roster: PlayerRosterState;
  let innStorage: InnStorageState;

  beforeEach(() => {
    roster = RosterManager.createInitialRoster("TestHero", Element.Fire);
    innStorage = InnStorageManager.createInitialInnStorage();
  });

  it("should initialize with empty beasts list", () => {
    expect(innStorage.beasts).toEqual([]);
  });

  it("should disallow depositing the Hero", () => {
    const res = InnStorageManager.depositBeast(
      roster,
      innStorage,
      roster.hero.id
    );
    expect(res.success).toBe(false);
    expect(res.reason).toContain("ไม่สามารถฝากตัวละครหลัก");
  });

  it("should disallow depositing Active Beast if it is the only beast in roster", () => {
    // Roster starts with exactly 1 beast (Lu Bu)
    expect(roster.beasts.length).toBe(1);
    const activeBeastId = roster.activeBeastId;

    const res = InnStorageManager.depositBeast(
      roster,
      innStorage,
      activeBeastId
    );
    expect(res.success).toBe(false);
    expect(res.reason).toContain(
      "ไม่สามารถฝากขุนพลตัวหลักได้เนื่องจากเป็นขุนพลตัวเดียว"
    );
  });

  it("should deposit reserve beast and restore its HP and SP to 100%", () => {
    const woundedBeast: Combatant = {
      id: "beast_wolf",
      name: "Fenrir Wolf",
      isHero: false,
      level: 6,
      element: Element.Wind,
      hp: 10,
      maxHp: 90,
      sp: 5,
      maxSp: 40,
      atk: 25,
      def: 15,
      int: 10,
      agi: 20,
    };
    roster.beasts.push(woundedBeast);

    const res = InnStorageManager.depositBeast(
      roster,
      innStorage,
      "beast_wolf"
    );
    expect(res.success).toBe(true);
    expect(res.roster.beasts.length).toBe(1);
    expect(res.storage.beasts.length).toBe(1);

    // Daycare full heal
    const stored = res.storage.beasts[0];
    expect(stored.hp).toBe(90);
    expect(stored.sp).toBe(40);
  });

  it("should automatically promote next beast when active beast is deposited (if reserve exists)", () => {
    const reserveBeast: Combatant = {
      id: "beast_boar",
      name: "Mountain Boar",
      isHero: false,
      level: 5,
      element: Element.Earth,
      hp: 80,
      maxHp: 80,
      sp: 20,
      maxSp: 20,
      atk: 20,
      def: 20,
      int: 5,
      agi: 10,
    };
    roster.beasts.push(reserveBeast);

    const oldActiveId = roster.activeBeastId;
    const res = InnStorageManager.depositBeast(roster, innStorage, oldActiveId);
    expect(res.success).toBe(true);
    expect(res.roster.activeBeastId).toBe("beast_boar");
    expect(res.roster.beasts.length).toBe(1);
  });

  it("should withdraw beast from inn back to active roster", () => {
    const storedBeast: Combatant = {
      id: "beast_tiger",
      name: "White Tiger",
      isHero: false,
      level: 8,
      element: Element.Wind,
      hp: 110,
      maxHp: 110,
      sp: 30,
      maxSp: 30,
      atk: 35,
      def: 20,
      int: 12,
      agi: 28,
    };
    innStorage.beasts.push(storedBeast);

    const res = InnStorageManager.withdrawBeast(
      roster,
      innStorage,
      "beast_tiger"
    );
    expect(res.success).toBe(true);
    expect(res.storage.beasts.length).toBe(0);
    expect(res.roster.beasts.length).toBe(2);
    expect(res.roster.beasts.some((b) => b.id === "beast_tiger")).toBe(true);
  });

  it("should reject withdrawal if roster is already at max capacity (10)", () => {
    // Fill roster to 10
    while (roster.beasts.length < 10) {
      roster.beasts.push({
        id: `extra_${roster.beasts.length}`,
        name: `Extra ${roster.beasts.length}`,
        isHero: false,
        level: 1,
        element: Element.Water,
        hp: 50,
        maxHp: 50,
        sp: 10,
        maxSp: 10,
        atk: 10,
        def: 10,
        int: 10,
        agi: 10,
      });
    }

    innStorage.beasts.push({
      id: "beast_denied",
      name: "Denied",
      isHero: false,
      level: 1,
      element: Element.Fire,
      hp: 50,
      maxHp: 50,
      sp: 10,
      maxSp: 10,
      atk: 10,
      def: 10,
      int: 10,
      agi: 10,
    });

    const res = InnStorageManager.withdrawBeast(
      roster,
      innStorage,
      "beast_denied"
    );
    expect(res.success).toBe(false);
    expect(res.reason).toContain("ขุนพลเต็มแล้ว");
  });
});
