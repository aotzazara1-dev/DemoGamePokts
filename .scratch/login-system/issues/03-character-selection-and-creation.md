# 03: Multi-Hero Character Selection and Creation Interface

**What to build:**
A full character management system allowing each authenticated account to own up to 3 distinct Heroes. Players can view character cards showing their Hero's name, element badge, level, and current map, create new Heroes with custom names and chosen elemental affinities (awarding an element-matched Starter Beast), or delete existing Heroes with two-step confirmation.

**Blocked by:** 02: HTTP Authentication Endpoints and Client Auth Modal

**Status:** ready-for-agent

- [ ] HTTP REST endpoints mounted on port 2567: `GET /api/heroes`, `POST /api/heroes`, and `DELETE /api/heroes/:id`.
- [ ] Enforces a maximum limit of 3 Heroes per Account.
- [ ] Hero creation accepts name (3–16 characters) and chosen Element (Earth, Water, Fire, Wind), initializing base stats and starting inventory.
- [ ] Automatically generates a level 1 Starter Beast matching the Hero's chosen Element into the Hero's Active Beast slot.
- [ ] `CharacterSelectModalController` displays up to 3 slots: active character cards or "+ Create Hero" empty slots.
- [ ] "Delete Hero" action requires typing the exact character name into a confirmation modal before deletion.
- [ ] Automated tests verify hero creation, element assignment, starter beast provisioning, max capacity limits, and safe deletion.
