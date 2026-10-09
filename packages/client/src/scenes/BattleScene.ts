import Phaser from 'phaser';

export class BattleScene extends Phaser.Scene {
  private encounterData: any;

  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data: any) {
    this.encounterData = data;
  }

  create() {
    const { width, height } = this.scale;

    // Dark semi-transparent combat arena backdrop
    this.add.rectangle(width / 2, height / 2, width, height, 0x050b14, 0.95);

    // Battle Title
    this.add.text(width / 2, 60, '⚔️ TS ONLINE TACTICAL BATTLE INSTANCE ⚔️', {
      fontFamily: 'Segoe UI, Tahoma',
      fontSize: '24px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(width / 2, 95, 'Zone: Whispering Meadow | 2x5 Formation Grid Combat', {
      fontFamily: 'Segoe UI, Tahoma',
      fontSize: '14px',
      color: '#94a3b8'
    }).setOrigin(0.5, 0.5);

    // Draw 2x5 Formation Grid for Player (Allies) and Enemies
    this.drawFormationGrid(width / 2 - 250, height / 2, 'ALLIES (Player + Beast)', 0x1d4ed8);
    this.drawFormationGrid(width / 2 + 250, height / 2, 'ENEMIES (Wild Beasts)', 0xb91c1c);

    // Display wild enemy information if available
    const enemies = this.encounterData?.encounter?.wildEnemies || [{ name: 'Wild Beast', level: 3, element: 'Earth' }];
    const enemy = enemies[0];

    this.add.text(width / 2 + 250, height / 2 - 40, `👾 ${enemy.name} (Lv.${enemy.level || 3})`, {
      fontSize: '16px',
      color: '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Friendly Hero
    this.add.text(width / 2 - 250, height / 2 - 40, '🧙 Hero (Lv.5 Water)', {
      fontSize: '16px',
      color: '#60a5fa',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    // Action phase prompt
    this.add.text(width / 2, height - 140, 'Action Phase: 30s Countdown Synchronized by Colyseus BattleRoom', {
      fontSize: '15px',
      color: '#34d399'
    }).setOrigin(0.5, 0.5);

    // Return to Overworld Button (Simulate battle completion)
    const returnBtn = this.add.rectangle(width / 2, height - 80, 260, 44, 0xd97706)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(width / 2, height - 80, 'Complete Fight & Return to Overworld', {
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    returnBtn.on('pointerover', () => returnBtn.setFillStyle(0xf59e0b));
    returnBtn.on('pointerout', () => returnBtn.setFillStyle(0xd97706));

    returnBtn.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.stop();
        this.scene.resume('OverworldScene');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(300, 255, 255, 255);
  }

  private drawFormationGrid(centerX: number, centerY: number, label: string, color: number) {
    this.add.text(centerX, centerY - 110, label, {
      fontSize: '14px',
      color: '#e2e8f0',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);

    const g = this.add.graphics();
    g.lineStyle(2, color, 0.8);

    // 2 rows, 5 columns grid
    const cols = 5;
    const rows = 2;
    const slotW = 50;
    const slotH = 50;
    const startX = centerX - (cols * slotW) / 2;
    const startY = centerY - (rows * slotH) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        g.strokeRect(startX + c * slotW, startY + r * slotH, slotW - 4, slotH - 4);
      }
    }
  }
}
