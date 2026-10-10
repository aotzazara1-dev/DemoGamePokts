import { MapConfig, Element } from "../types.js";

export const MAP_DATABASE: Record<string, MapConfig> = {
  valhalla_coliseum: {
    id: "valhalla_coliseum",
    name: "Valhalla Coliseum (ลานประลองวัลฮัลลา)",
    theme: "coliseum",
    width: 50,
    height: 50,
    obstacles: [
      { x: 8, y: 10 },
      { x: 12, y: 8 },
      { x: 15, y: 15 },
      { x: 15, y: 16 },
      { x: 16, y: 15 },
    ],
    zones: [
      {
        id: "valhalla_safe_ring",
        name: "Valhalla Inner Sanctum (เขตพักผ่อนวัลฮัลลา)",
        type: "safe",
        bounds: { minX: 0, maxX: 15, minY: 0, maxY: 20 },
        encounterRatePerStep: 0,
        encounterPool: [],
      },
      {
        id: "valhalla_proving_grounds",
        name: "Valhalla Proving Grounds (ลานประลองเทพและมนุษย์)",
        type: "wild",
        bounds: { minX: 16, maxX: 49, minY: 0, maxY: 49 },
        encounterRatePerStep: 0.15,
        encounterPool: [
          {
            beastTemplateId: "valkyrie_scout",
            name: "Valkyrie Scout (วาลคิรีสอดแนม)",
            element: Element.Wind,
            baseLevel: 3,
            levelVariance: 1,
            weight: 1,
            baseHp: 38,
            baseSp: 18,
            baseAtk: 14,
            baseDef: 9,
            baseAgi: 15,
          },
          {
            beastTemplateId: "fenrir_pup",
            name: "Fenrir Pup (ลูกสุนัขเฟนรีร์)",
            element: Element.Earth,
            baseLevel: 4,
            levelVariance: 1,
            weight: 1,
            baseHp: 52,
            baseSp: 12,
            baseAtk: 17,
            baseDef: 14,
            baseAgi: 9,
          },
        ],
      },
    ],
    portals: [
      {
        id: "portal_valhalla_to_helheim",
        position: { x: 35, y: 2 },
        targetMapId: "helheim_abyss",
        targetPosition: { x: 2, y: 15 },
        name: "Bifrost Gate to Helheim Abyss (ประตูมิติสู่ขุมนรกเฮลไฮม์)",
      },
      {
        id: "portal_valhalla_to_asgard",
        position: { x: 48, y: 25 },
        targetMapId: "asgard_sanctuary",
        targetPosition: { x: 2, y: 25 },
        name: "Bifrost Gate to Asgard Sanctuary (ประตูมิติสู่ป่าศักดิ์สิทธิ์แอสการ์ด)",
      },
    ],
    npcs: [
      {
        id: "npc_heimdall",
        name: "Heimdall (ผู้ประกาศสงครามไฮม์ดัล)",
        title: "Apocalypse Announcer & Keeper of Gjallarhorn",
        avatarIcon: "📯",
        spriteKey: "npc_heimdall",
        position: { x: 8, y: 10 },
        greeting:
          "ข้าคือไฮม์ดัล! ผู้เป่าแตรกยัลลาร์ฮอร์นและผู้ประกาศศึกมหาศึกคนชนเทพ! เหล่านักรบเอ๋ย เจ้าพร้อมสำหรับเสบียงและศาสตราวุธศักดิ์สิทธิ์หรือยัง?!",
        options: [
          {
            id: "opt_shop",
            label: "🛒 ซื้อขายโอสถและอาวุธศักดิ์สิทธิ์ (Open Divine Shop)",
            action: "shop",
          },
          { id: "opt_close", label: "✕ ลาก่อน (Goodbye)", action: "close" },
        ],
        shopItemIds: [
          "item_small_herb",
          "item_ginseng",
          "item_steamed_bun",
          "item_herbal_tea",
          "item_vitality_pill",
          "item_phoenix_feather",
          "item_town_scroll",
        ],
      },
      {
        id: "npc_brunhilde",
        name: "Brunhilde (บรุนฮิลด์ พี่สาวคนโตแห่ง 13 วาลคิรี)",
        title: "Chief Valkyrie Strategist",
        avatarIcon: "🗡️",
        spriteKey: "npc_brunhilde",
        position: { x: 12, y: 8 },
        greeting:
          "ยินดีต้อนรับสู่ศึกแร็กนาร็อค ผู้ถูกอัญเชิญจากต่างโลก... มนุษย์และทวยเทพกำลังจะเข้าปะทะกัน หากเจ้าเหนื่อยล้า จงให้ข้าฟื้นฟูพลังวิญญาณแห่งโวลุนเดอร์ให้!",
        options: [
          {
            id: "opt_heal",
            label:
              "💖 พลังฟื้นฟูแห่งโวลุนเดอร์ (Völundr Resonance Full Heal - ฟรี)",
            action: "heal",
            response:
              "บรุนฮิลด์ได้ร่ายมนต์ศักดิ์สิทธิ์แห่งวาลคิรี ฟื้นฟูพลังชีวิตและจิตวิญญาณของทุกคนในปาร์ตี้จนเต็มเปี่ยม!",
          },
          {
            id: "opt_advice",
            label: "📜 คำแนะนำกลยุทธ์แร็กนาร็อค (Ragnarok Tactical Advice)",
            action: "advice",
            response:
              "ทางทิศตะวันออกมีสนามประลองที่มีวาลคิรีฝึกหัดและสุนัขป่าเฟนรีร์ หากขึ้นทิศเหนือผ่านเกทไบฟรอสต์จะไปสู่ขุมนรกเฮลไฮม์ และทิศตะวันออกไกลคือป่าศักดิ์สิทธิ์แอสการ์ด!",
          },
          { id: "opt_close", label: "✕ ลาก่อน (Goodbye)", action: "close" },
        ],
      },
      {
        id: "npc_goll",
        name: "Göll (เกิลล์ น้องสาวคนสุดท้องแห่ง 13 วาลคิรี)",
        title: "Innkeeper & Beast Daycare Overseer",
        avatarIcon: "📦",
        spriteKey: "npc_goll",
        position: { x: 10, y: 7 },
        greeting:
          "สวัสดีท่านผู้กล้า! ข้าคือเกิลล์ วาลคิรีลำดับที่ 13... สัมภาระหนักเกินไปหรืออยากพักฟื้นขุนพลม้าศึกใช่ไหม? โรงเตี๊ยมและคลังสมบัติของข้าพร้อมให้บริการฟรีเสมอ!",
        options: [
          {
            id: "opt_warehouse",
            label: "📦 คลังเก็บไอเทมและเหรียญทอง (Open Personal Warehouse)",
            action: "warehouse",
          },
          {
            id: "opt_inn_beasts",
            label: "🐎 โรงเตี๊ยมรับฝากขุนพล (Open Inn Beast Storage & Daycare)",
            action: "inn_beasts",
          },
          { id: "opt_close", label: "✕ ลาก่อน (Goodbye)", action: "close" },
        ],
      },
    ],
  },

  helheim_abyss: {
    id: "helheim_abyss",
    name: "Helheim Abyss (หุบเหวนรกเฮลไฮม์)",
    theme: "abyss",
    width: 30,
    height: 30,
    obstacles: [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 20, y: 15 },
      { x: 20, y: 16 },
    ],
    zones: [
      {
        id: "helheim_depths",
        name: "Helheim Nether Depths (ก้นบึ้งขุมนรกเฮลไฮม์)",
        type: "wild",
        bounds: { minX: 0, maxX: 29, minY: 0, maxY: 29 },
        encounterRatePerStep: 0.16,
        encounterPool: [
          {
            beastTemplateId: "cerberus_hound",
            name: "Cerberus Nether Hound (หมาสามหัวแห่งเฮเดส)",
            element: Element.Earth,
            baseLevel: 6,
            levelVariance: 1,
            weight: 1,
            baseHp: 68,
            baseSp: 16,
            baseAtk: 20,
            baseDef: 21,
            baseAgi: 11,
          },
          {
            beastTemplateId: "chaos_serpent",
            name: "Níðhöggr Chaos Serpent (พญางูแห่งความวินาศนิดฮอกก์)",
            element: Element.Water,
            baseLevel: 7,
            levelVariance: 1,
            weight: 1,
            baseHp: 58,
            baseSp: 28,
            baseAtk: 23,
            baseDef: 13,
            baseAgi: 18,
          },
        ],
      },
    ],
    portals: [
      {
        id: "portal_helheim_to_valhalla",
        position: { x: 1, y: 15 },
        targetMapId: "valhalla_coliseum",
        targetPosition: { x: 35, y: 3 },
        name: "Return to Valhalla Coliseum (กลับสู่ลานประลองวัลฮัลลา)",
      },
    ],
  },

  asgard_sanctuary: {
    id: "asgard_sanctuary",
    name: "Asgard Sanctuary (ป่าศักดิ์สิทธิ์แอสการ์ด)",
    theme: "sanctuary",
    width: 40,
    height: 40,
    obstacles: [
      { x: 12, y: 12 },
      { x: 13, y: 12 },
      { x: 25, y: 20 },
      { x: 26, y: 20 },
    ],
    zones: [
      {
        id: "yggdrasil_grove",
        name: "Yggdrasil Celestial Grove (ดงพฤกษาอิกดราซิล)",
        type: "wild",
        bounds: { minX: 0, maxX: 39, minY: 0, maxY: 39 },
        encounterRatePerStep: 0.18,
        encounterPool: [
          {
            beastTemplateId: "pegasus_steed",
            name: "Celestial Pegasus (ม้าศึกเพกาซัส)",
            element: Element.Wind,
            baseLevel: 8,
            levelVariance: 1,
            weight: 1,
            baseHp: 92,
            baseSp: 22,
            baseAtk: 27,
            baseDef: 18,
            baseAgi: 14,
          },
          {
            beastTemplateId: "thunder_raven",
            name: "Huginn Thunder Raven (เรเวนสายฟ้าแห่งโอดิน)",
            element: Element.Fire,
            baseLevel: 9,
            levelVariance: 1,
            weight: 1,
            baseHp: 68,
            baseSp: 35,
            baseAtk: 29,
            baseDef: 14,
            baseAgi: 23,
          },
        ],
      },
    ],
    portals: [
      {
        id: "portal_asgard_to_valhalla",
        position: { x: 1, y: 25 },
        targetMapId: "valhalla_coliseum",
        targetPosition: { x: 47, y: 25 },
        name: "Return to Valhalla Coliseum (กลับสู่ลานประลองวัลฮัลลา)",
      },
    ],
  },
};

// Backward-compatibility aliases for legacy map IDs
MAP_DATABASE["novice_town_and_meadow"] = MAP_DATABASE["valhalla_coliseum"];
MAP_DATABASE["pebble_cave"] = MAP_DATABASE["helheim_abyss"];
MAP_DATABASE["bamboo_forest"] = MAP_DATABASE["asgard_sanctuary"];

export const DEFAULT_OVERWORLD_MAP: MapConfig =
  MAP_DATABASE["valhalla_coliseum"];

export function getMapConfig(mapId: string): MapConfig {
  if (mapId === "novice_town_and_meadow")
    return MAP_DATABASE["valhalla_coliseum"];
  if (mapId === "pebble_cave") return MAP_DATABASE["helheim_abyss"];
  if (mapId === "bamboo_forest") return MAP_DATABASE["asgard_sanctuary"];
  return MAP_DATABASE[mapId] || DEFAULT_OVERWORLD_MAP;
}
