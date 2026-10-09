import { Schema, MapSchema, type } from '@colyseus/schema';

export class PlayerNetworkState extends Schema {
  @type('string') id: string = '';
  @type('string') name: string = '';
  @type('number') x: number = 0;
  @type('number') y: number = 0;
  @type('string') direction: string = 'down';
  @type('boolean') inBattle: boolean = false;

  constructor(id: string = '', name: string = '', x: number = 0, y: number = 0, direction: string = 'down') {
    super();
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.inBattle = false;
  }
}

export class OverworldState extends Schema {
  @type({ map: PlayerNetworkState }) players = new MapSchema<PlayerNetworkState>();
}
