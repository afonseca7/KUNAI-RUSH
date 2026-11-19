import Phaser from 'phaser';
import { LAYOUT_FRACTIONS } from '../config/balance';
import { i18n } from '../config/i18n';
import { getTargetSkin } from '../config/skins';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import { TargetWheel } from '../objects/TargetWheel';
import { DailyStreakModal } from '../ui/DailyStreakModal';
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

let streakShownInSession = false;

export class MenuScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private showcaseWheel!: TargetWheel;
  private mascot!: Phaser.GameObjects.Sprite;
  private coinBadge!: CoinBadgeRefs;
  private toastText?: PixelText;

  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;

    void adsManager.syncBannerForScene('MenuScene');
    this.backdrop = createSceneBackdrop(this);

    // Top HUD row
    const topY = fracY(this, LAYOUT_FRACTIONS.HUD_TOP_Y);
    createNineSlicePanel(this, 44, topY, 72, 16, 'dark', 28);
    new PixelText(this, 44, topY, i18n.t('menu.best_level', { level: save.bestLevel }), {
      size: 8,
      tint: 0x9bf5c6,
      depth: 29
    });
    this.coinBadge = createCoinBadge(this, w - 31, topY, save.coins, 29);

    // Title Plaque
    const titleY = fracY(this, 0.175);
    createNineSlicePanel(this, w * 0.5, titleY, 154, 38, 'wood', 20);
    new PixelText(this, w * 0.5, titleY - 6, i18n.t('app.title'), {
      size: 16,
      tint: 0xffe073,
      depth: 21
    });
    new PixelText(this, w * 0.5, titleY + 8, i18n.t('app.subtitle'), {
      size: 8,
      tint: 0x59f2e6,
      depth: 21
    });

    // Showcase rotating pixel target with two decorative equipped kunais
    const targetDef = getTargetSkin(save.equippedTarget);
    const wheelY = fracY(this, 0.36);
    this.showcaseWheel = new TargetWheel(this, w * 0.5, wheelY, targetDef.textureKey);
    this.showcaseWheel.configure(targetDef.textureKey, 24, 58, 1, 'constant');
    this.showcaseWheel.setDepth(12);

    const k1 = this.add.image(0, 26, save.equippedKunai).setOrigin(0.5).setAngle(0);
    const k2 = this.add.image(0, -26, save.equippedKunai).setOrigin(0.5).setAngle(180);
    this.showcaseWheel.stuckLayer.add([k1, k2]);

    // Animated Ninja Mascot at 1:1 16x16 texel density using equipped ninja skin
    const mascotY = fracY(this, 0.5);
    this.mascot = this.add
      .sprite(Math.round(w * 0.5), mascotY, save.equippedNinja, 0)
      .setOrigin(0.5)
      .setDepth(15);
    this.mascot.play(`${save.equippedNinja}_idle_front`);

    new PixelText(this, w * 0.5, fracY(this, 0.565), i18n.t('menu.best_score', { score: save.bestScore }), {
      size: 8,
      tint: 0xd6e2f5,
      depth: 21
    });

    // Primary PLAY button
    new PixelButton(this, w * 0.5, fracY(this, 0.665), {
      width: 124,
      height: 28,
      label: i18n.t('menu.play'),
      fontSize: 16,
      iconKey: save.equippedKunai,
      depth: 25,
      onClick: () => {
        this.scene.start('GameScene', { level: 1, score: 0, runCoins: 0, revivesUsed: 0 });
      }
    });

    // Secondary row: SHOP and SETTINGS
    const secY = fracY(this, 0.785);
    new PixelButton(this, w * 0.5 - 38, secY, {
      width: 70,
      height: 22,
      label: i18n.t('menu.shop'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        if (this.scene.getIndex('ShopScene') >= 0) {
          this.scene.start('ShopScene');
        } else {
          this.showToast('SHOP -> P2');
        }
      }
    });

    new PixelButton(this, w * 0.5 + 38, secY, {
      width: 70,
      height: 22,
      label: i18n.t('menu.settings'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        if (this.scene.getIndex('SettingsScene') >= 0) {
          this.scene.start('SettingsScene');
        } else {
          this.showToast('SETTINGS -> P2');
        }
      }
    });

    this.toastText = new PixelText(this, w * 0.5, fracY(this, 0.865), '', {
      size: 8,
      tint: 0xffe073,
      depth: 40
    }).setAlpha(0);

    if (!streakShownInSession && saveService.canClaimDailyStreak().eligible) {
      streakShownInSession = true;
      new DailyStreakModal(this, (newCoins) => {
        this.coinBadge.updateCoins(newCoins);
      });
    }

    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'MenuScene',
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale,
      coins: save.coins,
      bestScore: save.bestScore,
      equippedNinja: save.equippedNinja,
      equippedKunai: save.equippedKunai,
      equippedBackground: save.equippedBackground
    };
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50);
    this.backdrop.bgTile.tilePositionY -= dt * 0.005 * this.backdrop.parallaxFactor;
    this.showcaseWheel.updateRotation(dt);
  }

  private showToast(msg: string): void {
    if (!this.toastText) return;
    this.tweens.killTweensOf([this.toastText.main, this.toastText.shadow]);
    this.toastText.setText(msg).setAlpha(1);
    this.tweens.add({
      targets: [this.toastText.main, this.toastText.shadow],
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut'
    });
  }
}
