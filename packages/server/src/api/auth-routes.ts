import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { AccountRepository, AccountRecord } from '../db/AccountRepository.js';
import { PasswordUtils } from '../auth/PasswordUtils.js';
import { AccountSummary } from '@poktsonline/shared';

function toAccountSummary(account: AccountRecord): AccountSummary {
  return {
    id: account.id,
    username: account.username,
    isGuest: account.isGuest,
    createdAt: account.createdAt
  };
}

function validateCredentials(username?: unknown, password?: unknown): { error?: string; trimmedUsername: string; cleanPassword: string } {
  if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 20) {
    return { error: 'Username must be between 3 and 20 characters', trimmedUsername: '', cleanPassword: '' };
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters long', trimmedUsername: '', cleanPassword: '' };
  }
  return { trimmedUsername: username.trim(), cleanPassword: password };
}

export function createAuthRouter(accountRepo: AccountRepository): Router {
  const router = Router();

  // Helper to extract Bearer token
  const getBearerToken = (req: Request): string | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7).trim();
  };

  // POST /api/auth/guest
  router.post('/guest', (req: Request, res: Response): any => {
    try {
      let guestToken = req.body?.guestToken;
      if (!guestToken || typeof guestToken !== 'string' || guestToken.trim().length === 0) {
        guestToken = 'guest_' + crypto.randomUUID();
      }

      const account = accountRepo.createGuestAccount(guestToken);
      const sessionToken = accountRepo.createSession(account.id);

      return res.json({
        token: sessionToken,
        guestToken,
        account: toAccountSummary(account)
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create guest session' });
    }
  });

  // POST /api/auth/register
  router.post('/register', (req: Request, res: Response): any => {
    try {
      const { username, password } = req.body || {};
      const validation = validateCredentials(username, password);
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const existing = accountRepo.findAccountByUsername(validation.trimmedUsername);
      if (existing) {
        return res.status(409).json({ error: `Username '${validation.trimmedUsername}' already exists` });
      }

      const passwordHash = PasswordUtils.hashPassword(validation.cleanPassword);
      const account = accountRepo.createRegisteredAccount(validation.trimmedUsername, passwordHash);
      const sessionToken = accountRepo.createSession(account.id);

      return res.json({
        token: sessionToken,
        account: toAccountSummary(account)
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  // POST /api/auth/login
  router.post('/login', (req: Request, res: Response): any => {
    try {
      const { username, password } = req.body || {};

      if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const account = accountRepo.findAccountByUsername(username.trim());
      if (!account || !account.passwordHash) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const valid = PasswordUtils.verifyPassword(password, account.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const sessionToken = accountRepo.createSession(account.id);

      return res.json({
        token: sessionToken,
        account: toAccountSummary(account)
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // POST /api/auth/link-account
  router.post('/link-account', (req: Request, res: Response): any => {
    try {
      const token = getBearerToken(req) || req.body?.token;
      if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
      }

      const account = accountRepo.validateSession(token);
      if (!account) {
        return res.status(401).json({ error: 'Invalid or expired session' });
      }

      if (!account.isGuest) {
        return res.status(400).json({ error: 'Account is already registered' });
      }

      const { username, password } = req.body || {};
      const validation = validateCredentials(username, password);
      if (validation.error) {
        return res.status(400).json({ error: validation.error });
      }

      const existing = accountRepo.findAccountByUsername(validation.trimmedUsername);
      if (existing && existing.id !== account.id) {
        return res.status(409).json({ error: `Username '${validation.trimmedUsername}' already exists` });
      }

      const passwordHash = PasswordUtils.hashPassword(validation.cleanPassword);
      accountRepo.linkGuestAccount(account.id, validation.trimmedUsername, passwordHash);

      const updated = accountRepo.findAccountById(account.id)!;

      return res.json({
        token,
        account: toAccountSummary(updated)
      });
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        return res.status(409).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Failed to link account' });
    }
  });

  // GET /api/auth/me
  router.get('/me', (req: Request, res: Response): any => {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const account = accountRepo.validateSession(token);
    if (!account) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    return res.json({
      account: toAccountSummary(account)
    });
  });

  return router;
}
