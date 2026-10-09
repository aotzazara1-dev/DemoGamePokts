import { Schema, MapSchema, type } from '@colyseus/schema';

export class CombatantNetworkState extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('boolean') isHero: boolean = false;
  @type('number') level: number = 1;
  @type('string') element: string = 'Earth';
  @type('number') hp: number = 100;
  @type('number') maxHp: number = 100;
  @type('number') sp: number = 50;
  @type('number') maxSp: number = 50;
  @type('string') team: string = 'allies';
  @type('string') row: string = 'front';
  @type('number') slot: number = 0;
  @type('boolean') isAlive: boolean = true;

  constructor(init?: Partial<CombatantNetworkState>) {
    super();
    if (init) {
      Object.assign(this, init);
    }
  }
}

export class BattleRoomState extends Schema {
  @type('string') phase: string = 'action';
  @type('number') round: number = 1;
  @type('number') actionTimer: number = 30;
  @type({ map: CombatantNetworkState }) combatants = new MapSchema<CombatantNetworkState>();
}
