# 06: Phaser Battle Scene and Combat HUD

**What to build:** The browser-based combat screen rendering the 2x5 Formation Grid for both teams, displaying character sprites and health bars, providing a tactical Action Phase HUD (Attack, Skill, Defend, Capture, Flee, Item) with a 30s countdown, animating Resolution Phase actions/combos/damage numbers, and handling end-of-combat transitions.

**Blocked by:** 04: Colyseus Authoritative Server Rooms, 05: Phaser Isometric Overworld Client

**Status:** ready-for-agent

- [ ] Battle Scene renders friendly Hero + Active Beast and enemy wild Beasts placed on their respective 2x5 Formation Grid slots.
- [ ] Action HUD displays 6 action choices (Attack, Skill, Defend, Capture, Flee, Item) and a 30-second countdown bar.
- [ ] Targeting interface allows selecting valid opposing slots (highlighting valid front/back row targets).
- [ ] Resolution Phase plays back action events in order: attacking animations, floating damage numbers, combo visual sync, capture capture effect, and unit faints.
- [ ] Victory, defeat, or escape banner displays with rewards/new Beast notification, then transitions back to the Overworld scene.
