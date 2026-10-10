#!/usr/bin/env node

/**
 * Anti-God Files & Deep Module Guardrail (ADR 0020)
 *
 * Enforces tiered LOC ceilings and prevents existing monoliths from growing:
 * - UI Controllers, Repositories, Services, Managers: Max 400 lines.
 * - Game Scenes, Renderers: Max 600 lines.
 * - Data Catalogs, Math Formulas, Domain Types: Max 400 lines.
 * - Legacy Whitelist: Enforces Boy Scout Rule (whitelisted files can ONLY shrink, never grow).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Ceilings per category
const CEILINGS = {
  SCENE_RENDERER: 600,
  DEFAULT: 400,
};

// Legacy Whitelist with exact baseline caps as of ADR 0020
// Boy Scout Rule: Current lines MUST be <= cap. If a file grows, it fails!
const LEGACY_WHITELIST = {
  "packages/client/src/scenes/OverworldScene.ts": 1901,
  "packages/client/src/scenes/BattleScene.ts": 1290,
  "packages/client/src/renderer/OverworldRenderer.ts": 979,
  "packages/client/src/ui/InventoryModalController.ts": 686,
  "packages/server/src/rooms/OverworldRoom.ts": 686,
  "packages/client/src/entities/OverworldEntityManager.ts": 659,
  "packages/server/src/db/HeroRepository.ts": 482,
  "packages/client/src/ui/DebugToolbarController.ts": 447,
  "packages/shared/src/inventory/item-database.ts": 425,
  "packages/shared/src/battle/battle-engine.ts": 405,
};

function getFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "dist" ||
        entry.name === ".git" ||
        entry.name === "graphify-out" ||
        entry.name === ".scratch"
      ) {
        continue;
      }
      getFiles(fullPath, fileList);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.endsWith(".d.ts") &&
      !entry.name.endsWith(".test.ts")
    ) {
      fileList.push(relPath);
    }
  }

  return fileList;
}

function getCeilingForFile(relPath) {
  if (
    relPath.includes("/scenes/") ||
    relPath.includes("/renderer/") ||
    relPath.endsWith("Scene.ts") ||
    relPath.endsWith("Renderer.ts")
  ) {
    return CEILINGS.SCENE_RENDERER;
  }
  return CEILINGS.DEFAULT;
}

function countLines(filePath) {
  const fullPath = path.join(ROOT_DIR, filePath);
  const content = fs.readFileSync(fullPath, "utf8");
  // Count lines handling both CRLF and LF
  return content.split(/\r?\n/).length;
}

function main() {
  console.log(
    "🛡️  Checking Anti-God Files & Deep Module Guardrails (ADR 0020)..."
  );

  const files = getFiles(path.join(ROOT_DIR, "packages"));
  const violations = [];
  const warnings = [];

  for (const relPath of files) {
    const lines = countLines(relPath);

    if (relPath in LEGACY_WHITELIST) {
      const cap = LEGACY_WHITELIST[relPath];
      if (lines > cap) {
        violations.push({
          type: "BOY_SCOUT_VIOLATION",
          path: relPath,
          lines,
          cap,
          message: `Legacy file grew from ${cap} to ${lines} lines! Whitelisted files must only shrink. Extract new logic into a deep sub-module.`,
        });
      } else if (lines < cap) {
        warnings.push({
          path: relPath,
          lines,
          cap,
          saved: cap - lines,
        });
      }
    } else {
      const ceiling = getCeilingForFile(relPath);
      if (lines > ceiling) {
        violations.push({
          type: "GOD_FILE_VIOLATION",
          path: relPath,
          lines,
          cap: ceiling,
          message: `New or unlisted file has ${lines} lines, exceeding the ${ceiling}-line ceiling! Split into deep sub-controllers or managers (Single Responsibility Principle).`,
        });
      }
    }
  }

  if (warnings.length > 0) {
    console.log(
      "\n🌟 Boy Scout Progress (Files that shrunk below whitelist cap):"
    );
    for (const w of warnings) {
      console.log(
        `  - ${w.path}: ${w.lines} lines (shrunk by ${w.saved} lines from cap ${w.cap})`
      );
    }
  }

  if (violations.length > 0) {
    console.error("\n❌ ANTI-GOD FILE VIOLATIONS DETECTED:");
    for (const v of violations) {
      console.error(`  - [${v.type}] ${v.path}: ${v.message}`);
    }
    console.error("\n💡 Remediation Guide:");
    console.error(
      "  1. Decompose the class: extract UI modals into packages/client/src/ui/"
    );
    console.error("  2. Extract input handling into dedicated InputManager");
    console.error(
      "  3. Extract network listeners into a NetworkBridge/Adapter"
    );
    console.error(
      "  4. Refer to docs/adr/0020-anti-god-files-and-graphify-first.md\n"
    );
    process.exit(1);
  }

  console.log(
    `\n✅ All ${files.length} TypeScript source files comply with Anti-God File guardrails!`
  );
  process.exit(0);
}

main();
