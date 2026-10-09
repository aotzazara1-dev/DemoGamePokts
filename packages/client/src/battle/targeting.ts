import { type BattleState, type CombatActionType, type ItemType } from '@poktsonline/shared';

/**
 * Evaluates valid targetable unit IDs according to TS Online 2x5 Formation Grid rules:
 * - Front row units intercept direct melee attacks.
 * - Back row units are protected until their column's front row unit is defeated or empty.
 */
export function getValidTargets(
  actionType: CombatActionType,
  actorTeam: 'allies' | 'enemies',
  battleState: BattleState,
  itemType?: ItemType
): string[] {
  const opposingTeamKey = actorTeam === 'allies' ? 'enemies' : 'allies';
  const opposingTeam = battleState[opposingTeamKey];
  const validIds: string[] = [];

  if (actionType === 'attack' || actionType === 'capture') {
    for (let c = 0; c < 5; c++) {
      const frontUnit = opposingTeam.front[c];
      const backUnit = opposingTeam.back[c];

      if (frontUnit && frontUnit.hp > 0) {
        if (actionType === 'capture') {
          if (!frontUnit.isHero) validIds.push(frontUnit.id);
        } else {
          validIds.push(frontUnit.id);
        }
      } else if (backUnit && backUnit.hp > 0) {
        // Front unit is cleared/dead, back unit is exposed
        if (actionType === 'capture') {
          if (!backUnit.isHero) validIds.push(backUnit.id);
        } else {
          validIds.push(backUnit.id);
        }
      }
    }
  } else if (actionType === 'skill') {
    // Skills can target any living opposing combatant by default (elemental ranged)
    for (let c = 0; c < 5; c++) {
      const frontUnit = opposingTeam.front[c];
      const backUnit = opposingTeam.back[c];
      if (frontUnit && frontUnit.hp > 0) validIds.push(frontUnit.id);
      if (backUnit && backUnit.hp > 0) validIds.push(backUnit.id);
    }
  }

  if (actionType === 'item') {
    const friendlyTeam = battleState[actorTeam];
    for (let c = 0; c < 5; c++) {
      const frontUnit = friendlyTeam.front[c];
      const backUnit = friendlyTeam.back[c];
      if (frontUnit) {
        if (itemType === 'revive' ? frontUnit.hp <= 0 : frontUnit.hp > 0) {
          validIds.push(frontUnit.id);
        }
      }
      if (backUnit) {
        if (itemType === 'revive' ? backUnit.hp <= 0 : backUnit.hp > 0) {
          validIds.push(backUnit.id);
        }
      }
    }
    return validIds;
  }

  return validIds;
}
