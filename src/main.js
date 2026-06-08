"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#0c404c',
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    scene: [Load, Title, Credits, UI, Gallery, PlayerTest, AttackTest, BreadTest, BulletTest, DeathAnimTest, DuckTest, PathTest, SpawnTest, WaveSpawnTest]
}

const game = new Phaser.Game(config);