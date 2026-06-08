class Credits extends Phaser.Scene {
    constructor() {
        super("credits");
    }
    create() {
        this.creditTitle = this.add.bitmapText(CANVAS_WIDTH / 2, 200, "04b_30", "Credits", 48)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.credits = this.add.bitmapText(CANVAS_WIDTH / 2 - 50, CANVAS_HEIGHT / 2, "04b_30", 
            `
            Game Lead - Quincy Hurst
            Programming - Quincy Hurst, Iain Rogers
            Level Design - Quincy Hurst
            Movement Design - Quincy Hurst, Iain Rogers
            Systems Engineering - Quincy Hurst, Iain Rogers
            Sound Design - Quincy Hurst
            Sound Recording - Iain Rogers
            Art Design - Quincy Hurst
            
            Music Credits
            Lifestyle Groove - Dagored, Free To Use ApS
            
            Font Credits
            04b_30 - Yuji Oshimoto
            
            All audio/visual assets from Kenney assets`,
            14).setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD);
        
        this.returnText = this.add.bitmapText(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 200, "04b_30", "Press ENTER to return to title", 14)
            .setOrigin(0.5)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    }
    update(time, delta) {
        if(this.enterKey.isDown) {
            this.scene.start("title");
        }
    }
}