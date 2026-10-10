// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { DialogueModalController } from "../src/ui/DialogueModalController.js";
import { MAP_DATABASE } from "@poktsonline/shared";

describe("DialogueModalController - Warehouse and Inn Storage Actions", () => {
  let controller: DialogueModalController;
  let onOpenShopMock: ReturnType<typeof vi.fn>;
  let onHealMock: ReturnType<typeof vi.fn>;
  let onOpenWarehouseMock: ReturnType<typeof vi.fn>;
  let onOpenInnStorageMock: ReturnType<typeof vi.fn>;
  let onCloseMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="dialogue-modal" class="dialogue-modal">
        <div id="dialogue-avatar"></div>
        <div id="dialogue-speaker-name"></div>
        <div id="dialogue-speaker-title"></div>
        <div id="dialogue-text"></div>
        <div id="dialogue-options-grid"></div>
        <button id="dialogue-btn-close"></button>
      </div>
    `;

    onOpenShopMock = vi.fn();
    onHealMock = vi.fn();
    onOpenWarehouseMock = vi.fn();
    onOpenInnStorageMock = vi.fn();
    onCloseMock = vi.fn();

    controller = new DialogueModalController({
      onOpenShop: onOpenShopMock,
      onHeal: onHealMock,
      onOpenWarehouse: onOpenWarehouseMock,
      onOpenInnStorage: onOpenInnStorageMock,
      onClose: onCloseMock,
    });
  });

  it("finds Innkeeper Göll in Novice Town and renders dialogue options", () => {
    const noviceTown = MAP_DATABASE["novice_town_and_meadow"];
    expect(noviceTown).toBeDefined();

    const goll = noviceTown.npcs?.find((npc) => npc.id === "npc_goll");
    expect(goll).toBeDefined();
    expect(goll?.name).toContain("Göll");
    expect(goll?.position).toEqual({ x: 10, y: 7 });

    controller.open(goll!);
    expect(controller.isOpen()).toBe(true);

    const nameEl = document.getElementById("dialogue-speaker-name");
    expect(nameEl?.textContent).toBe(goll?.name);

    const optionsGrid = document.getElementById("dialogue-options-grid");
    const buttons = optionsGrid?.querySelectorAll("button");
    expect(buttons?.length).toBe(3);
  });

  it("triggers onOpenWarehouse callback when warehouse option clicked", () => {
    const noviceTown = MAP_DATABASE["novice_town_and_meadow"];
    const goll = noviceTown.npcs?.find((npc) => npc.id === "npc_goll")!;

    controller.open(goll);

    const optionsGrid = document.getElementById("dialogue-options-grid");
    const warehouseBtn = Array.from(
      optionsGrid?.querySelectorAll("button") || []
    ).find((b) => b.textContent?.includes("คลังเก็บไอเทม"));
    expect(warehouseBtn).toBeDefined();

    warehouseBtn?.click();

    expect(onOpenWarehouseMock).toHaveBeenCalledTimes(1);
    expect(onOpenWarehouseMock).toHaveBeenCalledWith(goll);
    expect(controller.isOpen()).toBe(false);
  });

  it("triggers onOpenInnStorage callback when inn beasts option clicked", () => {
    const noviceTown = MAP_DATABASE["novice_town_and_meadow"];
    const goll = noviceTown.npcs?.find((npc) => npc.id === "npc_goll")!;

    controller.open(goll);

    const optionsGrid = document.getElementById("dialogue-options-grid");
    const innBtn = Array.from(
      optionsGrid?.querySelectorAll("button") || []
    ).find((b) => b.textContent?.includes("โรงเตี๊ยมรับฝากขุนพล"));
    expect(innBtn).toBeDefined();

    innBtn?.click();

    expect(onOpenInnStorageMock).toHaveBeenCalledTimes(1);
    expect(onOpenInnStorageMock).toHaveBeenCalledWith(goll);
    expect(controller.isOpen()).toBe(false);
  });
});
