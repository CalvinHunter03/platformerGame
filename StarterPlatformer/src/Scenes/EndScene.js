class EndScene extends Phaser.Scene {
    constructor(){
        super("endScene");
    }

    init(){
        this.ACCELERATION = 225;
        this.DRAG = 900 ;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -450;
        this.SCALE = 3;
        this.SPAWN_X = 100;
        this.SPAWN_Y = 200;
        this.doubleJump = true;

        this.score = 0;
        this.diamondScore = 0;
        this.deathCounter = 0;
        this.my = {
            sprite: {},
            vfx: {}
        }

    }

    create(){

        this.collectCoinSound = this.sound.add("collect_coin", {
            volume: .5
        });

        this.jumpSound = this.sound.add("jump_noise", {
            volume: 0.5
        });

        this.background = this.add.image(100,100,"blue_background");
        this.background.setScale(3);

        this.map = this.add.tilemap("End_map", 18, 18, 40, 20);

        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        this.groundLayer = this.map.createLayer("Ground-n-platforms", this.tileset, 0, 0);

        this.groundLayer.setCollisionByProperty({
            collides: true
        });


        my.sprite.piratePlayer = this.physics.add.sprite(this.SPAWN_X, this.SPAWN_Y, "pirate");
        my.sprite.piratePlayer.setScale(1.5);

        this.physics.add.collider(my.sprite.piratePlayer, this.groundLayer);

        cursors = this.input.keyboard.createCursorKeys();

        this.physics.world.drawDebug = false;


        my.sprite.piratePlayer.body.setSize(my.sprite.piratePlayer.width/2, my.sprite.piratePlayer.height/1.2, true);
        my.sprite.piratePlayer.refreshBody();

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*2, this.map.heightInPixels*2);
        this.cameras.main.startFollow(my.sprite.piratePlayer, true, 1, 1); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.goldCoins = this.map.createFromObjects("Coins", {
            name: "gold_coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.physics.world.enable(this.goldCoins, Phaser.Physics.Arcade.STATIC_BODY);

        this.coinGroup = this.add.group(this.goldCoins);

        this.physics.add.overlap(my.sprite.piratePlayer, this.coinGroup, (obj1, obj2) => {
            obj2.destroy();
            this.score++;
            this.collectCoinSound.play();

        });

        this.endText = this.add.text(500, 200, "Collect all coins to restart!", {
            fontFamily: "Georgia",
            color: "white",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 20,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);

        this.collectText = this.add.text(185, 280, "You collected _ diamonds!", {
            fontFamily: "Georgia",
            color: "white",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 15,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);

        this.youDiedText = this.add.text(120, 200, "You died _ times!", {
            fontFamily: "Georgia",
            color: "white",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 15,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);

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

    update(){

        this.collectText.setText("You collected " + this.scene.get("hud").diamondScore + " / 6 diamonds!");
        this.youDiedText.setText("You died " + this.scene.get("hud").deathCounter + " times!");
        this.scene.get("hud").scoreText.setText("Coins: " + this.score + " / 9");

        if(this.score == 9){
            this.scene.get("hud").diamondScore = 0;
            this.scene.get("hud").deathCounter = 0;
            this.scene.start("platformerScene");
            
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

            this.vfxWalking.stop();

            //Pirate player idle
            my.sprite.piratePlayer.anims.pause();
            
            
        }

        if(my.sprite.piratePlayer.body.blocked.down) {
            this.doubleJump = true;
        }
        if(my.sprite.piratePlayer.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.piratePlayer.body.setVelocityY(this.JUMP_VELOCITY);

            this.vfxJumping.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxJumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.vfxJumping.start();
        }
        else{
            this.vfxJumping.stop();
        }
        if(this.doubleJump && Phaser.Input.Keyboard.JustDown(cursors.up)){
            my.sprite.piratePlayer.body.setVelocityY(this.JUMP_VELOCITY);
            this.doubleJump = false;
            this.vfxJumping.startFollow(my.sprite.piratePlayer, my.sprite.piratePlayer.displayWidth/2-10, my.sprite.piratePlayer.displayHeight/2-5, false);
            this.vfxJumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            this.vfxJumping.start();
  
        }
        
    }
}