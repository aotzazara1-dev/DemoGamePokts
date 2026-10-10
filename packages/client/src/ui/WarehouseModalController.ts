import {
  InventoryState,
  WarehouseState,
  WarehouseManager,
  getItemDefinition,
  getItemIcon,
} from "@poktsonline/shared";

export interface WarehouseModalCallbacks {
  onInventoryUpdated: (inventory: InventoryState) => void;
  onWarehouseUpdated: (warehouse: WarehouseState) => void;
  onShowToast: (msg: string, color?: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export type SelectedSource = "inventory" | "warehouse";

/**
 * Deep UI Controller for Personal Item & Gold Warehouse Modal (ADR 0022).
 * Tiered LOC Ceiling: <= 400 lines.
 */
export class WarehouseModalController {
  private inventory: InventoryState;
  private warehouse: WarehouseState;
  private callbacks: WarehouseModalCallbacks;

  private selectedSource: SelectedSource | null = null;
  private selectedSlotIndex: number | null = null;
  private selectedQuantity: number = 1;
  private goldDialogMode: "deposit" | "withdraw" | null = null;

  constructor(
    inventory: InventoryState,
    warehouse: WarehouseState,
    callbacks: WarehouseModalCallbacks
  ) {
    this.inventory = inventory;
    this.warehouse = warehouse;
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public setInventory(inventory: InventoryState): void {
    this.inventory = inventory;
    if (this.isOpen()) this.render();
  }

  public setWarehouse(warehouse: WarehouseState): void {
    this.warehouse = warehouse;
    if (this.isOpen()) this.render();
  }

  public open(): void {
    const modal = document.getElementById("warehouse-modal");
    if (!modal) return;
    this.selectedSource = null;
    this.selectedSlotIndex = null;
    this.selectedQuantity = 1;
    this.closeGoldDialog();
    this.render();
    modal.classList.add("open");
    this.callbacks.onOpen?.();
  }

  public close(): void {
    document.getElementById("warehouse-modal")?.classList.remove("open");
    this.closeGoldDialog();
    this.selectedSource = null;
    this.selectedSlotIndex = null;
    this.callbacks.onClose?.();
  }

  public isOpen(): boolean {
    return (
      document.getElementById("warehouse-modal")?.classList.contains("open") ??
      false
    );
  }

  private setupDOM(): void {
    const btnClose = document.getElementById("btn-close-warehouse-modal");
    const btnBottom = document.getElementById("btn-close-warehouse-bottom");
    if (btnClose) btnClose.onclick = () => this.close();
    if (btnBottom) btnBottom.onclick = () => this.close();

    const btnDepGold = document.getElementById("btn-deposit-gold");
    if (btnDepGold) btnDepGold.onclick = () => this.openGoldDialog("deposit");
    const btnWithGold = document.getElementById("btn-withdraw-gold");
    if (btnWithGold)
      btnWithGold.onclick = () => this.openGoldDialog("withdraw");

    const btnCancelGold = document.getElementById("btn-wh-gold-cancel");
    if (btnCancelGold) btnCancelGold.onclick = () => this.closeGoldDialog();
    const btnConfirmGold = document.getElementById("btn-wh-gold-confirm");
    if (btnConfirmGold)
      btnConfirmGold.onclick = () => this.handleGoldTransfer();

    const btnGoldMax = document.getElementById("wh-gold-max-btn");
    if (btnGoldMax) {
      btnGoldMax.onclick = () => {
        const input = document.getElementById(
          "wh-gold-input"
        ) as HTMLInputElement;
        if (input)
          input.value = String(
            this.goldDialogMode === "deposit"
              ? this.inventory.gold
              : this.warehouse.gold
          );
      };
    }

    const btnToWh = document.getElementById("btn-transfer-to-warehouse");
    if (btnToWh) btnToWh.onclick = () => this.transferSelectedItem("deposit");
    const btnToInv = document.getElementById("btn-transfer-to-inventory");
    if (btnToInv)
      btnToInv.onclick = () => this.transferSelectedItem("withdraw");

    const qtyInput = document.getElementById(
      "wh-transfer-qty"
    ) as HTMLInputElement;
    if (qtyInput) {
      qtyInput.onchange = () => {
        const val = parseInt(qtyInput.value, 10);
        this.selectedQuantity = isNaN(val) || val < 1 ? 1 : val;
        qtyInput.value = String(this.selectedQuantity);
      };
    }

    const btnQtyMax = document.getElementById("wh-qty-max-btn");
    if (btnQtyMax) {
      btnQtyMax.onclick = () => {
        const slot = this.getSelectedSlot();
        if (slot) {
          this.selectedQuantity = slot.quantity;
          const input = document.getElementById(
            "wh-transfer-qty"
          ) as HTMLInputElement;
          if (input) input.value = String(slot.quantity);
        }
      };
    }
  }

  public render(): void {
    this.renderCapacitiesAndGold();
    this.renderGrid("wh-inv-grid", "inventory", this.inventory.slots);
    this.renderGrid("wh-storage-grid", "warehouse", this.warehouse.slots);
    this.renderSelectedInspector();
  }

  private renderCapacitiesAndGold(): void {
    const invUsed = this.inventory.slots.filter((s) => s !== null).length;
    const whUsed = this.warehouse.slots.filter((s) => s !== null).length;

    const invCapEl = document.getElementById("wh-inv-capacity");
    if (invCapEl)
      invCapEl.textContent = `${invUsed} / ${this.inventory.slots.length}`;
    const whCapEl = document.getElementById("wh-storage-capacity");
    if (whCapEl)
      whCapEl.textContent = `${whUsed} / ${this.warehouse.slots.length}`;

    const invGoldEl = document.getElementById("wh-inv-gold-val");
    if (invGoldEl)
      invGoldEl.textContent = `${this.inventory.gold.toLocaleString()} G`;
    const whGoldEl = document.getElementById("wh-storage-gold-val");
    if (whGoldEl)
      whGoldEl.textContent = `${this.warehouse.gold.toLocaleString()} G`;
  }

  private renderGrid(
    containerId: string,
    source: SelectedSource,
    slots: any[]
  ): void {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    slots.forEach((slot, index) => {
      const slotEl = document.createElement("div");
      slotEl.className = "wh-slot";
      if (!slot) {
        slotEl.classList.add("empty");
      } else {
        if (
          this.selectedSource === source &&
          this.selectedSlotIndex === index
        ) {
          slotEl.classList.add("selected");
        }
        const iconEl = document.createElement("div");
        iconEl.className = "wh-slot-icon";
        iconEl.textContent = getItemIcon(slot.itemId);

        const qtyEl = document.createElement("div");
        qtyEl.className = "wh-slot-qty";
        qtyEl.textContent = String(slot.quantity);

        slotEl.appendChild(iconEl);
        if (slot.quantity > 1) slotEl.appendChild(qtyEl);

        const def = getItemDefinition(slot.itemId);
        slotEl.title = `${def?.name || slot.itemId} x${slot.quantity}`;

        slotEl.onclick = () => this.selectSlot(source, index);
        slotEl.ondblclick = () => {
          this.selectSlot(source, index);
          this.transferSelectedItem(
            source === "inventory" ? "deposit" : "withdraw"
          );
        };
      }
      container.appendChild(slotEl);
    });
  }

  private selectSlot(source: SelectedSource, index: number): void {
    this.selectedSource = source;
    this.selectedSlotIndex = index;
    this.selectedQuantity = 1;
    const qtyInput = document.getElementById(
      "wh-transfer-qty"
    ) as HTMLInputElement;
    if (qtyInput) qtyInput.value = "1";
    this.render();
  }

  private getSelectedSlot() {
    if (this.selectedSlotIndex === null || !this.selectedSource) return null;
    return this.selectedSource === "inventory"
      ? this.inventory.slots[this.selectedSlotIndex]
      : this.warehouse.slots[this.selectedSlotIndex];
  }

  private renderSelectedInspector(): void {
    const slot = this.getSelectedSlot();
    const iconEl = document.getElementById("wh-selected-icon");
    const nameEl = document.getElementById("wh-selected-name");
    const descEl = document.getElementById("wh-selected-desc");
    const btnToWh = document.getElementById(
      "btn-transfer-to-warehouse"
    ) as HTMLButtonElement;
    const btnToInv = document.getElementById(
      "btn-transfer-to-inventory"
    ) as HTMLButtonElement;

    if (!slot || !this.selectedSource) {
      if (iconEl) iconEl.textContent = "❓";
      if (nameEl) nameEl.textContent = "ยังไม่ได้เลือกไอเทม";
      if (descEl)
        descEl.textContent = "คลิกที่ไอเทมในกระเป๋าหรือคลังเพื่อจัดการ";
      if (btnToWh) btnToWh.disabled = true;
      if (btnToInv) btnToInv.disabled = true;
      return;
    }

    const def = getItemDefinition(slot.itemId);
    if (iconEl) iconEl.textContent = getItemIcon(slot.itemId);
    if (nameEl)
      nameEl.textContent = `${def?.name || slot.itemId} (มี ${slot.quantity})`;
    if (descEl) descEl.textContent = def?.description || "";

    if (btnToWh) btnToWh.disabled = this.selectedSource !== "inventory";
    if (btnToInv) btnToInv.disabled = this.selectedSource !== "warehouse";
  }

  private transferSelectedItem(direction: "deposit" | "withdraw"): void {
    if (this.selectedSlotIndex === null || !this.selectedSource) return;
    const slot = this.getSelectedSlot();
    const itemId = slot ? slot.itemId : "";
    const def = getItemDefinition(itemId);
    const itemName = def?.name || itemId;

    const res =
      direction === "deposit"
        ? WarehouseManager.depositItem(
            this.inventory,
            this.warehouse,
            this.selectedSlotIndex,
            this.selectedQuantity
          )
        : WarehouseManager.withdrawItem(
            this.inventory,
            this.warehouse,
            this.selectedSlotIndex,
            this.selectedQuantity
          );

    if (res.success) {
      this.inventory = res.inventory;
      this.warehouse = res.warehouse;
      this.callbacks.onInventoryUpdated(this.inventory);
      this.callbacks.onWarehouseUpdated(this.warehouse);
      const actionName =
        direction === "deposit" ? "ฝากเข้าคลัง" : "ถอนใส่กระเป๋า";
      this.callbacks.onShowToast(
        `📦 ${actionName} ${itemName} x${res.transferredQuantity || this.selectedQuantity} สำเร็จ!`,
        "#34d399"
      );
      const currentList =
        direction === "deposit" ? this.inventory.slots : this.warehouse.slots;
      if (!currentList[this.selectedSlotIndex]) {
        this.selectedSlotIndex = null;
        this.selectedSource = null;
      }
      this.render();
    } else {
      this.callbacks.onShowToast(
        `❌ ${res.reason || "โอนย้ายไอเทมไม่สำเร็จ"}`,
        "#f87171"
      );
    }
  }

  private openGoldDialog(mode: "deposit" | "withdraw"): void {
    this.goldDialogMode = mode;
    const dialog = document.getElementById("wh-gold-dialog");
    const title = document.getElementById("wh-gold-dialog-title");
    const desc = document.getElementById("wh-gold-dialog-desc");
    const input = document.getElementById("wh-gold-input") as HTMLInputElement;
    if (!dialog || !title || !desc || !input) return;

    if (mode === "deposit") {
      title.textContent = "ฝากเหรียญทองเข้าคลัง";
      desc.textContent = `ทองในกระเป๋า: ${this.inventory.gold.toLocaleString()} G`;
      input.value = String(Math.min(100, this.inventory.gold));
      input.max = String(this.inventory.gold);
    } else {
      title.textContent = "ถอนเหรียญทองใส่กระเป๋า";
      desc.textContent = `ทองในคลัง: ${this.warehouse.gold.toLocaleString()} G`;
      input.value = String(Math.min(100, this.warehouse.gold));
      input.max = String(this.warehouse.gold);
    }
    dialog.style.display = "flex";
  }

  private closeGoldDialog(): void {
    const dialog = document.getElementById("wh-gold-dialog");
    if (dialog) dialog.style.display = "none";
    this.goldDialogMode = null;
  }

  private handleGoldTransfer(): void {
    if (!this.goldDialogMode) return;
    const input = document.getElementById("wh-gold-input") as HTMLInputElement;
    const amount = parseInt(input?.value || "0", 10);

    const isDep = this.goldDialogMode === "deposit";
    const res = isDep
      ? WarehouseManager.depositGold(this.inventory, this.warehouse, amount)
      : WarehouseManager.withdrawGold(this.inventory, this.warehouse, amount);

    if (res.success) {
      this.inventory = res.inventory;
      this.warehouse = res.warehouse;
      this.callbacks.onInventoryUpdated(this.inventory);
      this.callbacks.onWarehouseUpdated(this.warehouse);
      const actionName = isDep ? "ฝากทองเข้าคลัง" : "ถอนทองใส่กระเป๋า";
      this.callbacks.onShowToast(
        `🪙 ${actionName} ${amount.toLocaleString()} G สำเร็จ!`,
        "#fbbf24"
      );
      this.closeGoldDialog();
      this.render();
    } else {
      this.callbacks.onShowToast(
        `❌ ${res.reason || "โอนย้ายเหรียญทองไม่สำเร็จ"}`,
        "#f87171"
      );
    }
  }
}
