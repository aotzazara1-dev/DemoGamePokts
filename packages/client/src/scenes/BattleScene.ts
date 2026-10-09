import Phaser from 'phaser';
import { BattleNetwork } from '../network/BattleNetwork.js';
import { getValidTargets } from '../battle/targeting.js';
import {
  Element,
  BattleEngine,
  ProgressionEngine,
  ELEMENTAL_SKILLS,
  InventoryManager,
  LootEngine,
  getItemDefinition,
  type SkillDefinition,
  type Combatant,
  type BattleState,
  type CombatAction,
  type CombatActionType,
  type BattleEvent,
  type InventoryState,
  type LootReward,
  type ItemStack
} from '@poktsonline/shared';

export class BattleScene extends Phaser.Scene {
  private network!: BattleNetwork;
  private encounterData: any;

  // Domain state
  private battleState!: BattleState;
  private inventory: InventoryState = InventoryManager.createInitialInventory();
  private currentTurnActorId: string = 'hero_1';
  private selectedActionType: CombatActionType | null = null;
  private selectedSkillId: string | null = null;
  private selectedItemId: string | null = null;
  private stagedActions: Record<string, CombatAction> = {};

  // Timers and UI
  private actionTimerSeconds: number = 30;
  private timerProgressBar!: Phaser.GameObjects.Rectangle;
  private itemMenuContainer?: Phaser.GameObjects.Container;
  private timerText!: Phaser.GameObjects.Text;
  private statusBannerText!: Phaser.GameObjects.Text;
  private activeActorText!: Phaser.GameObjects.Text;
  private skillButtonText!: Phaser.GameObjects.Text;

  // Interactive containers
  private combatantVisuals: Map<string, {
    container: Phaser.GameObjects.Container;
    hpBar: Phaser.GameObjects.Rectangle;
    spBar: Phaser.GameObjects.Rectangle;
    hpText: Phaser.GameObjects.Text;
    sprite: Phaser.GameObjects.Image;
    badge: Phaser.GameObjects.Text;
    unit: Combatant;
    x: number;
    y: number;
  }> = new Map();

