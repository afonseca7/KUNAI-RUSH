import Phaser from 'phaser';
import { ECONOMY_CONFIG } from '../config/balance';
import { i18n } from '../config/i18n';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { EFFECTS_KEYS } from '../objects/EffectsFactory';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { PixelButton, PixelText, createNineSlicePanel } from './UITheme';

export class DailyStreakModal {
  public readonly container: Phaser.GameObjects.Container;

  constructor(
    scene: Phaser.Scene,
    onClaimed: (newCoinsTotal: number) => void,
    onClose?: () => void
  ) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const status = saveService.canClaimDailyStreak();
    const activeDay = Math.min(4, Math.max(1, status.nextDayIndex));

    this.container = scene.add.container(0, 0).setDepth(75);

    // Input-blocking nocturnal backdrop dim
    const scrim = scene.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.74)
      .setInteractive();
    this.container.add(scrim);

    const cx = Math.round(w * 0.5);
    const cy = Math.round(h * 0.48);

    const modalPanel = createNineSlicePanel(scene, cx, cy, 158, 152, 'dark');
    this.container.add(modalPanel);

    const headerBanner = createNineSlicePanel(scene, cx, cy - 58, 142, 22, 'wood');
    this.container.add(headerBanner);

    const title = new PixelText(scene, cx, cy - 58, i18n.t('streak.title'), {
      size: 8,
      tint: 0xffe073
    });
    title.addToContainer(this.container);

    const rewards = ECONOMY_CONFIG.DAILY_STREAK_REWARDS;
    const sub = new PixelText(
      scene,
      cx,
      cy - 40,
      i18n.t('streak.subtitle', {
        day: status.nextDayIndex,
        coins: status.eligible ? status.rewardCoins : rewards[activeDay - 1]
      }),
      {
        size: 8,
        tint: 0x9bf5c6
      }
    );
    sub.addToContainer(this.container);

    // 2x2 grid of 9-slice day cards with animated pixel coins
    const colOffsets = [-34, 34];
    const rowOffsets = [-12, 20];

    for (let i = 0; i < 4; i++) {
      const dayNum = i + 1;
      const dx = cx + colOffsets[i % 2];
      const dy = cy + rowOffsets[Math.floor(i / 2)];
      const isCurrent = status.eligible && dayNum === activeDay;
      const isClaimed = dayNum < activeDay || (!status.eligible && dayNum <= activeDay);

      const cell = createNineSlicePanel(
        scene,
        dx,
        dy,
        62,
        28,
        isCurrent ? 'wood' : isClaimed ? 'bgDark' : 'dark'
      );
      this.container.add(cell);

      const coin = scene.add.sprite(dx - 18, dy, ASSET_KEYS.COIN_SPIN, 0);
      if (scene.anims.exists('coin_spin_loop') && isCurrent) {
        coin.play('coin_spin_loop');
      }
      if (isClaimed && !isCurrent) coin.setAlpha(0.5);
      this.container.add(coin);

      const dayLabel = new PixelText(
        scene,
        dx + 6,
        dy - 5,
        i === 3 ? `${i18n.t('streak.day', { day: 4 })}+` : i18n.t('streak.day', { day: dayNum }),
        {
          size: 8,
          tint: isCurrent ? 0xffffff : 0x9fb3cc
        }
      );
      dayLabel.addToContainer(this.container);

      const amtLabel = new PixelText(scene, dx + 6, dy + 5, `+${rewards[i]}`, {
        size: 8,
        tint: isCurrent ? 0xffe073 : 0xd6e2f5
      });
      amtLabel.addToContainer(this.container);
    }

    const claimBtn = new PixelButton(scene, cx, cy + 54, {
      width: 128,
      height: 24,
      label: status.eligible
        ? i18n.t('streak.claim', { coins: status.rewardCoins })
        : i18n.t('common.close'),
      fontSize: 8,
      onClick: () => {
        if (status.eligible) {
          const res = saveService.claimDailyStreak();
          if (res.claimed) {
            audioService.playSfx('coin');
            audioService.playSfx('levelup');
            hapticsService.medium();
            onClaimed(saveService.get().coins);
          }
        }
        this.destroy();
        onClose?.();
      }
    });
    this.container.add(claimBtn.container);
  }

  public destroy(): void {
    this.container.destroy();
  }
}
