import { Schema, MapSchema, type } from '@colyseus/schema';

export class PlayerNetworkState extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('string') mapId: string = 'novice_town_and_meadow';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') direction: string = 'down';
  @type('boolean') inBattle: boolean = false;

  constructor(
    id: string = '',
    name: string = '',
    x: number = 0,
    y: number = 0,
    direction: string = 'down',
    mapId: string = 'novice_town_and_meadow'
  ) {
    super();
    this.id = id;
    this.name = name;
    this.mapId = mapId;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.inBattle = false;
  }
}

export class RoamingBeastNetworkState extends Schema {
  @type('string') id: string = '';
  @type('string') templateId: string = '';
  @type('string') name: string = '';
  @type('string') element: string = 'earth';
  @type('number') level: number = 1;
  @type('string') mapId: string = 'novice_town_and_meadow';
  @type('string') zoneId: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') direction: string = 'down';
  @type('boolean') inCombat: boolean = false;
  @type('number') respawnAt: number = 0;
  @type('number') baseAtk: number = 10;
  @type('number') baseDef: number = 10;
  @type('number') baseAgi: number = 10;
  @type('number') baseHp: number = 30;
  @type('number') baseSp: number = 10;

  constructor(init?: Partial<RoamingBeastNetworkState>) {
    super();
    if (init) {
      Object.assign(this, init);
    }
  }
}

export class OverworldState extends Schema {
  @type({ map: PlayerNetworkState }) players = new MapSchema<PlayerNetworkState>();
  @type({ map: RoamingBeastNetworkState }) roamingBeasts = new MapSchema<RoamingBeastNetworkState>();
}
