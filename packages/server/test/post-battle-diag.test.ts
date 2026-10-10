import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { OverworldRoom } from "../src/rooms/OverworldRoom.js";
import { DEFAULT_OVERWORLD_MAP } from "../src/rooms/OverworldRoom.js";
import { DatabaseEngine } from "../src/db/DatabaseEngine.js";
import { AccountRepository } from "../src/db/AccountRepository.js";
import { HeroRepository } from "../src/db/HeroRepository.js";
import { Element } from "@poktsonline/shared";

describe("Post-Battle Encounters with Persistence", () => {
  let room: OverworldRoom;
  let db: DatabaseEngine;
  let accountRepo: AccountRepository;
  let heroRepo: HeroRepository;
  let sessionToken: string;
  let heroId: string;

  const createMockClient = (sessionId: string) => {
    const messages: { type: string; payload: any }[] = [];
    return {
      sessionId,
      messages,
      send: (type: string, payload: any) => {
        messages.push({ type, payload });
      },
    };
  };

  beforeEach(async () => {
    try {
      db = new DatabaseEngine();
      await db.init();
      accountRepo = new AccountRepository(db);
      heroRepo = new HeroRepository(db);

      const acc = accountRepo.createGuestAccount("diag_guest_123");
      sessionToken = accountRepo.createSession(acc.id);
      const hero = heroRepo.createHero(acc.id, {
        name: "DiagHero",
        element: Element.Water,
      });
      heroId = hero.id;

      room = new OverworldRoom();
      room.onCreate({
        mapConfig: DEFAULT_OVERWORLD_MAP,
        accountRepo,
        heroRepo,
      });
    } catch (e: any) {
      console.error("[BEFORE_EACH_FAIL]:", String(e), e);
      throw new Error(`[BEFORE_EACH_FAIL]: ${String(e)}`);
    }
  });

  afterEach(() => {
    if (room) {
      room.clock?.stop();
      clearTimeout((room as any)["_autoDisposeTimeout"]);
      clearInterval((room as any)["_patchInterval"]);
    }
    db?.close();
  });

  it("completes combat, saves hero state, concludes battle, and moves to next encounter", () => {
    const client = createMockClient("client_auth");
    let player: any;
    let beast1: any;
    try {
      console.log("--- Step 1: onJoin ---");
      room.onJoin(client as any, {
        name: "DiagHero",
        spawnTile: { x: 10, y: 10 },
        sessionToken,
        heroId,
      });
      console.log("--- Step 2: verify player ---");
      player = room.state.players.get("client_auth")!;
      expect(player).toBeDefined();
      expect(player.inBattle).toBe(false);
      expect(player.x).toBe(10);
      expect(player.y).toBe(10);

      console.log("--- Step 3: find beast ---");
      const beasts = Array.from(room.state.roamingBeasts.values()).filter(
        (b) => b.mapId === player.mapId && !b.inCombat
      );
      beast1 = beasts[0];
      beast1.x = 11;
      beast1.y = 10;

      console.log("--- Step 4: move to beast ---");
      (room as any).onMessageHandlers["move"](client, {
        targetX: 11,
        targetY: 10,
        mapId: player.mapId,
      });

      console.log("--- Step 5: check encounter 1 ---");
      expect(client.messages.filter((m) => m.type === "encounter").length).toBe(
        1
      );
      expect(player.inBattle).toBe(true);

      console.log("--- Step 6: battleConcluded ---");
      (room as any).onMessageHandlers["battleConcluded"](client);
      expect(player.inBattle).toBe(false);
    } catch (e: any) {
      console.error("[CAUGHT ERROR IN TEST]:", e.message, e.stack);
      throw e;
    }

    try {
      console.log("--- Step 7: syncHeroState ---");
      const info = (room as any).clientHeroMap.get(client.sessionId);
      console.log("info fullState:", {
        level: info.fullState.hero.level,
        exp: info.fullState.hero.exp,
        statPoints: info.fullState.hero.statPoints,
        skillPoints: info.fullState.hero.skillPoints,
        mapId: info.fullState.mapId,
        x: info.fullState.x,
        y: info.fullState.y,
        direction: info.fullState.direction,
        gold: info.fullState.inventory.gold,
        heroId: info.heroId,
      });
      // OverworldScene resume calls syncHeroState
      (room as any).onMessageHandlers["syncHeroState"](client, {
        inventory: { slots: [], gold: 500 },
        roster: {
          hero: {
            id: heroId,
            name: "DiagHero",
            level: 1,
            hp: 100,
            maxHp: 100,
            sp: 40,
            maxSp: 40,
            atk: 25,
            def: 15,
            int: 10,
            agi: 20,
          },
          beasts: [],
          activeBeastId: undefined,
        },
      });
    } catch (e: any) {
      console.error("[STACK TRACE IN TEST]:", e.message, e.stack);
      throw e;
    }

    // OverworldScene resume calls sendBattleConcluded with position sync
    (room as any).onMessageHandlers["battleConcluded"](client, {
      x: 11,
      y: 10,
      mapId: player.mapId,
    });
    expect(player.inBattle).toBe(false);
    expect(beast1.inCombat).toBe(true);
    expect(beast1.x).toBe(-999);
    expect(beast1.y).toBe(-999);

    // Now player moves to (12, 10)
    (room as any).onMessageHandlers["move"](client, {
      targetX: 12,
      targetY: 10,
      mapId: player.mapId,
    });

    expect(player.x).toBe(12);
    expect(player.y).toBe(10);
  });

  it("reconciles and resynchronizes client-server position via battleConcluded payload", () => {
    const client = createMockClient("client_desync");
    room.onJoin(client as any, {
      name: "DesyncHero",
      spawnTile: { x: 10, y: 10 },
      sessionToken,
      heroId,
    });

    const player = room.state.players.get("client_desync")!;
    player.inBattle = true;

    // During combat transition, client arrived at (12, 10)
    // When battle concludes, client sends confirmed position
    (room as any).onMessageHandlers["battleConcluded"](client, {
      x: 12,
      y: 10,
      mapId: player.mapId,
    });

    expect(player.inBattle).toBe(false);
    expect(player.x).toBe(12);
    expect(player.y).toBe(10);

    // Subsequent 1-step move from reconciled position succeeds
    (room as any).onMessageHandlers["move"](client, {
      targetX: 13,
      targetY: 10,
      mapId: player.mapId,
    });
    expect(player.x).toBe(13);
    expect(player.y).toBe(10);
  });

  it("triggers encounter when player clicks on a roaming beast on the exact same tile", () => {
    const client = createMockClient("client_same_tile");
    room.onJoin(client as any, {
      name: "SameTileHero",
      spawnTile: { x: 10, y: 10 },
      sessionToken,
      heroId,
    });

    const player = room.state.players.get("client_same_tile")!;
    const beasts = Array.from(room.state.roamingBeasts.values()).filter(
      (b) => b.mapId === player.mapId && !b.inCombat
    );
    const beast = beasts[0];
    beast.x = 10;
    beast.y = 10;

    // Client sends move to same tile where beast is
    (room as any).onMessageHandlers["move"](client, {
      targetX: 10,
      targetY: 10,
      mapId: player.mapId,
    });

    expect(client.messages.filter((m) => m.type === "encounter").length).toBe(
      1
    );
    expect(player.inBattle).toBe(true);
    expect(beast.inCombat).toBe(true);
    expect(beast.x).toBe(-999);
  });
});
