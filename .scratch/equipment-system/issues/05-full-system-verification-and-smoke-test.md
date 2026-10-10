# 05: Full System Verification and Smoke Test

## Status: closed

## Blocked By: 04-client-ui-paperdoll-and-modals.md

## Description

Perform end-to-end verification of the Equipment System across shared math, server persistence, and client UI.

## Acceptance Criteria

- Run `npm run check` verifying:
  - All 3 workspaces compile with TypeScript cleanly
  - All unit tests pass across client, server, and shared (220+ tests)
- Pre-commit hook runs lint-staged and tests cleanly.
- Knowledge graph updated via `graphify update .`.
- Git commit and push to `origin/main`.
