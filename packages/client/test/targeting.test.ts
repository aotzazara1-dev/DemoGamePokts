import { describe, it, expect } from "vitest";
import { getValidTargets } from "../src/battle/targeting.js";
import { Element, type BattleState, type Combatant } from "@poktsonline/shared";

describe("Battle Targeting Rules", () => {
  const hero: Combatant = {
    id: "hero_1",
    name: "Hero",
    isHero: true,
    level: 5,
    element: Element.Water,
    hp: 100,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    atk: 25,
    def: 15,
    int: 10,
    agi: 20,
  };

  const frontEnemy: Combatant = {
    id: "enemy_front_2",
    name: "Front Boar",
    isHero: false,
    level: 4,
    element: Element.Earth,
    hp: 50,
    maxHp: 50,
    sp: 10,
    maxSp: 10,
    atk: 15,
    def: 10,
    int: 5,
    agi: 10,
  };

  const backEnemy: Combatant = {
    id: "enemy_back_2",
    name: "Back Sprite",
    isHero: false,
    level: 3,
    element: Element.Wind,
    hp: 30,
    maxHp: 30,
    sp: 20,
    maxSp: 20,
    atk: 10,
    def: 5,
    int: 12,
    agi: 15,
  };

  it("blocks melee attack from targeting back-row enemy when guarded by living front-row unit", () => {
    const battleState: BattleState = {
      round: 1,
      outcome: "ongoing",
      allies: {
        front: [null, null, hero, null, null],
        back: [null, null, null, null, null],
      },
      enemies: {
        front: [null, null, frontEnemy, null, null],
        back: [null, null, backEnemy, null, null],
      },
      capturedBeastIds: [],
    };

    const validTargets = getValidTargets("attack", "allies", battleState);
    expect(validTargets).toContain("enemy_front_2");
    expect(validTargets).not.toContain("enemy_back_2");
  });

  it("allows targeting back-row enemy once their front-row guard faints or column is empty", () => {
    const battleState: BattleState = {
      round: 1,
      outcome: "ongoing",
      allies: {
        front: [null, null, hero, null, null],
        back: [null, null, null, null, null],
      },
      enemies: {
        front: [null, null, { ...frontEnemy, hp: 0 }, null, null],
        back: [null, null, backEnemy, null, null],
      },
      capturedBeastIds: [],
    };

    const validTargets = getValidTargets("attack", "allies", battleState);
    expect(validTargets).toContain("enemy_back_2");
  });

  it("allows capture action only against living wild beasts, not players or heroes", () => {
    const battleState: BattleState = {
      round: 1,
      outcome: "ongoing",
      allies: {
        front: [null, null, hero, null, null],
        back: [null, null, null, null, null],
      },
      enemies: {
        front: [null, null, frontEnemy, null, null],
        back: [null, null, backEnemy, null, null],
      },
      capturedBeastIds: [],
    };

    const captureTargets = getValidTargets("capture", "allies", battleState);
    // frontEnemy is a wild beast with front guard alive, but is in front row so eligible
    expect(captureTargets).toContain("enemy_front_2");
  });

  it("allows targeting living allies with heal items, and fainted allies with revive items", () => {
    const beast: Combatant = {
      ...frontEnemy,
      id: "beast_1",
      name: "Allied Beast",
      hp: 0, // fainted
    };

    const battleState: BattleState = {
      round: 1,
      outcome: "ongoing",
      allies: {
        front: [null, null, hero, null, null],
        back: [null, null, beast, null, null],
      },
      enemies: {
        front: [null, null, frontEnemy, null, null],
        back: [null, null, null, null, null],
      },
      capturedBeastIds: [],
    };

    // Heal item targets living allies only
    const healTargets = getValidTargets(
      "item",
      "allies",
      battleState,
      "hp_restore"
    );
    expect(healTargets).toContain("hero_1");
    expect(healTargets).not.toContain("beast_1");

    // Revive item targets fainted allies only
    const reviveTargets = getValidTargets(
      "item",
      "allies",
      battleState,
      "revive"
    );
    expect(reviveTargets).toContain("beast_1");
    expect(reviveTargets).not.toContain("hero_1");
  });

  it("routes heal and buff skills to living allies, and attack skills to living enemies", () => {
    const allyBeast: Combatant = {
      ...frontEnemy,
      id: "beast_1",
      name: "Allied Beast",
      hp: 40,
    };

    const battleState: BattleState = {
      round: 1,
      outcome: "ongoing",
      allies: {
        front: [null, null, hero, null, null],
        back: [null, null, allyBeast, null, null],
      },
      enemies: {
        front: [null, null, frontEnemy, null, null],
        back: [null, null, backEnemy, null, null],
      },
      capturedBeastIds: [],
    };

    // Heal skill targets living allies
    const healTargets = getValidTargets(
      "skill",
      "allies",
      battleState,
      undefined,
      "heal"
    );
    expect(healTargets).toContain("hero_1");
    expect(healTargets).toContain("beast_1");
    expect(healTargets).not.toContain("enemy_front_2");
    expect(healTargets).not.toContain("enemy_back_2");

    // Buff skill targets living allies
    const buffTargets = getValidTargets(
      "skill",
      "allies",
      battleState,
      undefined,
      "buff"
    );
    expect(buffTargets).toContain("hero_1");
    expect(buffTargets).toContain("beast_1");
    expect(buffTargets).not.toContain("enemy_front_2");

    // Attack skill targets living enemies (both front and back)
    const attackTargets = getValidTargets(
      "skill",
      "allies",
      battleState,
      undefined,
      "attack"
    );
    expect(attackTargets).toContain("enemy_front_2");
    expect(attackTargets).toContain("enemy_back_2");
    expect(attackTargets).not.toContain("hero_1");
    expect(attackTargets).not.toContain("beast_1");
  });
});
