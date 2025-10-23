import { Scene } from "phaser";
import IComponent from "./IComponent";

export default class Shield implements IComponent {
  public enabled: boolean = true;

  private scene: Scene;
  private owner: any; 
  private sprite: Phaser.GameObjects.Sprite;
  private timerEvent?: Phaser.Time.TimerEvent;
  private cycleEvent?: Phaser.Time.TimerEvent;
  private frameNames = ["shield3.png", "shield2.png", "shield1.png"];
  private _active = false;

  constructor(scene: Scene, owner: any) {
    this.scene = scene;
    this.owner = owner;

    this.sprite = this.scene.add.sprite(owner.x, owner.y, "sprites", this.frameNames[0]);
    this.sprite.setVisible(false);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setDepth(50);

    this.scene.events.on("postupdate", this.followOwner, this);
  }

  public update(_time?: number, _delta?: number): void {
  }

  private followOwner() {
    if (!this.sprite || !this.sprite.active) return;
    this.sprite.x = this.owner.x;
    this.sprite.y = this.owner.y;
    this.sprite.rotation = this.owner.rotation ?? 0;
  }

  public activate(durationMs: number = 1500) {
    if (this._active) {
      this.timerEvent?.remove(false);
      this.cycleEvent?.remove(false);
    } else {
      if (this.owner?.arcadeBody) {
        try { this.owner.arcadeBody.setEnable(false); } catch (e) {}
      }
    }

    this._active = true;
    this.sprite.setVisible(true);
    this.sprite.setFrame(this.frameNames[0]);

    const steps = this.frameNames.length;
    const stepDuration = Math.max(1, Math.floor(durationMs / steps));

    let idx = 0;
    this.cycleEvent = this.scene.time.addEvent({
      delay: stepDuration,
      repeat: steps - 1,
      callback: () => {
        idx++;
        if (idx < this.frameNames.length) {
          this.sprite.setFrame(this.frameNames[idx]);
        }
      }
    });

    this.timerEvent = this.scene.time.delayedCall(durationMs, () => this.deactivate());
  }

  private deactivate() {
    this._active = false;
    this.sprite.setVisible(false);
    this.cycleEvent?.remove(false);
    this.timerEvent?.remove(false);
    this.cycleEvent = undefined;
    this.timerEvent = undefined;

    if (this.owner?.arcadeBody) {
      try { this.owner.arcadeBody.setEnable(true); } catch (e) { }
    }
  }

  public isActive(): boolean {
    return this._active;
  }

  public destroy(): void {
    this.scene.events.off("postupdate", this.followOwner, this);
    this.sprite.destroy();
    this.timerEvent?.remove(false);
    this.cycleEvent?.remove(false);
    this.enabled = false;
  }
}
