import {
  Combatant,
  InventoryState,
  InventoryManager,
  ItemStack,
  ItemCategory,
  getItemDefinition,
  getItemIcon,
  getItemCategory,
  getItemCategoryLabel,
} from "@poktsonline/shared";

export interface InventoryModalCallbacks {
  onHeroUpdated?: (hero: Combatant) => void;
  onBeastUpdated?: (beast: Combatant) => void;
  onInventoryUpdated?: (inventory: InventoryState) => void;
  onEquipItem?: (
    itemId: string,
    targetType: "hero" | "champion",
    championId?: string
  ) => void;
  onWarpTown?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for 20-Slot Inventory Modal, item inspector,
 * and overworld item consumption (Hero / Active Beast).
 */
export class InventoryModalController {
  private inventory: InventoryState;
  private hero: Combatant;
  private activeBeast?: Combatant;
  private activeCategory: ItemCategory = "all";
  private selectedSlotIndex: number | null = null;
  private isModalOpen: boolean = false;
  private callbacks: InventoryModalCallbacks;

  constructor(
    initialInventory: InventoryState,
    initialHero: Combatant,
    activeBeast?: Combatant,
    callbacks: InventoryModalCallbacks = {}
  ) {
    this.inventory = initialInventory;
    this.hero = initialHero;
    this.activeBeast = activeBeast;
    this.callbacks = callbacks;

    this.setupDOM();
    this.updateHeaderBadge();
  }

  public setInventory(inventory: InventoryState): void {
    this.inventory = inventory;
    if (this.selectedSlotIndex !== null) {
      const slot = this.inventory.slots[this.selectedSlotIndex];
      if (!slot) {
        this.selectedSlotIndex = null;
      }
    }
    this.updateHeaderBadge();
    if (this.isModalOpen) {
      this.render();
    }
  }

  public getInventory(): InventoryState {
    return this.inventory;
  }

  public getActiveCategory(): ItemCategory {
    return this.activeCategory;
  }

  public setCategory(category: ItemCategory): void {
    this.activeCategory = category;
    if (this.selectedSlotIndex !== null) {
      const slot = this.inventory.slots[this.selectedSlotIndex];
      if (
        slot &&
        this.activeCategory !== "all" &&
        getItemCategory(slot.itemId) !== this.activeCategory
      ) {
        this.selectedSlotIndex = null;
      }
    }
    this.render();
  }

  public getCategoryCounts(): Record<ItemCategory, number> {
    const counts: Record<ItemCategory, number> = {
      all: 0,
      consumable: 0,
      equipment: 0,
      material: 0,
    };

    for (const slot of this.inventory.slots) {
      if (slot) {
        counts.all++;
        const cat = getItemCategory(slot.itemId);
        counts[cat] = (counts[cat] || 0) + 1;
      }
    }

    return counts;
  }

  public setHero(hero: Combatant): void {
    this.hero = hero;
    if (this.isModalOpen) {
      this.renderInspector();
    }
  }

  public setActiveBeast(beast?: Combatant): void {
    this.activeBeast = beast;
    if (this.isModalOpen) {
      this.renderInspector();
    }
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public toggle(forceOpen?: boolean): void {
    const modal = document.getElementById("inventory-modal");
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
      this.clearFeedback();
      this.callbacks.onClose?.();
    }
  }

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const btnInv = document.getElementById("btn-inventory");
    if (btnInv) btnInv.style.display = visible ? "flex" : "none";
    const btnQuick = document.getElementById("btn-quick-inventory");
    if (btnQuick) btnQuick.style.display = visible ? "inline-block" : "none";
    const headerBtn = document.getElementById("header-btn-inventory");
    if (headerBtn) headerBtn.style.display = visible ? "inline-flex" : "none";
  }

