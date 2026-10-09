# 18. Mock Boundaries and Testing Conventions

Date: 2026-10-09

## Status

Accepted

## Context

Poktsonline is a monorepo containing browser client (`@poktsonline/client`), Colyseus game server (`@poktsonline/server`), and shared logic (`@poktsonline/shared`).
During automated testing with Vitest, modules interact with simulated or headless environments:

1. **Client Graphics Headless Mock**:
   - Client unit tests execute in a Node/JSDOM environment where Phaser canvas and graphics are mocked minimally.
   - High-level Phaser graphics methods such as `g.strokeLineShape()` or advanced shape wrappers are absent from the mock interface.
   - Using unsupported methods causes runtime failures during tests even when TypeScript compilation succeeds.

2. **Server Room Configuration Isolation**:
   - In Colyseus rooms (`OverworldRoom`, `BattleRoom`), test suites instantiate rooms with isolated test fixtures (e.g., `testMapConfig` with custom boundaries and coordinates).
   - If room lifecycle hooks (e.g., `onJoin()`) assume production constant fallbacks (like a hardcoded `STARTER_MAP_ID`), mock test fixtures fail assertions.

## Decision

1. **Standardize Graphics Primitives in Procedural Textures**:
   - All procedural pixel/texture generators (`createCelestialArenaTextures`, `createChampionTextures`, etc.) must exclusively use fundamental drawing primitives:
     - `g.strokePoints([{ x, y }, ...])`
     - `g.fillRect(x, y, width, height)`
     - `g.fillStyle(color, alpha)` / `g.lineStyle(width, color, alpha)`
     - `g.beginPath()`, `g.moveTo(x, y)`, `g.lineTo(x, y)`, `g.strokePath()`
   - Do NOT invoke un-mocked helper methods like `strokeLineShape()`.

2. **Dynamic Room Fallbacks**:
   - Rooms must derive default map IDs and spawn points from their active room configuration:
     ```typescript
     const targetMapId = options.mapId ?? this.mapConfig.id;
     ```
   - Global defaults (`STARTER_MAP_ID`) are used ONLY when initializing the room definition if no config is injected.

## Consequences

- Prevents runtime `TypeError` in Vitest mock scenes.
- Room testing preserves 100% isolation without coupling to specific world map definitions.
