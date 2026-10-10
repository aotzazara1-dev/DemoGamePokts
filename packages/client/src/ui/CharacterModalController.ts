import {
  Combatant,
  ProgressionEngine,
  EquipmentManager,
  type EquipmentSlot,
  getItemDefinition,
  getItemIcon,
} from "@poktsonline/shared";

export interface CharacterModalCallbacks {
  onHeroUpdated?: (hero: Combatant) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onUnequipItem?: (slot: EquipmentSlot) => void;
}

/**
 * Deep UI Controller for Hero Profile & Stat Allocation modal.
 * Encapsulates all DOM element lookups, event bindings, and stat updates.
 */
export class CharacterModalController {
  private hero: Combatant;
  private callbacks: CharacterModalCallbacks;
  private isModalOpen: boolean = false;

  constructor(initialHero: Combatant, callbacks: CharacterModalCallbacks = {}) {
    this.hero = initialHero;
    this.callbacks = callbacks;
    this.setupDOM();
    this.updateHeroStatusBar();
  }

  public setHero(hero: Combatant): void {
    this.hero = hero;
    if (this.isModalOpen) {
      this.render();
    }
    this.updateHeroStatusBar();
  }

  public getHero(): Combatant {
    return this.hero;
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public toggle(forceOpen?: boolean): void {
    const modal = document.getElementById("character-modal");
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

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const btnStatus = document.getElementById("btn-character-status");
    if (btnStatus) {
      btnStatus.style.display = visible ? "block" : "none";
    }
  }

  public updateHeroStatusBar(): void {
    const hero = this.hero;
    const maxExp =
      hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const statPoints = hero.statPoints ?? 0;

    const quickInfo = document.getElementById("hero-quick-info");
    if (quickInfo) {
      const ptsNote =
        statPoints > 0
          ? ` <span style="color: #fbbf24; font-weight: bold;">⭐ ${statPoints} PTS!</span>`
          : "";
      quickInfo.innerHTML = `🧙 ${hero.name} Lv.${hero.level} (${exp}/${maxExp} EXP)${ptsNote}`;
    }
  }

  public render(): void {
    const modal = document.getElementById("character-modal");
    if (!modal || !this.isModalOpen) return;

    const hero = this.hero;
    const maxExp =
      hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const expPercent = Math.min(100, Math.floor((exp / maxExp) * 100));
    const statPoints = hero.statPoints ?? 0;

    const nameTitle = document.getElementById("char-name-title");
    if (nameTitle)
      nameTitle.innerText = `${hero.name} Lv.${hero.level} [${hero.element}]`;

    const expText = document.getElementById("char-exp-text");
    if (expText) expText.innerText = `EXP: ${exp} / ${maxExp} (${expPercent}%)`;

    const expBar = document.getElementById("char-exp-bar");
    if (expBar) expBar.style.width = `${expPercent}%`;

    const pointsBadge = document.getElementById("char-stat-points-val");
    if (pointsBadge) {
      pointsBadge.innerText = `${statPoints} Points Available`;
      pointsBadge.style.color = statPoints > 0 ? "#fbbf24" : "#94a3b8";
      pointsBadge.style.borderColor = statPoints > 0 ? "#fbbf24" : "#475569";
    }

    // Equipment bonus calculation
    const bonus = EquipmentManager.getEquipmentBonusStats(hero.equipment);

    const formatStat = (val: number, bonusVal?: number) => {
      if (bonusVal && bonusVal > 0) {
        return `${val} <span style="color: #4ade80; font-size: 11px; font-weight: normal;">(+${bonusVal})</span>`;
      }
      return `${val}`;
    };

    const elAtk = document.getElementById("val-atk");
    if (elAtk) elAtk.innerHTML = formatStat(hero.atk, bonus.atk);

    const elDef = document.getElementById("val-def");
    if (elDef) elDef.innerHTML = formatStat(hero.def, bonus.def);

    const elInt = document.getElementById("val-int");
    if (elInt) elInt.innerHTML = formatStat(hero.int, bonus.int);

    const elAgi = document.getElementById("val-agi");
    if (elAgi) elAgi.innerHTML = formatStat(hero.agi, bonus.agi);

    const elHp = document.getElementById("val-hp");
    if (elHp)
      elHp.innerHTML =
        `${hero.hp} / ${hero.maxHp}` +
        (bonus.maxHp
          ? ` <span style="color: #4ade80; font-size: 11px;">(+${bonus.maxHp})</span>`
          : "");

    const elSp = document.getElementById("val-sp");
    if (elSp)
      elSp.innerHTML =
        `${hero.sp} / ${hero.maxSp}` +
        (bonus.maxSp
          ? ` <span style="color: #4ade80; font-size: 11px;">(+${bonus.maxSp})</span>`
          : "");

    const plusBtns = document.querySelectorAll<HTMLButtonElement>(
      "#character-modal .btn-stat-plus"
    );
    plusBtns.forEach((btn) => {
      btn.disabled = statPoints <= 0;
    });

    // Render Hero Equipment Paperdoll Slots
    const eqContainer = document.getElementById("hero-equipment-slots");
    if (eqContainer) {
      eqContainer.innerHTML = "";
      const slots: EquipmentSlot[] = [
        "head",
        "weapon",
        "armor",
        "boots",
        "accessory",
      ];
      const slotLabels: Record<EquipmentSlot, { label: string; icon: string }> =
        {
          head: { label: "Head", icon: "🪖" },
          weapon: { label: "Weapon", icon: "⚔️" },
          armor: { label: "Armor", icon: "🛡️" },
          boots: { label: "Boots", icon: "👢" },
          accessory: { label: "Accessory", icon: "💍" },
        };

      slots.forEach((slot) => {
        const itemId = hero.equipment?.[slot];
        const itemDef = itemId ? getItemDefinition(itemId) : null;
        const slotEl = document.createElement("div");
        slotEl.className = `paperdoll-slot ${itemDef ? "equipped" : "empty"}`;
        slotEl.setAttribute("data-slot", slot);

        if (itemDef) {
          slotEl.title = `${itemDef.name}\n${itemDef.description}\n[Click to Unequip]`;
          slotEl.innerHTML = `
            <span class="paperdoll-slot-icon">${getItemIcon(itemDef.id)}</span>
            <span class="paperdoll-slot-name">${itemDef.name.split(" (")[0]}</span>
            <span class="paperdoll-slot-type">${slotLabels[slot].label}</span>
            <span class="paperdoll-slot-unequip">✕ Unequip</span>
          `;
          slotEl.onclick = () => {
            this.callbacks.onUnequipItem?.(slot);
          };
        } else {
          slotEl.title = `${slotLabels[slot].label} Slot (Empty)`;
          slotEl.innerHTML = `
            <span class="paperdoll-slot-icon" style="opacity: 0.35;">${slotLabels[slot].icon}</span>
            <span class="paperdoll-slot-name" style="opacity: 0.5;">[Empty]</span>
            <span class="paperdoll-slot-type">${slotLabels[slot].label}</span>
          `;
        }
        eqContainer.appendChild(slotEl);
      });
    }
  }

  private setupDOM(): void {
    const btnStatus = document.getElementById("btn-character-status");
    if (btnStatus) btnStatus.onclick = () => this.toggle();

    const btnClose = document.getElementById("btn-close-char-modal");
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnDone = document.getElementById("btn-close-char-bottom");
    if (btnDone) btnDone.onclick = () => this.toggle(false);

    const modal = document.getElementById("character-modal");
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }

    const plusBtns = document.querySelectorAll<HTMLButtonElement>(
      "#character-modal .btn-stat-plus"
    );
    plusBtns.forEach((btn) => {
      btn.onclick = () => {
        const attr = btn.getAttribute("data-attr") as
          "atk" | "def" | "int" | "agi";
        const res = ProgressionEngine.allocateStatPoint(this.hero, attr);
        if (res.success) {
          this.hero = res.combatant;
          this.render();
          this.updateHeroStatusBar();
          this.callbacks.onHeroUpdated?.(this.hero);
        }
      };
    });
  }
}
