import {
  Combatant,
  PlayerRosterState,
  InventoryState,
  EquipmentManager,
  type EquipmentSlot,
  getItemDefinition,
  getItemIcon,
} from "@poktsonline/shared";

export interface EquipmentModalCallbacks {
  onEquipItem?: (
    itemId: string,
    targetType: "hero" | "champion",
    championId?: string
  ) => void;
  onUnequipItem?: (
    targetType: "hero" | "champion",
    championId: string | undefined,
    slot: EquipmentSlot
  ) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for the dedicated Equipment & Arms Hub modal ([E]).
 * Manages equipment slots, gear bag, and unit switching between Hero and all Roster Champions.
 */
export class EquipmentModalController {
  private hero: Combatant;
  private roster: PlayerRosterState;
  private inventory: InventoryState;
  private selectedUnitId: string = "hero";
  private callbacks: EquipmentModalCallbacks;
  private isModalOpen: boolean = false;

  constructor(
    initialHero: Combatant,
    initialRoster: PlayerRosterState,
    initialInventory: InventoryState,
    callbacks: EquipmentModalCallbacks = {}
  ) {
    this.hero = initialHero;
    this.roster = initialRoster;
    this.inventory = initialInventory;
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public setHero(hero: Combatant): void {
    this.hero = hero;
    if (this.isModalOpen) {
      this.render();
    }
  }

  public setRoster(roster: PlayerRosterState): void {
    this.roster = roster;
    if (this.isModalOpen) {
      this.render();
    }
  }

  public setInventory(inventory: InventoryState): void {
    this.inventory = inventory;
    if (this.isModalOpen) {
      this.render();
    }
  }

  public setSelectedUnit(unitId: string): void {
    this.selectedUnitId = unitId;
    if (this.isModalOpen) {
      this.render();
    }
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public toggle(forceOpen?: boolean): void {
    const modal = document.getElementById("equipment-modal");
    if (!modal) return;

    if (forceOpen !== undefined) {
      this.isModalOpen = forceOpen;
    } else {
      this.isModalOpen = !this.isModalOpen;
    }

    if (this.isModalOpen) {
      modal.classList.add("open");
      this.render();
      this.callbacks.onOpen?.();
    } else {
      modal.classList.remove("open");
      this.callbacks.onClose?.();
    }
  }

  public open(): void {
    this.toggle(true);
  }

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const btnEq = document.getElementById("btn-equipment");
    if (btnEq) {
      btnEq.style.display = visible ? "flex" : "none";
    }
    const headerBtn = document.getElementById("header-btn-equipment");
    if (headerBtn) {
      headerBtn.style.display = visible ? "flex" : "none";
    }
  }

  public getSelectedUnit(): Combatant {
    if (this.selectedUnitId === "hero") {
      return this.hero;
    }
    const champ = this.roster.beasts.find((b) => b.id === this.selectedUnitId);
    return champ || this.hero;
  }

  public render(): void {
    const modal = document.getElementById("equipment-modal");
    if (!modal || !this.isModalOpen) return;

    this.renderRosterColumn();
    this.renderPaperdollColumn();
    this.renderGearBagColumn();
  }

  private renderRosterColumn(): void {
    const container = document.getElementById("eq-unit-list");
    if (!container) return;

    container.innerHTML = "";

    // 1. Hero Card
    const heroCard = document.createElement("div");
    heroCard.className = `eq-unit-card ${this.selectedUnitId === "hero" ? "active" : ""}`;
    heroCard.onclick = () => {
      this.selectedUnitId = "hero";
      this.render();
    };
    heroCard.innerHTML = `
      <div class="eq-unit-avatar">🧙</div>
      <div class="eq-unit-meta">
        <div class="eq-unit-name">${this.hero.name}</div>
        <div class="eq-unit-tag">${this.getElementIcon(this.hero.element)} Lv.${this.hero.level} &bull; ตัวหลัก</div>
      </div>
    `;
    container.appendChild(heroCard);

    // 2. Champions
    this.roster.beasts.forEach((beast) => {
      const isSelected = this.selectedUnitId === beast.id;
      const card = document.createElement("div");
      card.className = `eq-unit-card ${isSelected ? "active" : ""}`;
      card.onclick = () => {
        this.selectedUnitId = beast.id;
        this.render();
      };
      card.innerHTML = `
        <div class="eq-unit-avatar">${this.getUnitIcon(beast)}</div>
        <div class="eq-unit-meta">
          <div class="eq-unit-name">${beast.name}</div>
          <div class="eq-unit-tag">${this.getElementIcon(beast.element)} Lv.${beast.level} &bull; ขุนพล</div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  private renderPaperdollColumn(): void {
    const unit = this.getSelectedUnit();
    const isHero = this.selectedUnitId === "hero";
    const bonus = EquipmentManager.getEquipmentBonusStats(unit.equipment);

    // Header Strip
    const titleEl = document.getElementById("eq-selected-title");
    if (titleEl) {
      const roleText = isHero ? "ตัวละครหลัก" : "ขุนพลคู่หู";
      titleEl.innerHTML = `
        <span>${isHero ? "🧙" : this.getUnitIcon(unit)}</span>
        <span>${unit.name}</span>
        <span style="font-size: 11px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 6px; border-radius: 4px; font-weight: 500;">
          Lv.${unit.level} [${unit.element.toUpperCase()}] &bull; ${roleText}
        </span>
      `;
    }

    const statsEl = document.getElementById("eq-selected-stats");
    if (statsEl) {
      statsEl.innerHTML = `
        ATK ${unit.atk} ${bonus.atk ? `<span style="color: #4ade80;">(+${bonus.atk})</span>` : ""} &bull;
        DEF ${unit.def} ${bonus.def ? `<span style="color: #4ade80;">(+${bonus.def})</span>` : ""} &bull;
        INT ${unit.int || 10} ${bonus.int ? `<span style="color: #4ade80;">(+${bonus.int})</span>` : ""} &bull;
        AGI ${unit.agi} ${bonus.agi ? `<span style="color: #4ade80;">(+${bonus.agi})</span>` : ""}
      `;
    }

    // 5 Slots
    const slotsContainer = document.getElementById("eq-slots-container");
    if (slotsContainer) {
      slotsContainer.innerHTML = "";
      const slots: EquipmentSlot[] = [
        "head",
        "weapon",
        "armor",
        "boots",
        "accessory",
      ];
      const slotLabels: Record<EquipmentSlot, { label: string; icon: string }> =
        {
          head: { label: "Headgear", icon: "🪖" },
          weapon: { label: "Weapon", icon: "⚔️" },
          armor: { label: "Armor / Robe", icon: "🛡️" },
          boots: { label: "Boots / Greaves", icon: "👢" },
          accessory: { label: "Accessory", icon: "💍" },
        };

      slots.forEach((slot) => {
        const itemId = unit.equipment?.[slot];
        const itemDef = itemId ? getItemDefinition(itemId) : null;
        const card = document.createElement("div");
        card.className = `eq-slot-card ${itemDef ? "equipped" : "empty"}`;
        card.setAttribute("data-slot", slot);

        if (itemDef) {
          card.innerHTML = `
            <div class="eq-slot-icon">${getItemIcon(itemDef.id)}</div>
            <div class="eq-slot-info">
              <div class="eq-slot-type">${slotLabels[slot].label}</div>
              <div class="eq-slot-name">${itemDef.name.split(" (")[0]}</div>
              <div class="eq-slot-stats">${this.formatItemStats(itemDef)}</div>
            </div>
            <button class="btn-eq-unequip" data-slot="${slot}">✕ ถอด</button>
          `;
          const btnUnequip =
            card.querySelector<HTMLButtonElement>(".btn-eq-unequip");
          if (btnUnequip) {
            btnUnequip.onclick = (e) => {
              e.stopPropagation();
              this.callbacks.onUnequipItem?.(
                isHero ? "hero" : "champion",
                isHero ? undefined : unit.id,
                slot
              );
            };
          }
        } else {
          card.innerHTML = `
            <div class="eq-slot-icon" style="opacity: 0.35;">${slotLabels[slot].icon}</div>
            <div class="eq-slot-info">
              <div class="eq-slot-type">${slotLabels[slot].label}</div>
              <div class="eq-slot-name" style="color: #64748b;">(ช่องว่าง / Empty)</div>
            </div>
          `;
        }

        slotsContainer.appendChild(card);
      });
    }
  }

  private renderGearBagColumn(): void {
    const container = document.getElementById("eq-bag-list");
    if (!container) return;

    container.innerHTML = "";
    const unit = this.getSelectedUnit();
    const isHero = this.selectedUnitId === "hero";

    // Find all equipment items in inventory
    const equipItems: {
      slotIndex: number;
      itemId: string;
      quantity: number;
    }[] = [];
    this.inventory.slots.forEach((s, idx) => {
      if (s) {
        const def = getItemDefinition(s.itemId);
        if (def && def.type === "equipment") {
          equipItems.push({
            slotIndex: idx,
            itemId: s.itemId,
            quantity: s.quantity,
          });
        }
      }
    });

    if (equipItems.length === 0) {
      container.innerHTML = `
        <div style="color: #64748b; font-size: 11px; text-align: center; padding: 24px 8px;">
          ไม่มีอุปกรณ์สวมใส่ในกระเป๋า<br>
          <span style="font-size: 10px; color: #475569;">(ดรอปจากมอนสเตอร์ หรือซื้อจากร้านค้า)</span>
        </div>
      `;
      return;
    }

    equipItems.forEach((item) => {
      const def = getItemDefinition(item.itemId)!;
      const row = document.createElement("div");
      row.className = "eq-bag-item";
      row.title = `${def.name}\n${def.description}`;

      row.innerHTML = `
        <div class="eq-bag-icon">${getItemIcon(def.id)}</div>
        <div class="eq-bag-meta">
          <div class="eq-bag-name">${def.name.split(" (")[0]}</div>
          <div class="eq-bag-slot">${def.slot ? def.slot.toUpperCase() : "EQUIP"} &bull; ${this.formatItemStats(def)}</div>
        </div>
        <button class="btn-eq-action" data-item="${def.id}">ใส่</button>
      `;

      const btnEquip = row.querySelector<HTMLButtonElement>(".btn-eq-action");
      if (btnEquip) {
        btnEquip.onclick = (e) => {
          e.stopPropagation();
          this.callbacks.onEquipItem?.(
            def.id,
            isHero ? "hero" : "champion",
            isHero ? undefined : unit.id
          );
        };
      }

      container.appendChild(row);
    });
  }

  private formatItemStats(def: any): string {
    if (!def.stats) return "";
    const parts: string[] = [];
    if (def.stats.atk) parts.push(`+${def.stats.atk} ATK`);
    if (def.stats.def) parts.push(`+${def.stats.def} DEF`);
    if (def.stats.int) parts.push(`+${def.stats.int} INT`);
    if (def.stats.agi) parts.push(`+${def.stats.agi} AGI`);
    if (def.stats.maxHp) parts.push(`+${def.stats.maxHp} HP`);
    if (def.stats.maxSp) parts.push(`+${def.stats.maxSp} SP`);
    return parts.join(", ");
  }

  private getElementIcon(element?: string): string {
    switch (element?.toLowerCase()) {
      case "fire":
        return "🔥";
      case "water":
        return "🌊";
      case "earth":
        return "🌿";
      case "wind":
        return "🌪️";
      default:
        return "✨";
    }
  }

  private getUnitIcon(unit: Combatant): string {
    if (unit.id.includes("lubu")) return "⚡";
    if (unit.id.includes("thor")) return "🔨";
    if (unit.id.includes("kojiro")) return "🗡️";
    if (unit.id.includes("zeus")) return "⚡";
    if (unit.id.includes("shiva")) return "🔱";
    return "🦁";
  }

  private setupDOM(): void {
    const btnEquipHUD = document.getElementById("btn-equipment");
    if (btnEquipHUD) btnEquipHUD.onclick = () => this.toggle();

    const headerBtn = document.getElementById("header-btn-equipment");
    if (headerBtn) headerBtn.onclick = () => this.toggle();

    const btnClose = document.getElementById("btn-close-equipment-modal");
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnBottomDone = document.getElementById("btn-close-equipment-bottom");
    if (btnBottomDone) btnBottomDone.onclick = () => this.toggle(false);

    const modal = document.getElementById("equipment-modal");
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }
  }
}
