# Phaser 3 Client and Colyseus Server Architecture

We chose Phaser 3 for isometric 2.5D client rendering and Colyseus for Node.js authoritative room management. Phaser provides built-in tilemap parsing and scene transitions, while Colyseus handles delta-compressed state synchronization between the shared Overworld and isolated Battle Instance rooms.
