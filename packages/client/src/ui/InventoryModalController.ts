import {
  Combatant,
  InventoryState,
  InventoryManager,
  ItemStack,
  getItemDefinition,
  getItemIcon
} from '@poktsonline/shared';

export interface InventoryModalCallbacks {
  onHeroUpdated?: (hero: Combatant) => void;
  onBeastUpdated?: (beast: Combatant) => void;
  onInventoryUpdated?: (inventory: InventoryState) => void;
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
    const modal = document.getElementById('inventory-modal');
    if (!modal) return;

    if (forceOpen !== undefined) {
      this.isModalOpen = forceOpen;
    } else {
      this.isModalOpen = !this.isModalOpen;
    }

    if (this.isModalOpen) {
      modal.classList.add('open');
      this.render();
      this.callbacks.onOpen?.();
    } else {
      modal.classList.remove('open');
      this.clearFeedback();
      this.callbacks.onClose?.();
    }
  }

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const btnInv = document.getElementById('btn-inventory');
    if (btnInv) btnInv.style.display = visible ? 'flex' : 'none';
    const btnQuick = document.getElementById('btn-quick-inventory');
    if (btnQuick) btnQuick.style.display = visible ? 'inline-block' : 'none';
    const headerBtn = document.getElementById('header-btn-inventory');
    if (headerBtn) headerBtn.style.display = visible ? 'inline-flex' : 'none';
  }

  public updateHeaderBadge(): void {
    const usedSlots = this.inventory.slots.filter(s => s !== null).length;
    const btnInv = document.getElementById('btn-inventory');
    if (btnInv) {
      btnInv.innerHTML = `🎒 INVENTORY (${usedSlots}/${InventoryManager.INVENTORY_CAPACITY}) <span style="opacity: 0.75; font-size: 11px;">[I]</span>`;
    }

    const headerBtn = document.getElementById('header-btn-inventory');
    if (headerBtn) {
      headerBtn.innerHTML = `🎒 Inventory [I] <span style="font-size: 10px; opacity: 0.8; margin-left: 2px;">(${usedSlots}/${InventoryManager.INVENTORY_CAPACITY})</span>`;
    }

    const headerCap = document.getElementById('inv-capacity-header');
    if (headerCap) {
      headerCap.innerText = `SLOTS (${usedSlots} / ${InventoryManager.INVENTORY_CAPACITY})`;
    }

    const goldVal = document.getElementById('inv-gold-val');
    if (goldVal) {
      goldVal.innerText = `${this.inventory.gold.toLocaleString()} Gold`;
    }
  }

  public render(): void {
    const modal = document.getElementById('inventory-modal');
    if (!modal || !this.isModalOpen) return;

    this.updateHeaderBadge();
    this.renderGrid();
    this.renderInspector();
  }

  private renderGrid(): void {
    const container = document.getElementById('inv-grid-container');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 0; i < InventoryManager.INVENTORY_CAPACITY; i++) {
      const slot = this.inventory.slots[i];
      const slotEl = document.createElement('div');
      slotEl.className = 'inv-slot';

      if (this.selectedSlotIndex === i) {
        slotEl.classList.add('selected');
      }

      if (slot) {
        const def = getItemDefinition(slot.itemId);
        const icon = getItemIcon(slot.itemId);

        slotEl.title = def ? `${def.name} (x${slot.quantity})` : slot.itemId;
        slotEl.innerHTML = `
          <span class="inv-item-icon">${icon}</span>
          <span class="inv-qty-badge">x${slot.quantity}</span>
        `;

        slotEl.onclick = () => {
          this.selectedSlotIndex = i;
          this.clearFeedback();
          this.render();
        };
      } else {
        slotEl.classList.add('empty');
        slotEl.title = `Slot ${i + 1} (Empty)`;
        slotEl.onclick = () => {
          this.selectedSlotIndex = null;
          this.clearFeedback();
          this.render();
        };
      }

      container.appendChild(slotEl);
    }
  }

  private renderInspector(): void {
    const emptyBox = document.getElementById('inv-inspector-empty');
    const detailsBox = document.getElementById('inv-inspector-details');
    if (!emptyBox || !detailsBox) return;

    if (this.selectedSlotIndex === null || !this.inventory.slots[this.selectedSlotIndex]) {
      emptyBox.style.display = 'flex';
      detailsBox.style.display = 'none';
      return;
    }

    const slot = this.inventory.slots[this.selectedSlotIndex]!;
    const def = getItemDefinition(slot.itemId);
    if (!def) {
      emptyBox.style.display = 'flex';
      detailsBox.style.display = 'none';
      return;
    }

    emptyBox.style.display = 'none';
    detailsBox.style.display = 'flex';

    // Populate details
    const iconEl = document.getElementById('inv-detail-icon');
    if (iconEl) iconEl.innerText = getItemIcon(def.id);

    const nameEl = document.getElementById('inv-detail-name');
    if (nameEl) nameEl.innerText = def.name;

    const badgeEl = document.getElementById('inv-detail-badge');
    if (badgeEl) {
      badgeEl.className = `inv-item-type-badge ${this.getBadgeClass(def.type)}`;
      badgeEl.innerText = this.getBadgeText(def.type, def.effectValue);
    }

    const descEl = document.getElementById('inv-detail-desc');
    if (descEl) descEl.innerText = def.description;

    const priceEl = document.getElementById('inv-detail-price');
    if (priceEl) priceEl.innerText = `${def.price} G`;

    const qtyEl = document.getElementById('inv-detail-qty');
    if (qtyEl) qtyEl.innerText = `x${slot.quantity}`;

    // Update HP/SP indicators on Target Buttons
    const heroHpLabel = document.getElementById('inv-hero-hp-label');
    if (heroHpLabel) {
      heroHpLabel.innerText = `${this.hero.hp}/${this.hero.maxHp} HP, ${this.hero.sp}/${this.hero.maxSp} SP`;
    }

    const beastHpLabel = document.getElementById('inv-beast-hp-label');
    const targetTitle = document.getElementById('inv-target-title');
    const btnUseScroll = document.getElementById('btn-use-item-scroll') as HTMLButtonElement | null;
    const btnUseHero = document.getElementById('btn-use-item-hero') as HTMLButtonElement | null;
    const btnUseBeast = document.getElementById('btn-use-item-beast') as HTMLButtonElement | null;

    if (def.type === 'scroll') {
      if (targetTitle) targetTitle.innerText = 'ใช้งานไอเทมพิเศษ (Use Item):';
      if (btnUseScroll) btnUseScroll.style.display = 'flex';
      if (btnUseHero) btnUseHero.style.display = 'none';
      if (btnUseBeast) btnUseBeast.style.display = 'none';
    } else {
      if (targetTitle) targetTitle.innerText = 'เลือกเป้าหมายที่จะใช้ (Target):';
      if (btnUseScroll) btnUseScroll.style.display = 'none';
      if (btnUseHero) btnUseHero.style.display = 'flex';
      if (btnUseBeast) {
        if (this.activeBeast) {
          btnUseBeast.style.display = 'flex';
          btnUseBeast.disabled = false;
          if (beastHpLabel) {
            beastHpLabel.innerText = `${this.activeBeast.name}: ${this.activeBeast.hp}/${this.activeBeast.maxHp} HP`;
          }
        } else {
          btnUseBeast.style.display = 'none';
        }
      }
    }
  }

  private handleUseItem(targetType: 'hero' | 'beast'): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const target = targetType === 'hero' ? this.hero : this.activeBeast;
    if (!target) {
      this.showFeedback('No target selected.', false);
      return;
    }

    const def = getItemDefinition(slot.itemId);
    if (!def) return;

    // Special scroll handling (Town teleport)
    if (def.type === 'scroll') {
      this.handleUseScroll();
      return;
    }

    const result = InventoryManager.useItemOnCombatant(this.inventory, slot.itemId, target, false);
    if (result.success) {
      this.inventory = result.inventory;
      if (targetType === 'hero') {
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
      this.showFeedback(`❌ ${result.reason || 'Cannot use item!'}`, false);
    }
  }

  private handleUseScroll(): void {
    if (this.selectedSlotIndex === null) return;
    const slot = this.inventory.slots[this.selectedSlotIndex];
    if (!slot) return;

    const def = getItemDefinition(slot.itemId);
    if (!def || def.type !== 'scroll') return;

    const result = InventoryManager.useItemOnCombatant(this.inventory, slot.itemId, this.hero, false);
    if (result.success) {
      this.inventory = result.inventory;
      this.showFeedback(`⚡ ${def.name} used! Teleporting back to town...`, true);
      this.callbacks.onInventoryUpdated?.(this.inventory);
      this.callbacks.onWarpTown?.();
      this.render();
    } else {
      this.showFeedback(result.reason || 'Could not use item.', false);
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
      this.showFeedback(result.reason || 'Could not drop item.', false);
    }
  }

  private showFeedback(msg: string, success: boolean): void {
    const box = document.getElementById('inv-feedback-msg');
    if (!box) return;
    box.innerText = msg;
    box.className = `inv-feedback-msg ${success ? 'show-success' : 'show-error'}`;
  }

  private clearFeedback(): void {
    const box = document.getElementById('inv-feedback-msg');
    if (!box) return;
    box.innerText = '';
    box.className = 'inv-feedback-msg';
  }

  private getBadgeClass(type: string): string {
    switch (type) {
      case 'hp_restore': return 'badge-hp-restore';
      case 'sp_restore': return 'badge-sp-restore';
      case 'revive': return 'badge-revive';
      case 'scroll': return 'badge-scroll';
      default: return '';
    }
  }

  private getBadgeText(type: string, effectValue: number): string {
    switch (type) {
      case 'hp_restore': return `HP Restore (+${effectValue})`;
      case 'sp_restore': return `SP Restore (+${effectValue})`;
      case 'revive': return `Revive (+${effectValue} HP)`;
      case 'scroll': return 'Town Teleport';
      default: return type;
    }
  }

  private setupDOM(): void {
    const btnInv = document.getElementById('btn-inventory');
    if (btnInv) btnInv.onclick = () => this.toggle();

    const btnQuick = document.getElementById('btn-quick-inventory');
    if (btnQuick) btnQuick.onclick = () => this.toggle();

    const headerBtn = document.getElementById('header-btn-inventory');
    if (headerBtn) headerBtn.onclick = () => this.toggle();

    const btnClose = document.getElementById('btn-close-inv-modal');
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnBottomDone = document.getElementById('btn-close-inv-bottom');
    if (btnBottomDone) btnBottomDone.onclick = () => this.toggle(false);

    const modal = document.getElementById('inventory-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }

    const btnUseScroll = document.getElementById('btn-use-item-scroll');
    if (btnUseScroll) {
      btnUseScroll.onclick = () => this.handleUseScroll();
    }

    const btnUseHero = document.getElementById('btn-use-item-hero');
    if (btnUseHero) {
      btnUseHero.onclick = () => this.handleUseItem('hero');
    }

    const btnUseBeast = document.getElementById('btn-use-item-beast');
    if (btnUseBeast) {
      btnUseBeast.onclick = () => this.handleUseItem('beast');
    }

    const btnDrop = document.getElementById('btn-drop-item');
    if (btnDrop) {
      btnDrop.onclick = () => this.handleDropItem();
    }
  }
}
