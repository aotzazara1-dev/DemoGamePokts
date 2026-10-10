import {
  Combatant,
  PlayerRosterState,
  Element,
  RosterManager,
  ProgressionEngine,
  InventoryManager,
  type InventoryState,
} from "@poktsonline/shared";

export interface DebugToolbarCallbacks {
  onHeroUpdated: (hero: Combatant) => void;
  onRosterUpdated: (roster: PlayerRosterState) => void;
  onInventoryUpdated?: (inventory: InventoryState) => void;
  onInstantBattle: (encounter: any) => void;
  onWarp: (
    tile: { x: number; y: number; mapId?: string },
    toastMsg: string,
    color?: string
  ) => void;
  onShowToast: (msg: string, color?: string) => void;
}

/**
 * Deep UI Controller for Developer QA Toolbar.
 * Encapsulates all developer testing cheats (EXP, level up, heal, hurt, beast spawner, inventory, warp, battle trigger).
 */
export class DebugToolbarController {
  private getHero: () => Combatant;
  private getRoster: () => PlayerRosterState;
  private getInventory?: () => InventoryState;
  private callbacks: DebugToolbarCallbacks;

  constructor(
    getHero: () => Combatant,
    getRoster: () => PlayerRosterState,
    callbacks: DebugToolbarCallbacks,
    getInventory?: () => InventoryState
  ) {
    this.getHero = getHero;
    this.getRoster = getRoster;
    this.callbacks = callbacks;
    this.getInventory = getInventory;
    this.setupDOM();
  }

  public toggle(forceOpen?: boolean): void {
    const panel = document.getElementById("debug-panel");
    if (!panel) return;
    if (forceOpen !== undefined) {
      if (forceOpen) panel.classList.add("open");
      else panel.classList.remove("open");
    } else {
      panel.classList.toggle("open");
    }
  }

  public close(): void {
    this.toggle(false);
  }

  public isOpen(): boolean {
    const panel = document.getElementById("debug-panel");
    return panel ? panel.classList.contains("open") : false;
  }

  public setVisible(visible: boolean): void {
    const btnToggle = document.getElementById("btn-toggle-debug");
    if (btnToggle) btnToggle.style.display = visible ? "flex" : "none";
    if (!visible) {
      this.close();
    }
  }

