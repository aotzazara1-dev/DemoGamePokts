import { Element } from '../types.js';

export interface SkillDefinition {
  id: string;
  name: string;
  element: Element;
  spCost: number;
  multiplier: number;
  description: string;
}

export const ELEMENTAL_SKILLS: Record<string, SkillDefinition> = {
  rock_throw: {
    id: 'rock_throw',
    name: 'Rock Throw',
    element: Element.Earth,
    spCost: 10,
    multiplier: 1.4,
    description: 'Hurls massive bedrock boulders crushing frontline enemies.'
  },
  aqua_jet: {
    id: 'aqua_jet',
    name: 'Aqua Jet',
    element: Element.Water,
    spCost: 10,
    multiplier: 1.4,
    description: 'High-pressure water torrent piercing enemy defenses.'
  },
  flame_strike: {
    id: 'flame_strike',
    name: 'Flame Strike',
    element: Element.Fire,
    spCost: 12,
    multiplier: 1.5,
    description: 'Scorching fiery slash igniting targets.'
  },
  gale_slash: {
    id: 'gale_slash',
    name: 'Gale Slash',
    element: Element.Wind,
    spCost: 8,
    multiplier: 1.3,
    description: 'Razor wind blades cutting through opposing formation.'
  }
};
