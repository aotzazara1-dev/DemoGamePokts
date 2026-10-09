import {
  type Combatant,
  type PlayerRosterState,
  type FormationSlot,
  type TeamFormation,
  Element
} from '../types.js';

export class RosterManager {
  public static readonly MAX_BEAST_CAPACITY = 10;

  /**
   * Initializes default player roster containing Hero and starting Active Beast (Aqua Fin).
   */
  public static createInitialRoster(
    heroName: string = 'Hero',
    heroElement: Element = Element.Water
  ): PlayerRosterState {
    const hero: Combatant = {
      id: 'hero_1',
      name: heroName,
      isHero: true,
      level: 5,
      element: heroElement,
      hp: 120,
      maxHp: 120,
      sp: 50,
      maxSp: 50,
      atk: 28,
      def: 18,
      int: 12,
      agi: 22
    };

    const initialBeast: Combatant = {
      id: 'beast_aqua_fin',
      name: 'Aqua Fin',
      isHero: false,
      level: 4,
      element: Element.Water,
      hp: 75,
      maxHp: 75,
      sp: 25,
      maxSp: 25,
      atk: 20,
      def: 15,
      int: 10,
      agi: 18
    };

    return {
      hero,
      activeBeastId: initialBeast.id,
      beasts: [initialBeast],
      formation: {
        heroSlot: { row: 'front', col: 2 },
        beastSlot: { row: 'back', col: 2 }
      }
    };
  }

  /**
   * Sets the Active Beast deployed in battle from the player's roster.
   */
  public static setActiveBeast(
    roster: PlayerRosterState,
    beastId: string
  ): PlayerRosterState {
    const beast = roster.beasts.find(b => b.id === beastId);
    if (!beast) {
      return roster;
    }

    return {
      ...roster,
      activeBeastId: beastId
    };
  }

  /**
   * Sets the Formation Grid position for either Hero or Active Beast.
   * If target slot is occupied by the other allied unit, swaps positions.
   */
  public static setFormationSlot(
    roster: PlayerRosterState,
    unitType: 'hero' | 'beast',
    targetSlot: FormationSlot
  ): PlayerRosterState {
    // Clamp column between 0 and 4
    const clampedCol = Math.max(0, Math.min(4, targetSlot.col));
    const newSlot: FormationSlot = { row: targetSlot.row, col: clampedCol };

    const heroSlot = { ...roster.formation.heroSlot };
    const beastSlot = { ...roster.formation.beastSlot };

    if (unitType === 'hero') {
      // Check collision with beast
      if (beastSlot.row === newSlot.row && beastSlot.col === newSlot.col) {
        // Swap
        return {
          ...roster,
          formation: {
            heroSlot: newSlot,
            beastSlot: heroSlot
          }
        };
      }
      return {
        ...roster,
        formation: {
          ...roster.formation,
          heroSlot: newSlot
        }
      };
    } else {
      // Check collision with hero
      if (heroSlot.row === newSlot.row && heroSlot.col === newSlot.col) {
        // Swap
        return {
          ...roster,
          formation: {
            heroSlot: beastSlot,
            beastSlot: newSlot
          }
        };
      }
      return {
        ...roster,
        formation: {
          ...roster.formation,
          beastSlot: newSlot
        }
      };
    }
  }

  /**
   * Adds a newly captured wild beast to the player's roster.
   * Caps at maxCapacity (default 10).
   */
  public static addCapturedBeast(
    roster: PlayerRosterState,
    wildBeast: Combatant,
    maxCapacity: number = RosterManager.MAX_BEAST_CAPACITY
  ): { success: boolean; roster: PlayerRosterState; reason?: string; addedBeast?: Combatant } {
    if (roster.beasts.length >= maxCapacity) {
      return {
        success: false,
        roster,
        reason: `Roster is full! Maximum capacity is ${maxCapacity} Beasts.`
      };
    }

    // Clone and generate unique ID with restored health/spirit
    const newBeast: Combatant = {
      ...wildBeast,
      id: `beast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      isHero: false,
      hp: wildBeast.maxHp,
      sp: wildBeast.maxSp
    };

    const nextRoster: PlayerRosterState = {
      ...roster,
      beasts: [...roster.beasts, newBeast]
    };

    return {
      success: true,
      roster: nextRoster,
      addedBeast: newBeast
    };
  }

  /**
   * Builds the 2x5 TeamFormation data structure based on the current roster and formation settings.
   */
  public static buildTeamFormation(roster: PlayerRosterState): TeamFormation {
    const front: (Combatant | null)[] = [null, null, null, null, null];
    const back: (Combatant | null)[] = [null, null, null, null, null];

    // Place Hero
    if (roster.formation.heroSlot.row === 'front') {
      front[roster.formation.heroSlot.col] = roster.hero;
    } else {
      back[roster.formation.heroSlot.col] = roster.hero;
    }

    // Place Active Beast
    const activeBeast = roster.beasts.find(b => b.id === roster.activeBeastId);
    if (activeBeast) {
      if (roster.formation.beastSlot.row === 'front') {
        front[roster.formation.beastSlot.col] = activeBeast;
      } else {
        back[roster.formation.beastSlot.col] = activeBeast;
      }
    }

    return { front, back };
  }
}
