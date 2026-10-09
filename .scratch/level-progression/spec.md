# Specification: Level Progression, EXP Rewards & Stat Points Allocation

## 1. Overview
This specification details the design and implementation of the **Level Progression & Attribute Customization System** for *Poktsonline*, true to classic turn-based MMORPG mechanics (TS Online).

Following combat victory, participating Heroes and deployed Beasts earn Experience Points (EXP). Reaching the threshold triggers a Level Up, fully restoring Health & Spirit, granting base Attribute increases, and awarding distributable **Stat Points** for custom build progression.

---

## 2. Mathematical Domain Formulas

### 2.1 EXP Requirement Curve
$$\text{maxExp}(L) = \lfloor 50 \times L^{1.5} \rfloor$$
- Level 1: 50 EXP
- Level 2: 141 EXP
- Level 3: 259 EXP
- Level 4: 400 EXP
- Level 5: 559 EXP
- Level 10: 1,581 EXP

### 2.2 Enemy EXP Reward Curve
$$\text{expReward}(L_{\text{enemy}}) = \lfloor 30 \times L_{\text{enemy}} \rfloor$$
Total combat EXP is pooled from all defeated enemy combatants and divided equally among all surviving allied combatants.

### 2.3 Level Up Rewards
When `exp >= maxExp`:
1. `level += 1`
2. `exp -= maxExp` (overflow carries into next level)
3. Base increases: `maxHp += 15`, `maxSp += 5`
4. Health & Spirit Recovery: `hp = maxHp`, `sp = maxSp`
5. **Stat Points**:
   - Hero: `+3 Stat Points` per level
   - Beast: `+2 Stat Points` per level

### 2.4 Stat Point Allocation Effects
- **ATK (Strength)**: $+1$ ATK per point
- **DEF (Constitution)**: $+1$ DEF and $+10$ Max HP per point
- **INT (Intelligence)**: $+1$ INT and $+5$ Max SP per point
- **AGI (Agility)**: $+1$ AGI per point (determines turn action priority)

---

## 3. Architecture & Data Structures

### 3.1 Combatant Model Extension (`@poktsonline/shared`)
Extend `Combatant` interface:
```typescript
export interface Combatant {
  // Existing fields...
  exp: number;
  maxExp: number;
  statPoints: number;
}
```

### 3.2 Progression Engine (`@poktsonline/shared/src/progression/`)
- `calculateExpToNextLevel(level: number): number`
- `awardBattleExp(allies: Combatant[], defeatedEnemies: Combatant[]): BattleExpResult`
- `allocateStatPoint(combatant: Combatant, attribute: 'atk' | 'def' | 'int' | 'agi'): AllocationResult`

### 3.3 Authoritative Battle Server (`@poktsonline/server/src/rooms/BattleRoom.ts`)
- Calculate EXP rewards on combat victory.
- Detect level ups and broadcast `battleEnd` with `expAwarded` and `levelUps` array.

### 3.4 Client Battle Scene (`@poktsonline/client/src/scenes/BattleScene.ts`)
- Render EXP reward and Level Up notification banner.
- Resume `OverworldScene` with updated hero and beast progression states.

### 3.5 Client Status & Allocation UI (`packages/client/index.html` & `OverworldScene.ts`)
- Character status modal / Beast Roster stat allocation with `[ + ]` buttons for ATK, DEF, INT, AGI.
- Hotkey `C` (Character Status) and integration into the BEASTS modal.

---

## 4. Verification & Testing Strategy
- Unit tests for progression formulas, level up overflow, and stat point constraints in `@poktsonline/shared`.
- Integration tests in `@poktsonline/server` verifying battle victory EXP calculation and `battleEnd` payload.
- Client tests verifying UI state rendering and stat allocation callbacks.
