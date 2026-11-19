import Phaser from 'phaser';
import { LAYOUT_FRACTIONS } from '../config/balance';
import { i18n } from '../config/i18n';
import { getTargetSkin } from '../config/skins';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { TargetWheel } from '../objects/TargetWheel';
import { DailyStreakModal } from '../ui/DailyStreakModal';
import { LuckySpinModal } from '../ui/LuckySpinModal';
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
  private spinWheelIcon?: Phaser.GameObjects.Image;
  private spinBadgeLabel?: PixelText;
  private multActiveText?: PixelText;
  private activeModalOpen = false;
  private toastText?: PixelText;

  constructor() {
    super({ key: 'MenuScene' });
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;
    this.activeModalOpen = false;

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

    // Active Multiplier HUD badge (earned via Lucky Spin)
    this.multActiveText = new PixelText(
      this,
      w * 0.5,
      fracY(this, 0.605),
      save.activeMultiplier > 1 ? i18n.t('game.mult_active', { mult: save.activeMultiplier }) : '',
      {
        size: 8,
        tint: 0x59f2e6,
        depth: 22
      }
    ).setVisible(save.activeMultiplier > 1);

    // Floating Lucky Spin button (right side of mascot)
    const spinX = w - 26;
    const spinY = fracY(this, 0.495);
    const spinBtnContainer = this.add.container(spinX, spinY).setDepth(26);
    const spinPanel = createNineSlicePanel(this, 0, 0, 34, 34, 'wood');
    this.spinWheelIcon = this.add.image(0, -4, ASSET_KEYS.UI_WHEEL_MINI).setOrigin(0.5);
    const isFreeSpin = saveService.canUseFreeSpin();
    this.spinBadgeLabel = new PixelText(
      this,
      0,
      11,
      isFreeSpin ? i18n.t('menu.spin_free') : i18n.t('menu.spin_label'),
      {
        size: 8,
        tint: isFreeSpin ? 0x9bf5c6 : 0xffe073
      }
    );
    spinBtnContainer.add([spinPanel, this.spinWheelIcon]);
    this.spinBadgeLabel.addToContainer(spinBtnContainer);
    spinPanel.setInteractive({ useHandCursor: true });
    spinPanel.on('pointerup', () => {
      if (this.activeModalOpen) return;
      this.openLuckySpinModal();
    });

    if (isFreeSpin) {
      this.tweens.add({
        targets: spinBtnContainer,
        scaleX: 1.07,
        scaleY: 1.07,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

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

    this.refreshMenuBadges();
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50);
    this.backdrop.bgTile.tilePositionY -= dt * 0.005 * this.backdrop.parallaxFactor;
    this.showcaseWheel.updateRotation(dt);
    if (this.spinWheelIcon) {
      this.spinWheelIcon.angle += dt * 0.045;
    }
  }

  private openLuckySpinModal(): void {
    this.activeModalOpen = true;
    new LuckySpinModal(this, {
      onRewardApplied: () => this.refreshMenuBadges(),
      onClosed: () => {
        this.activeModalOpen = false;
        this.refreshMenuBadges();
      }
    });
  }

  private refreshMenuBadges(): void {
    const next = saveService.get();
    this.coinBadge.updateCoins(next.coins);
    const isFree = saveService.canUseFreeSpin();
    if (this.spinBadgeLabel) {
      this.spinBadgeLabel
        .setText(isFree ? i18n.t('menu.spin_free') : i18n.t('menu.spin_label'))
        .setTint(isFree ? 0x9bf5c6 : 0xffe073);
    }
    if (this.multActiveText) {
      this.multActiveText
        .setText(next.activeMultiplier > 1 ? i18n.t('game.mult_active', { mult: next.activeMultiplier }) : '')
        .setVisible(next.activeMultiplier > 1);
    }
    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'MenuScene',
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale,
      coins: next.coins,
      bestScore: next.bestScore,
      equippedNinja: next.equippedNinja,
      equippedKunai: next.equippedKunai,
      equippedBackground: next.equippedBackground,
      activeMultiplier: next.activeMultiplier,
      pendingChests: next.pendingChests,
      keysWhole: next.keysWhole,
      keysFrac: next.keysFrac,
      gold: next.gold
    };
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
