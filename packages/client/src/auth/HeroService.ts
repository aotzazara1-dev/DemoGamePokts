import { type HeroSummary, Element } from '@poktsonline/shared';
import { AuthService } from './AuthService.js';

export class HeroService {
  private static instance: HeroService;
  private serverUrl: string;

  private constructor(serverUrl: string = 'http://localhost:2567') {
    this.serverUrl = serverUrl;
  }

  public static getInstance(serverUrl?: string): HeroService {
    if (!HeroService.instance) {
      HeroService.instance = new HeroService(serverUrl);
    }
    return HeroService.instance;
  }

  public async getHeroes(): Promise<HeroSummary[]> {
    const token = AuthService.getInstance().getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${this.serverUrl}/api/heroes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to fetch heroes' }));
      throw new Error(err.error || 'Failed to fetch heroes');
    }

    const data = await res.json();
    return data.heroes || [];
  }

  public async createHero(name: string, element: Element): Promise<HeroSummary> {
    const token = AuthService.getInstance().getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${this.serverUrl}/api/heroes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, element })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create hero' }));
      throw new Error(err.error || 'Failed to create hero');
    }

    const data = await res.json();
    return data.hero;
  }

  public async deleteHero(heroId: string, confirmName: string): Promise<boolean> {
    const token = AuthService.getInstance().getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${this.serverUrl}/api/heroes/${heroId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ confirmName })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete hero' }));
      throw new Error(err.error || 'Failed to delete hero');
    }

    const data = await res.json();
    return data.success === true;
  }
}
