import {
  PlayerRosterState,
  Combatant,
  Element,
  RosterManager,
  ProgressionEngine
} from '@poktsonline/shared';

export interface RosterModalCallbacks {
  onRosterUpdated?: (roster: PlayerRosterState) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * Deep UI Controller for Beast Roster & 2x5 Formation Grid Modal.
 * Encapsulates all beast listing, deployment, stat allocation, and formation slot selection.
 */
export class RosterModalController {
  private roster: PlayerRosterState;
  private callbacks: RosterModalCallbacks;
  private isModalOpen: boolean = false;
  private selectedFormationUnitType: 'hero' | 'beast' = 'hero';

  constructor(initialRoster: PlayerRosterState, callbacks: RosterModalCallbacks = {}) {
    this.roster = initialRoster;
    this.callbacks = callbacks;
    this.setupDOM();
    this.updateButtonLabel();
  }

  public setRoster(roster: PlayerRosterState): void {
    this.roster = roster;
    this.updateButtonLabel();
    if (this.isModalOpen) {
      this.render();
    }
  }

  public getRoster(): PlayerRosterState {
    return this.roster;
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public toggle(forceOpen?: boolean): void {
    const modal = document.getElementById('roster-modal');
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
      this.callbacks.onClose?.();
    }
  }

  public close(): void {
    this.toggle(false);
  }

  public setButtonVisible(visible: boolean): void {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.style.display = visible ? 'flex' : 'none';
    }
  }

