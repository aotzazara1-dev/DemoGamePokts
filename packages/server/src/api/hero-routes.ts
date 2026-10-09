import { Router, Request, Response, NextFunction } from 'express';
import { Element } from '@poktsonline/shared';
import { AccountRepository, AccountRecord } from '../db/AccountRepository.js';
import { HeroRepository } from '../db/HeroRepository.js';

interface AuthenticatedRequest extends Request {
  account?: AccountRecord;
}

export function createHeroRouter(accountRepo: AccountRepository, heroRepo: HeroRepository): Router {
  const router = Router();

  // Authentication Middleware
  const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const token = authHeader.slice(7).trim();
    const account = accountRepo.validateSession(token);
    if (!account) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    req.account = account;
    next();
  };

  router.use(requireAuth);

  // GET /api/heroes
  router.get('/', (req: AuthenticatedRequest, res: Response): any => {
    try {
      const account = req.account!;
      const heroes = heroRepo.getHeroesByAccountId(account.id);
      return res.json({ heroes });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch heroes' });
    }
  });

  // POST /api/heroes
  router.post('/', (req: AuthenticatedRequest, res: Response): any => {
    try {
      const account = req.account!;
      const { name, element } = req.body || {};

      if (!name || typeof name !== 'string' || name.trim().length < 3 || name.trim().length > 16) {
        return res.status(400).json({ error: 'Hero name must be between 3 and 16 characters' });
      }

      if (!element || !Object.values(Element).includes(element as Element)) {
        return res.status(400).json({ error: 'Valid element (Earth, Water, Fire, Wind) is required' });
      }

      const count = heroRepo.getHeroCountByAccountId(account.id);
      if (count >= HeroRepository.MAX_HEROES_PER_ACCOUNT) {
        return res.status(400).json({ error: `Maximum ${HeroRepository.MAX_HEROES_PER_ACCOUNT} heroes allowed per account` });
      }

      const hero = heroRepo.createHero(account.id, {
        name: name.trim(),
        element: element as Element
      });

      return res.status(201).json({ hero });
    } catch (err: any) {
      if (err.message && err.message.includes('Maximum')) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message || 'Failed to create hero' });
    }
  });

  // DELETE /api/heroes/:id
  router.delete('/:id', (req: AuthenticatedRequest, res: Response): any => {
    try {
      const account = req.account!;
      const heroId = String(req.params.id);
      const { confirmName } = req.body || {};

      const fullState = heroRepo.getHeroFullState(heroId);
      if (!fullState || fullState.accountId !== account.id) {
        return res.status(404).json({ error: 'Hero not found or unauthorized' });
      }

      if (!confirmName || confirmName.trim() !== fullState.hero.name) {
        return res.status(400).json({
          error: `Confirmation name does not match hero name '${fullState.hero.name}'`
        });
      }

      const deleted = heroRepo.deleteHero(heroId, account.id);
      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete hero' });
      }

      return res.json({ success: true, deletedHeroId: heroId });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete hero' });
    }
  });

  return router;
}
