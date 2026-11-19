import Phaser from 'phaser';
import {
  LUCKY_SPIN_CONFIG,
  rollWeightedLuckySegment,
  type LuckySpinSegmentDef
} from '../config/balance';
import { i18n } from '../config/i18n';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { EFFECTS_KEYS } from '../objects/EffectsFactory';
import { ParticleManager } from '../objects/ParticleManager';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import { PixelButton, PixelText, createNineSlicePanel } from './UITheme';

function formatHms(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export class LuckySpinModal {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly wheelImage: Phaser.GameObjects.Image;
  private readonly pointerImage: Phaser.GameObjects.Image;
  private readonly statusText: PixelText;
  private readonly spinBtn: PixelButton;
  private readonly closeBtn: PixelButton;
  private readonly particles: ParticleManager;
  private readonly onUpdateBind: (_time: number, delta: number) => void;
  private readonly onRewardApplied?: (seg: LuckySpinSegmentDef) => void;
  private readonly onClosed?: () => void;

  private isSpinning = false;
  private destroyed = false;
  private cooldownTimer?: Phaser.Time.TimerEvent;
  private wheelCenterX = 0;
  private wheelCenterY = 0;

  constructor(
    scene: Phaser.Scene,
    opts?: {
      onRewardApplied?: (seg: LuckySpinSegmentDef) => void;
      onClosed?: () => void;
    }
  ) {
    this.scene = scene;
    this.onRewardApplied = opts?.onRewardApplied;
    this.onClosed = opts?.onClosed;

    const w = scene.scale.width;
    const h = scene.scale.height;
    const cy = Math.round(h * 0.48);
    this.wheelCenterX = Math.round(w * 0.5);
    this.wheelCenterY = cy - 48;

    this.particles = new ParticleManager(scene, 48, 4, 72);

    this.root = scene.add.container(0, 0).setDepth(90);

    const scrim = scene.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.8)
      .setInteractive();
    this.root.add(scrim);

    const panel = createNineSlicePanel(scene, w * 0.5, cy, 164, 224, 'dark');
    this.root.add(panel);

    const title = new PixelText(scene, w * 0.5, cy - 98, i18n.t('spin.title'), {
      size: 8,
      tint: 0xffe073
    });
    title.addToContainer(this.root);

    // 72x72 pixel-art wheel + gold top pointer
    this.wheelImage = scene.add
      .image(this.wheelCenterX, this.wheelCenterY, ASSET_KEYS.UI_WHEEL_64)
      .setOrigin(0.5);
    this.pointerImage = scene.add
      .image(this.wheelCenterX, this.wheelCenterY - 37, ASSET_KEYS.UI_WHEEL_POINTER)
      .setOrigin(0.5, 0.25);
    this.root.add([this.wheelImage, this.pointerImage]);

    // 8-segment color-coded horizontal pixel legend (4 cols x 2 rows)
    const segs = LUCKY_SPIN_CONFIG.SEGMENTS;
    for (let i = 0; i < segs.length; i++) {
      const seg = segs[i];
      const col = i % 4;
      const row = Math.floor(i / 4);
      const px = Math.round(w * 0.5 - 56 + col * 36);
      const py = cy + (row === 0 ? -4 : 8);
      const dotX = seg.label.length >= 4 ? px - 14 : px - 10;

      const dot = scene.add
        .image(dotX, py, EFFECTS_KEYS.PARTICLE_2PX)
        .setDisplaySize(5, 5)
        .setTint(seg.colorHex);
      this.root.add(dot);

      const lbl = new PixelText(scene, seg.label.length >= 4 ? px + 5 : px + 3, py, seg.label, {
        size: 8,
        tint: seg.isHighTier ? 0xffe073 : 0xf4f0e8
      });
      lbl.addToContainer(this.root);
    }

    this.statusText = new PixelText(scene, w * 0.5, cy + 25, i18n.t('spin.subtitle'), {
      size: 8,
      tint: 0x59f2e6,
      maxWidth: 150
    });
    this.statusText.addToContainer(this.root);

    this.spinBtn = new PixelButton(scene, w * 0.5, cy + 54, {
      width: 148,
      height: 24,
      label: '',
      fontSize: 8,
      onClick: () => {
        void this.handleSpinClick();
      }
    });

    this.closeBtn = new PixelButton(scene, w * 0.5, cy + 84, {
      width: 112,
      height: 20,
      label: i18n.t('spin.close_no_spin'),
      fontSize: 8,
      onClick: () => {
        if (!this.isSpinning) {
          this.destroy();
          this.onClosed?.();
        }
      }
    });

    this.root.add([this.spinBtn.container, this.closeBtn.container]);

    this.onUpdateBind = (_t: number, delta: number) => {
      this.particles.update(Math.min(delta, 50));
    };
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdateBind);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

    this.cooldownTimer = scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.refreshControls()
    });

    this.refreshControls();
  }

  private refreshControls(): void {
    if (this.destroyed || this.isSpinning) return;

    const freeReady = saveService.canUseFreeSpin();
    const adSpinsLeft = saveService.getRemainingDailyAdSpins();

    if (freeReady) {
      this.spinBtn.setLabel(i18n.t('spin.free_ready')).setDisabled(false);
    } else if (adSpinsLeft > 0) {
      this.spinBtn
        .setLabel(i18n.t('spin.watch_ad', { left: adSpinsLeft }))
        .setDisabled(false);
      const remSec = saveService.getFreeSpinRemainingSec();
      if (this.statusText.main.text.startsWith('PRÓXIMO') || this.statusText.main.text.startsWith('NEXT') || this.statusText.main.text === i18n.t('spin.subtitle')) {
        this.statusText.setText(i18n.t('spin.next_free', { time: formatHms(remSec) })).setTint(0xd6e2f5);
      }
    } else {
      this.spinBtn.setLabel(i18n.t('spin.limit_reached')).setDisabled(true);
      const remSec = saveService.getFreeSpinRemainingSec();
      this.statusText.setText(i18n.t('spin.next_free', { time: formatHms(remSec) })).setTint(0xff9691);
    }
  }

  private pickWinningSegment(): { seg: LuckySpinSegmentDef; forced: boolean } {
    const win = window as unknown as Record<string, unknown>;
    const override = win.__KUNAI_FORCE_SPIN_INDEX__;
    if (typeof override === 'number' && Number.isInteger(override) && override >= 0 && override < 8) {
      win.__KUNAI_FORCE_SPIN_INDEX__ = undefined;
      return { seg: LUCKY_SPIN_CONFIG.SEGMENTS[override], forced: true };
    }
    return { seg: rollWeightedLuckySegment(), forced: false };
  }

  private async handleSpinClick(): Promise<void> {
    if (this.isSpinning || this.destroyed) return;

    const freeReady = saveService.canUseFreeSpin();
    if (!freeReady && saveService.getRemainingDailyAdSpins() <= 0) {
      this.refreshControls();
      return;
    }

    this.spinBtn.setDisabled(true);
    this.closeBtn.setDisabled(true);

    let usedFree = freeReady;
    if (!usedFree) {
      const rewarded = await adsManager.showRewarded('lucky_spin');
      if (this.destroyed || !this.scene.sys.isActive()) return;
      if (!rewarded) {
        this.statusText.setText(i18n.t('spin.ad_cancelled')).setTint(0xff9691);
        this.closeBtn.setDisabled(false);
        this.refreshControls();
        return;
      }
    }

    // Decide prize BEFORE visual rotation via weighted RNG
    const { seg, forced } = this.pickWinningSegment();
    saveService.recordSpinUsed(usedFree);
    this.isSpinning = true;
    this.statusText.setText(i18n.t('spin.spinning')).setTint(0xffe073);

    const jitterDeg = forced ? 0 : (Math.random() - 0.5) * 16;
    const targetMod = (360 - ((seg.index * 45) % 360) + jitterDeg + 360) % 360;
    const curMod = ((this.wheelImage.angle % 360) + 360) % 360;
    const forwardDelta = (targetMod - curMod + 360) % 360;
    const turns = 3 + Math.floor(Math.random() * 2);
    const totalSpinDeg = turns * 360 + forwardDelta;
    const finalAngle = this.wheelImage.angle + totalSpinDeg;

    let lastSectorTick = Math.floor(this.wheelImage.angle / 45);
    this.scene.tweens.add({
      targets: this.wheelImage,
      angle: finalAngle,
      duration: 2950,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        if (this.destroyed) return;
        const curTick = Math.floor(this.wheelImage.angle / 45);
        if (curTick !== lastSectorTick) {
          lastSectorTick = curTick;
          audioService.playSfx('click');
          hapticsService.light();
          this.pointerImage.setAngle(-16);
          this.scene.tweens.killTweensOf(this.pointerImage);
          this.scene.tweens.add({
            targets: this.pointerImage,
            angle: 0,
            duration: 95,
            ease: 'Quad.easeOut'
          });
        }
      },
      onComplete: () => {
        if (this.destroyed) return;
        this.finishSpin(seg, usedFree);
      }
    });
  }

  private finishSpin(seg: LuckySpinSegmentDef, usedFree: boolean): void {
    this.isSpinning = false;
    this.closeBtn.setDisabled(false);

    // Squash wheel on land
    this.scene.tweens.add({
      targets: this.wheelImage,
      scaleX: 1.09,
      scaleY: 0.91,
      duration: 110,
      yoyo: true,
      ease: 'Quad.easeOut'
    });

    // Apply reward cleanly
    if (seg.type === 'multiplier') {
      saveService.setActiveMultiplier(seg.value);
      const msg =
        seg.value >= 10
          ? i18n.t('spin.jackpot', { mult: seg.value })
          : i18n.t('spin.win_mult', { mult: seg.value });
      this.statusText.setText(msg).setTint(0x59f2e6);
    } else if (seg.type === 'coins') {
      saveService.addCoins(seg.value);
      this.statusText.setText(i18n.t('spin.win_coins', { coins: seg.value })).setTint(0xffe073);
    } else {
      saveService.addPendingChest(!usedFree);
      this.statusText.setText(i18n.t('spin.win_chest')).setTint(0xffe073);
    }

    if (seg.isHighTier) {
      this.particles.emitConfetti(this.wheelCenterX, this.wheelCenterY);
      audioService.playSfx(seg.value >= 30 || seg.type === 'chest' ? 'boss' : 'levelup');
      hapticsService.heavy();
    } else {
      audioService.playSfx('coin');
      hapticsService.medium();
    }

    (window as unknown as Record<string, unknown>).__KUNAI_LAST_SPIN__ = {
      id: seg.id,
      type: seg.type,
      value: seg.value,
      label: seg.label,
      usedFree,
      usedAd: !usedFree
    };
    adsManager.syncQaSnapshot(`lucky_spin:${seg.id}`);

    this.onRewardApplied?.(seg);
    this.refreshControls();
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cooldownTimer?.remove();
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdateBind);
    this.particles.destroy();
    this.root.destroy();
  }
}