  public updateButtonLabel(): void {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.innerHTML = `🐾 BEASTS (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY}) <span style="opacity: 0.75; font-size: 11px;">[B]</span>`;
    }
  }

  public render(): void {
    const modal = document.getElementById('roster-modal');
    if (!modal || !this.isModalOpen) return;

    // 1. Capacity header
    const capacityHeader = document.getElementById('roster-capacity-header');
    if (capacityHeader) {
      capacityHeader.innerText = `BEAST ROSTER (${this.roster.beasts.length}/${RosterManager.MAX_BEAST_CAPACITY})`;
    }

    // 2. Beast List
    const beastContainer = document.getElementById('beast-list-container');
    if (beastContainer) {
      beastContainer.innerHTML = '';
      if (this.roster.beasts.length === 0) {
        beastContainer.innerHTML = `
          <div style="padding: 24px; text-align: center; color: #64748b; font-size: 13px;">
            No beasts captured yet.<br>Explore Whispering Meadow to capture wild beasts!
          </div>
        `;
      } else {
        this.roster.beasts.forEach((beast: Combatant) => {
          const isActive = beast.id === this.roster.activeBeastId;
          const card = document.createElement('div');
          card.className = `beast-item ${isActive ? 'active' : ''}`;

          card.innerHTML = `
            <div class="beast-info">
              <div class="beast-name-row">
                <span style="color: ${this.getElementColor(beast.element)};">${beast.name}</span>
                <span style="font-size: 11px; color: #94a3b8;">Lv.${beast.level}</span>
                <span class="badge-element badge-${beast.element}">${this.getElementIcon(beast.element)} ${beast.element}</span>
              </div>
              <div class="beast-bars">
                <span>HP: ${beast.hp}/${beast.maxHp}</span> &bull; <span>SP: ${beast.sp}/${beast.maxSp}</span> &bull; <span>EXP: ${beast.exp ?? 0}/${beast.maxExp ?? ProgressionEngine.calculateExpToNextLevel(beast.level)}</span>
              </div>
              <div class="beast-stats-row">
                <span>ATK: ${beast.atk}</span>
                <span>DEF: ${beast.def}</span>
                <span>INT: ${beast.int || 10}</span>
                <span>AGI: ${beast.agi}</span>
              </div>
              ${(beast.statPoints ?? 0) > 0 ? `
                <div style="margin-top: 4px; display: flex; align-items: center; gap: 4px; font-size: 10px; color: #fbbf24;">
                  <span>⭐ ${beast.statPoints} Pts:</span>
                  <button class="beast-stat-btn" data-attr="atk" data-id="${beast.id}">+ATK</button>
                  <button class="beast-stat-btn" data-attr="def" data-id="${beast.id}">+DEF</button>
                  <button class="beast-stat-btn" data-attr="int" data-id="${beast.id}">+INT</button>
                  <button class="beast-stat-btn" data-attr="agi" data-id="${beast.id}">+AGI</button>
                </div>
              ` : ''}
            </div>
            <div>
              ${isActive 
                ? '<div class="badge-active-beast">⭐ ACTIVE</div>' 
                : `<button class="btn-deploy-beast" data-id="${beast.id}">⚡ Deploy</button>`
              }
            </div>
          `;

          const deployBtn = card.querySelector<HTMLButtonElement>('.btn-deploy-beast');
          if (deployBtn) {
            deployBtn.onclick = (e) => {
              e.stopPropagation();
              this.roster = RosterManager.setActiveBeast(this.roster, beast.id);
              this.updateButtonLabel();
              this.render();
              this.callbacks.onRosterUpdated?.(this.roster);
            };
          }

          const statBtns = card.querySelectorAll<HTMLButtonElement>('.beast-stat-btn');
          statBtns.forEach(btn => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const attr = btn.getAttribute('data-attr') as 'atk' | 'def' | 'int' | 'agi';
              const res = ProgressionEngine.allocateStatPoint(beast, attr);
              if (res.success) {
                const idx = this.roster.beasts.findIndex((b: Combatant) => b.id === beast.id);
                if (idx !== -1) this.roster.beasts[idx] = res.combatant;
                this.render();
                this.callbacks.onRosterUpdated?.(this.roster);
              }
            };
          });

          beastContainer.appendChild(card);
        });
      }
    }

    // 3. Unit Selector Buttons
    const btnHero = document.getElementById('btn-select-hero');
    const btnBeast = document.getElementById('btn-select-beast');
    const activeBeast = this.roster.beasts.find((b: Combatant) => b.id === this.roster.activeBeastId);

    if (btnHero) {
      btnHero.className = `btn-unit-select ${this.selectedFormationUnitType === 'hero' ? 'selected-hero' : ''}`;
      btnHero.onclick = () => {
        this.selectedFormationUnitType = 'hero';
        this.render();
      };
    }

    if (btnBeast) {
      btnBeast.className = `btn-unit-select ${this.selectedFormationUnitType === 'beast' ? 'selected-beast' : ''}`;
      btnBeast.innerText = `🦁 Move ${activeBeast?.name || 'Active Beast'}`;
      btnBeast.onclick = () => {
        this.selectedFormationUnitType = 'beast';
        this.render();
      };
    }

    // 4. Formation Grid Slots
    this.renderGridSlotsRow('front', document.getElementById('grid-front-row'), activeBeast);
    this.renderGridSlotsRow('back', document.getElementById('grid-back-row'), activeBeast);

    // 5. Summary Text
    const summaryText = document.getElementById('formation-summary-text');
    if (summaryText) {
      summaryText.innerHTML = `
        <b>Current Formation:</b> 
        🧙 Hero: <span style="color: #60a5fa;">${this.roster.formation.heroSlot.row.toUpperCase()} [Col ${this.roster.formation.heroSlot.col}]</span> &bull; 
        🦁 ${activeBeast?.name || 'Beast'}: <span style="color: #34d399;">${this.roster.formation.beastSlot.row.toUpperCase()} [Col ${this.roster.formation.beastSlot.col}]</span>
      `;
    }
  }

  private renderGridSlotsRow(row: 'front' | 'back', rowEl: HTMLElement | null, activeBeast?: Combatant): void {
    if (!rowEl) return;
    rowEl.innerHTML = '';

    for (let col = 0; col < 5; col++) {
      const isHeroHere = this.roster.formation.heroSlot.row === row && this.roster.formation.heroSlot.col === col;
      const isBeastHere = this.roster.formation.beastSlot.row === row && this.roster.formation.beastSlot.col === col;

      const slotBox = document.createElement('div');
      slotBox.className = `slot-box ${isHeroHere ? 'hero-slot' : isBeastHere ? 'beast-slot' : ''}`;

      if (isHeroHere) {
        slotBox.innerHTML = '<div>🧙 Hero</div><div style="font-size: 9px; opacity: 0.85;">Lv.5</div>';
      } else if (isBeastHere) {
        slotBox.innerHTML = `<div>🦁 ${activeBeast?.name?.split(' ')[0] || 'Beast'}</div><div style="font-size: 9px; opacity: 0.85;">Lv.${activeBeast?.level || 1}</div>`;
      } else {
        slotBox.innerHTML = `<div>Slot ${col}</div><div style="font-size: 9px; opacity: 0.5;">Empty</div>`;
      }

      slotBox.onclick = () => {
        this.roster = RosterManager.setFormationSlot(this.roster, this.selectedFormationUnitType, { row, col });
        this.render();
        this.callbacks.onRosterUpdated?.(this.roster);
      };

      rowEl.appendChild(slotBox);
    }
  }

  private setupDOM(): void {
    const htmlBtn = document.getElementById('btn-roster');
    if (htmlBtn) {
      htmlBtn.style.display = 'flex';
      htmlBtn.onclick = () => this.toggle();
    }

    const btnClose = document.getElementById('btn-close-modal');
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnConfirm = document.getElementById('btn-confirm-formation');
    if (btnConfirm) btnConfirm.onclick = () => this.toggle(false);

    const modal = document.getElementById('roster-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }
  }

  private getElementColor(element: Element): string {
    switch (element) {
      case Element.Water: return '#38bdf8';
      case Element.Fire: return '#f87171';
      case Element.Earth: return '#fb923c';
      case Element.Wind: return '#4ade80';
      default: return '#e2e8f0';
    }
  }

  private getElementIcon(element: Element): string {
    switch (element) {
      case Element.Water: return '💧';
      case Element.Fire: return '🔥';
      case Element.Earth: return '🌍';
      case Element.Wind: return '🌪️';
      default: return '✨';
    }
  }
}
