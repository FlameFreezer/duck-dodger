"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.WEBGL,
    render: {
        pixelArt: false  
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade"
    },
    backgroundColor: '#a7b2eb',
    width: canvasW,
    height: canvasH,
    scene: [Gallery]
}

const game = new Phaser.Game(config);