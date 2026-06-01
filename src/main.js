"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#0c404c',
    width: canvasW,
    height: canvasH,
    scene: [PlayerTest]
}

const game = new Phaser.Game(config);