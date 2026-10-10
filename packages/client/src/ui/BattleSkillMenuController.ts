import Phaser from "phaser";
import {
  Combatant,
  SkillManager,
  getSkillDefinition,
  getSkillDisplayName,
} from "@poktsonline/shared";
import { soundManager } from "../audio/SoundManager.js";

export interface BattleSkillMenuCallbacks {
  onSkillSelected: (skillId: string) => void;
  onCancelled: () => void;
  onWarning?: (msg: string) => void;
}

/**
 * Deep UI Controller for In-Combat 5-Slot Skill Selection (ADR 0020 & 0021).
 * Displays actor's 5 configured skill slots with SP costs, STAB/affinities,
 * and signature locks directly above the combat action HUD.
 */
export class BattleSkillMenuController {
  private scene: Phaser.Scene;
  private callbacks: BattleSkillMenuCallbacks;
  private container?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, callbacks: BattleSkillMenuCallbacks) {
    this.scene = scene;
    this.callbacks = callbacks;
  }

  public isOpen(): boolean {
    return !!this.container;
  }

  public show(actor: Combatant): void {
    this.hide();

    const slots = SkillManager.ensureSkillSlots(actor);
    const { width, height } = this.scene.scale;
    const hudY = height - 100;
    const menuY = hudY - 76;

    this.container = this.scene.add.container(width / 2, menuY);
    this.container.setDepth(500);

    const slotCount = slots.length;
    const btnWidth = 142;
    const btnHeight = 40;
    const spacing = 8;
    const totalW = (slotCount + 1) * btnWidth + slotCount * spacing;
    const startX = -totalW / 2 + btnWidth / 2;

    // Background Panel
    const bgPanel = this.scene.add.rectangle(
      0,
      0,
      totalW + 24,
      btnHeight + 20,
      0x0f172a,
      0.96
    );
    bgPanel.setStrokeStyle(1.5, 0x38bdf8, 0.85);
    this.container.add(bgPanel);

    // 5 Skill Slot Buttons
    slots.forEach((slot, idx) => {
      const x = startX + idx * (btnWidth + spacing);
      const skill = slot.skillId ? getSkillDefinition(slot.skillId) : null;

      if (!skill) {
        // Empty Slot Button
        const emptyBtn = this.scene.add.rectangle(
          x,
          0,
          btnWidth,
          btnHeight,
          0x1e293b,
          0.6
        );
        emptyBtn.setStrokeStyle(1, 0x475569, 0.5);

        const emptyText = this.scene.add.text(
          x,
          0,
          `Slot ${idx + 1}\n(Empty)`,
          {
            fontSize: "11px",
            color: "#64748b",
            fontFamily: "monospace",
            align: "center",
          }
        );
        emptyText.setOrigin(0.5);

        this.container?.add([emptyBtn, emptyText]);
        return;
      }

      const spCost = SkillManager.getEffectiveSkillCost(actor, skill);
      const canCast = actor.sp >= spCost;
      const isSTAB = skill.element === actor.element;
      const isSig = slot.isSignature;

      let borderColor = 0x38bdf8;
      let bgColor = 0x1e293b;
      if (isSig) borderColor = 0xf59e0b;
      else if (isSTAB) borderColor = 0x10b981;
      else if (skill.element !== "neutral") borderColor = 0xf97316;

      if (!canCast) {
        borderColor = 0x64748b;
        bgColor = 0x0f172a;
      }

      const btnBg = this.scene.add.rectangle(
        x,
        0,
        btnWidth,
        btnHeight,
        bgColor,
        0.9
      );
      btnBg.setStrokeStyle(1.5, borderColor, 0.9);
      btnBg.setInteractive({ useHandCursor: canCast });

      const shortName = getSkillDisplayName(skill, 14);
      const prefix = isSig ? "⭐ " : "";
      const label = `${prefix}${shortName}\n${spCost} SP`;

      const textColor = canCast
        ? isSig
          ? "#fde047"
          : isSTAB
            ? "#6ee7b7"
            : "#ffffff"
        : "#64748b";

      const btnText = this.scene.add.text(x, 0, label, {
        fontSize: "11px",
        fontStyle: isSig ? "bold" : "normal",
        color: textColor,
        fontFamily: "monospace",
        align: "center",
      });
      btnText.setOrigin(0.5);

      btnBg.on("pointerover", () => {
        if (canCast) btnBg.fillColor = 0x334155;
      });
      btnBg.on("pointerout", () => {
        btnBg.fillColor = bgColor;
      });
      btnBg.on("pointerdown", () => {
        soundManager.playButtonClick();
        if (!canCast) {
          this.scene.cameras.main.shake(100, 0.004);
          this.callbacks.onWarning?.(
            `Not enough SP for ${skill.name}! (Needs ${spCost} SP, has ${actor.sp} SP)`
          );
          return;
        }
        this.hide();
        this.callbacks.onSkillSelected(skill.id);
      });

      this.container?.add([btnBg, btnText]);
    });

    // Cancel Button
    const cancelX = startX + slotCount * (btnWidth + spacing);
    const cancelBtn = this.scene.add.rectangle(
      cancelX,
      0,
      btnWidth,
      btnHeight,
      0x475569,
      0.9
    );
    cancelBtn.setStrokeStyle(1.5, 0x94a3b8);
    cancelBtn.setInteractive({ useHandCursor: true });

    const cancelText = this.scene.add.text(cancelX, 0, "✕ Cancel", {
      fontSize: "12px",
      color: "#e2e8f0",
      fontFamily: "monospace",
    });
    cancelText.setOrigin(0.5);

    cancelBtn.on("pointerover", () => (cancelBtn.fillColor = 0x64748b));
    cancelBtn.on("pointerout", () => (cancelBtn.fillColor = 0x475569));
    cancelBtn.on("pointerdown", () => {
      soundManager.playButtonClick();
      this.hide();
      this.callbacks.onCancelled();
    });

    this.container.add([cancelBtn, cancelText]);
  }

  public hide(): void {
    if (this.container) {
      this.container.destroy();
      this.container = undefined;
    }
  }

  public destroy(): void {
    this.hide();
  }
}
