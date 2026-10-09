import crypto from 'crypto';
import { DatabaseEngine } from './DatabaseEngine.js';

export interface AccountRecord {
  id: string;
  username: string | null;
  passwordHash: string | null;
  guestToken: string | null;
  isGuest: boolean;
  createdAt: number;
}

export class AccountRepository {
  constructor(private db: DatabaseEngine) {}

  public createGuestAccount(guestToken: string): AccountRecord {
    const existing = this.findAccountByGuestToken(guestToken);
    if (existing) {
      return existing;
    }

    const id = 'acc_' + crypto.randomUUID().slice(0, 8);
    const now = Date.now();

    this.db.run(
      'INSERT INTO accounts (id, username, password_hash, guest_token, created_at) VALUES (?, NULL, NULL, ?, ?)',
      [id, guestToken, now]
    );

    return {
      id,
      username: null,
      passwordHash: null,
      guestToken,
      isGuest: true,
      createdAt: now
    };
  }

  public findAccountByGuestToken(guestToken: string): AccountRecord | null {
    const row = this.db.queryOne<any>(
      'SELECT * FROM accounts WHERE guest_token = ?',
      [guestToken]
    );
    if (!row) return null;
    return this.mapRowToAccount(row);
  }

  public createRegisteredAccount(username: string, passwordHash: string): AccountRecord {
    const existing = this.findAccountByUsername(username);
    if (existing) {
      throw new Error(`Username '${username}' already exists`);
    }

    const id = 'acc_' + crypto.randomUUID().slice(0, 8);
    const now = Date.now();

    this.db.run(
      'INSERT INTO accounts (id, username, password_hash, guest_token, created_at) VALUES (?, ?, ?, NULL, ?)',
      [id, username, passwordHash, now]
    );

    return {
      id,
      username,
      passwordHash,
      guestToken: null,
      isGuest: false,
      createdAt: now
    };
  }

  public findAccountByUsername(username: string): AccountRecord | null {
    const row = this.db.queryOne<any>(
      'SELECT * FROM accounts WHERE LOWER(username) = LOWER(?)',
      [username]
    );
    if (!row) return null;
    return this.mapRowToAccount(row);
  }

  public findAccountById(id: string): AccountRecord | null {
    const row = this.db.queryOne<any>(
      'SELECT * FROM accounts WHERE id = ?',
      [id]
    );
    if (!row) return null;
    return this.mapRowToAccount(row);
  }

  public linkGuestAccount(accountId: string, username: string, passwordHash: string): boolean {
    const existing = this.findAccountByUsername(username);
    if (existing && existing.id !== accountId) {
      throw new Error(`Username '${username}' already exists`);
    }

    this.db.run(
      'UPDATE accounts SET username = ?, password_hash = ? WHERE id = ?',
      [username, passwordHash, accountId]
    );
    return true;
  }

  public createSession(accountId: string, expiresInMs: number = 7 * 24 * 3600 * 1000): string {
    const token = 'sess_' + crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + expiresInMs;

    this.db.run(
      'INSERT INTO sessions (token, account_id, expires_at) VALUES (?, ?, ?)',
      [token, accountId, expiresAt]
    );

    return token;
  }

  public validateSession(token: string): AccountRecord | null {
    const now = Date.now();
    const row = this.db.queryOne<any>(
      `SELECT a.* FROM accounts a
       JOIN sessions s ON a.id = s.account_id
       WHERE s.token = ? AND s.expires_at > ?`,
      [token, now]
    );
    if (!row) return null;
    return this.mapRowToAccount(row);
  }

  public deleteSession(token: string): void {
    this.db.run('DELETE FROM sessions WHERE token = ?', [token]);
  }

  private mapRowToAccount(row: any): AccountRecord {
    return {
      id: row.id,
      username: row.username ?? null,
      passwordHash: row.password_hash ?? null,
      guestToken: row.guest_token ?? null,
      isGuest: row.username === null || row.username === undefined,
      createdAt: row.created_at
    };
  }
}
