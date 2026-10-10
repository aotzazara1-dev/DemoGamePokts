import { describe, it, expect, beforeEach } from "vitest";
import {
  Element,
  Combatant,
  SkillManager,
  getSkillDefinition,
  SKILL_DATABASE,
} from "../src/index.js";

describe("SkillManager & 5-Slot Skill Architecture (ADR 0021)", () => {
  let luBu: Combatant;
  let kojiro: Combatant;
  let adam: Combatant;
  let thor: Combatant;
  let hero: Combatant;

  beforeEach(() => {
    luBu = {
      id: "champ_lu_bu",
      name: "Lu Bu",
      isHero: false,
      level: 15,
      element: Element.Fire,
      hp: 300,
      maxHp: 300,
      sp: 80,
      maxSp: 80,
      atk: 55,
      def: 25,
      int: 15,
      agi: 28,
    };

    kojiro = {
      id: "champ_sasaki_kojiro",
      name: "Sasaki Kojiro",
      isHero: false,
      level: 15,
      element: Element.Water,
      hp: 250,
      maxHp: 250,
      sp: 90,
      maxSp: 90,
      atk: 45,
      def: 20,
      int: 30,
      agi: 35,
    };

    adam = {
      id: "champ_adam",
      name: "Adam",
      isHero: false,
      level: 15,
      element: Element.Earth,
      hp: 320,
      maxHp: 320,
      sp: 70,
      maxSp: 70,
      atk: 48,
      def: 35,
      int: 18,
      agi: 25,
    };

    thor = {
      id: "champ_thor",
      name: "Thor",
      isHero: false,
      level: 15,
      element: Element.Wind,
      hp: 290,
      maxHp: 290,
      sp: 85,
      maxSp: 85,
      atk: 52,
      def: 28,
      int: 22,
      agi: 26,
    };

    hero = {
      id: "hero_main",
      name: "Isekai Hero",
      isHero: true,
      level: 10,
      element: Element.Fire,
      hp: 200,
      maxHp: 200,
      sp: 60,
      maxSp: 60,
      atk: 35,
      def: 22,
      int: 20,
      agi: 22,
    };
  });

  describe("Starter Skill Allocation & Signature Skills", () => {
    it("allocates exactly 5 slots with immutable Signature skills for Lu Bu", () => {
      const slots = SkillManager.ensureSkillSlots(luBu);
      expect(slots.length).toBe(5);

      // Slots 0 & 1 are Signatures
      expect(slots[0].skillId).toBe("skill_sky_piercer");
      expect(slots[0].isSignature).toBe(true);

      expect(slots[1].skillId).toBe("skill_god_of_war_rage");
      expect(slots[1].isSignature).toBe(true);

      // Slot 2 is flexible starter
      expect(slots[2].skillId).toBe("flame_strike");
      expect(slots[2].isSignature).toBe(false);

      // Slots 3 & 4 are empty
      expect(slots[3].skillId).toBeNull();
      expect(slots[3].isSignature).toBe(false);
      expect(slots[4].skillId).toBeNull();
      expect(slots[4].isSignature).toBe(false);
    });

    it("allocates Signature skills for Kojiro, Adam, and Thor", () => {
      const kojiroSlots = SkillManager.ensureSkillSlots(kojiro);
      expect(kojiroSlots[0].skillId).toBe("skill_tsubame_gaeshi");
      expect(kojiroSlots[0].isSignature).toBe(true);
      expect(kojiroSlots[1].skillId).toBe("skill_thousand_images");
      expect(kojiroSlots[1].isSignature).toBe(true);

      const adamSlots = SkillManager.ensureSkillSlots(adam);
      expect(adamSlots[0].skillId).toBe("skill_eyes_of_the_lord");
      expect(adamSlots[0].isSignature).toBe(true);

      const thorSlots = SkillManager.ensureSkillSlots(thor);
      expect(thorSlots[0].skillId).toBe("skill_geirrod_hammer");
      expect(thorSlots[0].isSignature).toBe(true);
    });

    it("allocates elemental signature skill for the Hero", () => {
      const heroSlots = SkillManager.ensureSkillSlots(hero);
      expect(heroSlots[0].skillId).toBe("skill_hero_blazing_slash");
      expect(heroSlots[0].isSignature).toBe(true);
      expect(heroSlots[1].skillId).toBe("flame_strike");
      expect(heroSlots[1].isSignature).toBe(false);
      expect(heroSlots[2].skillId).toBeNull();
    });
  });

  describe("STAB & Cross-Element Damage Multipliers", () => {
    it("applies +25% STAB bonus when skill element matches combatant element", () => {
      // flame_strike base multiplier is 1.5. Lu Bu is Fire.
      // 1.5 * 1.25 = 1.88
      const stabMult = SkillManager.getEffectiveSkillMultiplier(
        luBu,
        "flame_strike"
      );
      expect(stabMult).toBe(1.88);
    });

    it("applies 0.8x penalty for cross-element skills", () => {
      // gale_slash base multiplier is 1.3. Lu Bu is Fire, skill is Wind.
      // 1.3 * 0.8 = 1.04
      const penaltyMult = SkillManager.getEffectiveSkillMultiplier(
        luBu,
        "gale_slash"
      );
      expect(penaltyMult).toBe(1.04);
    });

    it("preserves exact multiplier for neutral skills", () => {
      // skill_power_strike base multiplier is 1.5.
      const neutralMult = SkillManager.getEffectiveSkillMultiplier(
        luBu,
        "skill_power_strike"
      );
      expect(neutralMult).toBe(1.5);
    });
  });

  describe("SP Cost Surcharge", () => {
    it("charges normal SP for matching element and neutral skills", () => {
      // flame_strike base cost is 12 SP
      expect(SkillManager.getEffectiveSkillCost(luBu, "flame_strike")).toBe(12);

      // skill_power_strike base cost is 8 SP (neutral)
      expect(
        SkillManager.getEffectiveSkillCost(luBu, "skill_power_strike")
      ).toBe(8);
    });

    it("charges +50% SP surcharge for cross-element skills", () => {
      // gale_slash base cost is 8 SP. 8 * 1.5 = 12 SP
      expect(SkillManager.getEffectiveSkillCost(luBu, "gale_slash")).toBe(12);

      // skill_cyclone_barrage base cost is 20 SP. 20 * 1.5 = 30 SP
      expect(
        SkillManager.getEffectiveSkillCost(luBu, "skill_cyclone_barrage")
      ).toBe(30);
    });
  });

  describe("Forbidden Opposite Element Rule", () => {
    it("identifies forbidden opposing cycle elements", () => {
      // Fire opposes Water
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Fire, Element.Water)
      ).toBe(true);
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Fire, Element.Wind)
      ).toBe(false);
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Fire, "neutral")
      ).toBe(false);

      // Earth opposes Wind
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Earth, Element.Wind)
      ).toBe(true);
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Earth, Element.Water)
      ).toBe(false);

      // Water opposes Earth
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Water, Element.Earth)
      ).toBe(true);

      // Wind opposes Fire
      expect(
        SkillManager.isForbiddenOppositeElement(Element.Wind, Element.Fire)
      ).toBe(true);
    });

    it("blocks learning skills from the forbidden opposing element", () => {
      // Lu Bu (Fire) cannot learn aqua_jet (Water)
      const res = SkillManager.canLearnSkill(luBu, "aqua_jet");
      expect(res.canLearn).toBe(false);
      expect(res.reason).toContain("cannot harness opposing Water energy");

      // Adam (Earth) cannot learn gale_slash (Wind)
      const adamRes = SkillManager.canLearnSkill(adam, "gale_slash");
      expect(adamRes.canLearn).toBe(false);
      expect(adamRes.reason).toContain("cannot harness opposing Wind energy");
    });

    it("allows learning skills from allied or neutral elements", () => {
      // Lu Bu (Fire) CAN learn Wind skills (gale_slash) and Neutral skills
      expect(SkillManager.canLearnSkill(luBu, "gale_slash").canLearn).toBe(
        true
      );
      expect(
        SkillManager.canLearnSkill(luBu, "skill_power_strike").canLearn
      ).toBe(true);
    });
  });

  describe("Learning and Forgetting Skills", () => {
    it("teaches new skill into first empty slot", () => {
      const res = SkillManager.learnSkill(luBu, "skill_wind_haste");
      expect(res.success).toBe(true);
      expect(res.slotIndex).toBe(3); // First empty slot

      const slots = SkillManager.ensureSkillSlots(luBu);
      expect(slots[3].skillId).toBe("skill_wind_haste");
      expect(slots[3].isSignature).toBe(false);
    });

    it("prevents overwriting Signature skill slots", () => {
      // Slot 0 is Lu Bu's Sky Piercer
      const res = SkillManager.learnSkill(luBu, "skill_wind_haste", 0);
      expect(res.success).toBe(false);
      expect(res.reason).toContain("Cannot replace an innate Signature skill");
    });

    it("allows overwriting a flexible skill slot", () => {
      // Slot 2 has flame_strike (flexible)
      const res = SkillManager.learnSkill(luBu, "skill_wind_haste", 2);
      expect(res.success).toBe(true);
      expect(res.slotIndex).toBe(2);

      const slots = SkillManager.ensureSkillSlots(luBu);
      expect(slots[2].skillId).toBe("skill_wind_haste");
    });

    it("allows forgetting a flexible skill slot but blocks forgetting Signature slots", () => {
      // Forgetting flexible slot 2
      const forgetFlex = SkillManager.forgetSkill(luBu, 2);
      expect(forgetFlex.success).toBe(true);
      expect(luBu.skillSlots![2].skillId).toBeNull();

      // Forgetting signature slot 0
      const forgetSig = SkillManager.forgetSkill(luBu, 0);
      expect(forgetSig.success).toBe(false);
      expect(forgetSig.reason).toContain(
        "Cannot forget an innate Signature skill"
      );
      expect(luBu.skillSlots![0].skillId).toBe("skill_sky_piercer");
    });

    it("rejects learning duplicate skills already in another slot", () => {
      // Lu Bu already has flame_strike in slot 2
      const res = SkillManager.canLearnSkill(luBu, "flame_strike");
      expect(res.canLearn).toBe(false);
      expect(res.reason).toContain("already knows");
    });
  });
});
