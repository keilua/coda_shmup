import {Input, Scene} from "phaser";
import {PlayerShipData, PlayerShipsData} from "../gameData/PlayerShipsData.ts";
import type {BulletData} from "../gameData/BulletData.ts";
import Entity from './Entity.ts';
import Health from "../components/Health.ts";
import Movement from "../components/Movement.ts";
import Weapon from "../components/Weapon.ts";
import Shield from "../components/Shield.ts";


export default class Player extends Entity {
    private readonly _bulletData: BulletData = {
        width: 12,
        height: 4,
        color: 0xffe066,
        speed: 1024,
        damage: 1
    };

    private readonly _cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
    private _playerShipData: PlayerShipData;
    private _rateOfFire: number;
    private _lastShotTime: number;

    constructor(scene: Scene, x: number, y: number) {
        super(scene, x, y, 'sprites');

        if (this.scene.input.keyboard) {
            this._cursorKeys = this.scene.input.keyboard.createCursorKeys();

            this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ONE).on('down', () => this.selectPlayerShip(1));
            this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.TWO).on('down', () => this.selectPlayerShip(2));
            this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.THREE).on('down', () => this.selectPlayerShip(3));
        }
    }

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        this.addComponent(new Health(3, this));
        this.addComponent(new Movement());
        this.addComponent(new Weapon(bulletsGroup, this._bulletData));

        this.addComponent(new Shield(this.scene, this));
        this.setData('isPlayer', true);

        this.angle = -90;

        this.selectPlayerShip(1);

        this._rateOfFire = 0.5;
        this._lastShotTime = 0;

        this.getComponent(Health)?.on(Health.CHANGE_EVENT, () => {
            this.arcadeBody.setEnable(false);
            
            this.getComponent(Shield)?.activate(1500);

            this.scene.time.delayedCall(50, () => {
                this.arcadeBody.setEnable(true);
            });
        });
    }

    public selectPlayerShip(playerShipDataId: number) {
        const playerShipsData = this.scene.cache.json.get('playerShips') as PlayerShipsData;
        this._playerShipData = playerShipsData[playerShipDataId];

        this.setTexture('sprites', this._playerShipData.texture);
        const bodyData = this._playerShipData.body;
        this.arcadeBody.setCircle(bodyData.radius, bodyData.offsetX, bodyData.offsetY);

        this.getComponent(Movement)?.setSpeed(this._playerShipData.movementSpeed);
    }

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);

        // Press left or right arrow keys to move the player smoothly horizontally using deltaTime
        if (this._cursorKeys.left.isDown) {
            if (this._cursorKeys.shift.isDown) {
                this.angle -= this._playerShipData.movementSpeed * deltaTime;
            } else {
                this.getComponent(Movement)?.moveHorizontally(this, -deltaTime);
            }
        } else if (this._cursorKeys.right.isDown) {
            if (this._cursorKeys.shift.isDown) {
                this.angle += this._playerShipData.movementSpeed * deltaTime;
            } else {
                this.getComponent(Movement)?.moveHorizontally(this, deltaTime);
            }
        }

        //verti
                if (this._cursorKeys.up.isDown) {
            if (typeof (this.getComponent(Movement) as any)?.moveVertically === 'function') {
                this.getComponent(Movement)?.moveVertically(this, -deltaTime);
            } else {
                this.y += -this._playerShipData.movementSpeed * deltaTime;
            }
        } else if (this._cursorKeys.down.isDown) {
            if (typeof (this.getComponent(Movement) as any)?.moveVertically === 'function') {
                this.getComponent(Movement)?.moveVertically(this, deltaTime);
            } else {
                this.y += this._playerShipData.movementSpeed * deltaTime;
            }
        }
        
        // Stop player from going offscreen
        this.x = Phaser.Math.Clamp(this.x, this.displayWidth / 2, this.scene.cameras.main.width - this.displayWidth / 2);
        this.y = Phaser.Math.Clamp(this.y, this.displayHeight / 2, this.scene.cameras.main.height - this.displayHeight / 2);

        // Press space to shoot
        if (this._cursorKeys.space.isDown) {
            if (timeSinceLaunch - this._lastShotTime > this._rateOfFire * 1000) {
                this.getComponent(Weapon)?.shoot(this);
                this.scene.sound.play('sfx_laser1');

                this._lastShotTime = timeSinceLaunch;
            }
        }
    }
}