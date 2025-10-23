import IComponent from "./IComponent.ts";
import Entity from "../entities/Entity.ts";
import Shield from "../components/Shield";

export default class Health extends Phaser.Events.EventEmitter implements IComponent {
    public enabled: boolean = true;

    public static readonly CHANGE_EVENT: string = 'change';
    public static readonly DEATH_EVENT: string = 'death';

    private _current: number;
    private readonly _max: number;
    private readonly _entity: Entity;

    public get current(): number {
        return this._current;
    }

    public get max(): number {
        return this._max;
    }

    public constructor(value: number, entity: Entity) {
        super();

        this._current = value;
        this._max = value;
        this._entity = entity;
    }

    public damage(amount: number, emitEvents: boolean = true): void {
        const shield = this._entity.getComponent(Shield);
        if (shield?.isActive?.()) {
            console.log("Bouclier actif, dégâts ignorés !");
            return; 
    }

    this.adjust(-amount, emitEvents);
    }

    public heal(amount: number, emitEvents: boolean = true): void {
        if (!this.enabled || amount <= 0) return;
        this.adjust(amount, emitEvents);
    }

    private adjust(delta: number, emitEvents: boolean = true): void {
        if (!this.enabled)
            return;

        const prev: number = this._current;
        this._current = Phaser.Math.Clamp(this._current + delta, 0, this._max);

        if (emitEvents && this._current !== prev) {
            this.emit(Health.CHANGE_EVENT, this._current);

            if (this._current <= 0 && prev > 0) {
                const scene = this._entity.scene;
                const explosion = scene.add.image(this._entity.x, this._entity.y, "sprites",
                    "star1.png");

                scene.tweens.add({
                    targets: explosion,
                    scale: [4, 8, 2, 0],
                    ease: 'Back.easeOut',
                    duration: 800
                });

                scene.tweens.add({
                    targets: explosion,
                    alpha: { from: 1, to: 0 },
                    ease: 'Quad.easeIn',
                    duration: 1000
                }).once('complete', function(_tween: any, _targets: any){
                    explosion.destroy();
                }, this);

                this.emit(Health.DEATH_EVENT);
            }
        }
    }
}