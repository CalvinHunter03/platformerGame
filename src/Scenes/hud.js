class Hud extends Phaser.Scene{
    constructor(){
        super("hud");
    }

    init(){

        this.deathCounter = 0;
        this.diamondScore = 0;

    }

    create(){
        this.scoreText = this.add.text(1350, 50, "Coins: 0 / 0", {
            fontFamily: "Georgia",
            color: "Yellow",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 20,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);

        this.deathText = this.add.text(1329, 25, "Deaths: 0", {
            fontFamily: "Georgia",
            color: "Yellow",
            strokeThickness: 5,
            stroke: "black",
            fontSize: 20,
            wordWrap: {
                width: 150
            }
        }).setOrigin(0.5, 0.5);


    }

    update(){


    }
}