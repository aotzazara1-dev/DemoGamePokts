# 04: Procedural Champion Sprites, Divine Realm Textures, and Renderer

**What to build:**
Upgrade `OverworldRenderer` in `@poktsonline/client` with divine mythological textures: celestial golden-trimmed marble for Valhalla Coliseum (`tile_coliseum` / `tile_safe`), luminous sacred grass for Asgard Sanctuary (`tile_sanctuary`), and dark violet abyssal basalt for Helheim Abyss (`tile_abyss`). Add procedural 32x32 sprites for iconic Ragnarok champions (Thor with Mjolnir, Lu Bu with Sky Piercer, Sasaki Kojiro with Nodachi, Adam with Golden Aura, Zeus, Shiva, Buddha) and NPC avatars (Brunhilde with Valkyrie wings, Heimdall with golden Gjallarhorn horn).

**Blocked by:** Ticket 03

**Status:** resolved

- [x] Synthesize procedural tile textures for `tile_coliseum`, `tile_sanctuary`, and `tile_abyss` in `OverworldRenderer.initTextures()`.
- [x] Synthesize procedural textures for `npc_brunhilde` and `npc_heimdall`.
- [x] Synthesize procedural champion textures for `beast_thor`, `beast_lu_bu`, `beast_kojiro`, `beast_adam`, `beast_zeus`, `beast_shiva`, and `beast_buddha`.
- [x] Ensure `renderTilemap` maps map themes (`coliseum`, `sanctuary`, `abyss`) to the appropriate procedural textures.
- [x] Ensure client unit tests for `OverworldRenderer` and `OverworldEntityManager` pass.
