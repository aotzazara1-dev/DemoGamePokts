import { describe, it, expect, vi, beforeEach } from "vitest";
import { BattleSkillMenuController } from "../src/ui/BattleSkillMenuController.js";
import { Combatant, Element, SkillManager } from "@poktsonline/shared";

describe("BattleSkillMenuController", () => {
  let mockScene: any;
  let createdContainers: any[];
  let createdRectangles: any[];
  let createdTexts: any[];

  const createMockCombatant = (sp = 50, maxSp = 50): Combatant => ({
    id: "hero_1",
    name: "Hero",
    isHero: true,
    level: 5,
    element: Element.Water,
    hp: 100,
    maxHp: 100,
    sp,
    maxSp,
    atk: 30,
    def: 20,
    int: 15,
    agi: 20,
  });

  beforeEach(() => {
    createdContainers = [];
    createdRectangles = [];
    createdTexts = [];

    mockScene = {
      scale: { width: 800, height: 600 },
      cameras: {
        main: {
          shake: vi.fn(),
        },
      },
      add: {
        container: vi.fn((x: number, y: number) => {
          const children: any[] = [];
          const container = {
            x,
            y,
            children,
            depth: 0,
            setDepth: vi.fn((d: number) => {
              container.depth = d;
              return container;
            }),
            add: vi.fn((items: any) => {
              if (Array.isArray(items)) children.push(...items);
              else children.push(items);
              return container;
            }),
            destroy: vi.fn(() => {
              children.length = 0;
            }),
          };
          createdContainers.push(container);
          return container;
        }),
        rectangle: vi.fn(
          (
            x: number,
            y: number,
            w: number,
            h: number,
            color: number,
            alpha?: number
          ) => {
            const listeners: Record<string, Function> = {};
            const rect = {
              x,
              y,
              w,
              h,
              fillColor: color,
              fillAlpha: alpha,
              setStrokeStyle: vi.fn(),
              setInteractive: vi.fn(() => rect),
              on: vi.fn((event: string, fn: Function) => {
                listeners[event] = fn;
                return rect;
              }),
              _trigger: (event: string) => listeners[event]?.(),
            };
            createdRectangles.push(rect);
            return rect;
          }
        ),
        text: vi.fn((x: number, y: number, text: string, style?: any) => {
          const t = {
            x,
            y,
            text,
            style,
            setOrigin: vi.fn(() => t),
          };
          createdTexts.push(t);
          return t;
        }),
      },
    };
  });

  it("initializes in closed state and tracks isOpen accurately", () => {
    const onSkillSelected = vi.fn();
    const onCancelled = vi.fn();
    const controller = new BattleSkillMenuController(mockScene, {
      onSkillSelected,
      onCancelled,
    });

    expect(controller.isOpen()).toBe(false);

    const hero = createMockCombatant();
    controller.show(hero);
    expect(controller.isOpen()).toBe(true);

    controller.hide();
    expect(controller.isOpen()).toBe(false);
  });

  it("renders 5 skill slots and a cancel button for active combatant", () => {
    const controller = new BattleSkillMenuController(mockScene, {
      onSkillSelected: vi.fn(),
      onCancelled: vi.fn(),
    });

    const hero = createMockCombatant();
    controller.show(hero);

    // Created panel + 5 slots + 1 cancel button
    expect(createdContainers.length).toBe(1);
    // Buttons: 1 bgPanel + 5 slot buttons + 1 cancel button = 7 rectangles
    expect(createdRectangles.length).toBe(7);

    // Texts should include signature skill and cancel
    const textStrings = createdTexts.map((t) => t.text);
    expect(textStrings.some((s) => s.includes("Tidal Surge"))).toBe(true);
    expect(textStrings.some((s) => s.includes("Cancel"))).toBe(true);
  });

  it("triggers onSkillSelected when clicking an available skill", () => {
    const onSkillSelected = vi.fn();
    const controller = new BattleSkillMenuController(mockScene, {
      onSkillSelected,
      onCancelled: vi.fn(),
    });

    const hero = createMockCombatant(50, 50); // Full SP
    controller.show(hero);

    // First skill button is rect index 1 (0 is bgPanel)
    const firstSkillBtn = createdRectangles[1];
    firstSkillBtn._trigger("pointerdown");

    expect(onSkillSelected).toHaveBeenCalled();
    expect(controller.isOpen()).toBe(false);
  });

  it("triggers onCancelled when clicking the Cancel button", () => {
    const onCancelled = vi.fn();
    const controller = new BattleSkillMenuController(mockScene, {
      onSkillSelected: vi.fn(),
      onCancelled,
    });

    const hero = createMockCombatant();
    controller.show(hero);

    // Cancel button is the last rectangle (index 6)
    const cancelBtn = createdRectangles[createdRectangles.length - 1];
    cancelBtn._trigger("pointerdown");

    expect(onCancelled).toHaveBeenCalled();
    expect(controller.isOpen()).toBe(false);
  });

  it("warns and shakes camera when attempting to cast a skill with insufficient SP", () => {
    const onWarning = vi.fn();
    const onSkillSelected = vi.fn();
    const controller = new BattleSkillMenuController(mockScene, {
      onSkillSelected,
      onCancelled: vi.fn(),
      onWarning,
    });

    const lowSpHero = createMockCombatant(2, 50); // Only 2 SP (skills cost 10-18 SP)
    controller.show(lowSpHero);

    const firstSkillBtn = createdRectangles[1];
    firstSkillBtn._trigger("pointerdown");

    expect(onSkillSelected).not.toHaveBeenCalled();
    expect(onWarning).toHaveBeenCalledWith(
      expect.stringContaining("Not enough SP")
    );
    expect(mockScene.cameras.main.shake).toHaveBeenCalled();
    expect(controller.isOpen()).toBe(true); // Remains open
  });
});
