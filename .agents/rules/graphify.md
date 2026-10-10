---
trigger: always_on
description: Consult the graphify knowledge graph at graphify-out/ for codebase and architecture questions.
---

## graphify (Mandatory Knowledge Graph Navigation)

This project has a graphify knowledge graph at graphify-out/.

Rules:

- **MANDATORY PRE-EXPLORATION STEP**: Before searching the codebase, inspecting directories, or planning code changes, ALWAYS first run `graphify query "<question or symbol>"` (CLI) or `query_graph` (MCP). Use `graphify path "<A>" "<B>"` / `shortest_path` for relationships and `graphify explain "<concept>"` / `get_node` for focused concepts.
- **NO BLIND GREP/SCANS**: Do NOT execute blind recursive directory searches or arbitrary file scans before querying the graphify knowledge graph.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files.
- Read graphify-out/GRAPH_REPORT.md for god-node analysis, community detection, or broad architecture review.
- After modifying code files in this session, ALWAYS run `graphify update .` to keep the graph current (AST-only, no API cost).
