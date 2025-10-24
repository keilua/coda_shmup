import {Scene, GameObjects} from 'phaser';
import Health from "../components/Health.ts";
import RegistryConstants from "../RegistryConstants.ts";
import SaveManager from "../managers/SaveManager.ts";
import SaveConstants from "../SaveConstants.ts";
import EntityManager from "../managers/EntityManager.ts";
import GameConstants from "../GameConstants.ts";

export default class MainGameScene extends Scene {
    private bg: GameObjects.TileSprite;
    private planet: GameObjects.Image;
    private saveManager: SaveManager;
    private entityManager: EntityManager;

    constructor() {
        super(GameConstants.SceneKeys.MAIN_GAME);
    }

    // noinspection JSUnusedGlobalSymbols
    create() {
        if (!this.saveManager) {
            console.error('SaveManager plugin not found');
        }
        this.saveManager?.load();

        const bgMargin = 512;
        this.bg = this.add.tileSprite(this.cameras.main.centerX, this.cameras.main.centerY,
            this.cameras.main.width + bgMargin, this.cameras.main.height + bgMargin, 'bg').setTileScale(2);
        this.planet = this.add.image(0, -512, 'planet00').setOrigin(0);

        if (!this.entityManager) {
            console.error('EntityManager plugin not found');
        }

        const player = this.entityManager.initAndSpawnPlayer();

        try {
            let playerGO: any = undefined;
            if (!player) {
                console.warn('player is null/undefined after spawn');
            } else {
                playerGO = (player as any).sprite ?? (player as any).gameObject ?? null;
                if (!playerGO && typeof (player as any).getGameObject === 'function') {
                    playerGO = (player as any).getGameObject();
                }
                if (!playerGO && (player as any).x !== undefined && (player as any).y !== undefined) {
                    playerGO = player;
                }
            }

            if (playerGO) {
                const targetY = playerGO.y ?? this.cameras.main.centerY;
                const targetX = playerGO.x ?? this.cameras.main.centerX;

                const spriteHeight = (playerGO.displayHeight && playerGO.displayHeight > 0) ? playerGO.displayHeight : (playerGO.height || 64);
                const offscreenY = this.cameras.main.height + spriteHeight + 20;

                playerGO.x = this.cameras.main.centerX;
                playerGO.y = offscreenY;

                if (playerGO.body && (playerGO.body as any).enable !== undefined) {
                    (playerGO.body as any).enable = false;
                }

                this.tweens.add({
                    targets: playerGO,
                    y: targetY,
                    x: targetX, 
                    ease: 'Sine.easeOut',
                    duration: 800, 
                    onComplete: () => {
                        if (playerGO.body && (playerGO.body as any).enable !== undefined) {
                            (playerGO.body as any).enable = true;
                        }
                    }
                });
            } else {
                console.warn('Impossible de récupérer le GameObject du player pour l\'animation d\'entrée.');
            }
        } catch (e) {
            console.error('Erreur lors de l\'animation d\'entrée du player :', e);
        }

        player.getComponent(Health)?.once(Health.DEATH_EVENT, this.endGame, this);
        this.entityManager.initEnemies();
        this.entityManager.initGroupCollisions();

        if (this.input.keyboard) {
            this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).on('down', () => this.scene.restart());
        } else {
            console.error('No keyboard input');
        }

        this.registry.set(RegistryConstants.Keys.PLAYER_SCORE, 0);

        console.log("MainGameScene created");
    }

    private endGame() {
        const bestScore: number = Number(this.saveManager.getData(SaveConstants.Keys.PLAYER_BEST_SCORE) ?? 0);
        const currentScore: number = Number(this.registry.get(RegistryConstants.Keys.PLAYER_SCORE) ?? 0);
        if (currentScore > bestScore) {
            this.saveManager.setData(SaveConstants.Keys.PLAYER_BEST_SCORE, currentScore);
            console.log("New Best Score: " + currentScore);
        }

        this.scene.start(GameConstants.SceneKeys.GAME_OVER);
    }

    update(_timeSinceLaunch: number, deltaTime: number) {
        this.bg.tilePositionY -= 0.1 * deltaTime;
        this.planet.y += 0.40 * deltaTime;
    }
}
