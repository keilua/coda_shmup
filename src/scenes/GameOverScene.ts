import GameConstants from "../GameConstants.ts";
import RegistryConstants from "../RegistryConstants.ts";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super(GameConstants.SceneKeys.GAME_OVER);
    }

    create() {
        this.scene.stop(GameConstants.SceneKeys.MAIN_UI);

        const screenCenterX: number = this.scale.width / 2;
        this.add.text(screenCenterX, this.scale.width / 2, 'GAME OVER',
            {fontSize: '96px', color: '#fff', align: 'center'}).setOrigin(0.5);
        this.add.text(screenCenterX, 32, "SCORE",
            {fontSize: '48px', align: 'center'}).setOrigin(0.5);

        this.add.text(screenCenterX, 72, this.registry.get(RegistryConstants.Keys.PLAYER_SCORE).toString(),
            {fontSize: '32px', color: '#fff', align: 'center'}).setOrigin(0.5);

        this.add.text(screenCenterX, this.scale.height - 256, 'Press SPACE or TAP to play again',
            {fontSize: '32px', color: '#fff', align: 'center'}).setOrigin(0.5);

        this.input.keyboard?.once('keydown-SPACE', () => {
            this.scene.start(GameConstants.SceneKeys.HOME);
        });

        this.input.once('pointerdown', () => {
            this.scene.start(GameConstants.SceneKeys.HOME);
        });

        console.log("GameOverScene created");
    }
}
