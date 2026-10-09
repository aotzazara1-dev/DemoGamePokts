// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Element, type HeroSummary } from '@poktsonline/shared';
import { HeroService } from '../src/auth/HeroService.js';
import { AuthService } from '../src/auth/AuthService.js';
import { CharacterSelectModalController } from '../src/ui/CharacterSelectModalController.js';

describe('CharacterSelectModalController (Client Ticket 03)', () => {
  let heroService: HeroService;
  let authService: AuthService;

  const mockHeroes: HeroSummary[] = [
    {
      id: 'hero_1',
      accountId: 'acc_1',
      name: 'SwordSage',
      element: Element.Water,
      level: 5,
      mapId: 'novice_town_and_meadow',
      x: 10,
      y: 10,
      direction: 'down',
      createdAt: 1000
    }
  ];

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="character-select-modal">
        <button id="btn-char-select-link"></button>
        <div id="character-slots-grid"></div>

        <div id="create-hero-submodal" style="display: none;">
          <div id="create-hero-error" style="display: none;"></div>
          <form id="create-hero-form">
            <input id="create-hero-name" />
            <button class="element-choice-btn" data-element="Fire"></button>
            <button class="element-choice-btn selected" data-element="Water"></button>
            <button id="btn-cancel-create-hero" type="button"></button>
            <button id="btn-submit-create-hero" type="submit"></button>
          </form>
        </div>

        <div id="delete-hero-submodal" style="display: none;">
          <p id="delete-hero-prompt"></p>
          <div id="delete-hero-error" style="display: none;"></div>
          <form id="delete-hero-form">
            <input id="delete-hero-confirm-name" />
            <button id="btn-cancel-delete-hero" type="button"></button>
            <button id="btn-submit-delete-hero" type="submit"></button>
          </form>
        </div>
      </div>
    `;

    heroService = HeroService.getInstance();
    authService = AuthService.getInstance();

    heroService.getHeroes = vi.fn().mockResolvedValue([...mockHeroes]);
    heroService.createHero = vi.fn().mockImplementation(async (name, element) => ({
      id: 'hero_new',
      accountId: 'acc_1',
      name,
      element,
      level: 1,
      mapId: 'novice_town_and_meadow',
      x: 10,
      y: 10,
      direction: 'down',
      createdAt: Date.now()
    }));
    heroService.deleteHero = vi.fn().mockResolvedValue(true);
  });

  it('renders 1 active slot and 2 empty slots for account with 1 hero', async () => {
    const controller = new CharacterSelectModalController(heroService, authService);
    await controller.open();

    expect(controller.isOpen()).toBe(true);

    const activeSlots = document.querySelectorAll('.char-slot-card.active-slot');
    const emptySlots = document.querySelectorAll('.char-slot-card.empty-slot');

    expect(activeSlots.length).toBe(1);
    expect(emptySlots.length).toBe(2);

    const heroName = activeSlots[0].querySelector('.char-slot-name');
    expect(heroName?.textContent).toBe('SwordSage');
  });

  it('triggers onHeroSelected when clicking enter world button', async () => {
    const onHeroSelected = vi.fn();
    const controller = new CharacterSelectModalController(heroService, authService, { onHeroSelected });
    await controller.open();

    const enterBtn = document.querySelector('.btn-enter-world') as HTMLButtonElement;
    expect(enterBtn).not.toBeNull();
    enterBtn.click();

    expect(onHeroSelected).toHaveBeenCalledWith(mockHeroes[0]);
    expect(controller.isOpen()).toBe(false);
  });

  it('opens and closes create hero submodal', async () => {
    const controller = new CharacterSelectModalController(heroService, authService);
    await controller.open();

    const createBtn = document.querySelector('.btn-create-slot-hero') as HTMLButtonElement;
    createBtn.click();

    const submodal = document.getElementById('create-hero-submodal')!;
    expect(submodal.style.display).toBe('flex');

    const cancelBtn = document.getElementById('btn-cancel-create-hero')!;
    cancelBtn.click();
    expect(submodal.style.display).toBe('none');
  });

  it('validates name length on hero creation', async () => {
    const controller = new CharacterSelectModalController(heroService, authService);
    await controller.open();

    const createBtn = document.querySelector('.btn-create-slot-hero') as HTMLButtonElement;
    createBtn.click();

    const input = document.getElementById('create-hero-name') as HTMLInputElement;
    input.value = 'a'; // too short

    const form = document.getElementById('create-hero-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const err = document.getElementById('create-hero-error')!;
    expect(err.style.display).toBe('block');
    expect(err.textContent).toMatch(/between 3 and 16/i);
    expect(heroService.createHero).not.toHaveBeenCalled();
  });

  it('requires matching name confirmation to delete hero', async () => {
    const controller = new CharacterSelectModalController(heroService, authService);
    await controller.open();

    const deleteBtn = document.querySelector('.btn-delete-hero') as HTMLButtonElement;
    deleteBtn.click();

    const submodal = document.getElementById('delete-hero-submodal')!;
    expect(submodal.style.display).toBe('flex');

    const input = document.getElementById('delete-hero-confirm-name') as HTMLInputElement;
    input.value = 'WrongName';

    const form = document.getElementById('delete-hero-form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    const err = document.getElementById('delete-hero-error')!;
    expect(err.style.display).toBe('block');
    expect(err.textContent).toMatch(/does not match/i);
    expect(heroService.deleteHero).not.toHaveBeenCalled();

    // Now type correct name
    input.value = 'SwordSage';
    form.dispatchEvent(new Event('submit'));

    // Wait for resolution
    await Promise.resolve();
    expect(heroService.deleteHero).toHaveBeenCalledWith('hero_1', 'SwordSage');
  });
});
