// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillTreeModalController } from "../src/ui/SkillTreeModalController.js";
import { type Combatant, Element, SkillTreeManager } from "@poktsonline/shared";

describe("SkillTreeModalController", () => {
  let sampleHero: Combatant;
  let controller: SkillTreeModalController;
  let onHeroUpdatedMock: ReturnType<typeof vi.fn>;
  let onShowToastMock: ReturnType<typeof vi.fn>;
  let onOpenMock: ReturnType<typeof vi.fn>;
  let onCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="btn-skill-tree"></button>
      <button id="header-btn-skill-tree"></button>

      <div id="skill-tree-modal" class="st-modal">
        <div class="st-modal-content">
          <div class="st-header">
            <h2 id="skill-tree-title">🌳 Elemental Skill Tree</h2>
            <div id="skill-tree-points-badge" class="st-sp-badge">⭐ 0 Skill Points</div>
            <button id="btn-close-skill-tree" class="st-close-btn">&times;</button>
          </div>
          <div class="st-tree-layout">
            <div id="skill-tree-branch-a" class="st-branch-col"></div>
            <div id="skill-tree-branch-b" class="st-branch-col"></div>
          </div>
          <div id="skill-tree-ultimate-container" class="st-ultimate-box"></div>
          <div id="st-equip-overlay" class="st-equip-overlay" style="display: none;">
            <div class="st-equip-modal">
              <h3 id="st-equip-title"></h3>
              <div id="st-equip-slots" class="st-slots-grid"></div>
              <button id="btn-close-st-equip"></button>
            </div>
          </div>
        </div>
      </div>
    `;

    sampleHero = {
      id: "hero_test",
      name: "TestHero",
      isHero: true,
      level: 10,
      element: Element.Fire,
      hp: 200,
      maxHp: 200,
      sp: 100,
      maxSp: 100,
      atk: 40,
      def: 30,
      int: 20,
      agi: 25,
      skillPoints: 3,
      unlockedSkillIds: ["skill_fireball"],
    };

    onHeroUpdatedMock = vi.fn();
    onShowToastMock = vi.fn();
    onOpenMock = vi.fn();
    onCloseMock = vi.fn();

    controller = new SkillTreeModalController(sampleHero, {
      onHeroUpdated: onHeroUpdatedMock,
      onShowToast: onShowToastMock,
      onOpen: onOpenMock,
      onClose: onCloseMock,
    });
  });

  it("should initialize with default states and ensure hero skill tree state", () => {
    expect(controller.isOpen()).toBe(false);
    const hero = controller.getHero();
    expect(hero.skillPoints).toBe(3);
    expect(hero.unlockedSkillIds).toContain("skill_fireball");
    expect(hero.skillSlots).toBeDefined();
    expect(hero.skillSlots?.length).toBe(5);
  });

  it("should open and close modal and trigger callbacks", () => {
    const modalEl = document.getElementById("skill-tree-modal")!;

    controller.toggle();
    expect(controller.isOpen()).toBe(true);
    expect(modalEl.classList.contains("open")).toBe(true);
    expect(onOpenMock).toHaveBeenCalled();

    controller.close();
    expect(controller.isOpen()).toBe(false);
    expect(modalEl.classList.contains("open")).toBe(false);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("should render correct branches, SP badge, and node cards for Fire element", () => {
    controller.toggle(true);

    const titleEl = document.getElementById("skill-tree-title")!;
    expect(titleEl.innerText).toContain("[Fire] TestHero");

    const badgeEl = document.getElementById("skill-tree-points-badge")!;
    expect(badgeEl.innerText).toContain("3 Skill Points Available");

    const branchA = document.getElementById("skill-tree-branch-a")!;
    const branchB = document.getElementById("skill-tree-branch-b")!;
    const ultContainer = document.getElementById(
      "skill-tree-ultimate-container"
    )!;

    expect(branchA.innerHTML).toContain("Blazing Blade &amp; Might");
    expect(branchB.innerHTML).toContain("Pyroblast &amp; Meteors");
    expect(ultContainer.innerHTML).toContain("Surtr's Calamity");
  });

  it("should unlock an unlockable skill when clicking unlock button", () => {
    controller.toggle(true);

    // Initial SP = 3, Hero is Lv.10 Fire.
    // flame_strike in Branch A requires Lv.1 and Fire.
    const branchA = document.getElementById("skill-tree-branch-a")!;
    const unlockButtons =
      branchA.querySelectorAll<HTMLButtonElement>(".st-btn-unlock");
    expect(unlockButtons.length).toBeGreaterThan(0);

    const unlockBtn = unlockButtons[0];
    unlockBtn.click();

    expect(onHeroUpdatedMock).toHaveBeenCalled();
    expect(onShowToastMock).toHaveBeenCalled();

    const updatedHero = controller.getHero();
    expect(updatedHero.skillPoints).toBe(2);
    expect(updatedHero.unlockedSkillIds).toContain("flame_strike");
  });

  it("should open equip overlay and equip a learned skill to flexible slot", () => {
    // Hero already unlocked skill_fireball (located in Branch B)
    controller.toggle(true);

    const branchB = document.getElementById("skill-tree-branch-b")!;
    const equipButtons =
      branchB.querySelectorAll<HTMLButtonElement>(".st-btn-equip");
    expect(equipButtons.length).toBeGreaterThan(0);

    // Click equip on skill_fireball card
    equipButtons[0].click();

    const overlay = document.getElementById("st-equip-overlay")!;
    expect(overlay.style.display).toBe("flex");

    const slotsGrid = document.getElementById("st-equip-slots")!;
    const slotBoxes = slotsGrid.querySelectorAll<HTMLElement>(".st-slot-item");
    expect(slotBoxes.length).toBe(5);

    // Slot 0 is Signature and locked
    expect(slotBoxes[0].classList.contains("st-slot-locked")).toBe(true);

    // Slot 2 is flexible and available
    expect(slotBoxes[2].classList.contains("st-slot-available")).toBe(true);

    slotBoxes[2].click();

    expect(onHeroUpdatedMock).toHaveBeenCalled();
    expect(onShowToastMock).toHaveBeenCalled();

    const heroAfter = controller.getHero();
    expect(heroAfter.skillSlots?.[2].skillId).toBe("skill_fireball");
  });

  it("should toggle button visibility with setButtonVisible", () => {
    const btn = document.getElementById("btn-skill-tree")!;
    controller.setButtonVisible(false);
    expect(btn.style.display).toBe("none");

    controller.setButtonVisible(true);
    expect(btn.style.display).toBe("block");
  });
});
