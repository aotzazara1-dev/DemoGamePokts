# Issue 05: Inventory Category Tabs Filtering (Consumables, Equipment, Materials)

## Status: closed

## Blocked By: 03-inventory-modal-controller-and-styling.md

## Description

Enhance the 20-slot unified Inventory modal with category tabs (`All`, `Consumables / ของใช้`, `Equipment / สวมใส่`, `Materials / แมททีเรียล`), item category tags/badges, and interactive filtering.

## Tasks

1. Define `ItemCategory` (`all` | `consumable` | `equipment` | `material`) and helper `getItemCategory(item)` in `@poktsonline/shared`.
2. Add Category Filter Tab Bar to `#inventory-modal` in `packages/client/index.html`.
3. Add CSS tab styles and category badges in `packages/client/src/styles/inventory-modal.css`.
4. Update `InventoryModalController.ts`:
   - Support category filter state (`all`, `consumable`, `equipment`, `material`).
   - Dynamic tab counts badge (e.g. `ทั้งหมด (7)`, `ของใช้ (3)`, `สวมใส่ (2)`, `แมททีเรียล (2)`).
   - Render filtered slots or dimmed/highlighted matching slots.
   - Display category badge in item inspector.
5. Add unit tests for category filtering in client tests.
6. Verify via `npm run check`.