  public updateHeaderBadge(): void {
    const counts = this.getCategoryCounts();
    const usedSlots = counts.all;
    const btnInv = document.getElementById("btn-inventory");
    if (btnInv) {
      btnInv.innerHTML = `🎒 INVENTORY (${usedSlots}/${InventoryManager.INVENTORY_CAPACITY}) <span style="opacity: 0.75; font-size: 11px;">[I]</span>`;
    }

    const headerBtn = document.getElementById("header-btn-inventory");
    if (headerBtn) {
      headerBtn.innerHTML = `🎒 Inventory [I] <span style="font-size: 10px; opacity: 0.8; margin-left: 2px;">(${usedSlots}/${InventoryManager.INVENTORY_CAPACITY})</span>`;
    }

    const headerCap = document.getElementById("inv-capacity-header");
    if (headerCap) {
      if (this.activeCategory === "all") {
        headerCap.innerText = `SLOTS (${usedSlots} / ${InventoryManager.INVENTORY_CAPACITY})`;
      } else {
        const catName = getItemCategoryLabel(this.activeCategory).split(
          " ("
        )[0];
        headerCap.innerText = `${catName}: ${counts[this.activeCategory]} ชิ้น (รวม ${usedSlots}/${InventoryManager.INVENTORY_CAPACITY})`;
      }
    }

    const goldVal = document.getElementById("inv-gold-val");
    if (goldVal) {
      goldVal.innerText = `${this.inventory.gold.toLocaleString()} Gold`;
    }

    this.renderTabs(counts);
  }

  public renderTabs(counts?: Record<ItemCategory, number>): void {
    const currentCounts = counts || this.getCategoryCounts();
    const tabButtons =
      document.querySelectorAll<HTMLButtonElement>(".inv-tab-btn");
    tabButtons.forEach((btn) => {
      const cat = (btn.dataset.category || "all") as ItemCategory;
      btn.classList.toggle("active", cat === this.activeCategory);
      const countEl = btn.querySelector(".inv-tab-count");
      if (countEl) {
        countEl.textContent = `(${currentCounts[cat] ?? 0})`;
      }
    });
  }

  public render(): void {
    const modal = document.getElementById("inventory-modal");
    if (!modal || !this.isModalOpen) return;

    this.updateHeaderBadge();
    this.renderGrid();
    this.renderInspector();
  }

  private renderGrid(): void {
    const container = document.getElementById("inv-grid-container");
    if (!container) return;

    container.innerHTML = "";

    if (this.activeCategory === "all") {
      for (let i = 0; i < InventoryManager.INVENTORY_CAPACITY; i++) {
        const slot = this.inventory.slots[i];
        const slotEl = this.createSlotElement(i, slot, false);
        container.appendChild(slotEl);
      }
    } else {
      const matchingSlots: { index: number; stack: ItemStack }[] = [];
      for (let i = 0; i < InventoryManager.INVENTORY_CAPACITY; i++) {
        const slot = this.inventory.slots[i];
        if (slot && getItemCategory(slot.itemId) === this.activeCategory) {
          matchingSlots.push({ index: i, stack: slot });
        }
      }

      if (matchingSlots.length === 0) {
        const emptyNotice = document.createElement("div");
        emptyNotice.className = "inv-category-empty";
        const catLabel = getItemCategoryLabel(this.activeCategory).split(
          " ("
        )[0];
        emptyNotice.innerHTML = `
          <div style="font-size: 28px; margin-bottom: 6px;">📭</div>
          <div style="font-weight: 600; color: #94a3b8;">ไม่มีไอเทมในหมวด ${catLabel}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">ไอเทมที่ได้รับจะถูกจัดกลุ่มเข้าหมวดหมู่นี้อัตโนมัติ</div>
        `;
        container.appendChild(emptyNotice);
      } else {
        for (const item of matchingSlots) {
          const slotEl = this.createSlotElement(item.index, item.stack, true);
          container.appendChild(slotEl);
        }

        // Fill remaining slots up to 20 for uniform grid
        for (
          let i = matchingSlots.length;
          i < InventoryManager.INVENTORY_CAPACITY;
          i++
        ) {
          const emptySlotEl = document.createElement("div");
          emptySlotEl.className = "inv-slot empty";
          emptySlotEl.title = "Empty Slot";
          container.appendChild(emptySlotEl);
        }
      }
    }
  }

