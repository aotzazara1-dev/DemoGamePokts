// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../src/auth/AuthService.js';
import { AuthModalController } from '../src/ui/AuthModalController.js';

describe('AuthService & AuthModalController (Client Ticket 02)', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] ?? null,
      setItem: (key: string, val: string) => { localStorageMock[key] = val; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      length: 0,
      key: () => null
    } as any;

    // Reset document DOM
    document.body.innerHTML = `
      <button id="header-btn-auth"></button>
      <div id="auth-modal">
        <h2 id="auth-modal-title"></h2>
        <p id="auth-modal-desc"></p>
        <button id="btn-close-auth-modal"></button>
        <div id="auth-guest-section">
          <button id="btn-auth-guest"></button>
        </div>
        <div id="auth-tabs">
          <button id="auth-tab-login"></button>
          <button id="auth-tab-register"></button>
        </div>
        <div id="auth-error-msg"></div>
        <form id="auth-form">
          <input id="auth-input-username" />
          <input id="auth-input-password" />
          <button id="btn-auth-submit"></button>
        </form>
      </div>
    `;
  });

  describe('AuthService', () => {
    it('manages sessions and guest state', () => {
      const auth = AuthService.getInstance();
      auth.logout();

      expect(auth.getToken()).toBeNull();
      expect(auth.getAccount()).toBeNull();
      expect(auth.isGuest()).toBe(true);
    });

    it('stores session tokens upon successful guest login', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          token: 'mock_sess_token_123',
          guestToken: 'guest_dev_1',
          account: { id: 'acc_guest', isGuest: true, username: null, createdAt: Date.now() }
        })
      } as any);

      const auth = AuthService.getInstance();
      const res = await auth.loginAsGuest();

      expect(res.token).toBe('mock_sess_token_123');
      expect(auth.getToken()).toBe('mock_sess_token_123');
      expect(auth.getAccount()?.isGuest).toBe(true);
      expect(localStorage.getItem('pokts_session_token')).toBe('mock_sess_token_123');
    });

    it('logs out and clears stored tokens', () => {
      const auth = AuthService.getInstance();
      localStorage.setItem('pokts_session_token', 'token_to_clear');
      localStorage.setItem('pokts_account', JSON.stringify({ id: 'acc_1', isGuest: false, username: 'test' }));

      auth.logout();

      expect(auth.getToken()).toBeNull();
      expect(auth.getAccount()).toBeNull();
      expect(localStorage.getItem('pokts_session_token')).toBeNull();
    });
  });

  describe('AuthModalController', () => {
    it('opens and closes the modal and switches tabs', () => {
      const auth = AuthService.getInstance();
      auth.logout();

      const controller = new AuthModalController(auth);
      expect(controller.isOpen()).toBe(false);

      controller.open('login');
      expect(controller.isOpen()).toBe(true);
      const modal = document.getElementById('auth-modal');
      expect(modal?.classList.contains('open')).toBe(true);

      const title = document.getElementById('auth-modal-title');
      expect(title?.innerText).toContain('WELCOME BACK');

      controller.open('register');
      expect(title?.innerText).toContain('CREATE NEW ACCOUNT');

      controller.open('link');
      expect(title?.innerText).toContain('LINK GUEST ACCOUNT');

      controller.close();
      expect(controller.isOpen()).toBe(false);
      expect(modal?.classList.contains('open')).toBe(false);
    });

    it('updates header bar button according to authentication state', () => {
      const auth = AuthService.getInstance();
      const headerBtn = document.getElementById('header-btn-auth')!;

      // 1. Not logged in
      auth.logout();
      const controller = new AuthModalController(auth);
      expect(headerBtn.innerHTML).toContain('Login');

      // 2. Guest logged in
      (auth as any).currentAccount = { id: 'guest_1', isGuest: true, username: null, createdAt: 0 };
      controller.updateHeaderBar();
      expect(headerBtn.innerHTML).toContain('Guest (Link ID)');

      // 3. Registered user
      (auth as any).currentAccount = { id: 'reg_1', isGuest: false, username: 'SwordsmanLi', createdAt: 0 };
      controller.updateHeaderBar();
      expect(headerBtn.innerHTML).toContain('SwordsmanLi');
    });
  });
});
