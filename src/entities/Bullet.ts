import {BulletData} from "../gameData/BulletData.ts";

export default class Bullet extends Phaser.GameObjects.Image {
    private _arcadeBody: Phaser.Physics.Arcade.Body;
    private _damage: number = 0;

    public get damage(): number {
        return this._damage;
    }

    constructor(scene: Phaser.Scene, x: number = 0, y: number = 0) {
        super(scene, x, y, 'sprites', undefined as any);
        scene.add.existing(this);
    }

    public init() {
        this.scene.physics.add.existing(this);
        this._arcadeBody = this.body as Phaser.Physics.Arcade.Body;
        this._arcadeBody.allowGravity = false;
        this._arcadeBody.setFriction(0, 0);
    }

    public enable(
        x: number,
        y: number,
        velocityX: number,
        velocityY: number,
        data: BulletData,
        frameName?: string
    ) {
        this.setPosition(x, y);

        this.setDisplaySize(data.width, data.height);
        this.setOrigin(0.5);

        if (frameName) {
            this.setTexture('sprites', frameName);
            this.setScale(1);
        }

        if (!this._arcadeBody) {
            this.scene.physics.add.existing(this);
            this._arcadeBody = this.body as Phaser.Physics.Arcade.Body;
            this._arcadeBody.allowGravity = false;
            this._arcadeBody.setFriction(0, 0);
        }

        this.scene.physics.world.add(this._arcadeBody);
        this.setActive(true);
        this.setVisible(true);

        this._arcadeBody.setSize(data.width, data.height);
        this._arcadeBody.setVelocity(velocityX, velocityY);
        this._damage = data.damage;

        this.setRotation(this._arcadeBody.velocity.angle());
    }

    public disable() {
        if (this._arcadeBody) {
            this.scene.physics.world.disableBody(this._arcadeBody);
        }
        this.setActive(false);
        this.setVisible(false);
    }

    update(timeSinceLaunch: number, deltaTime: number) {
        super.update(timeSinceLaunch, deltaTime);

        if (this.y > this.scene.cameras.main.height + this.displayHeight 
            || this.y < -this.displayHeight) {
            this.disable();
        }
    }
}