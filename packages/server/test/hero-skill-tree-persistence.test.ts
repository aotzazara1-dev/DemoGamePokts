import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Element } from "@poktsonline/shared";
import { DatabaseEngine } from "../src/db/DatabaseEngine.js";
import { AccountRepository } from "../src/db/AccountRepository.js";
import { HeroRepository } from "../src/db/HeroRepository.js";

describe("Hero Skill Tree Persistence (Issue 03)", () => {
  let dbEngine: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;
  let accountId: string;

  beforeEach(async () => {
    dbEngine = new DatabaseEngine();
    await dbEngine.init();
    accountRepo = new AccountRepository(dbEngine);
    heroRepo = new HeroRepository(dbEngine);

    const account = accountRepo.createRegisteredAccount("tree_hero", "hash_pw");
    accountId = account.id;
  });

  afterEach(() => {
    dbEngine.close();
  });

  it("initializes new hero with 0 skillPoints, empty unlockedSkillIds, and starter skillSlots", () => {
    const summary = heroRepo.createHero(accountId, {
      name: "Terra Master",
      element: Element.Earth,
    });

    const fullState = heroRepo.getHeroFullState(summary.id);
    expect(fullState).not.toBeNull();
    expect(fullState!.hero.skillPoints).toBe(0);
    expect(fullState!.hero.unlockedSkillIds).toEqual([]);
    expect(fullState!.hero.skillSlots?.length).toBe(5);
    expect(fullState!.hero.skillSlots?.[0].skillId).toBe(
      "skill_hero_earth_breaker"
    );
    expect(fullState!.hero.skillSlots?.[0].isSignature).toBe(true);
  });

  it("persists updated skillPoints, unlockedSkillIds, and skillSlots via saveHeroState", () => {
    const summary = heroRepo.createHero(accountId, {
      name: "Aqua Sage",
      element: Element.Water,
    });

    const fullState = heroRepo.getHeroFullState(summary.id)!;
    fullState.hero.level = 15;
    fullState.hero.skillPoints = 3;
    fullState.hero.unlockedSkillIds = [
      "skill_healing_spring",
      "skill_purifying_wave",
      "aqua_jet",
    ];
    fullState.hero.skillSlots![1] = {
      slotIndex: 1,
      skillId: "skill_healing_spring",
      isSignature: false,
    };
    fullState.hero.skillSlots![2] = {
      slotIndex: 2,
      skillId: "skill_purifying_wave",
      isSignature: false,
    };

    heroRepo.saveHeroState(summary.id, fullState);

    // Retrieve again from DB
    const reloaded = heroRepo.getHeroFullState(summary.id)!;
    expect(reloaded.hero.level).toBe(15);
    expect(reloaded.hero.skillPoints).toBe(3);
    expect(reloaded.hero.unlockedSkillIds).toEqual([
      "skill_healing_spring",
      "skill_purifying_wave",
      "aqua_jet",
    ]);
    expect(reloaded.hero.skillSlots?.[1].skillId).toBe("skill_healing_spring");
    expect(reloaded.hero.skillSlots?.[2].skillId).toBe("skill_purifying_wave");
  });
});
