import Enemy from "./Enemy.ts";
import Health from "../components/Health.ts";
import Weapon from "../components/Weapon.ts";
import SinusMovement from "../components/SinusMovement.ts";
import type { BulletData } from '../gameData/BulletData.ts';

export default class MisterX extends Enemy {
    private _sinusMovement!: SinusMovement;

    private _misterBulletData: BulletData = {
        width: 12,
        height: 12,
        color: 0xffd166,
        speed: 420,
        damage: 1
    };

    public init(bulletsGroup: Phaser.Physics.Arcade.Group) {
        const cfg = (this.scene.cache.json.exists('misterX')) ? this.scene.cache.json.get('misterX') : {};

        this.angle = 90;

        const healthVal = cfg.health ?? 2;
        this.addComponent(new Health(healthVal, this));

        const moveCfg = {
            amplitude: cfg.movement?.amplitude ?? 90,
            frequency: cfg.movement?.frequency ?? 0.6,
            speed: cfg.movement?.speed ?? 40
        };
        this._sinusMovement = new SinusMovement(moveCfg);
        this.addComponent(this._sinusMovement as any); 

        this.addComponent(new Weapon(bulletsGroup, this._misterBulletData));

        this.setData('isPlayer', false);
        const spreadCfg = cfg.spread ?? { count: 5, angle: 45 }; 
        this.setData('spreadConfig', {
            count: spreadCfg.count ?? 5,
            angleDeg: spreadCfg.angle ?? 45
        });

        const delayMin = cfg.shoot?.delayMin ?? 1200;
        const delayMax = cfg.shoot?.delayMax ?? 2200;

        this['_shootTimerConfig'] = {
            delay: Phaser.Math.Between(delayMin, delayMax),
            callback: this.performShoot,      
            callbackScope: this,
            loop: true
        };
        this['_shootTimer'] = this.scene.time.addEvent(this['_shootTimerConfig']);

        if (!this.scene.anims.exists('misterXShoot')) {
            this.scene.anims.create({
                key: 'misterXShoot',
                frames: [
                    { key: 'sprites', frame: 'ufoRed.png' },
                    { key: 'sprites', frame: 'ufoRed-shoot0.png' }
                ],
                frameRate: 6
            });
        }

        this.arcadeBody.setCircle(this.displayWidth / 2);
    }

    public enable(x: number, y: number) {
        super.enable(x, y);
        this._sinusMovement.setStartX(this.x);
    }

    preUpdate(timeSinceLaunch: number, deltaTime: number) {
        super.preUpdate(timeSinceLaunch, deltaTime);

        if (this.y > this.scene.cameras.main.height + this.displayHeight) {
            this.disable();
        }

        const speedFactor = this.isTinted ? 0.5 : 1;
        (this._sinusMovement as any).move(this, deltaTime * speedFactor);
    }

    private performShoot() {
        this.play('misterXShoot');
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.setTexture('sprites', 'ufoRed.png');
            this.getComponent(Weapon)?.shoot(this);
            this.scene.sound.play('sfx_laser2');
        });
    }
}
