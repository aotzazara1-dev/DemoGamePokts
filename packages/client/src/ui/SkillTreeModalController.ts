import {
  type Combatant,
  type SkillTreeNode,
  type ElementalSkillTreeConfig,
  getElementalSkillTree,
  getSkillDefinition,
  SkillTreeManager,
} from "@poktsonline/shared";

export interface SkillTreeModalCallbacks {
  onHeroUpdated?: (hero: Combatant) => void;
  onShowToast?: (msg: string, color?: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for Hero Elemental Skill Tree (ADR 0008, ADR 0020).
 * Strictly <= 400 lines.
 */
export class SkillTreeModalController {
  private hero: Combatant;
  private callbacks: SkillTreeModalCallbacks;
  private isModalOpen: boolean = false;
  private activeEquipSkillId: string | null = null;

  constructor(hero: Combatant, callbacks: SkillTreeModalCallbacks = {}) {
    this.hero = SkillTreeManager.ensureHeroSkillTreeState(hero);
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public setHero(hero: Combatant): void {
    this.hero = SkillTreeManager.ensureHeroSkillTreeState(hero);
    if (this.isModalOpen) {
      this.render();
    }
  }

  public getHero(): Combatant {
    return this.hero;
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public toggle(forceOpen?: boolean): void {
    const modal = document.getElementById("skill-tree-modal");
    if (!modal) return;

    this.isModalOpen = forceOpen !== undefined ? forceOpen : !this.isModalOpen;

    if (this.isModalOpen) {
      modal.classList.add("open");
      this.activeEquipSkillId = null;
      this.render();
      this.callbacks.onOpen?.();
    } else {
      modal.classList.remove("open");
      this.activeEquipSkillId = null;
      this.callbacks.onClose?.();
    }
  }

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const btn = document.getElementById("btn-skill-tree");
    if (btn) btn.style.display = visible ? "block" : "none";
  }

  public render(): void {
    const modal = document.getElementById("skill-tree-modal");
    if (!modal || !this.isModalOpen) return;

    const hero = this.hero;
    const treeConfig = getElementalSkillTree(hero.element);
    if (!treeConfig) return;

    // Header info
    const titleEl = document.getElementById("skill-tree-title");
    if (titleEl) {
      titleEl.innerText = `🌳 Elemental Skill Tree: [${hero.element}] ${hero.name}`;
    }

    const pointsBadge = document.getElementById("skill-tree-points-badge");
    const points = hero.skillPoints ?? 0;
    if (pointsBadge) {
      pointsBadge.innerText = `⭐ ${points} Skill Point${points === 1 ? "" : "s"} Available`;
      pointsBadge.style.color = points > 0 ? "#fbbf24" : "#94a3b8";
      pointsBadge.style.borderColor = points > 0 ? "#fbbf24" : "#475569";
    }

    // Render Branch A & B
    const branchAContainer = document.getElementById("skill-tree-branch-a");
    const branchBContainer = document.getElementById("skill-tree-branch-b");
    const ultimateContainer = document.getElementById(
      "skill-tree-ultimate-container"
    );

    if (branchAContainer) {
      this.renderBranch(
        branchAContainer,
        treeConfig.branchAName,
        treeConfig.nodes.filter((n) => n.branch === "branch_a")
      );
    }
    if (branchBContainer) {
      this.renderBranch(
        branchBContainer,
        treeConfig.branchBName,
        treeConfig.nodes.filter((n) => n.branch === "branch_b")
      );
    }
    if (ultimateContainer) {
      const ultNode = treeConfig.nodes.find((n) => n.isUltimate);
      if (ultNode) this.renderUltimate(ultimateContainer, ultNode);
    }

    this.renderEquipOverlay();
  }

  private renderBranch(
    container: HTMLElement,
    branchName: string,
    nodes: SkillTreeNode[]
  ): void {
    container.innerHTML = "";

    const title = document.createElement("div");
    title.className = "st-branch-title";
    title.innerText = branchName;
    container.appendChild(title);

    const sorted = [...nodes].sort((a, b) => a.tier - b.tier);
    sorted.forEach((node, idx) => {
      const card = this.createNodeCard(node);
      container.appendChild(card);

      if (idx < sorted.length - 1) {
        const connector = document.createElement("div");
        connector.className = "st-branch-connector";
        connector.innerText = "↓";
        container.appendChild(connector);
      }
    });
  }

  private renderUltimate(container: HTMLElement, node: SkillTreeNode): void {
    container.innerHTML = "";
    const card = this.createNodeCard(node, true);
    container.appendChild(card);
  }

  private createNodeCard(node: SkillTreeNode, isUltimate = false): HTMLElement {
    const skillDef = getSkillDefinition(node.skillId);
    const unlocked =
      this.hero.unlockedSkillIds?.includes(node.skillId) ?? false;
    const check = SkillTreeManager.canUnlockSkill(this.hero, node.skillId);

    const card = document.createElement("div");
    card.className = `st-node-card ${isUltimate ? "st-node-ultimate" : ""} ${
      unlocked
        ? "st-node-learned"
        : check.canUnlock
          ? "st-node-unlockable"
          : "st-node-locked"
    }`;

    // Icon & category
    const catIcon =
      skillDef?.category === "heal"
        ? "💖"
        : skillDef?.category === "buff"
          ? "🛡️"
          : "⚔️";
    const equippedSlot = this.hero.skillSlots?.find(
      (s) => s.skillId === node.skillId
    )?.slotIndex;

    card.innerHTML = `
      <div class="st-card-header">
        <span class="st-card-tier">Tier ${node.tier}${isUltimate ? " (Ultimate)" : ""}</span>
        <span class="st-card-cost">SP: ${skillDef?.spCost ?? 0}</span>
      </div>
      <div class="st-card-name">${catIcon} ${skillDef?.name || node.skillId}</div>
      <div class="st-card-desc">${skillDef?.description || ""}</div>
      <div class="st-card-reqs">
        <span>Req: Lv.${node.requiredLevel}</span>
        ${node.requiredSkillId ? `<span>Prereq: ${getSkillDefinition(node.requiredSkillId)?.name.split(" (")[0] || ""}</span>` : ""}
      </div>
    `;

    const actionsRow = document.createElement("div");
    actionsRow.className = "st-card-actions";

    if (unlocked) {
      const badge = document.createElement("span");
      badge.className = "st-badge-learned";
      badge.innerText = "✅ เรียนรู้แล้ว";
      actionsRow.appendChild(badge);

      const equipBtn = document.createElement("button");
      equipBtn.className = "st-btn-equip";
      equipBtn.innerText =
        equippedSlot !== undefined
          ? `⚡ ช่อง ${equippedSlot}`
          : "⚡ ติดตั้งลง Slot";
      equipBtn.onclick = () => {
        this.activeEquipSkillId = node.skillId;
        this.renderEquipOverlay();
      };
      actionsRow.appendChild(equipBtn);
    } else if (check.canUnlock) {
      const unlockBtn = document.createElement("button");
      unlockBtn.className = "st-btn-unlock";
      unlockBtn.innerText = `✨ เรียนรู้ (${node.skillPointCost || 1} SP)`;
      unlockBtn.onclick = () => this.handleUnlock(node.skillId);
      actionsRow.appendChild(unlockBtn);
    } else {
      const lockBadge = document.createElement("span");
      lockBadge.className = "st-badge-locked";
      lockBadge.innerText = `🔒 ${check.reason || "ล็อกอยู่"}`;
      actionsRow.appendChild(lockBadge);
    }

    card.appendChild(actionsRow);
    return card;
  }

  private handleUnlock(skillId: string): void {
    const res = SkillTreeManager.unlockSkill(this.hero, skillId);
    if (res.success) {
      this.hero = res.hero;
      const skillName = getSkillDefinition(skillId)?.name || skillId;
      this.callbacks.onShowToast?.(
        `🎉 ปลดล็อกสกิล ${skillName} สำเร็จ!`,
        "#10b981"
      );
      this.callbacks.onHeroUpdated?.(this.hero);
      this.render();
    } else {
      this.callbacks.onShowToast?.(
        `❌ ${res.reason || "ไม่สามารถปลดล็อกได้"}`,
        "#ef4444"
      );
    }
  }

  private renderEquipOverlay(): void {
    const overlay = document.getElementById("st-equip-overlay");
    if (!overlay) return;

    if (!this.activeEquipSkillId) {
      overlay.style.display = "none";
      return;
    }

    overlay.style.display = "flex";
    const skillDef = getSkillDefinition(this.activeEquipSkillId);
    const titleEl = document.getElementById("st-equip-title");
    if (titleEl) {
      titleEl.innerText = `ติดตั้งสกิล: ${skillDef?.name || this.activeEquipSkillId}`;
    }

    const slotsGrid = document.getElementById("st-equip-slots");
    if (!slotsGrid) return;
    slotsGrid.innerHTML = "";

    const slots = this.hero.skillSlots || [];
    for (let slotIndex = 0; slotIndex <= 4; slotIndex++) {
      const slot = slots.find((s) => s.slotIndex === slotIndex);
      const slotBox = document.createElement("div");
      slotBox.className = "st-slot-item";

      const currentSkill = slot?.skillId
        ? getSkillDefinition(slot.skillId)
        : null;
      const isSig = slotIndex === 0;

      slotBox.innerHTML = `
        <div class="st-slot-num">Slot ${slotIndex} ${isSig ? "(ซิกเนเจอร์)" : "(สกิลเสริม)"}</div>
        <div class="st-slot-curr">${currentSkill ? currentSkill.name.split(" (")[0] : "<em>ว่าง</em>"}</div>
      `;

      if (isSig) {
        slotBox.classList.add("st-slot-locked");
        slotBox.title = "ช่องสกิลซิกเนเจอร์ไม่สามารถเปลี่ยนได้";
      } else {
        slotBox.classList.add("st-slot-available");
        slotBox.onclick = () => {
          const res = SkillTreeManager.equipSkillToSlot(
            this.hero,
            this.activeEquipSkillId!,
            slotIndex
          );
          if (res.success) {
            this.hero = res.hero;
            this.callbacks.onShowToast?.(
              `⚡ ติดตั้ง ${skillDef?.name.split(" (")[0]} ลงในช่อง ${slotIndex} สำเร็จ!`,
              "#38bdf8"
            );
            this.callbacks.onHeroUpdated?.(this.hero);
            this.activeEquipSkillId = null;
            this.render();
          } else {
            this.callbacks.onShowToast?.(`❌ ${res.reason}`, "#ef4444");
          }
        };
      }
      slotsGrid.appendChild(slotBox);
    }
  }

  private setupDOM(): void {
    const btnSkillTree = document.getElementById("btn-skill-tree");
    if (btnSkillTree) btnSkillTree.onclick = () => this.toggle();

    const btnClose = document.getElementById("btn-close-skill-tree");
    if (btnClose) btnClose.onclick = () => this.close();

    const btnCancelEquip = document.getElementById("btn-close-st-equip");
    if (btnCancelEquip) {
      btnCancelEquip.onclick = () => {
        this.activeEquipSkillId = null;
        this.renderEquipOverlay();
      };
    }

    const modal = document.getElementById("skill-tree-modal");
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.close();
      };
    }
  }
}
