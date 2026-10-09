# Authoritative Roaming Wild Beasts and Overworld Collision Encounters

We decided to introduce server-authoritative Roaming Beasts on the Overworld alongside the existing step-based random encounters in wild Zones.

1. **Dual Encounter Architecture**:
   - Random step-based encounters remain active within wild Zones (`encounterRatePerStep`).
   - Roaming Beasts exist as synchronized entities across all connected clients on the same Map via Colyseus state (`RoamingBeastNetworkState`).

2. **Server-Side AI & State Machine**:
   - Roaming Beasts spawn dynamically within wild Zones based on the map's `encounterPool`.
   - On a periodic server tick (~1500ms), each active Roaming Beast evaluates proximity to nearby Heroes.
   - **Aggro Range**: If a Hero is within 3 tiles and not in combat, the Beast pursues the nearest Hero using grid step-movement.
   - **Wander Mode**: If no Hero is within aggro range, the Beast wanders randomly within its zone bounds or idles, respecting obstacles and safe zones.
   - **Collision Trigger**: When a Beast and a Hero occupy the same tile (via either Beast pursuit or Hero movement), a Battle Instance is triggered immediately for that Hero.
   - **Respawn Cooldown**: Upon entering combat, the Roaming Beast is deactivated from the Overworld. If defeated or fled, it respawns at a randomized position in its zone after a cooldown (~20 seconds).

3. **Client Presentation**:
   - Rendered using isometric tile projection with animated idle/bobbing, element indicator, level badge, and direction flipping.
   - Players can click on a Roaming Beast to automatically pathfind towards it to engage in combat.
