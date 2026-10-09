import { Element, type HeroSummary } from '@poktsonline/shared';
import { HeroService } from '../auth/HeroService.js';
import { AuthService } from '../auth/AuthService.js';

export interface CharacterSelectCallbacks {
  onHeroSelected?: (hero: HeroSummary) => void;
  onOpenLinkAccount?: () => void;
  onClose?: () => void;
}

export class CharacterSelectModalController {
  private heroService: HeroService;
  private authService: AuthService;
  private callbacks: CharacterSelectCallbacks;
  private isModalOpen: boolean = false;
  private heroes: HeroSummary[] = [];
  private selectedElement: Element = Element.Water;
  private heroPendingDeletion: HeroSummary | null = null;

  constructor(
    heroService: HeroService,
    authService: AuthService,
    callbacks: CharacterSelectCallbacks = {}
  ) {
    this.heroService = heroService;
    this.authService = authService;
    this.callbacks = callbacks;
    this.setupDOM();
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public async open(): Promise<void> {
    this.isModalOpen = true;
    const modal = document.getElementById('character-select-modal');
    if (!modal) return;

    modal.classList.add('open');
    this.hideSubmodals();
    await this.refreshHeroes();
  }

  public close(): void {
    this.isModalOpen = false;
    const modal = document.getElementById('character-select-modal');
    if (modal) {
      modal.classList.remove('open');
    }
    this.callbacks.onClose?.();
  }

  public async refreshHeroes(): Promise<void> {
    try {
      this.heroes = await this.heroService.getHeroes();
      this.render();
    } catch (err: any) {
      console.error('Failed to load heroes:', err);
    }
  }

  private setupDOM(): void {
    const modal = document.getElementById('character-select-modal');
    if (!modal) return;

    // Link Account button if playing as Guest
    const btnLink = document.getElementById('btn-char-select-link');
    btnLink?.addEventListener('click', () => {
      this.callbacks.onOpenLinkAccount?.();
    });

    // Create Hero form
    const createForm = document.getElementById('create-hero-form') as HTMLFormElement;
    createForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateHero();
    });

    const btnCancelCreate = document.getElementById('btn-cancel-create-hero');
    btnCancelCreate?.addEventListener('click', () => {
      this.hideSubmodals();
    });

