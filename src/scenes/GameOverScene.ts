import Phaser from 'phaser';
import { LAYOUT_FRACTIONS } from '../config/balance';
import { i18n } from '../config/i18n';
import { saveService } from '../services/SaveService';
import {
  PixelButton,
  PixelText,
  createCoinBadge,
  createNineSlicePanel,
  createSceneBackdrop,
  fracY,
  getViewportMetrics,
  type BackdropRefs
} from '../ui/UITheme';

export interface GameOverSceneData {
  score: number;
  level: number;
  runCoins: number;
  isNewBestScore: boolean;
  revivesUsed: number;
}

export class GameOverScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private payload!: GameOverSceneData;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  public init(data?: Partial<GameOverSceneData>): void {
    this.payload = {
      score: data?.score ?? 0,
      level: data?.level ?? 1,
      runCoins: data?.runCoins ?? 0,
      isNewBestScore: Boolean(data?.isNewBestScore),
      revivesUsed: data?.revivesUsed ?? 0
    };
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;

    this.backdrop = createSceneBackdrop(this);

    const topY = fracY(this, LAYOUT_FRACTIONS.HUD_TOP_Y);
    createCoinBadge(this, w - 31, topY, save.coins, 30);

    // Summary 9-slice card
    const cardY = fracY(this, 0.34);
    createNineSlicePanel(this, w * 0.5, cardY, 154, 114, 'dark', 20);

    new PixelText(this, w * 0.5, cardY - 40, i18n.t('gameover.title'), {
      size: 16,
      tint: 0xff9691,
      depth: 22
    });

    if (this.payload.isNewBestScore) {
      new PixelText(this, w * 0.5, cardY - 22, i18n.t('gameover.new_record'), {
        size: 8,
        tint: 0xffe073,
        depth: 22
      });
    }

    new PixelText(this, w * 0.5, cardY - 6, i18n.t('gameover.score', { score: this.payload.score }), {
      size: 8,
      tint: 0xffffff,
      depth: 22
    });

    new PixelText(this, w * 0.5, cardY + 10, i18n.t('gameover.best', { best: save.bestScore }), {
      size: 8,
      tint: 0x59f2e6,
      depth: 22
    });

    new PixelText(this, w * 0.5, cardY + 26, i18n.t('gameover.level', { level: this.payload.level }), {
      size: 8,
      tint: 0xd6e2f5,
      depth: 22
    });

    new PixelText(
      this,
      w * 0.5,
      cardY + 42,
      i18n.t('gameover.run_coins', { coins: this.payload.runCoins }),
      {
        size: 8,
        tint: 0xffe073,
        depth: 22
      }
    );

    // Retry button
    new PixelButton(this, w * 0.5, fracY(this, 0.65), {
      width: 126,
      height: 26,
      label: i18n.t('gameover.retry'),
      fontSize: 16,
      depth: 25,
      onClick: () => {
        this.scene.start('GameScene', { level: 1, score: 0, runCoins: 0, revivesUsed: 0 });
      }
    });

    // Menu button
    new PixelButton(this, w * 0.5, fracY(this, 0.775), {
      width: 100,
      height: 22,
      label: i18n.t('gameover.menu'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        this.scene.start('MenuScene');
      }
    });

    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'GameOverScene',
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale,
      score: this.payload.score,
      level: this.payload.level
    };
  }

  public update(_time: number, delta: number): void {
    this.backdrop.bgTile.tilePositionY -= Math.min(delta, 50) * 0.004;
  }
}
