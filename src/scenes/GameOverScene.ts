import Phaser from 'phaser';
import { LAYOUT_FRACTIONS } from '../config/balance';
import { i18n } from '../config/i18n';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import {
  PixelButton,
  PixelText,
  createCoinBadge,
  createNineSlicePanel,
  createSceneBackdrop,
  fracY,
  getViewportMetrics,
  type BackdropRefs,
  type CoinBadgeRefs
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
  private coinBadge!: CoinBadgeRefs;
  private runCoinsText!: PixelText;
  private doubleBtn?: PixelButton;
  private retryBtn!: PixelButton;
  private menuBtn!: PixelButton;
  private doubled = false;
  private navigating = false;

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
    this.doubled = false;
    this.navigating = false;
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;

    void adsManager.syncBannerForScene('GameOverScene');
    this.backdrop = createSceneBackdrop(this);

    const topY = fracY(this, LAYOUT_FRACTIONS.HUD_TOP_Y);
    this.coinBadge = createCoinBadge(this, w - 31, topY, save.coins, 30);

    // Summary 9-slice card
    const cardY = fracY(this, 0.32);
    createNineSlicePanel(this, w * 0.5, cardY, 154, 108, 'dark', 20);

    new PixelText(this, w * 0.5, cardY - 38, i18n.t('gameover.title'), {
      size: 16,
      tint: 0xff9691,
      depth: 22
    });

    if (this.payload.isNewBestScore) {
      new PixelText(this, w * 0.5, cardY - 21, i18n.t('gameover.new_record'), {
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

    new PixelText(this, w * 0.5, cardY + 9, i18n.t('gameover.best', { best: save.bestScore }), {
      size: 8,
      tint: 0x59f2e6,
      depth: 22
    });

    new PixelText(this, w * 0.5, cardY + 24, i18n.t('gameover.level', { level: this.payload.level }), {
      size: 8,
      tint: 0xd6e2f5,
      depth: 22
    });

    this.runCoinsText = new PixelText(
      this,
      w * 0.5,
      cardY + 39,
      i18n.t('gameover.run_coins', { coins: this.payload.runCoins }),
      {
        size: 8,
        tint: 0xffe073,
        depth: 22
      }
    );

    if (this.payload.runCoins > 0) {
      this.doubleBtn = new PixelButton(this, w * 0.5, fracY(this, 0.555), {
        width: 136,
        height: 22,
        label: i18n.t('gameover.double_coins'),
        fontSize: 8,
        depth: 25,
        onClick: () => {
          void this.handleDoubleCoins();
        }
      });
    }

    // Retry button
    this.retryBtn = new PixelButton(this, w * 0.5, fracY(this, 0.66), {
      width: 126,
      height: 24,
      label: i18n.t('gameover.retry'),
      fontSize: 16,
      depth: 25,
      onClick: () => {
        void this.navigateWithInterstitial('GameScene', {
          level: 1,
          score: 0,
          runCoins: 0,
          revivesUsed: 0
        });
      }
    });

    // Menu button
    this.menuBtn = new PixelButton(this, w * 0.5, fracY(this, 0.765), {
      width: 100,
      height: 20,
      label: i18n.t('gameover.menu'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        void this.navigateWithInterstitial('MenuScene');
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
      level: this.payload.level,
      runCoins: this.payload.runCoins
    };
  }

  public update(_time: number, delta: number): void {
    this.backdrop.bgTile.tilePositionY -= Math.min(delta, 50) * 0.004;
  }

  private async handleDoubleCoins(): Promise<void> {
    if (this.doubled || this.navigating || this.payload.runCoins <= 0) return;
    this.doubleBtn?.setDisabled(true);
    const rewarded = await adsManager.showRewarded('double_coins');
    if (!this.scene.isActive()) return;

    if (rewarded) {
      this.doubled = true;
      const total = saveService.addCoins(this.payload.runCoins);
      this.coinBadge.updateCoins(total);
      const doubledAmt = this.payload.runCoins * 2;
      this.runCoinsText.setText(i18n.t('gameover.doubled', { coins: doubledAmt }));
      this.doubleBtn?.setLabel(i18n.t('gameover.doubled', { coins: doubledAmt })).setDisabled(true);
      audioService.playSfx('coin');
      audioService.playSfx('levelup');
      hapticsService.medium();
    } else {
      this.doubleBtn?.setDisabled(false);
    }
  }

  private async navigateWithInterstitial(targetScene: string, data?: object): Promise<void> {
    if (this.navigating) return;
    this.navigating = true;
    this.retryBtn.setDisabled(true);
    this.menuBtn.setDisabled(true);
    this.doubleBtn?.setDisabled(true);

    await adsManager.onGameOverNavigation(targetScene);
    if (!this.scene.isActive()) return;
    this.scene.start(targetScene, data);
  }
}
