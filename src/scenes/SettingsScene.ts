import Phaser from 'phaser';
import { LAYOUT_FRACTIONS } from '../config/balance';
import { i18n } from '../config/i18n';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { EFFECTS_KEYS } from '../objects/EffectsFactory';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import {
  PixelButton,
  PixelText,
  createNineSlicePanel,
  createSceneBackdrop,
  fracY,
  getViewportMetrics,
  type BackdropRefs
} from '../ui/UITheme';

export class SettingsScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private activeModal?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'SettingsScene' });
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;
    this.activeModal = undefined;
    void adsManager.syncBannerForScene('SettingsScene');

    this.backdrop = createSceneBackdrop(this);

    const topY = fracY(this, LAYOUT_FRACTIONS.HUD_TOP_Y);
    new PixelButton(this, 29, topY, {
      width: 50,
      height: 16,
      label: i18n.t('common.back'),
      fontSize: 8,
      depth: 30,
      onClick: () => {
        this.scene.start('MenuScene');
      }
    });

    new PixelText(this, w * 0.58, topY, i18n.t('settings.title'), {
      size: 16,
      tint: 0xffe073,
      depth: 30
    });

    // Main settings panel
    const panelY = fracY(this, 0.365);
    createNineSlicePanel(this, w * 0.5, panelY, 158, 112, 'dark', 20);

    // Sound row
    this.buildToggleRow(w * 0.5, panelY - 34, i18n.t('settings.sound'), save.soundEnabled, (next) => {
      saveService.setSoundEnabled(next);
      audioService.syncMuteFromSave();
      this.scene.restart();
    });

    // Haptics row
    this.buildToggleRow(
      w * 0.5,
      panelY - 2,
      i18n.t('settings.haptics'),
      save.hapticsEnabled,
      (next) => {
        saveService.setHapticsEnabled(next);
        if (next) hapticsService.light();
        this.scene.restart();
      }
    );

    // Language row
    new PixelText(this, w * 0.5 - 66, panelY + 30, i18n.t('settings.language'), {
      size: 8,
      tint: 0xd6e2f5,
      originX: 0,
      align: Phaser.GameObjects.BitmapText.ALIGN_LEFT,
      depth: 22
    });
    new PixelButton(this, w * 0.5 + 32, panelY + 30, {
      width: 72,
      height: 20,
      label: i18n.t('settings.lang_name'),
      fontSize: 8,
      depth: 24,
      onClick: () => {
        const nextLocale = save.locale === 'es' ? 'en' : 'es';
        saveService.setLocale(nextLocale);
        this.scene.restart();
      }
    });

    // Action buttons
    new PixelButton(this, w * 0.5, fracY(this, 0.62), {
      width: 140,
      height: 22,
      label: i18n.t('settings.credits'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        this.openTextModal(i18n.t('credits.title'), i18n.t('credits.body'), 'dark');
      }
    });

    new PixelButton(this, w * 0.5, fracY(this, 0.73), {
      width: 140,
      height: 22,
      label: i18n.t('settings.qa_ads'),
      fontSize: 8,
      depth: 25,
      onClick: () => {
        const qa = adsManager.getTelemetry();
        const stats = i18n.t('qa.stats', {
          ump: qa.umpState,
          npa: qa.npa ? 'TRUE' : 'FALSE',
          banner: qa.bannerVisible ? 'ON' : 'OFF',
          launches: qa.appLaunchCount,
          go: qa.sessionGameOvers,
          int: qa.interstitialShown,
          rew: qa.rewardedShown,
          open: qa.appOpenShown
        });
        this.openTextModal(i18n.t('qa.title'), stats, 'dark');
      }
    });

    new PixelButton(this, w * 0.5, fracY(this, 0.845), {
      width: 140,
      height: 22,
      label: i18n.t('settings.reset'),
      fontSize: 8,
      textTint: 0x7a1c2d,
      depth: 25,
      onClick: () => {
        this.openResetConfirmModal();
      }
    });

    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'SettingsScene',
      locale: save.locale,
      soundEnabled: save.soundEnabled,
      hapticsEnabled: save.hapticsEnabled,
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale
    };
  }

  public update(_time: number, delta: number): void {
    this.backdrop.bgTile.tilePositionY -= Math.min(delta, 50) * 0.004;
  }

  private buildToggleRow(
    cx: number,
    y: number,
    label: string,
    checked: boolean,
    onToggle: (next: boolean) => void
  ): void {
    new PixelText(this, cx - 66, y, label, {
      size: 8,
      tint: 0xd6e2f5,
      originX: 0,
      align: Phaser.GameObjects.BitmapText.ALIGN_LEFT,
      depth: 22
    });

    const box = this.add
      .image(Math.round(cx + 22), Math.round(y), checked ? ASSET_KEYS.UI_CHECKED : ASSET_KEYS.UI_UNCHECKED)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });

    const stateTxt = new PixelText(
      this,
      cx + 48,
      y,
      checked ? i18n.t('settings.on') : i18n.t('settings.off'),
      {
        size: 8,
        tint: checked ? 0x9bf5c6 : 0xff9691,
        depth: 24
      }
    );

    const toggleHandler = (): void => {
      audioService.playSfx('click');
      hapticsService.light();
      onToggle(!checked);
    };
    box.on('pointerup', toggleHandler);
    stateTxt.main.setInteractive({ useHandCursor: true }).on('pointerup', toggleHandler);
  }

  private openTextModal(title: string, body: string, variant: 'dark' | 'bamboo' | 'red'): void {
    this.closeModal();
    const w = this.scale.width;
    const h = this.scale.height;

    const modal = this.add.container(0, 0).setDepth(75);
    const scrim = this.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.75)
      .setInteractive();
    modal.add(scrim);

    const panel = createNineSlicePanel(this, w * 0.5, h * 0.48, 162, 138, variant);
    modal.add(panel);

    const titleText = new PixelText(this, w * 0.5, h * 0.48 - 52, title, {
      size: 8,
      tint: 0xffe073
    });
    titleText.addToContainer(modal);

    const bodyText = new PixelText(this, w * 0.5, h * 0.48 - 4, body, {
      size: 8,
      tint: 0xf4f0e8,
      maxWidth: 144,
      align: Phaser.GameObjects.BitmapText.ALIGN_CENTER
    });
    bodyText.addToContainer(modal);

    const closeBtn = new PixelButton(this, w * 0.5, h * 0.48 + 48, {
      width: 96,
      height: 22,
      label: i18n.t('common.close'),
      fontSize: 8,
      onClick: () => this.closeModal()
    });
    modal.add(closeBtn.container);

    this.activeModal = modal;
  }

  private openResetConfirmModal(): void {
    this.closeModal();
    const w = this.scale.width;
    const h = this.scale.height;

    const modal = this.add.container(0, 0).setDepth(75);
    const scrim = this.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.78)
      .setInteractive();
    modal.add(scrim);

    const panel = createNineSlicePanel(this, w * 0.5, h * 0.48, 158, 114, 'red');
    modal.add(panel);

    const titleText = new PixelText(this, w * 0.5, h * 0.48 - 16, i18n.t('settings.reset_confirm'), {
      size: 8,
      tint: 0xffe073,
      maxWidth: 132
    });
    titleText.addToContainer(modal);

    const yesBtn = new PixelButton(this, w * 0.5 - 34, h * 0.48 + 26, {
      width: 58,
      height: 22,
      label: i18n.t('common.yes'),
      fontSize: 8,
      onClick: () => {
        void saveService.resetProgress().then(() => {
          audioService.syncMuteFromSave();
          this.closeModal();
          this.scene.restart();
        });
      }
    });

    const noBtn = new PixelButton(this, w * 0.5 + 34, h * 0.48 + 26, {
      width: 58,
      height: 22,
      label: i18n.t('common.no'),
      fontSize: 8,
      onClick: () => this.closeModal()
    });

    modal.add([yesBtn.container, noBtn.container]);
    this.activeModal = modal;
  }

  private closeModal(): void {
    this.activeModal?.destroy();
    this.activeModal = undefined;
  }
}