  private createSlotElement(
    realIndex: number,
    slot: ItemStack | null,
    showSlotNum: boolean
  ): HTMLElement {
    const slotEl = document.createElement("div");
    slotEl.className = "inv-slot";

    if (this.selectedSlotIndex === realIndex) {
      slotEl.classList.add("selected");
    }

    if (slot) {
      const def = getItemDefinition(slot.itemId);
      const icon = getItemIcon(slot.itemId);
      const cat = getItemCategory(slot.itemId);

      slotEl.classList.add(`cat-${cat}`);
      slotEl.title = def
        ? `${def.name} (x${slot.quantity}) - ${getItemCategoryLabel(cat)}`
        : slot.itemId;

      const slotBadgeHtml = showSlotNum
        ? `<span class="inv-slot-num-badge">#${realIndex + 1}</span>`
        : "";

      slotEl.innerHTML = `
        ${slotBadgeHtml}
        <span class="inv-item-icon">${icon}</span>
        <span class="inv-qty-badge">x${slot.quantity}</span>
        <span class="inv-cat-pip pip-${cat}"></span>
      `;

      slotEl.onclick = () => {
        this.selectedSlotIndex = realIndex;
        this.clearFeedback();
        this.render();
      };
    } else {
      slotEl.classList.add("empty");
      slotEl.title = `Slot ${realIndex + 1} (Empty)`;
      slotEl.onclick = () => {
        this.selectedSlotIndex = null;
        this.clearFeedback();
        this.render();
      };
    }

    return slotEl;
  }

  private renderInspector(): void {
    const emptyBox = document.getElementById("inv-inspector-empty");
    const detailsBox = document.getElementById("inv-inspector-details");
    if (!emptyBox || !detailsBox) return;

    if (
      this.selectedSlotIndex === null ||
      !this.inventory.slots[this.selectedSlotIndex]
    ) {
      emptyBox.style.display = "flex";
      detailsBox.style.display = "none";
      return;
    }

    const slot = this.inventory.slots[this.selectedSlotIndex]!;
    const def = getItemDefinition(slot.itemId);
    if (!def) {
      emptyBox.style.display = "flex";
      detailsBox.style.display = "none";
      return;
    }

    emptyBox.style.display = "none";
    detailsBox.style.display = "flex";

    // Populate details
    const iconEl = document.getElementById("inv-detail-icon");
    if (iconEl) iconEl.innerText = getItemIcon(def.id);

    const nameEl = document.getElementById("inv-detail-name");
    if (nameEl) nameEl.innerText = def.name;

    const cat = getItemCategory(def.id);
    const catBadgeEl = document.getElementById("inv-detail-cat-badge");
    if (catBadgeEl) {
      catBadgeEl.className = `inv-category-badge badge-cat-${cat}`;
      catBadgeEl.innerText = getItemCategoryLabel(cat).split(" (")[0];
    }

    const badgeEl = document.getElementById("inv-detail-badge");
    if (badgeEl) {
      badgeEl.className = `inv-item-type-badge ${this.getBadgeClass(def.type)}`;
      badgeEl.innerText = this.getBadgeText(def.type, def.effectValue);
    }

    const descEl = document.getElementById("inv-detail-desc");
    if (descEl) descEl.innerText = def.description;

    const priceEl = document.getElementById("inv-detail-price");
    if (priceEl) priceEl.innerText = `${def.price} G`;

    const qtyEl = document.getElementById("inv-detail-qty");
    if (qtyEl) qtyEl.innerText = `x${slot.quantity}`;

    // Update HP/SP indicators on Target Buttons
    const heroHpLabel = document.getElementById("inv-hero-hp-label");
    if (heroHpLabel) {
      heroHpLabel.innerText = `${this.hero.hp}/${this.hero.maxHp} HP, ${this.hero.sp}/${this.hero.maxSp} SP`;
    }

    const beastHpLabel = document.getElementById("inv-beast-hp-label");
    const targetTitle = document.getElementById("inv-target-title");
    const btnUseScroll = document.getElementById(
      "btn-use-item-scroll"
    ) as HTMLButtonElement | null;
    const btnUseHero = document.getElementById(
      "btn-use-item-hero"
    ) as HTMLButtonElement | null;
    const btnUseBeast = document.getElementById(
      "btn-use-item-beast"
    ) as HTMLButtonElement | null;
    const btnEquipHero = document.getElementById(
      "btn-equip-item-hero"
    ) as HTMLButtonElement | null;
    const btnEquipBeast = document.getElementById(
      "btn-equip-item-beast"
    ) as HTMLButtonElement | null;
    const heroEquipLabel = document.getElementById("inv-hero-equip-label");
    const beastEquipLabel = document.getElementById("inv-beast-equip-label");

    if (def.type === "equipment") {
      if (targetTitle)
        targetTitle.innerText = "เลือกผู้สวมใส่อุปกรณ์ (Equip Target):";
      if (btnUseScroll) btnUseScroll.style.display = "none";
      if (btnUseHero) btnUseHero.style.display = "none";
      if (btnUseBeast) btnUseBeast.style.display = "none";

      if (btnEquipHero) {
        btnEquipHero.style.display = "flex";
        if (heroEquipLabel) heroEquipLabel.innerText = this.hero.name;
      }
      if (btnEquipBeast) {
        if (this.activeBeast) {
          btnEquipBeast.style.display = "flex";
          if (beastEquipLabel)
            beastEquipLabel.innerText = this.activeBeast.name;
        } else {
          btnEquipBeast.style.display = "none";
        }
      }
    } else if (def.type === "scroll") {
      if (btnEquipHero) btnEquipHero.style.display = "none";
      if (btnEquipBeast) btnEquipBeast.style.display = "none";
      if (targetTitle) targetTitle.innerText = "ใช้งานไอเทมพิเศษ (Use Item):";
      if (btnUseScroll) btnUseScroll.style.display = "flex";
      if (btnUseHero) btnUseHero.style.display = "none";
      if (btnUseBeast) btnUseBeast.style.display = "none";
    } else if (cat === "material") {
      if (btnEquipHero) btnEquipHero.style.display = "none";
      if (btnEquipBeast) btnEquipBeast.style.display = "none";
      if (btnUseScroll) btnUseScroll.style.display = "none";
      if (btnUseHero) btnUseHero.style.display = "none";
      if (btnUseBeast) btnUseBeast.style.display = "none";
      if (targetTitle)
        targetTitle.innerText =
          "💎 ไอเทมวัตถุดิบ (Material Item - ใช้สำหรับเควสต์/คราฟต์):";
    } else {
      if (btnEquipHero) btnEquipHero.style.display = "none";
      if (btnEquipBeast) btnEquipBeast.style.display = "none";
      if (targetTitle)
        targetTitle.innerText = "เลือกเป้าหมายที่จะใช้ (Target):";
      if (btnUseScroll) btnUseScroll.style.display = "none";
      if (btnUseHero) btnUseHero.style.display = "flex";
      if (btnUseBeast) {
        if (this.activeBeast) {
          btnUseBeast.style.display = "flex";
          btnUseBeast.disabled = false;
          if (beastHpLabel) {
            beastHpLabel.innerText = `${this.activeBeast.name}: ${this.activeBeast.hp}/${this.activeBeast.maxHp} HP`;
          }
        } else {
          btnUseBeast.style.display = "none";
        }
      }
    }
  }

