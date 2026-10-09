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

## Codebase Navigation & Knowledge Graph (Graphify)

- **Always Query Graph First**: Before reading raw files or grepping blindly, consult the persistent knowledge graph via `graphify query "<concept/question>"`.
- **Relationship Tracing**: Use `graphify path "<Source>" "<Target>"` to trace call flows and dependencies.
- **Node Deep-Dive**: Use `graphify explain "<NodeName>"` for targeted symbol summaries.
- **Keep Graph Fresh**: When files are modified, run `graphify update .` (fast AST-only update).
- **Knowledge Graph Files**: `graphify-out/graph.json` (database), `graphify-out/graph.html` (interactive visualizer).

