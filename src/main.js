"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: false  
    },
    width: canvasW,
    height: canvasH,
    scene: [Gallery]
}

const game = new Phaser.Game(config);