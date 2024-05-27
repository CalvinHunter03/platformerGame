class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");

        this.deathCounter = 0;
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.spritesheet("pirate", "PirateSpriteSheet.png", { frameWidth: 16, frameHeight: 16});        

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                         // Packed tilemap
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("Level_two_map", "Level_two_map.tmj");
        this.load.tilemapTiledJSON("End_map", "End_map.tmj");
        this.load.tilemapTiledJSON("Start_map", "Start_map.tmj");

        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.image("blue_background", "blue_background.png");

        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.audio("jump_noise", "Jump.m4a");
        this.load.audio("collect_coin", "Collect Coin.m4a");


    }

    create() {

        

        this.anims.create({
            key: "pirateWalk",
            frames: this.anims.generateFrameNumbers("pirate"),
            framerate: 1,
            repeat: -1
        });

        

         // ...and pass to the start Scene
         this.scene.launch("hud");
         this.scene.start("startScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}