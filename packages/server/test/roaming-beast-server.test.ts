import { describe, it, expect, beforeEach } from "vitest";
import { OverworldRoom } from "../src/rooms/OverworldRoom.js";
import { Element, type MapConfig } from "@poktsonline/shared";

describe("OverworldRoom Roaming Beasts", () => {
  let room: OverworldRoom;

  const testMapConfig: MapConfig = {
    id: "novice_town_and_meadow",
    name: "Test Novice Meadow",
    theme: "meadow",
    width: 30,
    height: 30,
    obstacles: [],
    zones: [
      {
        id: "town",
        name: "Town",
        type: "safe",
        bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
        encounterRatePerStep: 0,
        encounterPool: [],
      },
      {
        id: "whispering_meadow",
        name: "Whispering Meadow",
        type: "wild",
        bounds: { minX: 11, maxX: 29, minY: 0, maxY: 29 },
        encounterRatePerStep: 0, // Disable random encounters for this test to isolate roaming beasts
        encounterPool: [
          {
            beastTemplateId: "leaf_sprite",
            name: "Leaf Sprite",
            element: Element.Wind,
            baseLevel: 3,
            levelVariance: 0,
            weight: 1,
            baseHp: 35,
            baseSp: 15,
            baseAtk: 12,
            baseDef: 8,
            baseAgi: 14,
          },
        ],
      },
    ],
    portals: [],
  };

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

  beforeEach(() => {
    room = new OverworldRoom();
    room.onCreate({ mapConfig: testMapConfig });
  });

  it("populates initial roaming beasts into state", () => {
    expect(room.state.roamingBeasts.size).toBeGreaterThan(0);
    const firstBeast = Array.from(room.state.roamingBeasts.values())[0];
    expect(firstBeast.name).toBe("Leaf Sprite");
    expect(firstBeast.inCombat).toBe(false);
  });

  it("triggers encounter when roaming beast AI steps onto player", () => {
    const client = createMockClient("player_1");
    room.onJoin(client as any, { name: "Hero", spawnTile: { x: 15, y: 15 } });

    // Place a roaming beast at (15, 16) - 1 step away
    const beast = Array.from(room.state.roamingBeasts.values())[0];
    beast.x = 15;
    beast.y = 16;
    beast.inCombat = false;
    beast.respawnAt = 0;

    // Tick AI
    room.tickRoamingBeasts();

    // Verify encounter was sent to client
    const encounterMsg = client.messages.find((m) => m.type === "encounter");
    expect(encounterMsg).toBeDefined();
    expect(encounterMsg?.payload.encounter.wildEnemies[0].name).toBe(
      "Leaf Sprite"
    );

    // Verify player is inBattle and beast is inCombat
    const player = room.state.players.get("player_1")!;
    expect(player.inBattle).toBe(true);
    expect(beast.inCombat).toBe(true);
    expect(beast.respawnAt).toBeGreaterThan(Date.now());
  });

  it("triggers encounter when player moves onto an active roaming beast", () => {
    const client = createMockClient("player_2");
    room.onJoin(client as any, { name: "Hero", spawnTile: { x: 14, y: 15 } });

    // Place a roaming beast at (15, 15)
    const beast = Array.from(room.state.roamingBeasts.values())[0];
    beast.x = 15;
    beast.y = 15;
    beast.inCombat = false;
    beast.respawnAt = 0;

    // Player moves to (15, 15)
    (room as any).onMessageHandlers["move"](client, {
      targetX: 15,
      targetY: 15,
    });

    const encounterMsg = client.messages.find((m) => m.type === "encounter");
    expect(encounterMsg).toBeDefined();
    expect(encounterMsg?.payload.encounter.wildEnemies[0].name).toBe(
      "Leaf Sprite"
    );

    const player = room.state.players.get("player_2")!;
    expect(player.inBattle).toBe(true);
    expect(beast.inCombat).toBe(true);
  });

  it("respawns roaming beast after respawn cooldown expires", () => {
    const beast = Array.from(room.state.roamingBeasts.values())[0];
    beast.inCombat = true;
    beast.respawnAt = Date.now() - 1000; // Cooldown expired 1s ago

    room.tickRoamingBeasts();

    expect(beast.inCombat).toBe(false);
    expect(beast.respawnAt).toBe(0);
    expect(beast.x).toBeGreaterThanOrEqual(11); // Inside wild zone
  });

  it("allows moving and triggering new encounters after battleConcluded", () => {
    const client = createMockClient("player_3");
    room.onJoin(client as any, { name: "Hero", spawnTile: { x: 14, y: 15 } });

    // Beast 1 at (15, 15)
    const beasts = Array.from(room.state.roamingBeasts.values());
    const beast1 = beasts[0];
    beast1.x = 15;
    beast1.y = 15;
    beast1.inCombat = false;
    beast1.respawnAt = 0;

    // Player moves to (15, 15)
    (room as any).onMessageHandlers["move"](client, {
      targetX: 15,
      targetY: 15,
    });
    expect(client.messages.filter((m) => m.type === "encounter").length).toBe(
      1
    );

    const player = room.state.players.get("player_3")!;
    expect(player.inBattle).toBe(true);

    // Conclude battle
    (room as any).onMessageHandlers["battleConcluded"](client);
    expect(player.inBattle).toBe(false);

    // Beast 2 at (15, 16)
    const beast2 = beasts[1];
    beast2.x = 15;
    beast2.y = 16;
    beast2.inCombat = false;
    beast2.respawnAt = 0;

    // Player moves to (15, 16)
    (room as any).onMessageHandlers["move"](client, {
      targetX: 15,
      targetY: 16,
    });
    expect(client.messages.filter((m) => m.type === "encounter").length).toBe(
      2
    );
  });
});
