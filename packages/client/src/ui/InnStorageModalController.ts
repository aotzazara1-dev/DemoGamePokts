import {
  PlayerRosterState,
  InnStorageState,
  InnStorageManager,
  Combatant,
} from "@poktsonline/shared";

export interface InnStorageModalCallbacks {
  onRosterUpdated: (roster: PlayerRosterState) => void;
  onInnStorageUpdated: (innStorage: InnStorageState) => void;
  onShowToast: (msg: string, color?: string) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for Inn Beast Daycare & Storage Modal (ADR 0022).
 * Tiered LOC Ceiling: <= 400 lines.
 */
export class InnStorageModalController {
  private roster: PlayerRosterState;
  private innStorage: InnStorageState;
  private callbacks: InnStorageModalCallbacks;

  constructor(
    roster: PlayerRosterState,
    innStorage: InnStorageState,
    callbacks: InnStorageModalCallbacks
  ) {
    this.roster = roster;
    this.innStorage = innStorage;
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public setRoster(roster: PlayerRosterState): void {
    this.roster = roster;
    if (this.isOpen()) {
      this.render();
    }
  }

  public setInnStorage(innStorage: InnStorageState): void {
    this.innStorage = innStorage;
    if (this.isOpen()) {
      this.render();
    }
  }

  public open(): void {
    const modal = document.getElementById("inn-storage-modal");
    if (!modal) return;
    this.render();
    modal.classList.add("open");
    this.callbacks.onOpen?.();
  }

  public close(): void {
    const modal = document.getElementById("inn-storage-modal");
    if (modal) {
      modal.classList.remove("open");
    }
    this.callbacks.onClose?.();
  }

  public isOpen(): boolean {
    const modal = document.getElementById("inn-storage-modal");
    return modal ? modal.classList.contains("open") : false;
  }

  private setupDOM(): void {
    const btnClose = document.getElementById("btn-close-inn-modal");
    const btnBottom = document.getElementById("btn-close-inn-bottom");
    if (btnClose) btnClose.onclick = () => this.close();
    if (btnBottom) btnBottom.onclick = () => this.close();
  }

  public render(): void {
    this.renderCounts();
    this.renderRosterList();
    this.renderStorageList();
  }

  private renderCounts(): void {
    const rosterCountEl = document.getElementById("inn-roster-count");
    if (rosterCountEl) {
      rosterCountEl.textContent = `${this.roster.beasts.length} / 10`;
    }

    const storageCountEl = document.getElementById("inn-storage-count");
    if (storageCountEl) {
      storageCountEl.textContent = `${this.innStorage.beasts.length} / ${InnStorageManager.INN_STORAGE_CAPACITY}`;
    }
  }

  private renderRosterList(): void {
    const container = document.getElementById("inn-roster-list");
    if (!container) return;
    container.innerHTML = "";

    if (this.roster.beasts.length === 0) {
      container.innerHTML = `
        <div class="inn-empty-notice">
          <div style="font-size: 28px;">📭</div>
          <div>ไม่มีขุนพลติดตามในทัพ</div>
        </div>
      `;
      return;
    }

    const canDepositSole = this.roster.beasts.length > 1;

    this.roster.beasts.forEach((beast) => {
      const card = document.createElement("div");
      card.className = "inn-beast-card";

      const isActive = beast.id === this.roster.activeBeastId;

      card.innerHTML = `
        <div class="inn-beast-main">
          <div class="inn-beast-avatar">🐎</div>
          <div class="inn-beast-info">
            <div class="inn-beast-name-row">
              <span class="inn-beast-name">${beast.name}</span>
              <span class="inn-beast-badge ${isActive ? "badge-active" : "badge-reserve"}">
                ${isActive ? "⚔️ ขุนพลหลัก" : "กองหนุน"}
              </span>
            </div>
            <div class="inn-beast-stats">
              <span>Lv.${beast.level} [${beast.element}]</span>
              <div class="inn-bar-wrap">
                <span class="inn-beast-hp">HP: ${beast.hp}/${beast.maxHp}</span>
                <div class="inn-bar-track"><div class="inn-bar-fill hp" style="width: ${Math.round((beast.hp / Math.max(1, beast.maxHp)) * 100)}%;"></div></div>
              </div>
              <div class="inn-bar-wrap">
                <span class="inn-beast-sp">SP: ${beast.sp}/${beast.maxSp}</span>
                <div class="inn-bar-track"><div class="inn-bar-fill sp" style="width: ${Math.round((beast.sp / Math.max(1, beast.maxSp)) * 100)}%;"></div></div>
              </div>
            </div>
          </div>
        </div>
      `;

      const btnDeposit = document.createElement("button");
      btnDeposit.type = "button";
      btnDeposit.className = "inn-action-btn btn-deposit-beast";
      btnDeposit.textContent = "📥 ฝากโรงเตี๊ยม";

      if (!canDepositSole) {
        btnDeposit.disabled = true;
        btnDeposit.title = "ต้องมีขุนพลในทัพอย่างน้อย 1 ตัว";
      } else {
        btnDeposit.onclick = () => this.depositBeast(beast.id);
      }

      card.appendChild(btnDeposit);
      container.appendChild(card);
    });
  }

  private renderStorageList(): void {
    const container = document.getElementById("inn-storage-list");
    if (!container) return;
    container.innerHTML = "";

    if (this.innStorage.beasts.length === 0) {
      container.innerHTML = `
        <div class="inn-empty-notice">
          <div style="font-size: 28px;">🏡</div>
          <div>โรงเตี๊ยมยังไม่มีขุนพลมาพักฟื้น</div>
        </div>
      `;
      return;
    }

    const isRosterFull = this.roster.beasts.length >= 10;

    this.innStorage.beasts.forEach((beast) => {
      const card = document.createElement("div");
      card.className = "inn-beast-card";

      card.innerHTML = `
        <div class="inn-beast-main">
          <div class="inn-beast-avatar">✨</div>
          <div class="inn-beast-info">
            <div class="inn-beast-name-row">
              <span class="inn-beast-name">${beast.name}</span>
              <span class="inn-beast-badge badge-healed">✨ พักฟื้น 100%</span>
            </div>
            <div class="inn-beast-stats">
              <span>Lv.${beast.level} [${beast.element}]</span>
              <div class="inn-bar-wrap">
                <span class="inn-beast-hp">HP: ${beast.hp}/${beast.maxHp}</span>
                <div class="inn-bar-track"><div class="inn-bar-fill hp" style="width: ${Math.round((beast.hp / Math.max(1, beast.maxHp)) * 100)}%;"></div></div>
              </div>
              <div class="inn-bar-wrap">
                <span class="inn-beast-sp">SP: ${beast.sp}/${beast.maxSp}</span>
                <div class="inn-bar-track"><div class="inn-bar-fill sp" style="width: ${Math.round((beast.sp / Math.max(1, beast.maxSp)) * 100)}%;"></div></div>
              </div>
            </div>
          </div>
        </div>
      `;

      const btnWithdraw = document.createElement("button");
      btnWithdraw.type = "button";
      btnWithdraw.className = "inn-action-btn btn-withdraw-beast";
      btnWithdraw.textContent = "📤 รับกลับเข้าทัพ";

      if (isRosterFull) {
        btnWithdraw.disabled = true;
        btnWithdraw.title = "ทัพเต็มแล้ว (สูงสุด 10 ตัว)";
      } else {
        btnWithdraw.onclick = () => this.withdrawBeast(beast.id);
      }

      card.appendChild(btnWithdraw);
      container.appendChild(card);
    });
  }

  private depositBeast(beastId: string): void {
    const target = this.roster.beasts.find((b) => b.id === beastId);
    const res = InnStorageManager.depositBeast(
      this.roster,
      this.innStorage,
      beastId
    );
    if (res.success) {
      this.roster = res.roster;
      this.innStorage = res.storage;
      this.callbacks.onRosterUpdated(this.roster);
      this.callbacks.onInnStorageUpdated(this.innStorage);
      this.callbacks.onShowToast(
        `🐎 ฝาก ${target?.name || beastId} เข้าโรงเตี๊ยมสำเร็จ! ได้รับการพักฟื้น HP/SP เต็มเปี่ยม`,
        "#34d399"
      );
      this.render();
    } else {
      this.callbacks.onShowToast(
        `❌ ${res.reason || "ไม่สามารถฝากขุนพลได้"}`,
        "#f87171"
      );
    }
  }

  private withdrawBeast(beastId: string): void {
    const target = this.innStorage.beasts.find((b) => b.id === beastId);
    const res = InnStorageManager.withdrawBeast(
      this.roster,
      this.innStorage,
      beastId
    );
    if (res.success) {
      this.roster = res.roster;
      this.innStorage = res.storage;
      this.callbacks.onRosterUpdated(this.roster);
      this.callbacks.onInnStorageUpdated(this.innStorage);
      this.callbacks.onShowToast(
        `⚔️ ดึงตัว ${target?.name || beastId} กลับเข้าทัพสำเร็จ! พร้อมลุยศึก`,
        "#38bdf8"
      );
      this.render();
    } else {
      this.callbacks.onShowToast(
        `❌ ${res.reason || "ไม่สามารถดึงขุนพลได้"}`,
        "#f87171"
      );
    }
  }
}
