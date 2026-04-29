"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: canvasW,
    height: canvasH,
    scene: [Gallery]
}

const game = new Phaser.Game(config);