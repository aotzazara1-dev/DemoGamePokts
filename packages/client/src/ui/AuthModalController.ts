import { AuthService } from '../auth/AuthService.js';
import { type AccountSummary } from '@poktsonline/shared';

export interface AuthModalCallbacks {
  onAuthenticated?: (account: AccountSummary, token: string) => void;
  onClose?: () => void;
}

export class AuthModalController {
  private authService: AuthService;
  private callbacks: AuthModalCallbacks;
  private isModalOpen: boolean = false;
  private currentTab: 'login' | 'register' | 'link' = 'login';

  constructor(authService: AuthService, callbacks: AuthModalCallbacks = {}) {
    this.authService = authService;
    this.callbacks = callbacks;
    this.setupDOM();
    this.updateHeaderBar();
  }

  public isOpen(): boolean {
    return this.isModalOpen;
  }

  public open(mode: 'login' | 'register' | 'link' = 'login'): void {
    this.currentTab = mode;
    this.isModalOpen = true;
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('open');
    this.render();
  }

  public close(): void {
    this.isModalOpen = false;
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('open');
    }
    this.callbacks.onClose?.();
  }

  public updateHeaderBar(): void {
    const headerBtn = document.getElementById('header-btn-auth');
    if (!headerBtn) return;

    const account = this.authService.getAccount();
    if (!account) {
      headerBtn.innerHTML = '🔑 <kbd>Login</kbd>';
      headerBtn.title = 'Login or Register an Account';
      headerBtn.onclick = () => this.open('login');
    } else if (account.isGuest) {
      headerBtn.innerHTML = '🔗 <span style="color: #f59e0b;">Guest (Link ID)</span>';
      headerBtn.title = 'Link guest account to permanent username & password';
      headerBtn.onclick = () => this.open('link');
    } else {
      headerBtn.innerHTML = `👤 <span style="color: #38bdf8;">${account.username}</span>`;
      headerBtn.title = `Logged in as ${account.username} (Click to switch account)`;
      headerBtn.onclick = () => {
        if (confirm(`Logged in as ${account.username}.\nDo you want to log out?`)) {
          this.authService.logout();
          this.updateHeaderBar();
          window.location.reload();
        }
      };
    }
  }

  private setupDOM(): void {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    // Close button (only available if already authenticated or linking)
    const closeBtn = document.getElementById('btn-close-auth-modal');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // Tab buttons
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');

    tabLogin?.addEventListener('click', () => {
      this.currentTab = 'login';
      this.render();
    });

    tabRegister?.addEventListener('click', () => {
      this.currentTab = 'register';
      this.render();
    });

    // Guest button
    const btnGuest = document.getElementById('btn-auth-guest');
    btnGuest?.addEventListener('click', async () => {
      await this.handleGuestLogin();
    });

    // Form submit
    const form = document.getElementById('auth-form') as HTMLFormElement;
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit();
    });
  }

  private render(): void {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    const titleEl = document.getElementById('auth-modal-title');
    const descEl = document.getElementById('auth-modal-desc');
    const tabsContainer = document.getElementById('auth-tabs');
    const guestContainer = document.getElementById('auth-guest-section');
    const submitBtn = document.getElementById('btn-auth-submit');
    const tabLogin = document.getElementById('auth-tab-login');
    const tabRegister = document.getElementById('auth-tab-register');
    const closeBtn = document.getElementById('btn-close-auth-modal');
    const errorEl = document.getElementById('auth-error-msg');

    if (errorEl) {
      errorEl.innerText = '';
      errorEl.style.display = 'none';
    }

    // Can close if user already has an account or is linking
    const canClose = this.authService.getAccount() !== null;
    if (closeBtn) {
      closeBtn.style.display = canClose ? 'block' : 'none';
    }

    if (this.currentTab === 'link') {
      if (titleEl) titleEl.innerText = '🔗 LINK GUEST ACCOUNT';
      if (descEl) descEl.innerText = 'Set a Username and Password to save your characters permanently across devices';
      if (tabsContainer) tabsContainer.style.display = 'none';
      if (guestContainer) guestContainer.style.display = 'none';
      if (submitBtn) submitBtn.innerText = 'Confirm Permanent Link';
    } else if (this.currentTab === 'login') {
      if (titleEl) titleEl.innerText = '🔑 WELCOME BACK TO POKTSONLINE';
      if (descEl) descEl.innerText = 'Sign in to access your heroes, beasts, and progression';
      if (tabsContainer) tabsContainer.style.display = 'flex';
      if (guestContainer) guestContainer.style.display = 'block';
      if (submitBtn) submitBtn.innerText = 'Enter Game (Sign In)';
      tabLogin?.classList.add('active');
      tabRegister?.classList.remove('active');
    } else {
      if (titleEl) titleEl.innerText = '📝 CREATE NEW ACCOUNT';
      if (descEl) descEl.innerText = 'Register your unique identity to begin your martial journey';
      if (tabsContainer) tabsContainer.style.display = 'flex';
      if (guestContainer) guestContainer.style.display = 'block';
      if (submitBtn) submitBtn.innerText = 'Register & Start';
      tabRegister?.classList.add('active');
      tabLogin?.classList.remove('active');
    }
  }

  private async handleGuestLogin(): Promise<void> {
    const errorEl = document.getElementById('auth-error-msg');
    const btnGuest = document.getElementById('btn-auth-guest') as HTMLButtonElement;

    try {
      if (btnGuest) btnGuest.disabled = true;
      if (errorEl) errorEl.style.display = 'none';

      const res = await this.authService.loginAsGuest();
      this.updateHeaderBar();
      this.close();
      this.callbacks.onAuthenticated?.(res.account, res.token);
    } catch (err: any) {
      if (errorEl) {
        errorEl.innerText = `❌ ${err.message || 'Guest login failed'}`;
        errorEl.style.display = 'block';
      }
    } finally {
      if (btnGuest) btnGuest.disabled = false;
    }
  }

  private async handleFormSubmit(): Promise<void> {
    const usernameInput = document.getElementById('auth-input-username') as HTMLInputElement;
    const passwordInput = document.getElementById('auth-input-password') as HTMLInputElement;
    const errorEl = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('btn-auth-submit') as HTMLButtonElement;

    const username = usernameInput?.value?.trim() || '';
    const password = passwordInput?.value || '';

    if (username.length < 3) {
      this.showError('Username must be at least 3 characters long');
      return;
    }
    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long');
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      if (errorEl) errorEl.style.display = 'none';

      let res;
      if (this.currentTab === 'login') {
        res = await this.authService.login(username, password);
      } else if (this.currentTab === 'register') {
        res = await this.authService.register(username, password);
      } else {
        res = await this.authService.linkAccount(username, password);
      }

      this.updateHeaderBar();
      this.close();
      this.callbacks.onAuthenticated?.(res.account, res.token);
    } catch (err: any) {
      this.showError(err.message || 'Operation failed');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  private showError(msg: string): void {
    const errorEl = document.getElementById('auth-error-msg');
    if (errorEl) {
      errorEl.innerText = `❌ ${msg}`;
      errorEl.style.display = 'block';
    }
  }
}
