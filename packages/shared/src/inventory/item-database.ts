import { ItemDefinition } from "../types.js";

export const ITEM_DATABASE: Record<string, ItemDefinition> = {
  item_small_herb: {
    id: "item_small_herb",
    name: "Ambrosia Dew (น้ำทิพย์อัมฤทธิ์)",
    type: "hp_restore",
    effectValue: 50,
    description:
      "A soothing vial of celestial ambrosia that restores 50 HP to a single ally.",
    price: 10,
    sellPrice: 5,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_ginseng: {
    id: "item_ginseng",
    name: "Soma Elixir (น้ำโสมะศักดิ์สิทธิ์)",
    type: "sp_restore",
    effectValue: 40,
    description:
      "A prized celestial elixir of the gods that restores 40 SP to a single ally.",
    price: 25,
    sellPrice: 12,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_steamed_bun: {
    id: "item_steamed_bun",
    name: "Golden Apple of Eden (แอปเปิ้ลทองคำแห่งอีเดน)",
    type: "hp_restore",
    effectValue: 80,
    description:
      "A sacred golden fruit plucked from the Garden of Eden that restores 80 HP to a single ally.",
    price: 20,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_herbal_tea: {
    id: "item_herbal_tea",
    name: "Nectar of the Gods (น้ำอมฤตแห่งทวยเทพ)",
    type: "sp_restore",
    effectValue: 50,
    description:
      "Refreshing divine nectar brewed in Valhalla that restores 50 SP to a single ally.",
    price: 30,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_vitality_pill: {
    id: "item_vitality_pill",
    name: "Valkyrie Balm (ยารักษาแห่งวาลคิรี)",
    type: "hp_restore",
    effectValue: 200,
    description:
      "A potent miraculous salve infused with Valkyrie healing essence restoring 200 HP to a single ally.",
    price: 80,
    stackMax: 99,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_phoenix_feather: {
    id: "item_phoenix_feather",
    name: "Völundr Feather (ขนนกฟื้นวิญญาณโวลุนเดอร์)",
    type: "revive",
    effectValue: 100,
    description:
      "A glowing Valkyrie soul feather that revives a fallen ally with 100 HP.",
    price: 150,
    stackMax: 20,
    usableInCombat: true,
    usableOnOverworld: true,
  },
  item_town_scroll: {
    id: "item_town_scroll",
    name: "Bifrost Scroll (ม้วนคัมภีร์ไบฟรอสต์)",
    type: "scroll",
    effectValue: 0,
    description:
      "An enchanted celestial parchment that channels the Bifrost to teleport the hero back to Valhalla Coliseum.",
    price: 50,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: true,
  },
  item_beast_fang: {
    id: "item_beast_fang",
    name: "Dragon Tooth (เขี้ยวมังกรสวรรค์)",
    type: "loot",
    effectValue: 0,
    description:
      "A sharp sacred dragon tooth dropped by mythical beasts. Sells for a good price to celestial merchants.",
    price: 30,
    sellPrice: 20,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false,
  },
  item_boar_leather: {
    id: "item_boar_leather",
    name: "Nemean Hide (หนังราชสีห์นีเมียน)",
    type: "loot",
    effectValue: 0,
    description:
      "Impervious, golden pelt from mythological beasts prized by celestial crafters.",
    price: 40,
    sellPrice: 30,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false,
  },
  item_serpent_scale: {
    id: "item_serpent_scale",
    name: "Jörmungandr Scale (เกล็ดพญางูยอร์มุนกันด์)",
    type: "loot",
    effectValue: 0,
    description:
      "Shimmering abyssal scale collected from the deep mythical serpent of Helheim.",
    price: 50,
    sellPrice: 40,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false,
  },
  item_bamboo_shoot: {
    id: "item_bamboo_shoot",
    name: "Yggdrasil Branch (กิ่งไม้โลกอิกดราซิล)",
    type: "loot",
    effectValue: 0,
    description:
      "A sacred radiant branch gathered from the World Tree in the Asgard Sanctuary.",
    price: 25,
    sellPrice: 15,
    stackMax: 99,
    usableInCombat: false,
    usableOnOverworld: false,
  },

  // --- WEAPONS ---
  weapon_sky_piercer: {
    id: "weapon_sky_piercer",
    name: "Lu Bu's Sky Piercer (ทวนกรีดนภาของลิโป้)",
    type: "equipment",
    slot: "weapon",
    effectValue: 0,
    description:
      "The supreme halberd of Lu Bu capable of cleaving celestial skies. Grants +26 ATK and +6 AGI.",
    price: 300,
    sellPrice: 150,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { atk: 26, agi: 6 },
    requiredLevel: 4,
  },
  weapon_mjolnir_replica: {
    id: "weapon_mjolnir_replica",
    name: "Mjolnir's Echo (ค้อนอัสนีบาตมยอลเนียร์)",
    type: "equipment",
    slot: "weapon",
    effectValue: 0,
    description:
      "A consecrated replica of Thor's divine hammer crackling with thunder. Grants +30 ATK and +20 Max SP.",
    price: 350,
    sellPrice: 175,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { atk: 30, maxSp: 20 },
    requiredLevel: 4,
  },
  weapon_monohoshizao: {
    id: "weapon_monohoshizao",
    name: "Monohoshizao (ดาบยาวไร้พ่ายโคจิโร่)",
    type: "equipment",
    slot: "weapon",
    effectValue: 0,
    description:
      "The elongated nodachi of Sasaki Kojiro crafted to swallow swallows in flight. Grants +22 ATK and +14 AGI.",
    price: 280,
    sellPrice: 140,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { atk: 22, agi: 14 },
    requiredLevel: 4,
  },
  weapon_bronze_gladius: {
    id: "weapon_bronze_gladius",
    name: "Bronze Gladius (ดาบสัมฤทธิ์นักสู้)",
    type: "equipment",
    slot: "weapon",
    effectValue: 0,
    description:
      "Standard issue Valhalla arena blade for novice gladiators. Grants +12 ATK.",
    price: 80,
    sellPrice: 40,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { atk: 12 },
    requiredLevel: 1,
  },

  // --- HEAD ---
  head_valkyrie_winged_helm: {
    id: "head_valkyrie_winged_helm",
    name: "Valkyrie Winged Helm (หมวกปีกวาลคิรี)",
    type: "equipment",
    slot: "head",
    effectValue: 0,
    description:
      "Sacred silver helm adorned with divine wings. Grants +14 DEF, +40 Max HP, and +4 AGI.",
    price: 250,
    sellPrice: 125,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { def: 14, maxHp: 40, agi: 4 },
    requiredLevel: 3,
  },
  head_iron_circlet: {
    id: "head_iron_circlet",
    name: "Iron Circlet (รัดเกล้าเหล็กกล้า)",
    type: "equipment",
    slot: "head",
    effectValue: 0,
    description:
      "A sturdy iron circlet protecting the brow. Grants +8 DEF and +15 Max SP.",
    price: 70,
    sellPrice: 35,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { def: 8, maxSp: 15 },
    requiredLevel: 1,
  },

  // --- ARMOR ---
  armor_valhalla_plate: {
    id: "armor_valhalla_plate",
    name: "Valhalla Divine Breastplate (เกราะเกล็ดศักดิ์สิทธิ์วัลฮัลลา)",
    type: "equipment",
    slot: "armor",
    effectValue: 0,
    description:
      "Heavy plate forged from Asgardian metals. Grants +24 DEF and +80 Max HP.",
    price: 320,
    sellPrice: 160,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { def: 24, maxHp: 80 },
    requiredLevel: 4,
  },
  armor_einherjar_tunic: {
    id: "armor_einherjar_tunic",
    name: "Einherjar Battle Tunic (เสื้อเกราะผ้าผู้ถูกเลือก)",
    type: "equipment",
    slot: "armor",
    effectValue: 0,
    description:
      "Lightweight tunic reinforced with leather straps. Grants +12 DEF and +30 Max HP.",
    price: 75,
    sellPrice: 35,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { def: 12, maxHp: 30 },
    requiredLevel: 1,
  },

  // --- BOOTS ---
  boots_hermes_sandals: {
    id: "boots_hermes_sandals",
    name: "Winged Sandals of Hermes (รองเท้าปีกแห่งเฮอร์มีส)",
    type: "equipment",
    slot: "boots",
    effectValue: 0,
    description:
      "Enchanted sandals granting celestial swiftness. Grants +16 AGI and +6 DEF.",
    price: 240,
    sellPrice: 120,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { agi: 16, def: 6 },
    requiredLevel: 3,
  },
  boots_leather_boots: {
    id: "boots_leather_boots",
    name: "Leather Greaves (รองเท้าหนังนักรบ)",
    type: "equipment",
    slot: "boots",
    effectValue: 0,
    description:
      "Comfortable leather travel boots for swift footwork. Grants +6 AGI and +4 DEF.",
    price: 60,
    sellPrice: 30,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { agi: 6, def: 4 },
    requiredLevel: 1,
  },

  // --- ACCESSORY ---
  acc_draupnir_ring: {
    id: "acc_draupnir_ring",
    name: "Draupnir Ring of Odin (แหวนเดราพ์เนียร์)",
    type: "equipment",
    slot: "accessory",
    effectValue: 0,
    description:
      "Golden arm ring forged by the dwarves. Grants +8 ATK, +8 DEF, +8 INT, and +8 AGI.",
    price: 400,
    sellPrice: 200,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { atk: 8, def: 8, int: 8, agi: 8 },
    requiredLevel: 4,
  },
  acc_eden_amulet: {
    id: "acc_eden_amulet",
    name: "Amulet of Eden (จี้แห่งอีเดน)",
    type: "equipment",
    slot: "accessory",
    effectValue: 0,
    description:
      "A radiant stone resonating with primordial vitality. Grants +60 Max HP and +30 Max SP.",
    price: 180,
    sellPrice: 90,
    stackMax: 1,
    usableInCombat: false,
    usableOnOverworld: false,
    stats: { maxHp: 60, maxSp: 30 },
    requiredLevel: 2,
  },
};

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return ITEM_DATABASE[itemId];
}

export function getItemIcon(itemId: string): string {
  const item = ITEM_DATABASE[itemId];
  if (item?.type === "equipment") {
    switch (item.slot) {
      case "weapon":
        return "⚔️";
      case "head":
        return "🪖";
      case "armor":
        return "🛡️";
      case "boots":
        return "👢";
      case "accessory":
        return "💍";
    }
  }

  switch (itemId) {
    case "item_small_herb":
      return "🏺";
    case "item_ginseng":
      return "🧪";
    case "item_steamed_bun":
      return "🍎";
    case "item_herbal_tea":
      return "🍵";
    case "item_vitality_pill":
      return "💊";
    case "item_phoenix_feather":
      return "🪶";
    case "item_town_scroll":
      return "📜";
    case "item_beast_fang":
      return "🦷";
    case "item_boar_leather":
      return "🦁";
    case "item_serpent_scale":
      return "🐉";
    case "item_bamboo_shoot":
      return "🌿";
    default:
      return "📦";
  }
}
