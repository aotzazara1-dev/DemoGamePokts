import {
  NPCDefinition,
  InventoryState,
  ShopManager,
  getItemDefinition,
  getItemIcon,
} from "@poktsonline/shared";

export interface ShopModalCallbacks {
  onInventoryUpdated: (inventory: InventoryState) => void;
  onShowToast: (msg: string, color?: string) => void;
  onClose?: () => void;
}

export type ShopTab = "buy" | "sell";

/**
 * Deep UI Controller for Merchant Shop Window (Buy & Sell transactions).
 */
export class ShopModalController {
  private currentNPC: NPCDefinition | null = null;
  private inventory: InventoryState;
  private currentTab: ShopTab = "buy";
  private selectedItemId: string | null = null;
  private selectedSlotIndex: number | null = null;
  private selectedQuantity: number = 1;
  private callbacks: ShopModalCallbacks;

  constructor(inventory: InventoryState, callbacks: ShopModalCallbacks) {
    this.inventory = inventory;
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public setInventory(inventory: InventoryState): void {
    this.inventory = inventory;
    this.updateGoldDisplay();
    if (this.isOpen()) {
      this.renderTabContent();
    }
  }

  public open(npc: NPCDefinition): void {
    this.currentNPC = npc;
    this.currentTab = "buy";
    this.selectedItemId = npc.shopItemIds?.[0] || "item_steamed_bun";
    this.selectedSlotIndex = null;
    this.selectedQuantity = 1;

    const modal = document.getElementById("shop-modal");
    if (!modal) return;
    const titleEl = document.getElementById("shop-title-text");
    if (titleEl) titleEl.textContent = `ร้านค้า - ${npc.name}`;
    this.updateGoldDisplay();
    this.setupTabs();
    this.renderTabContent();
    modal.classList.add("open");
  }

  public close(): void {
    document.getElementById("shop-modal")?.classList.remove("open");
    this.currentNPC = null;
    this.callbacks.onClose?.();
  }

  public isOpen(): boolean {
    return (
      document.getElementById("shop-modal")?.classList.contains("open") ?? false
    );
  }

  private setupDOM(): void {
    const btnClose = document.getElementById("shop-btn-close");
    if (btnClose) {
      btnClose.onclick = () => this.close();
    }

    const tabBuy = document.getElementById("shop-tab-buy");
    const tabSell = document.getElementById("shop-tab-sell");

    if (tabBuy) {
      tabBuy.onclick = () => {
        this.currentTab = "buy";
        this.selectedQuantity = 1;
        this.selectedItemId = this.currentNPC?.shopItemIds?.[0] || null;
        this.selectedSlotIndex = null;
        this.setupTabs();
        this.renderTabContent();
      };
    }

    if (tabSell) {
      tabSell.onclick = () => {
        this.currentTab = "sell";
        this.selectedQuantity = 1;
        const first = this.inventory.slots.findIndex((s) => s !== null);
        this.selectedSlotIndex = first !== -1 ? first : null;
        this.selectedItemId =
          first !== -1 ? this.inventory.slots[first]?.itemId || null : null;
        this.setupTabs();
        this.renderTabContent();
      };
    }

    // Quantity buttons
    const btnMinus = document.getElementById("shop-qty-minus");
    const btnPlus = document.getElementById("shop-qty-plus");
    const inputQty = document.getElementById(
      "shop-qty-input"
    ) as HTMLInputElement;

    if (btnMinus) {
      btnMinus.onclick = () => {
        if (this.selectedQuantity > 1) {
          this.selectedQuantity -= 1;
          this.updateQuantityDisplay();
        }
      };
    }

    if (btnPlus) {
      btnPlus.onclick = () => {
        if (this.selectedQuantity < this.getMaxQuantity()) {
          this.selectedQuantity += 1;
          this.updateQuantityDisplay();
        }
      };
    }

    if (inputQty) {
      inputQty.onchange = () => {
        const val = parseInt(inputQty.value, 10);
        const max = this.getMaxQuantity();
        this.selectedQuantity =
          !isNaN(val) && val >= 1 ? Math.min(val, max) : 1;
        this.updateQuantityDisplay();
      };
    }

    // Shortcuts
    [1, 5, 10].forEach((mult) => {
      document
        .getElementById(`shop-qty-x${mult}`)
        ?.addEventListener("click", () => {
          this.selectedQuantity = Math.min(mult, this.getMaxQuantity());
          this.updateQuantityDisplay();
        });
    });
    document.getElementById("shop-qty-max")?.addEventListener("click", () => {
      this.selectedQuantity = Math.max(1, this.getMaxQuantity());
      this.updateQuantityDisplay();
    });

    // Confirm button
    const btnConfirm = document.getElementById("shop-confirm-btn");
    if (btnConfirm) {
      btnConfirm.onclick = () => this.handleTransaction();
    }
  }

  private setupTabs(): void {
    const tabBuy = document.getElementById("shop-tab-buy");
    const tabSell = document.getElementById("shop-tab-sell");
    if (tabBuy && tabSell) {
      tabBuy.classList.toggle("active", this.currentTab === "buy");
      tabSell.classList.toggle("active", this.currentTab === "sell");
    }
  }

  private updateGoldDisplay(): void {
    const goldEl = document.getElementById("shop-gold-val");
    if (goldEl) {
      goldEl.textContent = `${this.inventory.gold.toLocaleString()} G`;
    }
  }

  private getMaxQuantity(): number {
    if (this.currentTab === "buy") {
      if (!this.selectedItemId) return 1;
      const def = getItemDefinition(this.selectedItemId);
      if (!def || def.price <= 0) return 99;
      const affordable = Math.floor(this.inventory.gold / def.price);
      return Math.max(1, Math.min(affordable, def.stackMax));
    } else {
      if (this.selectedSlotIndex === null) return 1;
      const slot = this.inventory.slots[this.selectedSlotIndex];
      return slot ? slot.quantity : 1;
    }
  }

  private renderTabContent(): void {
    const listEl = document.getElementById("shop-items-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (this.currentTab === "buy") {
      this.renderBuyList(listEl);
    } else {
      this.renderSellList(listEl);
    }

    this.updateQuantityDisplay();
  }

  private createItemCard(
    itemId: string,
    isSelected: boolean,
    priceLabel: string,
    qtyLabel: string,
    onClick: () => void
  ): HTMLElement {
    const def = getItemDefinition(itemId);
    const card = document.createElement("div");
    card.className = `shop-item-card ${isSelected ? "selected" : ""}`;
    card.innerHTML = `
      <div class="shop-item-icon">${getItemIcon(itemId)}</div>
      <div class="shop-item-details">
        <div class="shop-item-name">${def?.name || itemId}</div>
        <div class="shop-item-desc">${def?.description || "ของสะสม"}</div>
      </div>
      <div class="shop-item-price-box">
        <div class="shop-item-price">🪙 ${priceLabel}</div>
        <div class="shop-item-qty-tag">${qtyLabel}</div>
      </div>
    `;
    card.onclick = onClick;
    return card;
  }

  private renderBuyList(container: HTMLElement): void {
    const items = this.currentNPC?.shopItemIds || [
      "item_steamed_bun",
      "item_herbal_tea",
      "item_vitality_pill",
      "item_phoenix_feather",
      "item_town_scroll",
    ];

    items.forEach((itemId: string) => {
      const def = getItemDefinition(itemId);
      if (!def) return;
      container.appendChild(
        this.createItemCard(
          itemId,
          this.selectedItemId === itemId,
          `${def.price} G`,
          `สูงสุด: ${def.stackMax}`,
          () => {
            this.selectedItemId = itemId;
            this.selectedQuantity = 1;
            this.renderTabContent();
          }
        )
      );
    });
  }

  private renderSellList(container: HTMLElement): void {
    const occupied = this.inventory.slots
      .map((s, idx) =>
        s ? { slotIndex: idx, itemId: s.itemId, quantity: s.quantity } : null
      )
      .filter(
        (e): e is { slotIndex: number; itemId: string; quantity: number } =>
          e !== null
      );

    if (occupied.length === 0) {
      container.innerHTML = `<div class="shop-empty-state">กระเป๋าว่างเปล่า ไม่มีไอเทมที่จะขาย</div>`;
      return;
    }

    occupied.forEach((entry) => {
      const def = getItemDefinition(entry.itemId);
      const unitSellPrice = def
        ? (def.sellPrice ?? Math.floor(def.price / 2))
        : 10;
      container.appendChild(
        this.createItemCard(
          entry.itemId,
          this.selectedSlotIndex === entry.slotIndex,
          `${unitSellPrice} G`,
          `มีในกระเป๋า: x${entry.quantity}`,
          () => {
            this.selectedSlotIndex = entry.slotIndex;
            this.selectedItemId = entry.itemId;
            this.selectedQuantity = 1;
            this.renderTabContent();
          }
        )
      );
    });
  }

  private updateQuantityDisplay(): void {
    const inputQty = document.getElementById(
      "shop-qty-input"
    ) as HTMLInputElement;
    if (inputQty) {
      inputQty.value = this.selectedQuantity.toString();
    }

    const totalValEl = document.getElementById("shop-total-val");
    const confirmBtn = document.getElementById(
      "shop-confirm-btn"
    ) as HTMLButtonElement;
    if (!totalValEl || !confirmBtn) return;

    if (this.currentTab === "buy") {
      const def = this.selectedItemId
        ? getItemDefinition(this.selectedItemId)
        : null;
      const unitPrice = def ? def.price : 0;
      const totalCost = unitPrice * this.selectedQuantity;

      totalValEl.textContent = `${totalCost.toLocaleString()} G`;
      confirmBtn.className = "shop-confirm-btn btn-buy";
      confirmBtn.innerHTML = `🛒 ซื้อสินค้า (ชำระ ${totalCost.toLocaleString()} G)`;
      confirmBtn.disabled =
        !def || totalCost > this.inventory.gold || totalCost <= 0;
    } else {
      const def = this.selectedItemId
        ? getItemDefinition(this.selectedItemId)
        : null;
      const unitSellPrice = def
        ? (def.sellPrice ?? Math.floor(def.price / 2))
        : 10;
      const totalEarned = unitSellPrice * this.selectedQuantity;

      totalValEl.textContent = `+${totalEarned.toLocaleString()} G`;
      confirmBtn.className = "shop-confirm-btn btn-sell";
      confirmBtn.innerHTML = `🪙 ขายสินค้า (รับเงิน ${totalEarned.toLocaleString()} G)`;
      confirmBtn.disabled = this.selectedSlotIndex === null || totalEarned <= 0;
    }
  }

  private handleTransaction(): void {
    if (this.currentTab === "buy") {
      if (!this.selectedItemId) return;
      const res = ShopManager.buyItem(
        this.inventory,
        this.selectedItemId,
        this.selectedQuantity
      );
      if (res.success) {
        this.setInventory(res.inventory);
        this.callbacks.onInventoryUpdated(res.inventory);
        const def = getItemDefinition(this.selectedItemId);
        this.callbacks.onShowToast(
          `🎉 ซื้อ ${def?.name || this.selectedItemId} x${this.selectedQuantity} สำเร็จ!`,
          "#38bdf8"
        );
      } else {
        this.callbacks.onShowToast(
          res.reason || "ไม่สามารถซื้อสินค้าได้",
          "#ef4444"
        );
      }
    } else {
      if (this.selectedSlotIndex === null) return;
      const res = ShopManager.sellItem(
        this.inventory,
        this.selectedSlotIndex,
        this.selectedQuantity
      );
      if (res.success) {
        this.setInventory(res.inventory);
        this.callbacks.onInventoryUpdated(res.inventory);
        this.callbacks.onShowToast(
          `🪙 ขายสินค้าสำเร็จ ได้รับเงิน +${res.goldEarned.toLocaleString()} G!`,
          "#fbbf24"
        );
        // Reset selection if slot is now empty
        if (!res.inventory.slots[this.selectedSlotIndex]) {
          const firstOccupiedIdx = res.inventory.slots.findIndex(
            (s) => s !== null
          );
          this.selectedSlotIndex =
            firstOccupiedIdx !== -1 ? firstOccupiedIdx : null;
          this.selectedItemId =
            this.selectedSlotIndex !== null
              ? res.inventory.slots[this.selectedSlotIndex]?.itemId || null
              : null;
        }
        this.renderTabContent();
      } else {
        this.callbacks.onShowToast(
          res.reason || "ไม่สามารถขายสินค้าได้",
          "#ef4444"
        );
      }
    }
  }
}
