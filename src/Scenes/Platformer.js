class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 225;
        this.DRAG = 900 ;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -450;
        this.SCALE = 3;
        this.SPAWN_X = 14;
        this.SPAWN_Y = 200;
        this.PARTICLE_VELOCITY = 50;
        this.score = 0;
        this.doubleJump = true;

        this.my = {
            sprite: {},
            vfx: {}
        }

    }

    create() {

        this.collectCoinSound = this.sound.add("collect_coin", {
            volume: .5
        });

        this.jumpSound = this.sound.add("jump_noise", {
            volume: 0.5
        });


        //background
        this.background = this.add.image(100,100,"blue_background");
        this.background.setScale(3);
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.

        this.levelOneText = this.add.text(50, 85, "Level One", {
            fontFamily: "Georgia",
            color: "white",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 20,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);

        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        //this.detailLayer = this.map.createLayer("details", this.tileset, 0, 0);
        //this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });



        this.goldCoins = this.map.createFromObjects("Objects", {
            name: "gold_coin",
            key: "tilemap_sheet",
            frame: 151
        });

        //creating diamond coin for jump boost
        this.diamondCoin = this.map.createFromObjects("Shiny_Objects", {
            name: "diamond",
            key: "tilemap_sheet",
            frame: 67
        });

        this.detailLayer = this.map.createLayer("details", this.tileset, 0, 0);


        //Gold coin collider
        this.physics.world.enable(this.goldCoins, Phaser.Physics.Arcade.STATIC_BODY);
        //Diamond collider
        this.physics.world.enable(this.diamondCoin, Phaser.Physics.Arcade.STATIC_BODY);

        
        this.coinGroup = this.add.group(this.goldCoins);
        this.diamondGroup = this.add.group(this.diamondCoin);
     
        

        

        //Pirate Player Below:
        my.sprite.piratePlayer = this.physics.add.sprite(this.SPAWN_X, this.SPAWN_Y, "pirate");
        my.sprite.piratePlayer.setScale(1.5);

        //collecting gold coins
        this.physics.add.overlap(my.sprite.piratePlayer, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score++;
            this.collectCoinSound.play();
        });

        //collecting diamonds!
        this.physics.add.overlap(my.sprite.piratePlayer, this.diamondGroup, (obj1, obj2) => {
            obj2.destroy();
            this.scene.get("hud").diamondScore++;
        });
        

        // Enable collision handling
        this.physics.add.collider(my.sprite.piratePlayer, this.groundLayer);


        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.physics.world.drawDebug = false;

        

        my.sprite.piratePlayer.body.setSize(my.sprite.piratePlayer.width/2, my.sprite.piratePlayer.height/1.2, true);
        my.sprite.piratePlayer.refreshBody();

        

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*2, this.map.heightInPixels*2);
        this.cameras.main.startFollow(my.sprite.piratePlayer, true, 1, 1); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        //this.scene.launch("hud");

        //let walkingSmoke = this.add.particles(0,0)

        this.vfxWalking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['fire_01.png', 'fire_02.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 200,
            // TODO: Try: gravityY: -400,
            alpha: {start: .5, end: 0.1}, 
        });

        this.vfxWalking.stop();

        this.vfxJumping = this.add.particles(0,0, "kenny-particles", {
            frame: ['muzzle_01.png'],
            scale: {start: 0.03, end: 0.1},
            lifespan: 200,
            alpha: {start: 1, end: 0.1},
        });

        this.vfxJumping.stop();



    }


    update() {

        //DEBUG
        this.scene.get("hud").scoreText.setText("Coins: " + this.score + " / 7");
        this.scene.get("hud").deathText.setText("Deaths: " + this.scene.get("hud").deathCounter);

        //this.score = 7;
        if (this.score == 7){
            this.scene.start("levelTwo");

        }

        if(my.sprite.piratePlayer.y > 300){
            my.sprite.piratePlayer.x = this.SPAWN_X;
            my.sprite.piratePlayer.y = this.SPAWN_Y;
            this.scene.get("hud").deathCounter++;
        }


        if(cursors.left.isDown) {
            //pirate player velocity changes
            my.sprite.piratePlayer.body.setAccelerationX(-this.ACCELERATION);
            

            //pirate player walking facing left.  be sure to flip
            my.sprite.piratePlayer.play("pirateWalk", true);
            my.sprite.piratePlayer.flipX = true;

            this.vfxWalking.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxWalking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.piratePlayer.body.blocked.down) {
                this.vfxWalking.start();
            }

        } else if(cursors.right.isDown) {
            
            my.sprite.piratePlayer.body.setAccelerationX(this.ACCELERATION);

            //pirate player walking facing right
            my.sprite.piratePlayer.play("pirateWalk", true);
            my.sprite.piratePlayer.flipX = false;

            this.vfxWalking.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxWalking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);
            // Only play smoke effect if touching the ground
            if (my.sprite.piratePlayer.body.blocked.down) {

                this.vfxWalking.start();

            }

        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.piratePlayer.body.setAccelerationX(0);

            
            my.sprite.piratePlayer.body.setDragX(this.DRAG);

            //Pirate player idle
            my.sprite.piratePlayer.anims.pause();
            this.vfxWalking.stop();
            
            
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(my.sprite.piratePlayer.body.blocked.down) {
            this.doubleJump = true;
        }
        if(my.sprite.piratePlayer.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.piratePlayer.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();

            this.vfxJumping.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxJumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.vfxJumping.start();
        }
        else{
            this.vfxJumping.stop();
        }
        if(this.doubleJump && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.piratePlayer.body.setVelocityY(this.JUMP_VELOCITY);
            this.jumpSound.play();

            this.doubleJump = false;
            this.vfxJumping.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxJumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.vfxJumping.start();
  
        }
        
    }
}

