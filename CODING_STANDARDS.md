# Coding Standards

Standards enforced during code reviews and development across this repository.

## 1. Parameters & Primitive Types

- **Avoid Positional Primitive Soup**: Functions and methods must avoid 3 or more consecutive parameters of identical primitive types (e.g. `(x: number, y: number, tw: number, th: number, ox: number, oy: number)`).
- **Use Named Options / Configuration Objects**: Bundle coordinate configs, dimensions, and settings into dedicated interfaces (e.g. `IsometricConfig`, `TileCoord`, `{ width, height, originX, originY }`). Named keys prevent silent parameter swap regressions that TypeScript cannot detect.
- **Prefer Dedicated Grid / Helper Objects**: For repeated geometric or isometric projections, encapsulate configurations into stateful helpers (e.g. `IsometricGrid`) rather than passing 4+ configuration arguments on every call.

## 2. Monorepo Architecture & Contracts

- **Single-Sourced Domain Contracts**: Network packet types, combat math, inventory schemas, and shared interfaces belong in `@poktsonline/shared`. Avoid duplicating interfaces or resorting to `any` across client and server boundaries.
- **Domain Terminology**: Strictly adhere to `GLOSSARY.md`. Use canonical terms (`Hero`, `Beast`, `Overworld`, `Battle Instance`) and avoid banned synonyms (`Pet`, `Avatar`, `Character`).

## 3. Client State & Lifecycle

- **Scene Introspection**: Keep `(window as any).__PHASER_GAME__ = game;` guarded under `import.meta.env.DEV` to enable automated headless smoke testing and instant agent state diagnostics.
