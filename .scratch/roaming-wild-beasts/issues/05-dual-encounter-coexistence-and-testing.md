# 05-dual-encounter-coexistence-and-testing
Status: resolved
Blocked by: 04

## Description
Verify coexistence between Roaming Beast collision encounters and walking random encounters.
- Verify walking in wild grass continues to roll random encounters based on `encounterRatePerStep`.
- Verify walking into a roaming beast or having a roaming beast chase and collide with the player enters battle.
- Verify that leaving battle returns player to overworld without double encounter softlocks.
- Ensure all test suites pass (100% green).
- Build production bundles and verify live servers.

## Answer
Verified dual encounter coexistence in unit tests and end-to-end integration:
1. Stepping on wild tiles continues to roll random wild encounters via `OverworldEngine.movePlayer`.
2. Stepping on a roaming beast or having a roaming beast pursue into player triggers collision battle.
3. Defeated or engaged roaming beasts enter 20s respawn cooldown, preventing duplicate softlocks.
4. All 145/145 tests passing across all three workspaces. Client and server build cleanly.
