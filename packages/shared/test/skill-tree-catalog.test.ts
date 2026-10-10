import { describe, it, expect } from "vitest";
import {
  Element,
  ELEMENTAL_SKILL_TREES,
  getElementalSkillTree,
  findSkillTreeNode,
  getSkillDefinition,
} from "../src/index.js";

describe("Elemental Skill Tree Catalog (ADR 0008)", () => {
  const elements = [Element.Earth, Element.Water, Element.Fire, Element.Wind];

  it("defines a skill tree configuration for all 4 elements", () => {
    elements.forEach((el) => {
      const tree = getElementalSkillTree(el);
      expect(tree).toBeDefined();
      expect(tree.element).toBe(el);
      expect(tree.branchAName).toBeTruthy();
      expect(tree.branchBName).toBeTruthy();
      expect(tree.nodes.length).toBe(7); // 3 branch A + 3 branch B + 1 ultimate
    });
  });

  it("ensures every skill tree node has a valid skill in SKILL_DATABASE with matching element", () => {
    elements.forEach((el) => {
      const tree = ELEMENTAL_SKILL_TREES[el];
      tree.nodes.forEach((node) => {
        const def = getSkillDefinition(node.skillId);
        expect(
          def,
          `Skill ${node.skillId} should exist in SKILL_DATABASE`
        ).toBeDefined();
        expect(
          def!.element,
          `Skill ${node.skillId} element should match tree element ${el}`
        ).toBe(el);
      });
    });
  });

  it("verifies linear prerequisite progression along Branch A and Branch B", () => {
    elements.forEach((el) => {
      const tree = ELEMENTAL_SKILL_TREES[el];
      ["branch_a", "branch_b"].forEach((branch) => {
        const branchNodes = tree.nodes.filter((n) => n.branch === branch);
        expect(branchNodes.length).toBe(3);

        const tier1 = branchNodes.find((n) => n.tier === 1)!;
        const tier2 = branchNodes.find((n) => n.tier === 2)!;
        const tier3 = branchNodes.find((n) => n.tier === 3)!;

        expect(tier1.requiredLevel).toBe(1);
        expect(tier1.requiredSkillId).toBeUndefined();

        expect(tier2.requiredLevel).toBe(10);
        expect(tier2.requiredSkillId).toBe(tier1.skillId);

        expect(tier3.requiredLevel).toBe(20);
        expect(tier3.requiredSkillId).toBe(tier2.skillId);
      });
    });
  });

  it("verifies capstone ultimate node requires Lv.30 and is flagged isUltimate", () => {
    elements.forEach((el) => {
      const tree = ELEMENTAL_SKILL_TREES[el];
      const ultimate = tree.nodes.find((n) => n.isUltimate);
      expect(ultimate).toBeDefined();
      expect(ultimate!.tier).toBe(4);
      expect(ultimate!.requiredLevel).toBe(30);
      expect(ultimate!.skillPointCost).toBe(1);
    });
  });

  it("findSkillTreeNode locates node and its parent elemental tree", () => {
    const res = findSkillTreeNode("skill_stone_wall");
    expect(res).toBeDefined();
    expect(res!.node.skillId).toBe("skill_stone_wall");
    expect(res!.config.element).toBe(Element.Earth);

    const nonExistent = findSkillTreeNode("skill_unknown_xyz");
    expect(nonExistent).toBeUndefined();
  });
});
