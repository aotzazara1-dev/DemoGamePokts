import { describe, it, expect } from "vitest";
import { BattleEngine } from "../src/battle/battle-engine.js";
import { BattleSwapExecutor } from "../src/battle/battle-swap-executor.js";
import {
  type BattleState,
  type Combatant,
  type TeamActionsMap,
  Element,
} from "../src/types.js";

describe("In-Combat Beast Swapping (ADR 0011)", () => {
  const createHero = (id = "hero_1", hp = 100): Combatant => ({
    id,
    name: "Hero",
    isHero: true,
    level: 10,
    element: Element.Water,
    hp,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    atk: 30,
    def: 20,
    int: 15,
    agi: 25,
  });

  const createBeast = (
    id: string,
    name: string,
    element = Element.Fire,
    hp = 80
  ): Combatant => ({
    id,
    name,
    isHero: false,
    level: 8,
    element,
    hp,
    maxHp: 80,
    sp: 30,
    maxSp: 30,
    atk: 25,
    def: 15,
    int: 10,
    agi: 20,
  });

  const createInitialState = (
    activeBeast: Combatant,
    enemy: Combatant
  ): BattleState => ({
    round: 1,
    outcome: "ongoing",
    allies: {
      front: [null, null, createHero(), null, null],
      back: [null, null, activeBeast, null, null],
    },
    enemies: {
      front: [null, null, enemy, null, null],
      back: [null, null, null, null, null],
    },
    capturedBeastIds: [],
  });

  it("Hero successfully swaps deployed active beast with conscious reserve beast", () => {
    const activeBeast = createBeast("beast_active", "Lu Bu");
    const reserveBeast = createBeast("beast_reserve", "Thor", Element.Wind);
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(activeBeast, enemy);
    const reserveBeasts = [reserveBeast];

    const actions: TeamActionsMap = {
      hero_1: { type: "swap", swapBeastId: "beast_reserve" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    // 1. Grid should now hold reserveBeast
    expect(res.nextState.allies.back[2]?.id).toBe("beast_reserve");
    expect(res.nextState.allies.back[2]?.name).toBe("Thor");

    // 2. Old beast should be moved to reserve
    expect(res.nextState.alliesReserve).toBeDefined();
    expect(
      res.nextState.alliesReserve!.some((b) => b.id === "beast_active")
    ).toBe(true);
    expect(
      res.nextState.alliesReserve!.some((b) => b.id === "beast_reserve")
    ).toBe(false);

    // 3. Swap event emitted
    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent).toBeDefined();
    expect(swapEvent?.actorId).toBe("hero_1");
    expect(swapEvent?.targetId).toBe("beast_reserve");
    expect(swapEvent?.message).toContain(
      "Hero withdrew Lu Bu and summoned Thor"
    );
  });

  it("Beast successfully initiates self-swap with conscious reserve beast", () => {
    const activeBeast = createBeast("beast_active", "Lu Bu");
    const reserveBeast = createBeast("beast_reserve", "Thor", Element.Wind);
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(activeBeast, enemy);
    const reserveBeasts = [reserveBeast];

    const actions: TeamActionsMap = {
      beast_active: { type: "swap", swapBeastId: "beast_reserve" },
      hero_1: { type: "defend" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    // 1. Grid should now hold reserveBeast
    expect(res.nextState.allies.back[2]?.id).toBe("beast_reserve");
    expect(res.nextState.allies.back[2]?.name).toBe("Thor");

    // 2. Old beast should be moved to reserve
    expect(res.nextState.alliesReserve).toBeDefined();
    expect(
      res.nextState.alliesReserve!.some((b) => b.id === "beast_active")
    ).toBe(true);

    // 3. Swap event emitted with retreat message
    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent?.message).toContain("Lu Bu retreated and summoned Thor");
  });

  it("fails swap if actor is not an allied combatant", () => {
    const activeBeast = createBeast("beast_active", "Lu Bu");
    const reserveBeast = createBeast("beast_reserve", "Thor");
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(activeBeast, enemy);
    const reserveBeasts = [reserveBeast];

    const actions: TeamActionsMap = {
      enemy_1: { type: "swap", swapBeastId: "beast_reserve" },
      hero_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent?.message).toContain(
      "cannot command a swap because they are not an allied combatant"
    );
    expect(res.nextState.allies.back[2]?.id).toBe("beast_active");
  });

  it("cannot summon a fallen reserve beast with HP = 0", () => {
    const activeBeast = createBeast("beast_active", "Lu Bu");
    const fallenReserve = createBeast("beast_dead", "Thor", Element.Wind, 0); // HP 0
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(activeBeast, enemy);
    const reserveBeasts = [fallenReserve];

    const actions: TeamActionsMap = {
      hero_1: { type: "swap", swapBeastId: "beast_dead" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent?.message).toContain(
      "Cannot summon fallen Reserve Beast Thor"
    );
    expect(res.nextState.allies.back[2]?.id).toBe("beast_active");
  });

  it("cannot swap into an already deployed beast", () => {
    const activeBeast = createBeast("beast_active", "Lu Bu");
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(activeBeast, enemy);
    // Reserve list mistakenly has the active beast
    const reserveBeasts = [activeBeast];

    const actions: TeamActionsMap = {
      hero_1: { type: "swap", swapBeastId: "beast_active" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent?.message).toContain("already deployed");
  });

  it("allows Hero to summon reserve beast after deployed active beast has fainted", () => {
    const faintedActive = createBeast("beast_active", "Lu Bu", Element.Fire, 0);
    const reserveBeast = createBeast("beast_reserve", "Thor", Element.Wind, 80);
    const enemy = createBeast("enemy_1", "Fenrir", Element.Earth, 100);

    const state = createInitialState(faintedActive, enemy);
    const reserveBeasts = [reserveBeast];

    const actions: TeamActionsMap = {
      hero_1: { type: "swap", swapBeastId: "beast_reserve" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    expect(res.nextState.allies.back[2]?.id).toBe("beast_reserve");
    expect(res.nextState.allies.back[2]?.hp).toBe(80);
    const swapEvent = res.events.find((e) => e.type === "swap");
    expect(swapEvent).toBeDefined();
    expect(swapEvent?.message).toContain("Thor");
  });

  it("ensures neither the withdrawing beast nor the incoming beast acts during the swap round (ADR 0011)", () => {
    // Active beast has 99 AGI (higher than Hero's 25 AGI)
    const activeBeast = createBeast(
      "beast_active",
      "Speedy Bird",
      Element.Wind,
      80
    );
    activeBeast.agi = 99;
    const reserveBeast = createBeast(
      "beast_reserve",
      "Rock Golem",
      Element.Earth,
      80
    );
    reserveBeast.agi = 50;
    const enemy = createBeast("enemy_1", "Enemy Target", Element.Water, 100);

    const state = createInitialState(activeBeast, enemy);
    const reserveBeasts = [reserveBeast];

    const actions: TeamActionsMap = {
      hero_1: { type: "swap", swapBeastId: "beast_reserve" },
      beast_active: { type: "attack", targetId: "enemy_1" },
      enemy_1: { type: "defend" },
    };

    const res = BattleEngine.resolveTurn(
      state,
      actions,
      () => 0.5,
      reserveBeasts
    );

    // Active beast action should have been cancelled, enemy takes NO damage from active beast
    const attackEvents = res.events.filter(
      (e) => e.type === "damage" || e.type === "attack"
    );
    expect(attackEvents.length).toBe(0);
    expect(res.nextState.enemies.front[2]?.hp).toBe(100);

    // Deployed beast is now the reserve beast
    expect(res.nextState.allies.back[2]?.id).toBe("beast_reserve");
  });
});