  private slotHighlightBoxes: Phaser.GameObjects.Rectangle[] = [];
  private actionButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: any) {
    this.encounterData = data;
    this.network = data.battleNetwork || new BattleNetwork();
    this.inventory = data.inventory || InventoryManager.createInitialInventory();
    this.stagedActions = {};
    this.selectedActionType = null;
    this.selectedItemId = null;
    this.actionTimerSeconds = 30;
  }

  preload() {
    this.createCombatantTextures();
  }

  create() {
    const { width, height } = this.scale;

    // Ensure Overworld HUD elements, buttons, and modals are hidden during combat
    const elementsToHide = [
      'ui-overlay',
      'btn-roster',
      'btn-character-status',
      'btn-toggle-debug',
      'debug-panel',
      'roster-modal',
      'character-modal'
    ];
    elementsToHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.classList.contains('open')) el.classList.remove('open');
        if (id.startsWith('btn-') || id === 'ui-overlay') {
          el.style.display = 'none';
        }
      }
    });

    // 1. Dark Atmospheric Combat Arena Backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x050a14, 0.96);

    // 2. Battle Instance Title
    this.add.text(width / 2, 38, '⚔️ POKTSONLINE BATTLE INSTANCE ⚔️', {
      fontFamily: 'Segoe UI, Tahoma',
      fontSize: '22px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    this.statusBannerText = this.add.text(width / 2, 70, 'Action Phase: Select tactical command for your units', {
      fontFamily: 'Segoe UI, Tahoma',
      fontSize: '14px',
      color: '#60a5fa'
    }).setOrigin(0.5, 0.5);

    // 3. Initialize Battle State
    this.initBattleState();

    // 4. Render Formation Grids & Combatant Sprites
    this.renderGridsAndUnits();

    // 5. Render Action HUD (Bottom Panel)
    this.createActionHUD();

    // 6. Connect or listen to BattleRoom events
    this.setupNetworkHandlers();

    // 7. Timer countdown loop
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.tickActionTimer()
    });

    // Fade in
    this.cameras.main.fadeIn(300, 255, 255, 255);
  }

  private createCombatantTextures() {
    // Hero Battle Sprite (Blue robe with sword)
    if (!this.textures.exists('combat_hero')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x1d4ed8, 1);
      g.fillRoundedRect(10, 16, 28, 34, 6);
      g.fillStyle(0xfde047, 1);
      g.fillCircle(24, 12, 10);
      g.fillStyle(0xd97706, 1);
      g.fillRect(16, 8, 16, 4);
      // Sword
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(36, 10, 4, 30);
      g.fillStyle(0xd97706, 1);
      g.fillRect(32, 32, 12, 4);
      g.generateTexture('combat_hero', 48, 56);
      g.destroy();
    }

    // Active Beast (Aqua Sprite / River Turtle)
    if (!this.textures.exists('combat_beast')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(24, 28, 18);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(20, 22, 8);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(18, 20, 3);
      g.generateTexture('combat_beast', 48, 56);
      g.destroy();
    }

    // Wild Enemy (Flame Imp / Leaf Sprite / Boar)
    if (!this.textures.exists('combat_wild')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xb91c1c, 1);
      g.fillRoundedRect(10, 16, 28, 30, 8);
      g.fillStyle(0xf87171, 1);
      g.fillTriangle(14, 16, 24, 4, 34, 16);
      // Eyes
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(19, 24, 3);
      g.fillCircle(29, 24, 3);
      g.generateTexture('combat_wild', 48, 56);
      g.destroy();
    }
  }

  private initBattleState() {
    const wildEnemies: Combatant[] = this.encounterData?.encounter?.wildEnemies || [
      {
        id: 'wild_enemy_1',
        name: 'Leaf Sprite',
        isHero: false,
        level: 3,
        element: Element.Wind,
        hp: 35,
        maxHp: 35,
        sp: 15,
        maxSp: 15,
        atk: 14,
        def: 8,
        int: 10,
        agi: 14
      }
    ];

    const hero: Combatant = {
      id: 'hero_1',
      name: 'Hero',
      isHero: true,
      level: 5,
      element: Element.Water,
      hp: 120,
      maxHp: 120,
      sp: 50,
      maxSp: 50,
      atk: 28,
      def: 18,
      int: 12,
      agi: 22
    };

    const beast: Combatant = {
      id: 'beast_1',
      name: 'Aqua Fin',
      isHero: false,
      level: 4,
      element: Element.Water,
      hp: 75,
      maxHp: 75,
      sp: 25,
      maxSp: 25,
      atk: 20,
      def: 15,
      int: 10,
      agi: 18
    };

    this.battleState = {
      round: 1,
      outcome: 'ongoing',
      allies: this.encounterData?.alliesFormation || {
        front: [null, null, hero, null, null],
        back: [null, null, beast, null, null]
      },
      enemies: {
        front: [null, null, wildEnemies[0] || null, null, null],
        back: [null, null, wildEnemies[1] || null, null, null]
      },
      capturedBeastIds: []
    };

    // Determine initial active actor (Hero or first living ally)
    for (let c = 0; c < 5; c++) {
      if (this.battleState.allies.front[c]?.isHero) {
        this.currentTurnActorId = this.battleState.allies.front[c]!.id;
        break;
      }
      if (this.battleState.allies.back[c]?.isHero) {
        this.currentTurnActorId = this.battleState.allies.back[c]!.id;
        break;
      }
    }
  }

  private renderGridsAndUnits() {
    const { width } = this.scale;
    const gridY = 240;

    // Clear existing
    this.combatantVisuals.forEach(v => v.container.destroy());
    this.combatantVisuals.clear();

    // 1. Allies Grid (Left side)
    this.renderSideFormation(width / 2 - 260, gridY, 'allies');

    // 2. Enemies Grid (Right side)
    this.renderSideFormation(width / 2 + 260, gridY, 'enemies');
  }

  private renderSideFormation(centerX: number, centerY: number, team: 'allies' | 'enemies') {
    const formation = this.battleState[team];
    const isAllies = team === 'allies';

    const cols = 5;
    const slotW = 68;
    const slotH = 76;
    const rowOffset = 90;

    // Label
    this.add.text(centerX, centerY - 100, isAllies ? '🛡️ ALLIES (Player Team)' : '⚔️ FOES (Wild Encounter)', {
      fontSize: '14px',
      color: isAllies ? '#60a5fa' : '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Front row is closer to center of arena:
    // For allies: back row at -rowOffset/2, front row at +rowOffset/2
    // For enemies: front row at -rowOffset/2, back row at +rowOffset/2
    const frontX = isAllies ? centerX + rowOffset / 2 : centerX - rowOffset / 2;
    const backX = isAllies ? centerX - rowOffset / 2 : centerX + rowOffset / 2;

    ['front', 'back'].forEach(rowKey => {
      const rowX = rowKey === 'front' ? frontX : backX;
      const units = formation[rowKey as 'front' | 'back'];

      for (let c = 0; c < cols; c++) {
        const slotY = centerY + (c - 2) * slotH;

        // Slot bounding box
        const slotG = this.add.graphics();
        slotG.lineStyle(1, isAllies ? 0x1e3a8a : 0x7f1d1d, 0.7);
        slotG.fillStyle(isAllies ? 0x0f172a : 0x180a0a, 0.5);
        slotG.strokeRoundedRect(rowX - slotW / 2, slotY - slotH / 2, slotW - 4, slotH - 4, 6);
        slotG.fillRoundedRect(rowX - slotW / 2, slotY - slotH / 2, slotW - 4, slotH - 4, 6);

        const unit = units[c];
        if (unit && unit.hp > 0) {
          this.createCombatantVisual(unit, rowX, slotY, isAllies);
        }
      }
    });
  }

  private createCombatantVisual(unit: Combatant, x: number, y: number, isAllies: boolean) {
    const container = this.add.container(x, y);

    const textureKey = unit.isHero ? 'combat_hero' : isAllies ? 'combat_beast' : 'combat_wild';
    const sprite = this.add.image(0, -6, textureKey);
    if (!isAllies) {
      sprite.setFlipX(true);
    }

    // Name & Level
    const nameText = this.add.text(0, -38, `${unit.name} Lv.${unit.level}`, {
      fontSize: '10px',
      color: isAllies ? '#e2e8f0' : '#fca5a5',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // HP Bar background
    const barBg = this.add.rectangle(0, 22, 48, 6, 0x1e293b);
    // HP Bar fill
    const hpRatio = Math.max(0, unit.hp / unit.maxHp);
    const hpColor = hpRatio > 0.5 ? 0x22c55e : hpRatio > 0.25 ? 0xeab308 : 0xef4444;
    const hpBar = this.add.rectangle(-24 + (48 * hpRatio) / 2, 22, 48 * hpRatio, 6, hpColor);

    // SP Bar background & fill
    const spRatio = Math.max(0, unit.sp / unit.maxSp);
    const spBar = this.add.rectangle(-24 + (48 * spRatio) / 2, 29, 48 * spRatio, 3, 0x38bdf8);

    // HP Text
    const hpText = this.add.text(0, 22, `${unit.hp}/${unit.maxHp}`, {
      fontSize: '8px',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // Action Staging Badge (Icon on top of combatant)
    const badge = this.add.text(18, -34, '', {
      fontSize: '14px',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5).setVisible(false);

    container.add([sprite, nameText, barBg, hpBar, spBar, hpText, badge]);

    // Make unit clickable for targeting
    container.setSize(56, 68);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.handleTargetSelected(unit.id));

    this.combatantVisuals.set(unit.id, {
      container,
      hpBar,
      spBar,
      hpText,
      sprite,
      badge,
      unit,
      x,
      y
    });
  }

  private updateActorStagingBadge(actorId: string, actionType: CombatActionType) {
    const vis = this.combatantVisuals.get(actorId);
    if (!vis) return;
    const iconMap: Record<CombatActionType, string> = {
      attack: '🗡️',
      skill: '✨',
      defend: '🛡️',
      pass: '⏸️',
      capture: '🕸️',
      item: '🎒',
      flee: '🏃'
    };
    vis.badge.setText(iconMap[actionType] || '✔️');
    vis.badge.setVisible(true);
  }

  private clearAllStagingBadges() {
    this.combatantVisuals.forEach(vis => {
      vis.badge.setVisible(false);
    });
  }

  private createActionHUD() {
    const { width, height } = this.scale;
    const hudY = height - 100;

    // HUD Panel Box
    const panelBg = this.add.rectangle(width / 2, hudY, 940, 140, 0x0f172a, 0.95);
    panelBg.setStrokeStyle(2, 0xd4af37, 0.8);

    // Active Actor Tag
    this.add.text(width / 2 - 380, hudY - 50, '👉 SELECTING ACTION FOR:', {
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: 'bold'
    });

    this.activeActorText = this.add.text(width / 2 - 200, hudY - 50, '🧙 Hero (Lv.5 Water)', {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    });

    // 30s Countdown Timer Bar
    this.add.text(width / 2 + 100, hudY - 50, '⏳ TIME REMAINING:', {
      fontSize: '12px',
      color: '#94a3b8',
      fontStyle: 'bold'
    });

    const timerBg = this.add.rectangle(width / 2 + 280, hudY - 48, 140, 10, 0x1e293b);
    this.timerProgressBar = this.add.rectangle(width / 2 + 280, hudY - 48, 140, 10, 0x22c55e);

    this.timerText = this.add.text(width / 2 + 370, hudY - 48, '30s', {
      fontSize: '12px',
      color: '#facc15',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Action Buttons (7 buttons including Pass)
    const actions: { type: CombatActionType; label: string; icon: string; color: number }[] = [
      { type: 'attack', label: 'Attack', icon: '🗡️', color: 0xd97706 },
      { type: 'skill', label: 'Skill (Water)', icon: '✨', color: 0x2563eb },
      { type: 'defend', label: 'Defend (-50%)', icon: '🛡️', color: 0x059669 },
      { type: 'pass', label: 'Pass (Wait)', icon: '⏸️', color: 0x475569 },
      { type: 'capture', label: 'Capture', icon: '🕸️', color: 0x7c3aed },
      { type: 'item', label: 'Item', icon: '🎒', color: 0x334155 },
      { type: 'flee', label: 'Flee Run', icon: '🏃', color: 0xdc2626 }
    ];

    const btnW = 118;
    const btnH = 44;
    const totalW = actions.length * btnW + (actions.length - 1) * 8;
    const startX = width / 2 - totalW / 2 + btnW / 2;
    const btnY = hudY + 14;

    actions.forEach((act, idx) => {
      const btnX = startX + idx * (btnW + 8);
      const btnContainer = this.add.container(btnX, btnY);

      const bg = this.add.rectangle(0, 0, btnW, btnH, act.color, 0.85);
      bg.setStrokeStyle(1, 0xfde047, 0.6);

      const label = this.add.text(0, 0, `${act.icon} ${act.label}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      if (act.type === 'skill') {
        this.skillButtonText = label;
      }

      btnContainer.add([bg, label]);
      btnContainer.setSize(btnW, btnH);
      btnContainer.setInteractive({ useHandCursor: true });

      btnContainer.on('pointerover', () => bg.setFillStyle(act.color, 1.0));
      btnContainer.on('pointerout', () => bg.setFillStyle(act.color, 0.85));
      btnContainer.on('pointerdown', () => this.handleActionClick(act.type));

      this.actionButtons.push(btnContainer);
    });

    this.updateActiveActorHUD();
  }

  private updateActiveActorHUD() {
    if (!this.activeActorText) return;
    const actorVis = this.combatantVisuals.get(this.currentTurnActorId);
    if (!actorVis) return;
    const actor = actorVis.unit;

    this.activeActorText.setText(`🧙 ${actor.name} (Lv.${actor.level} ${actor.element})`);
    this.activeActorText.setColor(actor.isHero ? '#38bdf8' : '#a7f3d0');

    if (this.skillButtonText) {
      this.skillButtonText.setText(`✨ Skill (${actor.element})`);
    }
  }

  private handleActionClick(actionType: CombatActionType) {
    if (this.itemMenuContainer) {
      this.itemMenuContainer.destroy();
      this.itemMenuContainer = undefined;
    }

    this.selectedActionType = actionType;
    this.selectedSkillId = null;
    this.selectedItemId = null;

    if (actionType === 'defend' || actionType === 'flee' || actionType === 'pass') {
      // Immediate actions that do not require targeting an enemy
      this.stagedActions[this.currentTurnActorId] = { type: actionType };
      this.updateActorStagingBadge(this.currentTurnActorId, actionType);
      this.advanceTurnInput();
    } else if (actionType === 'skill') {
      const activeVis = this.combatantVisuals.get(this.currentTurnActorId);
      const actor = activeVis?.unit;
      if (!actor) return;

      // Select elemental skill according to actor's element
      let skillDef: SkillDefinition = ELEMENTAL_SKILLS['aqua_jet'];
      if (actor.element === Element.Earth) skillDef = ELEMENTAL_SKILLS['rock_throw'];
      else if (actor.element === Element.Fire) skillDef = ELEMENTAL_SKILLS['flame_strike'];
      else if (actor.element === Element.Wind) skillDef = ELEMENTAL_SKILLS['gale_slash'];

      if (actor.sp < skillDef.spCost) {
        this.cameras.main.shake(120, 0.005);
        this.statusBannerText.setText(`Not enough SP! ${skillDef.name} costs ${skillDef.spCost} SP.`);
        this.statusBannerText.setColor('#ef4444');
        return;
      }

      this.selectedSkillId = skillDef.id;
      const validTargetIds = getValidTargets('skill', 'allies', this.battleState);
      this.highlightValidTargets(validTargetIds);

      this.statusBannerText.setText(`Selected ${skillDef.name} (${skillDef.spCost} SP)! Select enemy target:`);
      this.statusBannerText.setColor('#38bdf8');
    } else if (actionType === 'item') {
      const usableItems = this.inventory.slots.filter(s => {
        if (!s || s.quantity <= 0) return false;
        const def = getItemDefinition(s.itemId);
        return def && def.usableInCombat;
      }) as ItemStack[];

      if (usableItems.length === 0) {
        this.cameras.main.shake(120, 0.005);
        this.statusBannerText.setText('No combat-usable items in Bag!');
        this.statusBannerText.setColor('#ef4444');
        return;
      }

      this.showItemSelectionMenu(usableItems);
    } else {
      // Actions requiring target selection (attack, capture)
      const validTargetIds = getValidTargets(actionType, 'allies', this.battleState);
      this.highlightValidTargets(validTargetIds);

      this.statusBannerText.setText(`Select target for ${actionType.toUpperCase()}! (Highlighted)`);
      this.statusBannerText.setColor('#facc15');
    }
  }

  private showItemSelectionMenu(items: ItemStack[]) {
    if (this.itemMenuContainer) {
      this.itemMenuContainer.destroy();
      this.itemMenuContainer = undefined;
    }

    const { width, height } = this.scale;
    const hudY = height - 100;
    const menuY = hudY - 76;

    this.itemMenuContainer = this.add.container(width / 2, menuY);
    this.itemMenuContainer.setDepth(500);

    const btnWidth = 148;
    const btnHeight = 36;
    const totalW = (items.length + 1) * btnWidth + items.length * 8;
    const startX = -totalW / 2 + btnWidth / 2;

    const bgPanel = this.add.rectangle(0, 0, totalW + 24, btnHeight + 16, 0x0f172a, 0.96);
    bgPanel.setStrokeStyle(1.5, 0x38bdf8, 0.85);
    this.itemMenuContainer.add(bgPanel);

    items.forEach((item, idx) => {
      const def = getItemDefinition(item.itemId);
      const icon = this.getItemIcon(item.itemId);
      const btnX = startX + idx * (btnWidth + 8);
      const btn = this.add.container(btnX, 0);

      const btnBg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x1e293b, 0.95);
      btnBg.setStrokeStyle(1, 0x38bdf8, 0.6);

      const label = this.add.text(0, 0, `${icon} ${def?.name.split(' ')[0] || item.itemId} (x${item.quantity})`, {
        fontSize: '11px',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      btn.add([btnBg, label]);
      btn.setSize(btnWidth, btnHeight);
      btn.setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => btnBg.setFillStyle(0x0284c7, 1.0));
      btn.on('pointerout', () => btnBg.setFillStyle(0x1e293b, 0.95));
      btn.on('pointerdown', () => {
        this.selectedItemId = item.itemId;
        this.selectedActionType = 'item';
        if (this.itemMenuContainer) {
          this.itemMenuContainer.destroy();
          this.itemMenuContainer = undefined;
        }

        const validTargetIds = getValidTargets('item', 'allies', this.battleState, def?.type);
        this.highlightValidTargets(validTargetIds);

        this.statusBannerText.setText(`Using ${def?.name || item.itemId}! Select friendly ally target:`);
        this.statusBannerText.setColor('#38bdf8');
      });

      this.itemMenuContainer!.add(btn);
    });

    // Cancel Button
    const cancelX = startX + items.length * (btnWidth + 8);
    const cancelBtn = this.add.container(cancelX, 0);
    const cancelBg = this.add.rectangle(0, 0, btnWidth, btnHeight, 0x991b1b, 0.95);
    cancelBg.setStrokeStyle(1, 0xf87171, 0.6);
    const cancelLabel = this.add.text(0, 0, '✕ Cancel', {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    cancelBtn.add([cancelBg, cancelLabel]);
    cancelBtn.setSize(btnWidth, btnHeight);
    cancelBtn.setInteractive({ useHandCursor: true });
    cancelBtn.on('pointerover', () => cancelBg.setFillStyle(0xdc2626, 1.0));
    cancelBtn.on('pointerout', () => cancelBg.setFillStyle(0x991b1b, 0.95));
    cancelBtn.on('pointerdown', () => {
      if (this.itemMenuContainer) {
        this.itemMenuContainer.destroy();
        this.itemMenuContainer = undefined;
      }
      this.selectedActionType = null;
      this.selectedItemId = null;
      this.statusBannerText.setText('Action Phase: Select tactical command for your units');
      this.statusBannerText.setColor('#60a5fa');
    });

    this.itemMenuContainer.add(cancelBtn);
  }

  private getItemIcon(itemId: string): string {
    switch (itemId) {
      case 'item_steamed_bun': return '🥟';
      case 'item_herbal_tea': return '🍵';
      case 'item_vitality_pill': return '💊';
      case 'item_phoenix_feather': return '🪶';
      case 'item_town_scroll': return '📜';
      default: return '📦';
    }
  }

  private highlightValidTargets(targetIds: string[]) {
    // Clear old highlights
    this.slotHighlightBoxes.forEach(b => b.destroy());
    this.slotHighlightBoxes = [];

    targetIds.forEach(id => {
      const vis = this.combatantVisuals.get(id);
      if (vis) {
        const highlight = this.add.rectangle(vis.x, vis.y, 60, 72);
        highlight.setStrokeStyle(2, 0xfde047, 0.9);
        highlight.setFillStyle(0xfde047, 0.15);

        this.tweens.add({
          targets: highlight,
          alpha: { from: 0.3, to: 0.8 },
          duration: 400,
          yoyo: true,
          loop: -1
        });

        this.slotHighlightBoxes.push(highlight);
      }
    });
  }

  private handleTargetSelected(targetId: string) {
    if (!this.selectedActionType) return;

    const itemDef = this.selectedActionType === 'item' && this.selectedItemId
      ? getItemDefinition(this.selectedItemId)
      : undefined;

    const validTargets = getValidTargets(
      this.selectedActionType,
      'allies',
      this.battleState,
      itemDef?.type
    );

    if (!validTargets.includes(targetId)) {
      this.cameras.main.shake(100, 0.005);
      this.statusBannerText.setText(
        this.selectedActionType === 'item'
          ? 'Invalid ally target for this item!'
          : 'Target blocked by Front Row unit!'
      );
      this.statusBannerText.setColor('#ef4444');
      return;
    }

    // Target locked
    this.stagedActions[this.currentTurnActorId] = {
      type: this.selectedActionType,
      targetId,
      skillId: this.selectedActionType === 'skill' ? this.selectedSkillId || undefined : undefined,
      itemId: this.selectedActionType === 'item' ? this.selectedItemId || undefined : undefined
    };

    if (this.selectedActionType === 'item' && this.selectedItemId) {
      const res = InventoryManager.removeItem(this.inventory, this.selectedItemId, 1);
      if (res.success) {
        this.inventory = res.inventory;
      }
    }

    this.updateActorStagingBadge(this.currentTurnActorId, this.selectedActionType);

    this.slotHighlightBoxes.forEach(b => b.destroy());
    this.slotHighlightBoxes = [];

    this.advanceTurnInput();
  }

  private advanceTurnInput() {
    const livingAllies: Combatant[] = [];
    ['front', 'back'].forEach(r => {
      this.battleState.allies[r as 'front' | 'back'].forEach(u => {
        if (u && u.hp > 0) livingAllies.push(u);
      });
    });

    const nextUnstaged = livingAllies.find(u => !this.stagedActions[u.id]);
    if (nextUnstaged) {
      this.currentTurnActorId = nextUnstaged.id;
      this.updateActiveActorHUD();
      this.statusBannerText.setText(`Command locked! Select command for ${nextUnstaged.name}:`);
      this.statusBannerText.setColor('#38bdf8');
      this.selectedActionType = null;
      this.selectedSkillId = null;
      this.selectedItemId = null;
      return;
    }

    // All units submitted -> lock actions and resolve!
    if (this.activeActorText) {
      this.activeActorText.setText('Waiting for Resolution Phase...');
      this.activeActorText.setColor('#94a3b8');
    }
    this.statusBannerText.setText('All commands locked in! Executing Resolution Phase...');
    this.statusBannerText.setColor('#a7f3d0');

    this.submitAllActions();
  }

  private submitAllActions() {
    if (this.network && this.network.isConnected()) {
      Object.entries(this.stagedActions).forEach(([combatantId, action]) => {
        this.network.sendSelectAction(combatantId, action);
      });
    } else {
      // In case running standalone or testing, simulate resolution locally
      this.time.delayedCall(300, () => {
        this.executeLocalResolution();
      });
    }
  }

  private tickActionTimer() {
    if (this.battleState.outcome !== 'ongoing') return;

    this.actionTimerSeconds = Math.max(0, this.actionTimerSeconds - 1);
    this.timerText.setText(`${this.actionTimerSeconds}s`);

    const ratio = this.actionTimerSeconds / 30;
    this.timerProgressBar.setSize(140 * ratio, 10);
    this.timerProgressBar.setFillStyle(ratio > 0.5 ? 0x22c55e : ratio > 0.25 ? 0xeab308 : 0xef4444);

    if (this.actionTimerSeconds <= 0 && this.battleState.outcome === 'ongoing') {
      // Timer expired, auto-submit: default to defend for unsubmitted living units
      ['front', 'back'].forEach(r => {
        this.battleState.allies[r as 'front' | 'back'].forEach(u => {
          if (u && u.hp > 0 && !this.stagedActions[u.id]) {
            this.stagedActions[u.id] = { type: 'defend' };
            this.updateActorStagingBadge(u.id, 'defend');
          }
        });
      });
      this.advanceTurnInput();
    }
  }

  private setupNetworkHandlers() {
    this.network.onTurnResolution((payload) => {
      this.playResolutionSequence(payload.events, payload.outcome);
    });

    this.network.onBattleEnd((payload: any) => {
      this.showBattleEndBanner(
        payload.outcome,
        payload.capturedBeastIds || [],
        payload.expAwarded,
        payload.levelUps,
        payload.updatedAllies,
        payload.loot
      );
    });
  }

  private executeLocalResolution() {
    // 1. Assign AI actions to living enemies
    const fullActionsMap: Record<string, CombatAction> = { ...this.stagedActions };
    const opposingTeam = this.battleState.enemies;
    for (let c = 0; c < 5; c++) {
      const frontUnit = opposingTeam.front[c];
      const backUnit = opposingTeam.back[c];
      [frontUnit, backUnit].forEach(unit => {
        if (unit && unit.hp > 0 && !fullActionsMap[unit.id]) {
          // Find living target in allies formation (frontline first, then backline)
          let targetId: string | undefined;
          for (let col = 0; col < 5; col++) {
            const frontAlly = this.battleState.allies.front[col];
            if (frontAlly && frontAlly.hp > 0) {
              targetId = frontAlly.id;
              break;
            }
          }
          if (!targetId) {
            for (let col = 0; col < 5; col++) {
              const backAlly = this.battleState.allies.back[col];
              if (backAlly && backAlly.hp > 0) {
                targetId = backAlly.id;
                break;
              }
            }
          }
          if (targetId) {
            fullActionsMap[unit.id] = { type: 'attack', targetId };
          }
        }
      });
    }

    // 2. Deterministically resolve using pure shared BattleEngine
    const result = BattleEngine.resolveTurn(this.battleState, fullActionsMap);
    this.battleState = result.nextState;

    // 3. Play actual events
    this.playResolutionSequence(result.events, result.nextState.outcome);
  }

  private playResolutionSequence(events: BattleEvent[], finalOutcome: string) {
    if (!events || events.length === 0) {
      if (finalOutcome !== 'ongoing') {
        let loot: LootReward | undefined;
        if (finalOutcome === 'victory') {
          const defeated: Combatant[] = [];
          ['front', 'back'].forEach(r => {
            this.battleState.enemies[r as 'front' | 'back'].forEach(e => {
              if (e && e.hp <= 0) defeated.push(e);
            });
          });
          loot = LootEngine.calculateLoot(defeated);
        }
        this.showBattleEndBanner(finalOutcome, [], undefined, undefined, undefined, loot);
      }
      return;
    }

    let delay = 0;

    events.forEach(evt => {
      this.time.delayedCall(delay, () => {
        this.playSingleEventAnimation(evt);
      });
      delay += 800;
    });

    this.time.delayedCall(delay + 600, () => {
      if (finalOutcome !== 'ongoing') {
        let loot: LootReward | undefined;
        if (finalOutcome === 'victory') {
          const defeated: Combatant[] = [];
          ['front', 'back'].forEach(r => {
            this.battleState.enemies[r as 'front' | 'back'].forEach(e => {
              if (e && e.hp <= 0) defeated.push(e);
            });
          });
          loot = LootEngine.calculateLoot(defeated);
        }
        this.showBattleEndBanner(finalOutcome, [], undefined, undefined, undefined, loot);
      } else {
        // Next round
        this.actionTimerSeconds = 30;
        for (let c = 0; c < 5; c++) {
          if (this.battleState.allies.front[c]?.isHero && this.battleState.allies.front[c]!.hp > 0) {
            this.currentTurnActorId = this.battleState.allies.front[c]!.id;
            break;
          }
          if (this.battleState.allies.back[c]?.isHero && this.battleState.allies.back[c]!.hp > 0) {
            this.currentTurnActorId = this.battleState.allies.back[c]!.id;
            break;
          }
        }
        this.stagedActions = {};
        this.clearAllStagingBadges();
        this.updateActiveActorHUD();
        this.statusBannerText.setText('Action Phase: Next round started. Select commands!');
      }
    });
  }

  private playSingleEventAnimation(evt: BattleEvent) {
    this.statusBannerText.setText(evt.message);
    this.statusBannerText.setColor('#fde047');

    const target = evt.targetId ? this.combatantVisuals.get(evt.targetId) : undefined;

    if (evt.type === 'pass') {
      const actor = this.combatantVisuals.get(evt.actorId);
      if (actor) {
        this.showFloatingCombatText(actor.container.x, actor.container.y - 20, 'PASS ⏸️', '#94a3b8');
      }
      return;
    }

    if (evt.type === 'defend') {
      const actor = this.combatantVisuals.get(evt.actorId);
      if (actor) {
        this.showFloatingCombatText(actor.container.x, actor.container.y - 20, 'GUARD 🛡️', '#34d399');
      }
      return;
    }

    if (evt.type === 'flee') {
      const actor = this.combatantVisuals.get(evt.actorId);
      if (actor) {
        this.showFloatingCombatText(actor.container.x, actor.container.y - 20, 'FLEE 🏃', '#f87171');
      }
      return;
    }

    if (evt.type === 'heal' && target) {
      if (evt.value && evt.value > 0) {
        this.showFloatingCombatText(target.container.x, target.container.y - 20, `+${evt.value} HP 💚`, '#22c55e');
        target.unit.hp = Math.min(target.unit.maxHp, target.unit.hp + evt.value);
        this.updateHealthBar(target);
      } else {
        this.showFloatingCombatText(target.container.x, target.container.y - 20, 'NO EFFECT', '#94a3b8');
      }
      return;
    }

    if (evt.type === 'sp_restore' && target) {
      if (evt.value && evt.value > 0) {
        this.showFloatingCombatText(target.container.x, target.container.y - 20, `+${evt.value} SP 💧`, '#38bdf8');
        target.unit.sp = Math.min(target.unit.maxSp, target.unit.sp + evt.value);
        this.updateSpBar(target);
      }
      return;
    }

    if (evt.type === 'revive' && target) {
      if (evt.value && evt.value > 0) {
        this.showFloatingCombatText(target.container.x, target.container.y - 20, `REVIVED! +${evt.value} HP ❤️`, '#fbbf24');
        target.unit.hp = evt.value;
        this.tweens.add({
          targets: target.container,
          alpha: 1.0,
          duration: 300
        });
        this.updateHealthBar(target);
      }
      return;
    }

    if (evt.type === 'combo' && target) {
      // Find ally combatants participating in combo (uA + beast)
      const uAVis = this.combatantVisuals.get(evt.actorId);
      const beastVis = this.combatantVisuals.get('beast_1');
      const actorsToAnimate = [uAVis, beastVis].filter((v): v is NonNullable<typeof v> => !!v);

      actorsToAnimate.forEach(a => {
        const startX = a.container.x;
        const targetX = target.container.x;
        const leapDist = (targetX - startX) * 0.35;
        this.tweens.add({
          targets: a.container,
          x: startX + leapDist,
          duration: 180,
          yoyo: true,
          ease: 'Power2'
        });
      });

      this.time.delayedCall(180, () => {
        this.cameras.main.shake(160, 0.012);
        if (evt.value) {
          this.showFloatingCombatText(target.container.x, target.container.y - 20, `COMBO! -${evt.value}`, '#fbbf24');
          target.unit.hp = Math.max(0, target.unit.hp - evt.value);
          this.updateHealthBar(target);
        }
      });
      return;
    }

    const actor = this.combatantVisuals.get(evt.actorId);

    if (actor && target) {
      // Leap forward animation
      const startX = actor.container.x;
      const targetX = target.container.x;
      const leapDistance = (targetX - startX) * 0.35;

      this.tweens.add({
        targets: actor.container,
        x: startX + leapDistance,
        duration: 180,
        yoyo: true,
        ease: 'Power2',
        onYoyo: () => {
          // Impact shake and floating combat text
          this.cameras.main.shake(120, 0.008);
          if (evt.value) {
            const isSkill = evt.type === 'skill';
            const color = isSkill ? '#38bdf8' : '#ef4444';
            const prefix = isSkill ? '✨ -' : '-';
            this.showFloatingCombatText(target.container.x, target.container.y - 20, `${prefix}${evt.value}`, color);
            // Deduct HP
            target.unit.hp = Math.max(0, target.unit.hp - evt.value);
            this.updateHealthBar(target);
          }
        }
      });
    } else if (evt.type === 'capture_success' && target) {
      this.showFloatingCombatText(target.container.x, target.container.y - 20, 'CAPTURED! ⭐', '#a855f7');
      this.tweens.add({
        targets: target.container,
        alpha: 0,
        scale: 0.2,
        duration: 500
      });
    } else if (evt.type === 'capture_fail' && target) {
      this.showFloatingCombatText(target.container.x, target.container.y - 20, 'FAILED! ❌', '#ef4444');
    }
  }

  private updateHealthBar(vis: any) {
    const ratio = Math.max(0, vis.unit.hp / vis.unit.maxHp);
    const hpColor = ratio > 0.5 ? 0x22c55e : ratio > 0.25 ? 0xeab308 : 0xef4444;

    this.tweens.add({
      targets: vis.hpBar,
      width: 48 * ratio,
      duration: 250,
      ease: 'Power1'
    });
    vis.hpBar.setFillStyle(hpColor);
    vis.hpText.setText(`${vis.unit.hp}/${vis.unit.maxHp}`);

    if (vis.unit.hp <= 0) {
      this.tweens.add({
        targets: vis.container,
        alpha: 0.3,
        duration: 400
      });
    }
  }

  private updateSpBar(vis: any) {
    if (!vis.spBar) return;
    const ratio = Math.max(0, vis.unit.sp / (vis.unit.maxSp || 1));
    this.tweens.add({
      targets: vis.spBar,
      width: 48 * ratio,
      duration: 250,
      ease: 'Power1'
    });
  }

  private showFloatingCombatText(x: number, y: number, text: string, color: string) {
    const txt = this.add.text(x, y, text, {
      fontSize: '18px',
      color: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: txt,
      y: y - 40,
      alpha: 0,
      duration: 750,
      ease: 'Power1',
      onComplete: () => txt.destroy()
    });
  }

  private showBattleEndBanner(
    outcome: string,
    capturedBeastIds: string[],
    expAwarded?: number,
    levelUps?: any[],
    updatedAllies?: Combatant[],
    loot?: LootReward
  ) {
    this.battleState.outcome = outcome as any;
    const { width, height } = this.scale;

    const bannerContainer = this.add.container(width / 2, height / 2);
    bannerContainer.setDepth(1_000_000);

    const bannerBg = this.add.rectangle(0, 0, 580, 290, 0x0f172a, 0.98);
    bannerBg.setStrokeStyle(3, 0xd4af37, 1);

    const isDefeat = outcome === 'defeat';
    const isWin = outcome === 'victory';
    const title = isWin ? '🏆 VICTORY ACHIEVED! 🏆' : outcome === 'escaped' ? '🏃 ESCAPED FROM COMBAT' : '💀 DEFEATED IN COMBAT 💀';
    const titleColor = isWin ? '#fbbf24' : outcome === 'escaped' ? '#38bdf8' : '#ef4444';

    const titleText = this.add.text(0, -100, title, {
      fontSize: '22px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Calculate EXP fallback if not provided
    if (isWin && expAwarded === undefined) {
      let totalPool = 0;
      ['front', 'back'].forEach(r => {
        this.battleState.enemies[r as 'front' | 'back'].forEach(e => {
          if (e && e.hp <= 0) totalPool += ProgressionEngine.calculateEnemyExpReward(e.level);
        });
      });
      const livingCount = ['front', 'back'].reduce((acc, r) => {
        return acc + this.battleState.allies[r as 'front' | 'back'].filter(a => a && a.hp > 0).length;
      }, 0);
      expAwarded = livingCount > 0 ? Math.floor(totalPool / livingCount) : 0;
    }

    const expTextStr = isWin && (expAwarded ?? 0) > 0 ? `✨ Experience Gained: +${expAwarded} EXP` : '';
    const expText = this.add.text(0, -68, expTextStr, {
      fontSize: '13px',
      color: '#38bdf8',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Loot drops (Gold + Items)
    let lootTextStr = '';
    if (isWin && loot) {
      const parts: string[] = [];
      if (loot.gold > 0) parts.push(`🪙 +${loot.gold.toLocaleString()} Gold`);
      if (loot.droppedItems && loot.droppedItems.length > 0) {
        const itemNames = loot.droppedItems.map(d => {
          const def = getItemDefinition(d.itemId);
          return `${def ? def.name.split(' ')[0] : d.itemId} x${d.quantity}`;
        }).join(', ');
        parts.push(`🎁 ${itemNames}`);
      }
      if (parts.length > 0) {
        lootTextStr = parts.join(' | ');
      }
    }
    const lootText = this.add.text(0, -42, lootTextStr, {
      fontSize: '13px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    let levelUpMsg = '';
    if (levelUps && levelUps.length > 0) {
      levelUpMsg = levelUps.map(l => `🎉 LEVEL UP! ${l.name} is now Lv.${l.newLevel}! (+${l.statPointsGained} Stat Points)`).join('\n');
    }
    const levelUpText = this.add.text(0, -12, levelUpMsg, {
      fontSize: '12px',
      color: '#facc15',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 3
    }).setOrigin(0.5, 0.5);

    const captureNote = capturedBeastIds.length > 0
      ? `🕸️ Captured Beast added to team roster!`
      : '';
    const captureText = this.add.text(0, 26, captureNote, {
      fontSize: '13px',
      color: '#a855f7',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Return to Overworld or Respawn Button
    const returnBtn = this.add.rectangle(0, 85, 260, 42, isDefeat ? 0x991b1b : 0xd97706).setInteractive({ useHandCursor: true });
    const returnBtnText = this.add.text(0, 85, isDefeat ? 'Respawn at Novice Town' : 'Return to Overworld', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    returnBtn.on('pointerover', () => returnBtn.setFillStyle(isDefeat ? 0xb91c1c : 0xf59e0b));
    returnBtn.on('pointerout', () => returnBtn.setFillStyle(isDefeat ? 0x991b1b : 0xd97706));
    returnBtn.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.stop();

        const capturedBeasts: Combatant[] = [];
        const wildEnemies: Combatant[] = this.encounterData?.encounter?.wildEnemies || [];
        (capturedBeastIds || this.battleState.capturedBeastIds || []).forEach(id => {
          const found = wildEnemies.find(w => w.id === id);
          if (found) capturedBeasts.push(found);
        });

        if (isDefeat) {
          this.scene.resume('OverworldScene', {
            respawnTile: { x: 10, y: 10 },
            capturedBeasts,
            expAwarded,
            levelUps,
            updatedAllies,
            inventory: this.inventory,
            loot
          });
        } else {
          this.scene.resume('OverworldScene', {
            capturedBeasts,
            expAwarded,
            levelUps,
            updatedAllies,
            inventory: this.inventory,
            loot
          });
        }
      });
    });

    bannerContainer.add([bannerBg, titleText, expText, lootText, levelUpText, captureText, returnBtn, returnBtnText]);
    bannerContainer.setScale(0.7);
    this.tweens.add({
      targets: bannerContainer,
      scale: 1.0,
      duration: 250,
      ease: 'Back.out'
    });
  }
}
