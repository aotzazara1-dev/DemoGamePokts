import Phaser from "phaser";
import { Combatant } from "@poktsonline/shared";
import { soundManager } from "../audio/SoundManager.js";

export interface BattleSwapMenuCallbacks {
  onSelectReserveBeast: (beastId: string) => void;
  onCancelled: () => void;
  onWarning?: (msg: string) => void;
}

/**
 * Deep UI Controller for In-Combat Reserve Beast Swapping (ADR 0011 & 0020).
 * Displays living reserve beasts from the player's active roster
 * as interactive summon cards directly in the combat canvas.
 */
export class BattleSwapMenuController {
  private scene: Phaser.Scene;
  private callbacks: BattleSwapMenuCallbacks;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: BattleSwapMenuCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
  }

  public isOpen(): boolean {
    return !!this.container;
  }

  public hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }

  public show(
    actor: Combatant,
    rosterBeasts: Combatant[],
    activeBeastId: string | null
  ): void {
    this.hide();

    // 1. Validation: Only Hero can swap
    if (!actor.isHero) {
      this.callbacks.onWarning?.("Only the Hero can command a companion swap!");
      return;
    }

    // 2. Filter reserve beasts (excluding currently deployed active beast)
    const reserveBeasts = rosterBeasts.filter((b) => b.id !== activeBeastId);

    if (reserveBeasts.length === 0) {
      this.callbacks.onWarning?.("No reserve companions available in roster!");
      return;
    }

    const { width, height } = this.scene.scale;
    const hudY = height - 100;
    const menuY = hudY - 80;

    this.container = this.scene.add.container(width / 2, menuY);
    this.container.setDepth(500);

    const cardCount = reserveBeasts.length;
    const cardWidth = 140;
    const cardHeight = 56;
    const spacing = 10;
    const cancelWidth = 80;

    const totalW =
      cardCount * cardWidth + (cardCount - 1) * spacing + cancelWidth + 16;
    const startX = -totalW / 2 + cardWidth / 2;

    // Background Panel
    const bgPanel = this.scene.add.rectangle(
      0,
      0,
      totalW + 28,
      cardHeight + 28,
      0x0f172a,
      0.96
    );
    bgPanel.setStrokeStyle(1.5, 0x0284c7, 0.9);
    this.container.add(bgPanel);

    // Title label
    const titleText = this.scene.add.text(
      -totalW / 2 + 10,
      -cardHeight / 2 - 8,
      "🔄 SELECT RESERVE COMPANION (Consumes Hero turn):",
      {
        fontSize: "11px",
        color: "#38bdf8",
        fontFamily: "monospace",
        fontStyle: "bold",
      }
    );
    this.container.add(titleText);

    // Render each reserve beast card
    reserveBeasts.forEach((beast, idx) => {
      const x = startX + idx * (cardWidth + spacing);
      const isConscious = beast.hp > 0;

      const cardBg = this.scene.add.rectangle(
        x,
        6,
        cardWidth,
        cardHeight,
        isConscious ? 0x1e293b : 0x18181b,
        0.9
      );
      cardBg.setStrokeStyle(1, isConscious ? 0x38bdf8 : 0x52525b, 0.7);

      const nameText = this.scene.add
        .text(x, -10, `${beast.name} [${beast.element}]`, {
          fontSize: "11px",
          color: isConscious ? "#f1f5f9" : "#71717a",
          fontFamily: "monospace",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      const hpRatio = Math.max(
        0,
        Math.min(1, beast.hp / Math.max(1, beast.maxHp))
      );
      const statsText = this.scene.add
        .text(
          x,
          6,
          isConscious
            ? `Lv.${beast.level} HP:${beast.hp}/${beast.maxHp}`
            : `Lv.${beast.level} (Fainted)`,
          {
            fontSize: "10px",
            color: isConscious
              ? hpRatio > 0.4
                ? "#34d399"
                : "#f87171"
              : "#ef4444",
            fontFamily: "monospace",
          }
        )
        .setOrigin(0.5);

      const spText = this.scene.add
        .text(
          x,
          20,
          isConscious ? `SP: ${beast.sp}/${beast.maxSp}` : "Unconscious",
          {
            fontSize: "10px",
            color: isConscious ? "#38bdf8" : "#52525b",
            fontFamily: "monospace",
          }
        )
        .setOrigin(0.5);

      this.container?.add([cardBg, nameText, statsText, spText]);

      if (isConscious) {
        cardBg.setInteractive({ useHandCursor: true });
        cardBg.on("pointerover", () => {
          cardBg.setFillStyle(0x0369a1, 0.95);
        });
        cardBg.on("pointerout", () => {
          cardBg.setFillStyle(0x1e293b, 0.9);
        });
        cardBg.on("pointerdown", () => {
          soundManager.playButtonClick();
          this.callbacks.onSelectReserveBeast(beast.id);
          this.hide();
        });
      } else {
        cardBg.setInteractive({ useHandCursor: false });
        cardBg.on("pointerdown", () => {
          this.callbacks.onWarning?.(
            `Cannot summon fallen companion ${beast.name}!`
          );
        });
      }
    });

    // Cancel Button
    const cancelX =
      startX +
      cardCount * (cardWidth + spacing) -
      spacing / 2 +
      cancelWidth / 2;
    const cancelBg = this.scene.add.rectangle(
      cancelX,
      6,
      cancelWidth,
      cardHeight,
      0x334155,
      0.9
    );
    cancelBg.setStrokeStyle(1, 0x64748b, 0.8);
    cancelBg.setInteractive({ useHandCursor: true });

    const cancelText = this.scene.add
      .text(cancelX, 6, "✕ Cancel", {
        fontSize: "11px",
        color: "#e2e8f0",
        fontFamily: "monospace",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    cancelBg.on("pointerover", () => cancelBg.setFillStyle(0x475569, 1));
    cancelBg.on("pointerout", () => cancelBg.setFillStyle(0x334155, 0.9));
    cancelBg.on("pointerdown", () => {
      soundManager.playButtonClick();
      this.callbacks.onCancelled();
      this.hide();
    });

    this.container.add([cancelBg, cancelText]);
  }
}
