import type { Combatant, BattleState, BattleEvent } from "../types.js";

/** Center-out column priority for deploying combatants into formation */
export const FORMATION_CENTER_OUT_COLUMNS = [2, 1, 3, 0, 4] as const;

export interface ExecuteSwapParams {
  nextState: BattleState;
  actor: Combatant;
  swapBeastId: string;
  reserveBeasts?: Combatant[];
  events: BattleEvent[];
  actedUnitIds: Set<string>;
}

/**
 * Deep module encapsulating authoritative In-Combat Beast Swapping (ADR 0011).
 * Isolates validation, grid substitution, and reserve sync from BattleEngine.
 */
export class BattleSwapExecutor {
  public static executeSwap(params: ExecuteSwapParams): boolean {
    const {
      nextState,
      actor,
      swapBeastId,
      reserveBeasts = [],
      events,
      actedUnitIds,
    } = params;

    // 1. Only player allies can command a swap
    const isAlly =
      nextState.allies.front.some((u) => u?.id === actor.id) ||
      nextState.allies.back.some((u) => u?.id === actor.id);
    if (!isAlly) {
      events.push({
        type: "swap",
        actorId: actor.id,
        message: `${actor.name} cannot command a swap because they are not an allied combatant!`,
      });
      return false;
    }

    // 2. Candidate lookup in reserves
    const candidateIdx = reserveBeasts.findIndex((b) => b.id === swapBeastId);
    if (candidateIdx === -1) {
      events.push({
        type: "swap",
        actorId: actor.id,
        message: `Swap failed: Reserve Beast ${swapBeastId} was not found in reserve!`,
      });
      return false;
    }

    const candidate = reserveBeasts[candidateIdx];

    // 3. Candidate consciousness validation
    if (candidate.hp <= 0) {
      events.push({
        type: "swap",
        actorId: actor.id,
        targetId: candidate.id,
        message: `Cannot summon fallen Reserve Beast ${candidate.name}!`,
      });
      return false;
    }

    // 4. Verify candidate is not already deployed on the grid
    let isAlreadyDeployed = false;
    for (const row of [nextState.allies.front, nextState.allies.back]) {
      for (const slot of row) {
        if (slot && slot.id === candidate.id) {
          isAlreadyDeployed = true;
          break;
        }
      }
    }
    if (isAlreadyDeployed) {
      events.push({
        type: "swap",
        actorId: actor.id,
        targetId: candidate.id,
        message: `${candidate.name} is already deployed on the battlefield!`,
      });
      return false;
    }

    // 5. Find target slot on allies formation (where beast was or should be)
    let targetRow: "front" | "back" = "back";
    let targetCol = 2;
    let oldBeast: Combatant | null = null;
    let foundSlot = false;

    if (!actor.isHero) {
      // Beast itself is initiating retreat and summoning reserve
      for (const r of ["back", "front"] as const) {
        for (let c = 0; c < 5; c++) {
          const u = nextState.allies[r][c];
          if (u && u.id === actor.id) {
            targetRow = r;
            targetCol = c;
            oldBeast = u;
            foundSlot = true;
            break;
          }
        }
        if (foundSlot) break;
      }
    } else {
      // Hero commands swapping the deployed allied beast
      for (const r of ["back", "front"] as const) {
        for (let c = 0; c < 5; c++) {
          const u = nextState.allies[r][c];
          if (u && !u.isHero) {
            targetRow = r;
            targetCol = c;
            oldBeast = u;
            foundSlot = true;
            break;
          }
        }
        if (foundSlot) break;
      }
    }

    // Fallback: If no existing beast found, find first open slot in back row
    if (!foundSlot) {
      for (const c of FORMATION_CENTER_OUT_COLUMNS) {
        if (!nextState.allies.back[c]) {
          targetRow = "back";
          targetCol = c;
          break;
        }
      }
    }

    // 6. Withdraw old beast and deploy new candidate
    const newBeast: Combatant = JSON.parse(JSON.stringify(candidate));
    newBeast.action = undefined;
    newBeast.isDefending = false;

    // Swap positions
    nextState.allies[targetRow][targetCol] = newBeast;

    // Update reserves list in-place
    reserveBeasts.splice(candidateIdx, 1);
    if (oldBeast) {
      oldBeast.action = undefined;
      actedUnitIds.add(oldBeast.id);
      reserveBeasts.push(oldBeast);
    }
    nextState.alliesReserve = reserveBeasts;

    // Incoming beast cannot act in the deployment turn
    actedUnitIds.add(newBeast.id);

    // 7. Emit swap event
    const message = actor.isHero
      ? oldBeast
        ? `${actor.name} withdrew ${oldBeast.name} and summoned ${newBeast.name} into battle!`
        : `${actor.name} summoned ${newBeast.name} into battle!`
      : `${actor.name} retreated and summoned ${newBeast.name} into battle!`;

    events.push({
      type: "swap",
      actorId: actor.id,
      targetId: newBeast.id,
      message,
    });

    return true;
  }
}