  private handleUseItem(targetType: "hero" | "beast"): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const target = targetType === "hero" ? this.hero : this.activeBeast;
    if (!target) {
      this.showFeedback("No target selected.", false);
      return;
    }

    const def = getItemDefinition(slot.itemId);
    if (!def) return;

    // Special scroll handling (Town teleport)
    if (def.type === "scroll") {
      this.handleUseScroll();
      return;
    }

    const result = InventoryManager.useItemOnCombatant(
      this.inventory,
      slot.itemId,
      target,
      false
    );
    if (result.success) {
      this.inventory = result.inventory;
      if (targetType === "hero") {
        this.hero = result.target;
        this.callbacks.onHeroUpdated?.(this.hero);
      } else {
        this.activeBeast = result.target;
        this.callbacks.onBeastUpdated?.(this.activeBeast);
      }
      this.callbacks.onInventoryUpdated?.(this.inventory);
      this.showFeedback(`✨ ${result.message}`, true);
      this.render();
    } else {
      this.showFeedback(`❌ ${result.reason || "Cannot use item!"}`, false);
    }
  }

  private handleUseScroll(): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const def = getItemDefinition(slot.itemId);
    if (!def || def.type !== "scroll") return;

    const result = InventoryManager.useItemOnCombatant(
      this.inventory,
      slot.itemId,
      this.hero,
      false
    );
    if (result.success) {
      this.inventory = result.inventory;
      this.showFeedback(
        `⚡ ${def.name} used! Teleporting back to town...`,
        true
      );
      this.callbacks.onInventoryUpdated?.(this.inventory);
      this.callbacks.onWarpTown?.();
      this.render();
    } else {
      this.showFeedback(result.reason || "Could not use item.", false);
    }
  }

  private handleDropItem(): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const def = getItemDefinition(slot.itemId);
    const itemName = def ? def.name : slot.itemId;

    const result = InventoryManager.removeItem(this.inventory, slot.itemId, 1);
    if (result.success) {
      this.inventory = result.inventory;
      this.callbacks.onInventoryUpdated?.(this.inventory);
      this.showFeedback(`🗑️ Dropped 1x ${itemName}.`, true);
      this.render();
    } else {
      this.showFeedback(result.reason || "Could not drop item.", false);
    }
  }

  private showFeedback(msg: string, success: boolean): void {
    const box = document.getElementById("inv-feedback-msg");
    if (!box) return;
    box.innerText = msg;
    box.className = `inv-feedback-msg ${success ? "show-success" : "show-error"}`;
  }

  private clearFeedback(): void {
    const box = document.getElementById("inv-feedback-msg");
    if (!box) return;
    box.innerText = "";
    box.className = "inv-feedback-msg";
  }

  private getBadgeClass(type: string): string {
    switch (type) {
      case "hp_restore":
        return "badge-hp-restore";
      case "sp_restore":
        return "badge-sp-restore";
      case "revive":
        return "badge-revive";
      case "scroll":
        return "badge-scroll";
      case "equipment":
        return "badge-equipment";
      case "loot":
      case "material":
        return "badge-material";
      default:
        return "";
    }
  }

  private getBadgeText(type: string, effectValue: number): string {
    switch (type) {
      case "hp_restore":
        return `HP Restore (+${effectValue})`;
      case "sp_restore":
        return `SP Restore (+${effectValue})`;
      case "revive":
        return `Revive (+${effectValue} HP)`;
      case "scroll":
        return "Town Teleport";
      case "equipment":
        return "⚔️ Equipment";
      case "loot":
      case "material":
        return "💎 Material (วัตถุดิบ)";
      default:
        return type;
    }
  }

  private handleEquipItem(targetType: "hero" | "champion"): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const def = getItemDefinition(slot.itemId);
    if (!def || def.type !== "equipment") return;

    const championId =
      targetType === "champion" ? this.activeBeast?.id : undefined;
    this.callbacks.onEquipItem?.(def.id, targetType, championId);
    this.showFeedback(`⚔️ Equipping ${def.name.split(" (")[0]}...`, true);
  }

  private setupDOM(): void {
    const tabButtons =
      document.querySelectorAll<HTMLButtonElement>(".inv-tab-btn");
    tabButtons.forEach((btn) => {
      btn.onclick = () => {
        const cat = btn.dataset.category as ItemCategory;
        if (cat) {
          this.setCategory(cat);
        }
      };
    });

    const btnInv = document.getElementById("btn-inventory");
    if (btnInv) btnInv.onclick = () => this.toggle();

    const btnQuick = document.getElementById("btn-quick-inventory");
    if (btnQuick) btnQuick.onclick = () => this.toggle();

    const headerBtn = document.getElementById("header-btn-inventory");
    if (headerBtn) headerBtn.onclick = () => this.toggle();

    const btnClose = document.getElementById("btn-close-inv-modal");
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnBottomDone = document.getElementById("btn-close-inv-bottom");
    if (btnBottomDone) btnBottomDone.onclick = () => this.toggle(false);

    const modal = document.getElementById("inventory-modal");
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }

    const btnUseScroll = document.getElementById("btn-use-item-scroll");
    if (btnUseScroll) {
      btnUseScroll.onclick = () => this.handleUseScroll();
    }

    const btnUseHero = document.getElementById("btn-use-item-hero");
    if (btnUseHero) {
      btnUseHero.onclick = () => this.handleUseItem("hero");
    }

    const btnUseBeast = document.getElementById("btn-use-item-beast");
    if (btnUseBeast) {
      btnUseBeast.onclick = () => this.handleUseItem("beast");
    }

    const btnEquipHero = document.getElementById("btn-equip-item-hero");
    if (btnEquipHero) {
      btnEquipHero.onclick = () => this.handleEquipItem("hero");
    }

    const btnEquipBeast = document.getElementById("btn-equip-item-beast");
    if (btnEquipBeast) {
      btnEquipBeast.onclick = () => this.handleEquipItem("champion");
    }

    const btnDrop = document.getElementById("btn-drop-item");
    if (btnDrop) {
      btnDrop.onclick = () => this.handleDropItem();
    }
  }
}
