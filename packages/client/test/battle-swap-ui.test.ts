import { describe, it, expect, vi, beforeEach } from "vitest";
import { BattleSwapMenuController } from "../src/ui/BattleSwapMenuController.js";
import { Combatant, Element } from "@poktsonline/shared";

describe("BattleSwapMenuController", () => {
  let mockScene: any;
  let createdContainers: any[];
  let createdRectangles: any[];
  let createdTexts: any[];

  const createMockHero = (): Combatant => ({
    id: "hero_1",
    name: "Hero",
    isHero: true,
    level: 10,
    element: Element.Water,
    hp: 100,
    maxHp: 100,
    sp: 50,
    maxSp: 50,
    atk: 30,
    def: 20,
    int: 15,
    agi: 20,
  });

  const createMockBeast = (id: string, name: string, hp = 80): Combatant => ({
    id,
    name,
    isHero: false,
    level: 8,
    element: Element.Fire,
    hp,
    maxHp: 80,
    sp: 30,
    maxSp: 30,
    atk: 25,
    def: 15,
    int: 10,
    agi: 18,
  });

  beforeEach(() => {
    createdContainers = [];
    createdRectangles = [];
    createdTexts = [];

    mockScene = {
      scale: { width: 800, height: 600 },
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
          (x: number, y: number, w: number, h: number, color?: number) => {
            const rect = {
              x,
              y,
              w,
              h,
              color,
              interactive: false,
              events: new Map<string, Function>(),
              setStrokeStyle: vi.fn(),
              setFillStyle: vi.fn((c: number) => {
                rect.color = c;
                return rect;
              }),
              setInteractive: vi.fn((opts?: any) => {
                rect.interactive = true;
                return rect;
              }),
              on: vi.fn((event: string, fn: Function) => {
                rect.events.set(event, fn);
                return rect;
              }),
            };
            createdRectangles.push(rect);
            return rect;
          }
        ),
        text: vi.fn((x: number, y: number, text: string, style?: any) => {
          const textObj = {
            x,
            y,
            text,
            style,
            originX: 0,
            originY: 0,
            setOrigin: vi.fn((ox: number, oy: number = ox) => {
              textObj.originX = ox;
              textObj.originY = oy;
              return textObj;
            }),
          };
          createdTexts.push(textObj);
          return textObj;
        }),
      },
    };
  });

  it("warns and refuses to open if actor is not Hero", () => {
    const onWarning = vi.fn();
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast: vi.fn(),
      onCancelled: vi.fn(),
      onWarning,
    });

    const beastActor = createMockBeast("beast_1", "Lu Bu");
    controller.show(beastActor, [beastActor], "beast_1");

    expect(onWarning).toHaveBeenCalledWith(
      expect.stringContaining("Only the Hero")
    );
    expect(controller.isOpen()).toBe(false);
  });

  it("warns if no reserve beasts are in roster", () => {
    const onWarning = vi.fn();
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast: vi.fn(),
      onCancelled: vi.fn(),
      onWarning,
    });

    const hero = createMockHero();
    const activeBeast = createMockBeast("beast_active", "Lu Bu");

    // Only active beast, no reserves
    controller.show(hero, [activeBeast], "beast_active");

    expect(onWarning).toHaveBeenCalledWith(
      expect.stringContaining("No reserve companions")
    );
    expect(controller.isOpen()).toBe(false);
  });

  it("filters out active beast and renders reserve beasts", () => {
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast: vi.fn(),
      onCancelled: vi.fn(),
    });

    const hero = createMockHero();
    const activeBeast = createMockBeast("beast_active", "Lu Bu");
    const reserve1 = createMockBeast("beast_res_1", "Thor");
    const reserve2 = createMockBeast("beast_res_2", "Adam");

    controller.show(hero, [activeBeast, reserve1, reserve2], "beast_active");

    expect(controller.isOpen()).toBe(true);
    // Texts should contain Thor and Adam, but not Lu Bu
    const names = createdTexts.map((t) => t.text);
    expect(names.some((n) => n.includes("Thor"))).toBe(true);
    expect(names.some((n) => n.includes("Adam"))).toBe(true);
    expect(names.some((n) => n.includes("Lu Bu"))).toBe(false);
  });

  it("clicking a conscious reserve beast calls onSelectReserveBeast", () => {
    const onSelectReserveBeast = vi.fn();
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast,
      onCancelled: vi.fn(),
    });

    const hero = createMockHero();
    const activeBeast = createMockBeast("beast_active", "Lu Bu");
    const reserve = createMockBeast("beast_res_1", "Thor", 80);

    controller.show(hero, [activeBeast, reserve], "beast_active");

    // Find the clickable card rectangle for the reserve beast (not the background panel, not cancel)
    // The reserve card rectangle has interactive = true
    const cardRect = createdRectangles.find(
      (r) => r.interactive && r.w === 140 && r.events.has("pointerdown")
    );
    expect(cardRect).toBeDefined();

    // Simulate pointerdown
    cardRect.events.get("pointerdown")();

    expect(onSelectReserveBeast).toHaveBeenCalledWith("beast_res_1");
    expect(controller.isOpen()).toBe(false);
  });

  it("clicking a fainted reserve beast warns and does not select", () => {
    const onSelectReserveBeast = vi.fn();
    const onWarning = vi.fn();
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast,
      onCancelled: vi.fn(),
      onWarning,
    });

    const hero = createMockHero();
    const activeBeast = createMockBeast("beast_active", "Lu Bu");
    const faintedReserve = createMockBeast("beast_dead", "Thor", 0); // HP 0

    controller.show(hero, [activeBeast, faintedReserve], "beast_active");

    const faintedCard = createdRectangles.find(
      (r) => r.w === 140 && r.events.has("pointerdown")
    );
    expect(faintedCard).toBeDefined();

    faintedCard.events.get("pointerdown")();

    expect(onWarning).toHaveBeenCalledWith(
      expect.stringContaining("Cannot summon fallen companion")
    );
    expect(onSelectReserveBeast).not.toHaveBeenCalled();
    expect(controller.isOpen()).toBe(true); // Stays open
  });

  it("clicking cancel calls onCancelled and closes menu", () => {
    const onCancelled = vi.fn();
    const controller = new BattleSwapMenuController(mockScene, {
      onSelectReserveBeast: vi.fn(),
      onCancelled,
    });

    const hero = createMockHero();
    const activeBeast = createMockBeast("beast_active", "Lu Bu");
    const reserve = createMockBeast("beast_res_1", "Thor");

    controller.show(hero, [activeBeast, reserve], "beast_active");

    const cancelRect = createdRectangles.find(
      (r) => r.w === 80 && r.events.has("pointerdown")
    );
    expect(cancelRect).toBeDefined();

    cancelRect.events.get("pointerdown")();

    expect(onCancelled).toHaveBeenCalled();
    expect(controller.isOpen()).toBe(false);
  });
});
