import { Room, Client } from '@colyseus/core';
import { BattleRoomState, CombatantNetworkState } from '../schema/BattleState.js';
import {
  BattleEngine,
  type BattleState,
  type Combatant,
  type TeamFormation,
  type CombatAction,
  type TeamActionsMap
} from '@poktsonline/shared';

export interface BattleRoomOptions {
  playerCombatants?: Combatant[];
  wildEnemies?: Combatant[];
}

export class BattleRoom extends Room<BattleRoomState> {
  public authoritativeBattleState!: BattleState;
  public rng: () => number = Math.random;
  private pendingActions: Map<string, CombatAction> = new Map();
  private timerInterval?: any;

  onCreate(options: BattleRoomOptions = {}) {
    this.setState(new BattleRoomState());

    const playerCombatants = options.playerCombatants || [];
    const wildEnemies = options.wildEnemies || [];

    // Initialize 2x5 formation for allies and enemies
    const alliesFormation: TeamFormation = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null]
    };

    const enemiesFormation: TeamFormation = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null]
    };

    // Position player combatants
    playerCombatants.forEach((combatant, idx) => {
      // Put hero or first unit in front slot 2, beast in back slot 2 or front slot 1
      if (idx === 0) {
        alliesFormation.front[2] = combatant;
        this.addCombatantToState(combatant, 'allies', 'front', 2);
      } else if (idx === 1) {
        alliesFormation.back[2] = combatant;
        this.addCombatantToState(combatant, 'allies', 'back', 2);
      } else {
        const slot = idx < 5 ? idx : idx % 5;
        const row = idx < 5 ? 'front' : 'back';
        alliesFormation[row][slot] = combatant;
        this.addCombatantToState(combatant, 'allies', row, slot);
      }
    });

    // Position wild enemies
    wildEnemies.forEach((enemy, idx) => {
      const slot = idx === 0 ? 2 : idx < 5 ? idx : idx % 5;
      const row = idx < 5 ? 'front' : 'back';
      enemiesFormation[row][slot] = enemy;
      this.addCombatantToState(enemy, 'enemies', row, slot);
    });

    this.authoritativeBattleState = {
      round: 1,
      outcome: 'ongoing',
      allies: alliesFormation,
      enemies: enemiesFormation,
      capturedBeastIds: []
    };

    // Action submission handler
    this.onMessage('selectAction', (client: Client, message: { combatantId: string; action: CombatAction }) => {
      if (this.state.phase !== 'action') return;

      const combatant = this.state.combatants.get(message.combatantId);
      if (!combatant || combatant.team !== 'allies' || !combatant.isAlive) {
        return;
      }

      this.pendingActions.set(message.combatantId, message.action);

      // Check if all living ally combatants have submitted an action
      if (this.haveAllLivingAlliesSubmitted()) {
        this.resolveTurn();
      }
    });

    // Colyseus clock interval for 30s countdown
    if (this.clock) {
      this.timerInterval = this.clock.setInterval(() => {
        this.tickActionTimer(1);
      }, 1000);
    }
  }

  private addCombatantToState(combatant: Combatant, team: string, row: string, slot: number) {
    const netState = new CombatantNetworkState({
      id: combatant.id,
      name: combatant.name,
      isHero: combatant.isHero,
      level: combatant.level,
      element: combatant.element,
      hp: combatant.hp,
      maxHp: combatant.maxHp,
      sp: combatant.sp,
      maxSp: combatant.maxSp,
      team,
      row,
      slot,
      isAlive: combatant.hp > 0
    });
    this.state.combatants.set(combatant.id, netState);
  }

  private haveAllLivingAlliesSubmitted(): boolean {
    let livingAlliesCount = 0;
    for (const [id, c] of this.state.combatants.entries()) {
      if (c.team === 'allies' && c.isAlive) {
        livingAlliesCount++;
        if (!this.pendingActions.has(id)) {
          return false;
        }
      }
    }
    return livingAlliesCount > 0;
  }

  public tickActionTimer(seconds: number = 1) {
    if (this.state.phase !== 'action') return;

    this.state.actionTimer = Math.max(0, this.state.actionTimer - seconds);
    if (this.state.actionTimer <= 0) {
      // Auto-assign default defend actions for unsubmitted living allies
      for (const [id, c] of this.state.combatants.entries()) {
        if (c.team === 'allies' && c.isAlive && !this.pendingActions.has(id)) {
          this.pendingActions.set(id, { type: 'defend' });
        }
      }
      this.resolveTurn();
    }
  }

  public resolveTurn() {
    this.state.phase = 'resolution';

    // Construct actions map
    const actionsMap: TeamActionsMap = {};

    // 1. Allies actions
    for (const [id, action] of this.pendingActions.entries()) {
      actionsMap[id] = action;
    }

    // 2. Default AI actions for living enemies
    for (const [id, c] of this.state.combatants.entries()) {
      if (c.team === 'enemies' && c.isAlive && !actionsMap[id]) {
        // Target frontline living ally, or backline if front is empty
        let targetId: string | undefined;
        for (let col = 0; col < 5; col++) {
          const frontUnit = this.authoritativeBattleState.allies.front[col];
          if (frontUnit && frontUnit.hp > 0) {
            targetId = frontUnit.id;
            break;
          }
        }
        if (!targetId) {
          for (let col = 0; col < 5; col++) {
            const backUnit = this.authoritativeBattleState.allies.back[col];
            if (backUnit && backUnit.hp > 0) {
              targetId = backUnit.id;
              break;
            }
          }
        }
        if (targetId) {
          actionsMap[id] = { type: 'attack', targetId };
        }
      }
    }

    // Deterministically execute turn resolution via BattleEngine
    const result = BattleEngine.resolveTurn(this.authoritativeBattleState, actionsMap, this.rng);

    this.authoritativeBattleState = result.nextState;

    // Synchronize combatants state
    this.syncCombatantsState();

    // Broadcast turn resolution events to clients
    this.broadcast('turnResolution', {
      events: result.events,
      outcome: result.nextState.outcome
    });

    if (result.nextState.outcome !== 'ongoing') {
      this.state.phase = result.nextState.outcome;
      this.broadcast('battleEnd', {
        outcome: result.nextState.outcome,
        capturedBeastIds: result.nextState.capturedBeastIds
      });
      if (this.timerInterval) {
        this.timerInterval.clear();
      }
    } else {
      // Advance to next round
      this.state.round = result.nextState.round;
      this.state.phase = 'action';
      this.state.actionTimer = 30;
      this.pendingActions.clear();
    }
  }

  private syncCombatantsState() {
    ['allies', 'enemies'].forEach(teamKey => {
      const team = this.authoritativeBattleState[teamKey as 'allies' | 'enemies'];
      ['front', 'back'].forEach(rowKey => {
        const row = team[rowKey as 'front' | 'back'];
        row.forEach(combatant => {
          if (combatant) {
            const netState = this.state.combatants.get(combatant.id);
            if (netState) {
              netState.hp = combatant.hp;
              netState.sp = combatant.sp;
              netState.isAlive = combatant.hp > 0;
            }
          }
        });
      });
    });
  }

  public getCapturedBeasts(): string[] {
    return this.authoritativeBattleState.capturedBeastIds;
  }

  onJoin(_client: Client) {
    // Client connected to battle instance
  }

  onLeave(_client: Client) {
    // Client left battle
  }

  onDispose() {
    if (this.timerInterval) {
      this.timerInterval.clear();
    }
  }
}
