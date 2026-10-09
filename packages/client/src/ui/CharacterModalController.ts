import { Combatant, ProgressionEngine } from '@poktsonline/shared';

export interface CharacterModalCallbacks {
  onHeroUpdated?: (hero: Combatant) => void;
  onOpen?: () => void;
  onClose?: () => void;
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
    const modal = document.getElementById('character-modal');
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
    const btnStatus = document.getElementById('btn-character-status');
    if (btnStatus) {
      btnStatus.style.display = visible ? 'block' : 'none';
    }
  }

  public updateHeroStatusBar(): void {
    const hero = this.hero;
    const maxExp = hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const statPoints = hero.statPoints ?? 0;

    const quickInfo = document.getElementById('hero-quick-info');
    if (quickInfo) {
      const ptsNote = statPoints > 0 ? ` <span style="color: #fbbf24; font-weight: bold;">⭐ ${statPoints} PTS!</span>` : '';
      quickInfo.innerHTML = `🧙 ${hero.name} Lv.${hero.level} (${exp}/${maxExp} EXP)${ptsNote}`;
    }
  }

  public render(): void {
    const modal = document.getElementById('character-modal');
    if (!modal || !this.isModalOpen) return;

    const hero = this.hero;
    const maxExp = hero.maxExp ?? ProgressionEngine.calculateExpToNextLevel(hero.level);
    const exp = hero.exp ?? 0;
    const expPercent = Math.min(100, Math.floor((exp / maxExp) * 100));
    const statPoints = hero.statPoints ?? 0;

    const nameTitle = document.getElementById('char-name-title');
    if (nameTitle) nameTitle.innerText = `${hero.name} Lv.${hero.level} [${hero.element}]`;

    const expText = document.getElementById('char-exp-text');
    if (expText) expText.innerText = `EXP: ${exp} / ${maxExp} (${expPercent}%)`;

    const expBar = document.getElementById('char-exp-bar');
    if (expBar) expBar.style.width = `${expPercent}%`;

    const pointsBadge = document.getElementById('char-stat-points-val');
    if (pointsBadge) {
      pointsBadge.innerText = `${statPoints} Points Available`;
      pointsBadge.style.color = statPoints > 0 ? '#fbbf24' : '#94a3b8';
      pointsBadge.style.borderColor = statPoints > 0 ? '#fbbf24' : '#475569';
    }

    const elAtk = document.getElementById('val-atk');
    if (elAtk) elAtk.innerText = `${hero.atk}`;

    const elDef = document.getElementById('val-def');
    if (elDef) elDef.innerText = `${hero.def}`;

    const elInt = document.getElementById('val-int');
    if (elInt) elInt.innerText = `${hero.int}`;

    const elAgi = document.getElementById('val-agi');
    if (elAgi) elAgi.innerText = `${hero.agi}`;

    const elHp = document.getElementById('val-hp');
    if (elHp) elHp.innerText = `${hero.hp} / ${hero.maxHp}`;

    const elSp = document.getElementById('val-sp');
    if (elSp) elSp.innerText = `${hero.sp} / ${hero.maxSp}`;

    const plusBtns = document.querySelectorAll<HTMLButtonElement>('#character-modal .btn-stat-plus');
    plusBtns.forEach(btn => {
      btn.disabled = statPoints <= 0;
    });
  }

  private setupDOM(): void {
    const btnStatus = document.getElementById('btn-character-status');
    if (btnStatus) btnStatus.onclick = () => this.toggle();

    const btnClose = document.getElementById('btn-close-char-modal');
    if (btnClose) btnClose.onclick = () => this.toggle(false);

    const btnDone = document.getElementById('btn-close-char-bottom');
    if (btnDone) btnDone.onclick = () => this.toggle(false);

    const modal = document.getElementById('character-modal');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.toggle(false);
        }
      };
    }

    const plusBtns = document.querySelectorAll<HTMLButtonElement>('#character-modal .btn-stat-plus');
    plusBtns.forEach(btn => {
      btn.onclick = () => {
        const attr = btn.getAttribute('data-attr') as 'atk' | 'def' | 'int' | 'agi';
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
