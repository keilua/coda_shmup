import {Physics} from 'phaser';
import {BulletData} from "../gameData/BulletData.ts";
import Bullet from "../entities/Bullet.ts";
import Entity from "../entities/Entity.ts";
import IComponent from "./IComponent.ts";

export default class Weapon implements IComponent {
    public enabled: boolean = true;

    private readonly _bullets: Physics.Arcade.Group;
    private readonly _bulletData: BulletData;

    constructor(bullets: Physics.Arcade.Group, bulletData: BulletData) {
        if (!bullets) {
            console.error("Weapon 'bullets' group cannot be null or undefined");
        }

        this._bullets = bullets;
        this._bulletData = bulletData;
    }

    public shoot(source: Entity) {
        if (!this.enabled || !this._bullets) return;

    const spread = (source as any).getData?.('spreadConfig');
    if (spread && spread.count && spread.count > 1) {
        const count = Phaser.Math.Clamp(spread.count, 1, 360);
        const totalAngleDeg = spread.angleDeg ?? 360;
        const half = totalAngleDeg / 2;
        const centerDeg = Phaser.Math.RadToDeg(source.rotation);

        for (let i = 0; i < count; i++) {
            const t = (count === 1) ? 0.5 : i / (count - 1);
            const angleDeg = centerDeg - half + t * totalAngleDeg;
            const angleRad = Phaser.Math.DegToRad(angleDeg);

            const dir = new Phaser.Math.Vector2(Math.cos(angleRad), Math.sin(angleRad));
            const vel = dir.clone().scale(this._bulletData.speed);

            const bullet: Bullet = this._bullets.get() as Bullet;
            if (bullet) {
                const frameName = !!(source as any).getData?.('isPlayer') ? 'laserBlue02.png' : 'laserRed02.png';
                bullet.enable(
                    source.x + dir.x * source.arcadeBody.radius,
                    source.y + dir.y * source.arcadeBody.radius,
                    vel.x,
                    vel.y,
                    this._bulletData,
                    frameName
                );
            }
        }
        return;
    }

        const bullet: Bullet = this._bullets.get() as Bullet;
        if (bullet) {
            const sourceForward: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0).rotate(source.rotation);
            const bulletVelocity: Phaser.Math.Vector2 = sourceForward.clone().scale(this._bulletData.speed);

            const isPlayer = !!(source as any).getData?.('isPlayer');
            const frameName = isPlayer ? 'laserBlue02.png' : 'laserRed02.png';

            bullet.enable(
                source.x + sourceForward.x * source.arcadeBody.radius,
                source.y + sourceForward.y * source.arcadeBody.radius,
                bulletVelocity.x,
                bulletVelocity.y,
                this._bulletData,
                frameName
            );

            // Maths way
            // const forwardVectorX: number = Math.cos(source.rotation);
            // const forwardVectorY: number = Math.sin(source.rotation);
            // const bulletVelocityX: number = forwardVectorX * this._bulletData.speed;
            // const bulletVelocityY: number = forwardVectorY * this._bulletData.speed;
            // bullet.enable(source.x + forwardVectorX * source.arcadeBody.radius, source.y + forwardVectorY * source.arcadeBody.radius,
            //     bulletVelocityX, bulletVelocityY, this._bulletData);
        }
    }
}
