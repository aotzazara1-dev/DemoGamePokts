import { describe, it, expect } from "vitest";
import {
  Element,
  type Combatant,
  SkillTreeManager,
  ProgressionEngine,
} from "../src/index.js";

describe("SkillTreeManager & ProgressionEngine Skill Points (ADR 0008)", () => {
  const createTestHero = (overrides: Partial<Combatant> = {}): Combatant => ({
    id: "hero_test_1",
    name: "Awakened Hero",
    isHero: true,
    level: 1,
    element: Element.Earth,
    hp: 100,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    atk: 25,
    def: 15,
    int: 10,
    agi: 20,
    skillPoints: 1,
    unlockedSkillIds: [],
    ...overrides,
  });

  describe("ProgressionEngine Level-Up Skill Points", () => {
    it("awards +1 Skill Point per level to Heroes upon level up", () => {
      const hero = createTestHero({ level: 1, exp: 0, skillPoints: 0 });
      const expNeeded = ProgressionEngine.calculateExpToNextLevel(1);

      const result = ProgressionEngine.addExpToCombatant(hero, expNeeded);
      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(result.skillPointsGained).toBe(1);
      expect(result.combatant.skillPoints).toBe(1);
    });

    it("does NOT award Skill Points to Beasts upon level up", () => {
      const beast: Combatant = {
        id: "beast_1",
        name: "Wild Wolf",
        isHero: false,
        level: 1,
        element: Element.Wind,
        hp: 80,
        maxHp: 80,
        sp: 30,
        maxSp: 30,
        atk: 20,
        def: 10,
        int: 5,
        agi: 25,
        statPoints: 0,
      };
      const expNeeded = ProgressionEngine.calculateExpToNextLevel(1);
      const result = ProgressionEngine.addExpToCombatant(beast, expNeeded);
      expect(result.leveledUp).toBe(true);
      expect(result.skillPointsGained).toBe(0);
      expect(result.combatant.skillPoints).toBe(0);
    });
  });

  describe("SkillTreeManager.canUnlockSkill", () => {
    it("rejects non-heroes", () => {
      const beast = createTestHero({ isHero: false });
      const check = SkillTreeManager.canUnlockSkill(
        beast,
        "skill_earth_shield"
      );
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("Only Heroes");
    });

    it("rejects cross-element skills", () => {
      const hero = createTestHero({
        element: Element.Earth,
        level: 10,
        skillPoints: 3,
      });
      const check = SkillTreeManager.canUnlockSkill(hero, "aqua_jet"); // Water skill
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("does not match Hero element");
    });

    it("rejects skills when Hero level is below required level", () => {
      const hero = createTestHero({ level: 5, skillPoints: 2 });
      // skill_stone_wall requires Lv.10
      const check = SkillTreeManager.canUnlockSkill(hero, "skill_stone_wall");
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("Requires Hero Level 10");
    });

    it("rejects skills when Hero has 0 skill points", () => {
      const hero = createTestHero({ level: 5, skillPoints: 0 });
      const check = SkillTreeManager.canUnlockSkill(hero, "skill_earth_shield");
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("Requires 1 Skill Point");
    });

    it("rejects skills when prerequisite skill is not learned", () => {
      const hero = createTestHero({
        level: 12,
        skillPoints: 2,
        unlockedSkillIds: [],
      });
      // skill_stone_wall requires skill_earth_shield
      const check = SkillTreeManager.canUnlockSkill(hero, "skill_stone_wall");
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("Prerequisite ability not learned");
    });

    it("rejects Capstone Ultimate if neither branch Tier 3 is completed", () => {
      const hero = createTestHero({
        level: 30,
        skillPoints: 5,
        unlockedSkillIds: ["skill_earth_shield", "skill_stone_wall"], // only Tier 2
      });
      const check = SkillTreeManager.canUnlockSkill(
        hero,
        "skill_ultimate_gaia_wrath"
      );
      expect(check.canUnlock).toBe(false);
      expect(check.reason).toContain("Requires completing Tier 3");
    });

    it("approves Capstone Ultimate when Tier 3 of Branch A is learned and Lv.30", () => {
      const hero = createTestHero({
        level: 30,
        skillPoints: 2,
        unlockedSkillIds: [
          "skill_earth_shield",
          "skill_stone_wall",
          "skill_clay_regeneration", // Tier 3 Branch A
        ],
      });
      const check = SkillTreeManager.canUnlockSkill(
        hero,
        "skill_ultimate_gaia_wrath"
      );
      expect(check.canUnlock).toBe(true);
    });

    it("approves Tier 1 unlock when Level 1 and 1 SP", () => {
      const hero = createTestHero({ level: 1, skillPoints: 1 });
      const check = SkillTreeManager.canUnlockSkill(hero, "skill_earth_shield");
      expect(check.canUnlock).toBe(true);
    });
  });

  describe("SkillTreeManager.unlockSkill & Auto-Equip", () => {
    it("deducts Skill Point and adds to unlockedSkillIds", () => {
      const hero = createTestHero({
        level: 1,
        skillPoints: 2,
        unlockedSkillIds: [],
      });
      const res = SkillTreeManager.unlockSkill(hero, "skill_earth_shield");

      expect(res.success).toBe(true);
      expect(res.hero.skillPoints).toBe(1);
      expect(res.hero.unlockedSkillIds).toContain("skill_earth_shield");
    });

    it("auto-equips learned skill into first available flexible slot (slot 2)", () => {
      const hero = createTestHero({
        level: 1,
        skillPoints: 2,
        unlockedSkillIds: [],
      });
      const res = SkillTreeManager.unlockSkill(hero, "skill_earth_shield");

      expect(res.success).toBe(true);
      expect(res.autoEquippedSlot).toBe(2);
      const slot2 = res.hero.skillSlots?.find((s) => s.slotIndex === 2);
      expect(slot2?.skillId).toBe("skill_earth_shield");
    });
  });

  describe("SkillTreeManager.equipSkillToSlot & unequipSkillSlot", () => {
    it("refuses to overwrite slot 0 (innate signature)", () => {
      const hero = createTestHero({ unlockedSkillIds: ["skill_earth_shield"] });
      const res = SkillTreeManager.equipSkillToSlot(
        hero,
        "skill_earth_shield",
        0
      );
      expect(res.success).toBe(false);
      expect(res.reason).toContain("Slot 0 is the innate Signature skill");
    });

    it("refuses to equip an unlearned skill", () => {
      const hero = createTestHero({ unlockedSkillIds: [] });
      const res = SkillTreeManager.equipSkillToSlot(
        hero,
        "skill_earth_shield",
        2
      );
      expect(res.success).toBe(false);
      expect(res.reason).toContain("Skill must be unlocked");
    });

    it("equips learned skill into flexible slot 2 and allows unequipping", () => {
      const hero = createTestHero({ unlockedSkillIds: ["skill_earth_shield"] });
      const equipRes = SkillTreeManager.equipSkillToSlot(
        hero,
        "skill_earth_shield",
        2
      );
      expect(equipRes.success).toBe(true);

      const slot2 = equipRes.hero.skillSlots?.find((s) => s.slotIndex === 2);
      expect(slot2?.skillId).toBe("skill_earth_shield");

      const unequipRes = SkillTreeManager.unequipSkillSlot(equipRes.hero, 2);
      expect(unequipRes.success).toBe(true);
      const slot2After = unequipRes.hero.skillSlots?.find(
        (s) => s.slotIndex === 2
      );
      expect(slot2After?.skillId).toBeNull();
    });
  });
});
