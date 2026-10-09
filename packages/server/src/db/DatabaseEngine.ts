import fs from 'fs';
import path from 'path';
import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

export class DatabaseEngine {
  private SQL: SqlJsStatic | null = null;
  private db: Database | null = null;
  private filePath: string | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || null;
  }

  public async init(): Promise<void> {
    this.SQL = await initSqlJs();

    if (this.filePath && fs.existsSync(this.filePath)) {
      const fileBuffer = fs.readFileSync(this.filePath);
      this.db = new this.SQL.Database(fileBuffer);
    } else {
      this.db = new this.SQL.Database();
      if (this.filePath) {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        this.persist();
      }
    }

    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON;');

    // Run migrations
    this.runMigrations();
  }

  public persist(): void {
    if (!this.db || !this.filePath) return;
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.filePath, buffer);
  }

  public close(): void {
    if (this.db) {
      if (this.filePath) {
        this.persist();
      }
      this.db.close();
      this.db = null;
    }
  }

  public getTables(): string[] {
    const rows = this.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );
    return rows.map(r => r.name);
  }

  public run(sql: string, params: any[] = []): void {
    if (!this.db) throw new Error('Database not initialized');
    this.db.run(sql, params);
    if (this.filePath) {
      this.persist();
    }
  }

  public query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results: T[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as unknown as T);
    }
    stmt.free();
    return results;
  }

  public queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const results = this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  private runMigrations(): void {
    if (!this.db) return;

    this.db.run(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT,
        guest_token TEXT UNIQUE,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS heroes (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        name TEXT NOT NULL,
        element TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        exp INTEGER NOT NULL DEFAULT 0,
        stat_points INTEGER NOT NULL DEFAULT 0,
        allocated_stats TEXT NOT NULL,
        map_id TEXT NOT NULL,
        x INTEGER NOT NULL,
        y INTEGER NOT NULL,
        direction TEXT NOT NULL,
        gold INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS hero_inventories (
        hero_id TEXT NOT NULL,
        slot_index INTEGER NOT NULL,
        item_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        PRIMARY KEY (hero_id, slot_index),
        FOREIGN KEY(hero_id) REFERENCES heroes(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS hero_rosters (
        hero_id TEXT NOT NULL,
        beast_id TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 0,
        formation_index INTEGER NOT NULL DEFAULT 0,
        level INTEGER NOT NULL DEFAULT 1,
        exp INTEGER NOT NULL DEFAULT 0,
        hp INTEGER NOT NULL,
        sp INTEGER NOT NULL,
        attributes TEXT NOT NULL,
        PRIMARY KEY (hero_id, beast_id),
        FOREIGN KEY(hero_id) REFERENCES heroes(id) ON DELETE CASCADE
      );
    `);

    if (this.filePath) {
      this.persist();
    }
  }
}
