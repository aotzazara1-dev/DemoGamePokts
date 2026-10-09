# 02: Valhalla World Maps, Bifrost Portals, and Server Spawning

**What to build:**
Upgrade `MAP_DATABASE` in `@poktsonline/shared` with canonical Ragnarok maps: `valhalla_coliseum` (Safe arena & central hub), `asgard_sanctuary` (Celestial forest with Norse/Japanese wild spirits), and `helheim_abyss` (Underworld depths with chaotic nether entities). Implement bidirectional Bifrost Portals connecting these realms. Add backward-compatibility alias mapping for legacy map IDs (`novice_town_and_meadow`, `bamboo_forest`, `pebble_cave`) and update `HeroRepository` spawn points and starter champions.

**Blocked by:** Ticket 01

**Status:** resolved

- [x] Define `valhalla_coliseum`, `asgard_sanctuary`, and `helheim_abyss` in `MAP_DATABASE` with custom themes (`coliseum`, `sanctuary`, `abyss`).
- [x] Configure Bifrost Portals connecting the three celestial realms.
- [x] Implement alias fallback in `getMapConfig()` so legacy map IDs resolve to their Ragnarok counterparts without breaking existing save records.
- [x] Update `HeroRepository.getStarterBeast(element)` and `createHero()` in `@poktsonline/server` to spawn at `valhalla_coliseum` with elemental Einherjar/God starters.
- [x] Verify server map persistence and roaming beast tests pass.
