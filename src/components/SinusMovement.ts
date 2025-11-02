import IComponent from "./IComponent.ts";
import Entity from "../entities/Entity.ts";

export default class SinusMovement implements IComponent {
    public enabled: boolean = true;

    private _amplitude: number;
    private _frequency: number; 
    private _speed: number; 
    private _phase: number;
    private _timeAccumulator: number = 0;
    private _startX: number = 0;

    constructor(config: { amplitude?: number, frequency?: number, speed?: number } = {}) {
        this._amplitude = config.amplitude ?? 80;
        this._frequency = config.frequency ?? 0.5;
        this._speed = config.speed ?? 60;
        this._phase = Math.random() * Math.PI * 2;
    }

    public setStartX(x: number) {
        this._startX = x;
    }

    public move(entity: Entity, deltaTimeMs: number) {
        if (!this.enabled) return;

        const deltaSeconds = deltaTimeMs / 1000;
        this._timeAccumulator += deltaSeconds;

        const angle = this._timeAccumulator * this._frequency * Math.PI * 2 + this._phase;
        const offsetX = Math.sin(angle) * this._amplitude;
        entity.x = this._startX + offsetX;

        entity.y += this._speed * deltaSeconds;
    }
}
