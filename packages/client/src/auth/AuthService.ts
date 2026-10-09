import { type AccountSummary, type AuthSessionResponse } from '@poktsonline/shared';

export class AuthService {
  private static instance: AuthService;
  private serverUrl: string;
  private token: string | null = null;
  private currentAccount: AccountSummary | null = null;

  private constructor(serverUrl: string = 'http://localhost:2567') {
    this.serverUrl = serverUrl;
    this.token = localStorage.getItem('pokts_session_token');
    const storedAcc = localStorage.getItem('pokts_account');
    if (storedAcc) {
      try {
        this.currentAccount = JSON.parse(storedAcc);
      } catch {
        this.currentAccount = null;
      }
    }
  }

  public static getInstance(serverUrl?: string): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(serverUrl);
    }
    return AuthService.instance;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getAccount(): AccountSummary | null {
    return this.currentAccount;
  }

  public isGuest(): boolean {
    return this.currentAccount?.isGuest ?? true;
  }

  public async loginAsGuest(): Promise<AuthSessionResponse> {
    let guestToken = localStorage.getItem('pokts_guest_token');

    const res = await fetch(`${this.serverUrl}/api/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestToken: guestToken || undefined })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Guest login failed' }));
      throw new Error(err.error || 'Guest login failed');
    }

    const data = (await res.json()) as AuthSessionResponse & { guestToken?: string };
    if (data.guestToken) {
      localStorage.setItem('pokts_guest_token', data.guestToken);
    }
    this.saveSession(data.token, data.account);
    return data;
  }

  public async register(username: string, password: string): Promise<AuthSessionResponse> {
    const res = await fetch(`${this.serverUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }

    const data = (await res.json()) as AuthSessionResponse;
    this.saveSession(data.token, data.account);
    return data;
  }

  public async login(username: string, password: string): Promise<AuthSessionResponse> {
    const res = await fetch(`${this.serverUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }

    const data = (await res.json()) as AuthSessionResponse;
    this.saveSession(data.token, data.account);
    return data;
  }

  public async linkAccount(username: string, password: string): Promise<AuthSessionResponse> {
    if (!this.token) {
      throw new Error('Not logged in as guest');
    }

    const res = await fetch(`${this.serverUrl}/api/auth/link-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Link account failed' }));
      throw new Error(err.error || 'Link account failed');
    }

    const data = (await res.json()) as AuthSessionResponse;
    this.saveSession(data.token, data.account);
    // Remove guest token once registered permanently
    localStorage.removeItem('pokts_guest_token');
    return data;
  }

  public async verifyStoredSession(): Promise<AccountSummary | null> {
    if (!this.token) return null;

    try {
      const res = await fetch(`${this.serverUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        this.currentAccount = data.account;
        localStorage.setItem('pokts_account', JSON.stringify(data.account));
        return data.account;
      } else {
        this.logout();
        return null;
      }
    } catch {
      // Offline fallback: keep cached account if present
      return this.currentAccount;
    }
  }

  public logout(): void {
    this.token = null;
    this.currentAccount = null;
    localStorage.removeItem('pokts_session_token');
    localStorage.removeItem('pokts_account');
  }

  private saveSession(token: string, account: AccountSummary): void {
    this.token = token;
    this.currentAccount = account;
    localStorage.setItem('pokts_session_token', token);
    localStorage.setItem('pokts_account', JSON.stringify(account));
  }
}
