# 04: Client UI Paperdoll and Modals Integration

## Status: closed

## Blocked By: 03-server-persistence-and-room-messages.md

## Description

Build the Paperdoll interface in `CharacterModalController` (Hero) and `RosterModalController` (Champions), and add the Equip target flow in `InventoryModalController`.

## Acceptance Criteria

- `CharacterModalController`:
  - 5 Equipment Slot buttons (`weapon`, `head`, `armor`, `boots`, `accessory`) arranged in a paperdoll layout
  - Displays icon, name, and tooltip for equipped items
  - Click equipped item to unequip
  - Shows Base Attributes and bonus from equipment (e.g. `ATK: 28 (+12)`)
- `RosterModalController`:
  - For the selected champion, display their 5 equipment slots
  - Displays champion's effective stats (+ bonus from gear)
  - Click equipped slot to unequip
- `InventoryModalController`:
  - When an equipment item is selected, render `[สวมใส่ / Equip]` button
  - Clicking `Equip` opens a target selection modal/dropdown:
    - `Hero`
    - Roster champions (e.g. `Lu Bu`, `Thor`, etc.)
  - Sends `equip_item` to server room (or applies locally in offline mode)
- `DebugToolbarController`:
  - Add cheat buttons to grant test equipment items into inventory for QA.
- Client unit tests for UI rendering and interactions.