  private setupDOM(): void {
    const btnToggle = document.getElementById("btn-toggle-debug");
    const panel = document.getElementById("debug-panel");
    const btnClose = document.getElementById("btn-close-debug");

    if (btnToggle && panel) {
      btnToggle.onclick = () => panel.classList.toggle("open");
    }

    if (btnClose && panel) {
      btnClose.onclick = () => panel.classList.remove("open");
    }

    // 1. +500 EXP (Hero)
    const btnExp500 = document.getElementById("dbg-exp-500");
    if (btnExp500) {
      btnExp500.onclick = () => {
        const hero = this.getHero();
        const prog = ProgressionEngine.addExpToCombatant(hero, 500);
        this.callbacks.onHeroUpdated(prog.combatant);
        this.callbacks.onShowToast(
          `⚡ Added +500 EXP to Hero! (Total: ${prog.combatant.exp}/${prog.combatant.maxExp} Lv.${prog.combatant.level})`,
          "#facc15"
        );
      };
    }

    // 2. +500 EXP (Active Beast)
    const btnExpBeast = document.getElementById("dbg-exp-beast");
    if (btnExpBeast) {
      btnExpBeast.onclick = () => {
        const roster = this.getRoster();
        const activeBeast = roster.beasts.find(
          (b: Combatant) => b.id === roster.activeBeastId
        );
        if (activeBeast) {
          const prog = ProgressionEngine.addExpToCombatant(activeBeast, 500);
          const idx = roster.beasts.findIndex(
            (b: Combatant) => b.id === activeBeast.id
          );
          if (idx !== -1) roster.beasts[idx] = prog.combatant;
          this.callbacks.onRosterUpdated(roster);
          this.callbacks.onShowToast(
            `🦁 Added +500 EXP to ${activeBeast.name}! (Lv.${prog.combatant.level})`,
            "#38bdf8"
          );
        } else {
          this.callbacks.onShowToast("No active beast deployed!", "#ef4444");
        }
      };
    }

    // 3. Instant Level Up
    const btnLvlUp = document.getElementById("dbg-level-up");
    if (btnLvlUp) {
      btnLvlUp.onclick = () => {
        const hero = this.getHero();
        const needed = (hero.maxExp ?? 500) - (hero.exp ?? 0);
        const prog = ProgressionEngine.addExpToCombatant(
          hero,
          Math.max(1, needed)
        );
        this.callbacks.onHeroUpdated(prog.combatant);
        this.callbacks.onShowToast(
          `🎉 Level Up! Hero is now Lv.${prog.combatant.level}! (+${prog.statPointsGained} Stat Points)`,
          "#fbbf24"
        );
      };
    }

    // 4. +5 Stat Points
    const btnStatPts = document.getElementById("dbg-stat-points");
    if (btnStatPts) {
      btnStatPts.onclick = () => {
        const hero = this.getHero();
        hero.statPoints = (hero.statPoints ?? 0) + 5;
        this.callbacks.onHeroUpdated(hero);
        this.callbacks.onShowToast(
          `⭐ Added +5 Stat Points! Total: ${hero.statPoints}`,
          "#fbbf24"
        );
      };
    }

    // 5. Full Heal
    const btnHeal = document.getElementById("dbg-full-heal");
    if (btnHeal) {
      btnHeal.onclick = () => {
        const hero = this.getHero();
        const roster = this.getRoster();
        hero.hp = hero.maxHp;
        hero.sp = hero.maxSp;
        roster.beasts.forEach((b: Combatant) => {
          b.hp = b.maxHp;
          b.sp = b.maxSp;
        });
        this.callbacks.onHeroUpdated(hero);
        this.callbacks.onRosterUpdated(roster);
        this.callbacks.onShowToast(
          "💖 Full Heal! Health & Spirit restored to 100% for all units.",
          "#4ade80"
        );
      };
    }

    // 6. Hurt Hero (-40 HP)
    const btnHurt = document.getElementById("dbg-hurt-hero");
    if (btnHurt) {
      btnHurt.onclick = () => {
        const hero = this.getHero();
        hero.hp = Math.max(1, hero.hp - 40);
        this.callbacks.onHeroUpdated(hero);
        this.callbacks.onShowToast(
          `🩸 Hero took 40 damage! HP: ${hero.hp}/${hero.maxHp}`,
          "#ef4444"
        );
      };
    }

    // 7. Add Beasts
    const addMockBeast = (
      name: string,
      element: Element,
      atk: number,
      def: number
    ) => {
      const hero = this.getHero();
      const roster = this.getRoster();
      const mock: Combatant = {
        id: `beast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name,
        isHero: false,
        level: Math.max(1, hero.level - 1),
        element,
        hp: 70,
        maxHp: 70,
        sp: 30,
        maxSp: 30,
        atk,
        def,
        int: 10,
        agi: 14,
      };
      const res = RosterManager.addCapturedBeast(roster, mock);
      if (res.success) {
        this.callbacks.onRosterUpdated(res.roster);
        this.callbacks.onShowToast(
          `🐾 Added ${name} [${element}] to Beast Roster!`,
          "#a855f7"
        );
      } else {
        this.callbacks.onShowToast(res.reason || "Roster full!", "#ef4444");
      }
    };

    document
      .getElementById("dbg-add-fire-beast")
      ?.addEventListener("click", () =>
        addMockBeast("Flame Imp", Element.Fire, 24, 12)
      );
    document
      .getElementById("dbg-add-wind-beast")
      ?.addEventListener("click", () =>
        addMockBeast("Gale Hawk", Element.Wind, 20, 10)
      );
    document
      .getElementById("dbg-add-earth-beast")
      ?.addEventListener("click", () =>
        addMockBeast("Rock Boar", Element.Earth, 18, 22)
      );
    document
      .getElementById("dbg-add-water-beast")
      ?.addEventListener("click", () =>
        addMockBeast("Aqua Serpent", Element.Water, 22, 15)
      );

    // 8. Instant Battle Encounter
    const btnBattle = document.getElementById("dbg-instant-battle");
    if (btnBattle) {
      btnBattle.onclick = () => {
        this.close();
        const hero = this.getHero();
        this.callbacks.onInstantBattle({
          encounter: {
            wildEnemies: [
              {
                id: `wild_test_1`,
                name: "Wild Flame Imp",
                isHero: false,
                level: hero.level,
                element: Element.Fire,
                hp: 55,
                maxHp: 55,
                sp: 20,
                maxSp: 20,
                atk: 18,
                def: 12,
                int: 10,
                agi: 12,
              },
              {
                id: `wild_test_2`,
                name: "Wild Rock Boar",
                isHero: false,
                level: hero.level,
                element: Element.Earth,
                hp: 65,
                maxHp: 65,
                sp: 15,
                maxSp: 15,
                atk: 16,
                def: 20,
                int: 8,
                agi: 10,
              },
            ],
          },
        });
      };
    }

    // 9. Teleport Town
    const btnWarpTown = document.getElementById("dbg-warp-town");
    if (btnWarpTown) {
      btnWarpTown.onclick = () => {
        this.callbacks.onWarp(
          { x: 10, y: 10, mapId: "novice_town_and_meadow" },
          "🏡 Teleported to Novice Town (Safe Zone)",
          "#6ee7b7"
        );
      };
    }

    // 10. Teleport Meadow
    const btnWarpMeadow = document.getElementById("dbg-warp-meadow");
    if (btnWarpMeadow) {
      btnWarpMeadow.onclick = () => {
        this.callbacks.onWarp(
          { x: 23, y: 10, mapId: "novice_town_and_meadow" },
          "🌾 Teleported to Whispering Meadow (Wild Zone)",
          "#f59e0b"
        );
      };
    }

    // 11. Teleport Pebble Cave
    const btnWarpCave = document.getElementById("dbg-warp-cave");
    if (btnWarpCave) {
      btnWarpCave.onclick = () => {
        this.callbacks.onWarp(
          { x: 2, y: 15, mapId: "pebble_cave" },
          "🪨 Teleported to Pebble Cave Depths!",
          "#38bdf8"
        );
      };
    }

    // 12. Teleport Bamboo Forest
    const btnWarpForest = document.getElementById("dbg-warp-forest");
    if (btnWarpForest) {
      btnWarpForest.onclick = () => {
        this.callbacks.onWarp(
          { x: 2, y: 25, mapId: "bamboo_forest" },
          "🎋 Teleported to Bamboo Forest Grove!",
          "#34d399"
        );
      };
    }

    // 11. Inventory & Gold Cheats
    const btnBuns = document.getElementById("dbg-item-buns");
    if (btnBuns) {
      btnBuns.onclick = () => {
        if (!this.getInventory) return;
        const inv = this.getInventory();
        const res = InventoryManager.addItem(inv, "item_steamed_bun", 5);
        if (res.success) {
          this.callbacks.onInventoryUpdated?.(res.inventory);
          this.callbacks.onShowToast(
            "🥟 Added +5 Steamed Buns to Inventory!",
            "#38bdf8"
          );
        } else {
          this.callbacks.onShowToast(
            res.reason || "Inventory is full!",
            "#ef4444"
          );
        }
      };
    }

    const btnTea = document.getElementById("dbg-item-tea");
    if (btnTea) {
      btnTea.onclick = () => {
        if (!this.getInventory) return;
        const inv = this.getInventory();
        const res = InventoryManager.addItem(inv, "item_herbal_tea", 5);
        if (res.success) {
          this.callbacks.onInventoryUpdated?.(res.inventory);
          this.callbacks.onShowToast(
            "🍵 Added +5 Herbal Tea to Inventory!",
            "#38bdf8"
          );
        } else {
          this.callbacks.onShowToast(
            res.reason || "Inventory is full!",
            "#ef4444"
          );
        }
      };
    }

    const btnFeather = document.getElementById("dbg-item-feather");
    if (btnFeather) {
      btnFeather.onclick = () => {
        if (!this.getInventory) return;
        const inv = this.getInventory();
        const res = InventoryManager.addItem(inv, "item_phoenix_feather", 1);
        if (res.success) {
          this.callbacks.onInventoryUpdated?.(res.inventory);
          this.callbacks.onShowToast(
            "🪶 Added +1 Phoenix Feather to Inventory!",
            "#fbbf24"
          );
        } else {
          this.callbacks.onShowToast(
            res.reason || "Inventory is full!",
            "#ef4444"
          );
        }
      };
    }

    const btnGold = document.getElementById("dbg-add-gold");
    if (btnGold) {
      btnGold.onclick = () => {
        if (!this.getInventory) return;
        const inv = this.getInventory();
        const updated = InventoryManager.addGold(inv, 1000);
        this.callbacks.onInventoryUpdated?.(updated);
        this.callbacks.onShowToast(
          `🪙 Added +1,000 Gold! Total: ${updated.gold.toLocaleString()} G`,
          "#fbbf24"
        );
      };
    }

    const btnEquipSet = document.getElementById("dbg-item-equipment");
    if (btnEquipSet) {
      btnEquipSet.onclick = () => {
        if (!this.getInventory) return;
        let inv = this.getInventory();
        const items = [
          "weapon_bronze_gladius",
          "weapon_sky_piercer",
          "head_valkyrie_winged_helm",
          "armor_valhalla_plate",
          "boots_hermes_sandals",
          "acc_draupnir_ring",
        ];
        items.forEach((id) => {
          inv = InventoryManager.addItem(inv, id, 1).inventory;
        });
        this.callbacks.onInventoryUpdated?.(inv);
        this.callbacks.onShowToast(
          "⚔️ Added Völundr Equipment Set to Inventory!",
          "#38bdf8"
        );
      };
    }
  }
}
