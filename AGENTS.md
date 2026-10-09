# AGENTS.md

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped in `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout using `GLOSSARY.md` and `docs/adr/`. See `docs/agents/domain.md`.

## Key Navigation Pointers

- **Isometric Math & Projections**: `packages/client/src/utils/isometric.ts` (Use `IsometricGrid` or `IsometricConfig` object).
- **Client DOM Modals**: `packages/client/src/ui/` (Decoupled modal controllers: Auth, CharacterSelect, Inventory, Roster, Character, Shop, Dialogue).
- **Server Persistence & Repos**: `packages/server/src/db/` (WebAssembly SQLite `DatabaseEngine`, `AccountRepository`, `HeroRepository`).
- **Colyseus Room Authority**: `packages/server/src/rooms/` (`OverworldRoom`, `BattleRoom`).
- **Shared Data & Types**: `packages/shared/src/` (Combat formulas, progression, inventory, map configs).

## Codebase Navigation & Knowledge Graph

- See [graphify.md](file:///e:/Poktsonline/.agents/rules/graphify.md) for query, path, explain, and graph maintenance workflows.