    // Element selection buttons
    const elementBtns = document.querySelectorAll('.element-choice-btn');
    elementBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const el = btn.getAttribute('data-element') as Element;
        if (el) {
          this.selectedElement = el;
          elementBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
        }
      });
    });

    // Delete Hero form
    const deleteForm = document.getElementById('delete-hero-form') as HTMLFormElement;
    deleteForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleConfirmDelete();
    });

    const btnCancelDelete = document.getElementById('btn-cancel-delete-hero');
    btnCancelDelete?.addEventListener('click', () => {
      this.hideSubmodals();
    });
  }

  private render(): void {
    const modal = document.getElementById('character-select-modal');
    if (!modal) return;

    // Link button visibility
    const btnLink = document.getElementById('btn-char-select-link');
    if (btnLink) {
      btnLink.style.display = this.authService.isGuest() ? 'inline-flex' : 'none';
    }

    const grid = document.getElementById('character-slots-grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < 3; i++) {
      const hero = this.heroes[i];
      const slotEl = document.createElement('div');
      slotEl.className = 'char-slot-card';

      if (hero) {
        slotEl.classList.add('active-slot');
        slotEl.innerHTML = `
          <div class="char-slot-header">
            <span class="char-slot-element-badge el-${hero.element.toLowerCase()}">${this.getElementIcon(hero.element)} ${hero.element}</span>
            <span class="char-slot-level">Lv.${hero.level}</span>
          </div>
          <div class="char-slot-name">${hero.name}</div>
          <div class="char-slot-loc">📍 ${this.formatMapName(hero.mapId)}</div>
          <div class="char-slot-actions">
            <button class="btn-enter-world" data-id="${hero.id}">⚔️ ENTER WORLD</button>
            <button class="btn-delete-hero" data-id="${hero.id}" title="Delete character">🗑️</button>
          </div>
        `;

        const enterBtn = slotEl.querySelector('.btn-enter-world') as HTMLButtonElement;
        enterBtn?.addEventListener('click', () => {
          this.close();
          this.callbacks.onHeroSelected?.(hero);
        });

        const delBtn = slotEl.querySelector('.btn-delete-hero') as HTMLButtonElement;
        delBtn?.addEventListener('click', () => {
          this.openDeleteSubmodal(hero);
        });
      } else {
        slotEl.classList.add('empty-slot');
        slotEl.innerHTML = `
          <div class="empty-slot-content">
            <div class="empty-slot-icon">➕</div>
            <div class="empty-slot-text">EMPTY HERO SLOT</div>
            <button class="btn-create-slot-hero" data-slot="${i}">+ Create Hero</button>
          </div>
        `;

        const createBtn = slotEl.querySelector('.btn-create-slot-hero') as HTMLButtonElement;
        createBtn?.addEventListener('click', () => {
          this.openCreateSubmodal();
        });
      }

      grid.appendChild(slotEl);
    }
  }

  private openCreateSubmodal(): void {
    const sub = document.getElementById('create-hero-submodal');
    if (!sub) return;
    sub.style.display = 'flex';

    const inputName = document.getElementById('create-hero-name') as HTMLInputElement;
    if (inputName) {
      inputName.value = '';
      inputName.focus();
    }

    const err = document.getElementById('create-hero-error');
    if (err) err.style.display = 'none';
  }

  private openDeleteSubmodal(hero: HeroSummary): void {
    this.heroPendingDeletion = hero;
    const sub = document.getElementById('delete-hero-submodal');
    if (!sub) return;
    sub.style.display = 'flex';

    const promptText = document.getElementById('delete-hero-prompt');
    if (promptText) {
      promptText.innerHTML = `To permanently delete <strong>${hero.name}</strong>, type their exact name below:`;
    }

    const inputConfirm = document.getElementById('delete-hero-confirm-name') as HTMLInputElement;
    if (inputConfirm) {
      inputConfirm.value = '';
      inputConfirm.focus();
    }

    const err = document.getElementById('delete-hero-error');
    if (err) err.style.display = 'none';
  }

  private hideSubmodals(): void {
    const createSub = document.getElementById('create-hero-submodal');
    if (createSub) createSub.style.display = 'none';

    const deleteSub = document.getElementById('delete-hero-submodal');
    if (deleteSub) deleteSub.style.display = 'none';

    this.heroPendingDeletion = null;
  }

  private async handleCreateHero(): Promise<void> {
    const inputName = document.getElementById('create-hero-name') as HTMLInputElement;
    const errEl = document.getElementById('create-hero-error');
    const submitBtn = document.getElementById('btn-submit-create-hero') as HTMLButtonElement;

    const name = inputName?.value?.trim() || '';
    if (name.length < 3 || name.length > 16) {
      if (errEl) {
        errEl.innerText = '❌ Hero name must be between 3 and 16 characters';
        errEl.style.display = 'block';
      }
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (errEl) errEl.style.display = 'none';

      await this.heroService.createHero(name, this.selectedElement);
      this.hideSubmodals();
      await this.refreshHeroes();
    } catch (err: any) {
      if (errEl) {
        errEl.innerText = `❌ ${err.message || 'Failed to create hero'}`;
        errEl.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  private async handleConfirmDelete(): Promise<void> {
    if (!this.heroPendingDeletion) return;

    const inputConfirm = document.getElementById('delete-hero-confirm-name') as HTMLInputElement;
    const errEl = document.getElementById('delete-hero-error');
    const submitBtn = document.getElementById('btn-submit-delete-hero') as HTMLButtonElement;

    const confirmName = inputConfirm?.value?.trim() || '';
    if (confirmName !== this.heroPendingDeletion.name) {
      if (errEl) {
        errEl.innerText = `❌ Name does not match '${this.heroPendingDeletion.name}'`;
        errEl.style.display = 'block';
      }
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (errEl) errEl.style.display = 'none';

      await this.heroService.deleteHero(this.heroPendingDeletion.id, confirmName);
      this.hideSubmodals();
      await this.refreshHeroes();
    } catch (err: any) {
      if (errEl) {
        errEl.innerText = `❌ ${err.message || 'Failed to delete hero'}`;
        errEl.style.display = 'block';
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  private getElementIcon(element: Element): string {
    switch (element) {
      case Element.Fire: return '🔥';
      case Element.Water: return '💧';
      case Element.Earth: return '🌍';
      case Element.Wind: return '🌪️';
      default: return '✨';
    }
  }

  private formatMapName(mapId: string): string {
    switch (mapId) {
      case 'novice_town_and_meadow': return 'Novice Town & Meadow';
      case 'misty_forest': return 'Misty Bamboo Forest';
      case 'subterranean_cave': return 'Subterranean Cavern';
      default: return mapId;
    }
  }
}
