import {Loader} from "phaser";
import GameConstants from "../GameConstants.ts";

export default class HomeScene extends Phaser.Scene {

    private ship?: Phaser.GameObjects.Sprite;
    private shipTween?: Phaser.Tweens.Tween;

    private bg!: Phaser.GameObjects.TileSprite;
    private planetTimer: Phaser.Time.TimerEvent;
    
    private nextPlanetIndex: number = 0;
    private readonly MAX_PLANETS = 10; 

    constructor() {
        super(GameConstants.SceneKeys.HOME);
    }

    preload() {
        const width: number = this.scale.width;
        const y: number = this.scale.height / 2;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(0, y, width, 64);
        this.load.on(Loader.Events.PROGRESS, function (value: number) { // 0-1
            console.log("Loading : " + value);

            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(0, y, width * value, 64);
        });
        this.load.on(Loader.Events.COMPLETE, function () {
            console.log("Loading complete");

            progressBar.destroy();
            progressBox.destroy();
        });

        this.load.setPath('assets');

        this.load.image('bg', 'Backgrounds/darkPurple.png');

        for (let i = 0; i < this.MAX_PLANETS; i++) {
            const idx = i.toString().padStart(2, '0'); 
            const key = `planet${idx}`;
            const path = `Planets/${key}.png`;
            this.load.image(key, path);
        }


        this.load.atlas('sprites', 'Spritesheet/gameSprites.png', 'Spritesheet/gameSprites.json');
        this.load.bitmapFont('future-bmp', 'Fonts/kenvector_future.png', 'Fonts/kenvector_future.xml');
        this.load.font('future', 'Fonts/kenvector_future.ttf');
        this.load.json('playerShips', 'Data/playerShips.json');
        this.load.audio('sfx_laser1', 'Sounds/sfx_laser1.ogg');
        this.load.audio('sfx_laser2', 'Sounds/sfx_laser2.ogg');

    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        const bgMargin = 512;
        this.bg = this.add.tileSprite(w / 2, h / 2, w + bgMargin, h + bgMargin, 'bg').setTileScale(2);

        const title = this.add.text(this.scale.width / 2, this.scale.width / 2, 'CODA SHMUP',
            {fontSize: '72px', color: '#fff', fontFamily: 'future'}).setOrigin(0.5);
        const subtitle = this.add.text(this.scale.width / 2, this.scale.width / 2 + 72, 'Press SPACE to start',
            {fontSize: '32px', color: '#fff'}).setOrigin(0.5);

        title.setDepth(5);
        subtitle.setDepth(5);

        const shipFrame = "playerShip1_blue.png";
        this.ship = this.add.sprite(w / 2, h / 2, 'sprites', shipFrame);
        this.ship.setOrigin(0.5, 0.5);
        this.ship.setScale(1);
        this.ship.setAngle(-90); 
        this.ship.setDepth(10);
        this.ship.setVisible(true);

        const swingAmount = 70; 
        this.shipTween = this.tweens.add({
            targets: this.ship,
            x: { from: w / 2 - swingAmount, to: w / 2 + swingAmount },
            ease: "Sine.easeInOut",
            duration: 4000, 
            yoyo: true,
            repeat: -1
        });

        this.input.keyboard?.once('keydown-SPACE', () => {
            if (!this.ship) {
                this.scene.launch(GameConstants.SceneKeys.MAIN_UI);
                this.scene.start(GameConstants.SceneKeys.MAIN_GAME);
                return;
            }

            if (this.shipTween) {
                try { this.shipTween.stop(); } catch (e) { }
                this.shipTween = undefined;
            }

            const shipHeight = (this.ship.displayHeight && this.ship.displayHeight > 0) ? this.ship.displayHeight : (this.ship.height || 64);
            const targetY = -shipHeight; 
            const targetX = w / 2; 

            this.tweens.add({
                targets: this.ship,
                x: targetX,
                y: targetY,
                duration: 900, 
                ease: "Power1",
                onComplete: () => {
                    this.scene.launch(GameConstants.SceneKeys.MAIN_UI);
                    this.scene.start(GameConstants.SceneKeys.MAIN_GAME);
                }
            });
        });

        this.spawnPlanet(); 
        this.planetTimer = this.time.addEvent({
            delay: 10000, 
            loop: true,
            callback: this.spawnPlanet,
            callbackScope: this
        });

        console.log("HomeScene created");
    }

    private spawnPlanet() {
        const w = this.scale.width;
        const h = this.scale.height;

        const idx = this.nextPlanetIndex % this.MAX_PLANETS;
        const key = `planet${idx.toString().padStart(2, '0')}`;
        this.nextPlanetIndex = (this.nextPlanetIndex + 1) % this.MAX_PLANETS;

        const marginX = 50;
        const planetX = Phaser.Math.Between(marginX, Math.max(marginX, w - marginX));
        const planetGO = this.add.image(planetX, 0, key).setOrigin(0.5, 0);

        planetGO.setDepth(1);

        const scale = Phaser.Math.FloatBetween(0.7, 1.2);
        planetGO.setScale(scale);
        planetGO.setAlpha(0.95);

        const planetHeight = (planetGO.displayHeight && planetGO.displayHeight > 0)
            ? planetGO.displayHeight
            : ((planetGO.height || 200) * planetGO.scaleY);
        planetGO.y = -planetHeight - 50;

        const travelDuration = 12000;

        this.tweens.add({
            targets: planetGO,
            y: h + 200, 
            ease: 'Linear',
            duration: travelDuration,
            onComplete: () => {
                planetGO.destroy();
            }
        });
    }

    update(_timeSinceLaunch: number, deltaTime: number) {
        if (this.bg) {
            this.bg.tilePositionY -= 0.1 * deltaTime;
        }
    }
}
