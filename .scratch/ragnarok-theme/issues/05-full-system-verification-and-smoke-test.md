# 05: Full System Verification, Graph Refresh, and E2E Smoke Test

**What to build:**
Run full monorepo typechecking, test suites across all packages, update the Graphify knowledge graph (`graphify update .`), and verify end-to-end integration (character creation, Valhalla overworld spawning, NPC dialogues, shop purchases, and combat encounters).

**Blocked by:** Ticket 04

**Status:** resolved

- [x] Run `npm run build` or monorepo compilation to ensure 0 TypeScript errors.
- [x] Run `npm test` across all 3 workspaces (`@poktsonline/client`, `@poktsonline/server`, `@poktsonline/shared`) and ensure 100% test pass rate.
- [x] Run `graphify update .` to keep the persistent knowledge graph synchronized with all new Ragnarok symbols and relationships.
- [x] Verify clean git status and commit milestone changes.
