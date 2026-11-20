import Phaser from 'phaser';
import { CHEST_KEY_CONFIG } from '../config/balance';
import { i18n, type I18nKey } from '../config/i18n';
import { getTierColorHex, getTierLabelKey } from '../config/skins';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { EFFECTS_KEYS } from '../objects/EffectsFactory';
import { ParticleManager } from '../objects/ParticleManager';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import { PixelButton, PixelText, createNineSlicePanel } from './UITheme';

export type ChestModalOutcome = 'opened' | 'closed' | 'lost_in_flight';

export class ChestModal {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly chestSprite: Phaser.GameObjects.Image;
  private readonly pendingText: PixelText;
  private readonly keysStatusText: PixelText;
  private readonly progressBar: Phaser.GameObjects.Image;
  private readonly infoText: PixelText;
  private readonly openBtn: PixelButton;
  private readonly redeemBtn: PixelButton;
  private readonly closeBtn: PixelButton;
  private readonly particles: ParticleManager;
  private readonly onUpdateBind: (_time: number, delta: number) => void;
  private readonly onUpdated?: () => void;
  private readonly onDone?: (outcome: ChestModalOutcome) => void;

  private confirmOverlay?: Phaser.GameObjects.Container;
  private busy = false;
  private destroyed = false;
  private openedAny = false;

  constructor(
    scene: Phaser.Scene,
    opts?: {
      onUpdated?: () => void;
      onDone?: (outcome: ChestModalOutcome) => void;
    }
  ) {
    this.scene = scene;
    this.onUpdated = opts?.onUpdated;
    this.onDone = opts?.onDone;

    const w = scene.scale.width;
    const h = scene.scale.height;
    const cy = Math.round(h * 0.48);

    this.particles = new ParticleManager(scene, 48, 4, 72);
    this.root = scene.add.container(0, 0).setDepth(90);

    const scrim = scene.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.82)
      .setInteractive();
    this.root.add(scrim);

    const panel = createNineSlicePanel(scene, w * 0.5, cy, 166, 226, 'dark');
    this.root.add(panel);

    const title = new PixelText(scene, w * 0.5, cy - 99, i18n.t('chest.title'), {
      size: 8,
      tint: 0xffe073
    });
    title.addToContainer(this.root);

    this.chestSprite = scene.add
      .image(Math.round(w * 0.5), cy - 70, ASSET_KEYS.UI_CHEST_CLOSED)
      .setScale(2)
      .setOrigin(0.5);
    this.root.add(this.chestSprite);

    this.pendingText = new PixelText(scene, w * 0.5, cy - 42, '', {
      size: 8,
      tint: 0xd6e2f5
    });
    this.pendingText.addToContainer(this.root);

    const barUnder = scene.add
      .image(Math.round(w * 0.5), cy - 26, ASSET_KEYS.UI_BAR_UNDER)
      .setDisplaySize(116, 6);
    this.progressBar = scene.add
      .image(Math.round(w * 0.5 - 58), cy - 26, ASSET_KEYS.UI_BAR_PROGRESS)
      .setOrigin(0, 0.5)
      .setDisplaySize(1, 6);
    const keyIcon = scene.add
      .image(Math.round(w * 0.5 - 68), cy - 26, ASSET_KEYS.UI_ICON_KEY)
      .setOrigin(0.5);
    const goldIcon = scene.add
      .image(Math.round(w * 0.5 + 68), cy - 26, ASSET_KEYS.UI_ICON_GOLD)
      .setOrigin(0.5);
    this.root.add([barUnder, this.progressBar, keyIcon, goldIcon]);

    this.keysStatusText = new PixelText(scene, w * 0.5, cy - 12, '', {
      size: 8,
      tint: 0xffe073,
      maxWidth: 152
    });
    this.keysStatusText.addToContainer(this.root);

    this.infoText = new PixelText(scene, w * 0.5, cy + 12, '', {
      size: 8,
      tint: 0x59f2e6,
      maxWidth: 150
    });
    this.infoText.addToContainer(this.root);

    this.openBtn = new PixelButton(scene, w * 0.5, cy + 42, {
      width: 148,
      height: 22,
      label: '',
      fontSize: 8,
      onClick: () => {
        void this.handleOpenChest();
      }
    });

    this.redeemBtn = new PixelButton(scene, w * 0.5, cy + 68, {
      width: 148,
      height: 22,
      label: '',
      fontSize: 8,
      onClick: () => {
        this.handleRedeemKeys();
      }
    });

    this.closeBtn = new PixelButton(scene, w * 0.5, cy + 95, {
      width: 118,
      height: 20,
      label: '',
      fontSize: 8,
      onClick: () => {
        this.handleCloseAttempt();
      }
    });

    this.root.add([this.openBtn.container, this.redeemBtn.container, this.closeBtn.container]);

    this.onUpdateBind = (_t: number, delta: number) => {
      this.particles.update(Math.min(delta, 50));
    };
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.onUpdateBind);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

    this.refreshView();
  }

  private refreshView(customMsg?: string, customTint?: number): void {
    if (this.destroyed) return;
    const save = saveService.get();

    this.pendingText.setText(
      save.pendingChests > 0
        ? i18n.t('chest.pending_count', { count: save.pendingChests })
        : i18n.t('chest.none_pending')
    );

    const pct = Math.round(save.keysFrac * 100);
    this.keysStatusText.setText(
      i18n.t('chest.keys_status', { whole: save.keysWhole, pct, gold: save.gold })
    );
    const barWidth = Math.max(2, Math.round(116 * Math.max(0.02, save.keysFrac)));
    this.progressBar.setDisplaySize(barWidth, 6);

    if (customMsg) {
      this.infoText.setText(customMsg).setTint(customTint ?? 0x59f2e6);
    } else if (save.inFlightKeyAmount > 0) {
      this.infoText
        .setText(i18n.t('chest.in_flight_warn', { drop: save.inFlightKeyAmount }))
        .setTint(0xff9691);
    } else {
      this.infoText.setText('');
    }

    if (save.pendingChests > 0) {
      const freeNoDoubleAd = save.lastKeyFromAd === true;
      this.openBtn
        .setLabel(
          freeNoDoubleAd ? i18n.t('chest.open_free_no_ad') : i18n.t('chest.open_with_ad')
        )
        .setDisabled(this.busy);
    } else {
      this.openBtn.setLabel(i18n.t('chest.none_pending')).setDisabled(true);
    }

    const canRedeem = saveService.canRedeemKeysForSkin();
    this.redeemBtn
      .setLabel(i18n.t('chest.redeem_btn'))
      .setDisabled(this.busy || !canRedeem);

    this.closeBtn
      .setLabel(
        save.inFlightKeyAmount > 0
          ? i18n.t('chest.exit_without_open')
          : i18n.t('common.close')
      )
      .setDisabled(this.busy);

    adsManager.syncQaSnapshot();
  }

  private async handleOpenChest(): Promise<void> {
    if (this.busy || this.destroyed) return;
    const before = saveService.get();
    if (before.pendingChests <= 0) return;

    this.busy = true;
    this.refreshView();

    const needsAd = before.lastKeyFromAd !== true;
    if (needsAd) {
      const rewarded = await adsManager.showRewarded('open_chest');
      if (this.destroyed || !this.scene.sys.isActive()) return;
      if (!rewarded) {
        this.busy = false;
        this.refreshView(i18n.t('spin.ad_cancelled'), 0xff9691);
        return;
      }
    }

    const res = saveService.openPendingChest(needsAd);
    this.busy = false;
    if (!res.opened) {
      this.refreshView();
      return;
    }

    this.openedAny = true;
    this.chestSprite.setTexture(ASSET_KEYS.UI_CHEST_OPEN);
    this.scene.tweens.add({
      targets: this.chestSprite,
      scaleX: 2.25,
      scaleY: 1.85,
      duration: 140,
      yoyo: true,
      ease: 'Back.easeOut'
    });

    this.particles.emitConfetti(this.chestSprite.x, this.chestSprite.y);
    audioService.playSfx('boss');
    audioService.playSfx('coin');
    hapticsService.heavy();

    adsManager.syncQaSnapshot(`chest_opened:ad=${needsAd}:key=${res.keyGained}:gold=${res.goldGained}`);
    this.refreshView(
      i18n.t('chest.opened_reward', { gold: res.goldGained }) +
        (res.keyGained > CHEST_KEY_CONFIG.CHEST_KEY_REWARD ? ` (+${res.keyGained})` : ''),
      0x9bf5c6
    );
    this.onUpdated?.();
  }

  private handleRedeemKeys(): void {
    if (this.busy || this.destroyed) return;
    const res = saveService.redeemKeysForRandomSkin();
    if (res.allOwned) {
      this.refreshView(i18n.t('chest.all_unlocked'), 0xffe073);
      return;
    }
    if (!res.redeemed || !res.item) {
      this.refreshView();
      return;
    }

    this.particles.emitConfetti(this.chestSprite.x, this.chestSprite.y + 20);
    audioService.playSfx('levelup');
    hapticsService.heavy();

    const itemName = i18n.t(res.item.nameKey as I18nKey);
    const tierName = i18n.t(getTierLabelKey(res.item.tier) as I18nKey);
    (window as unknown as Record<string, unknown>).__KUNAI_LAST_SKIN_UNLOCK__ = {
      id: res.item.id,
      category: res.item.category,
      tier: res.item.tier,
      name: itemName
    };
    adsManager.syncQaSnapshot(`keys_redeemed:${res.item.id}:t${res.item.tier}`);

    this.refreshView(
      `${i18n.t('chest.skin_unlocked')}\n${itemName} (${tierName})`,
      getTierColorHex(res.item.tier)
    );
    this.onUpdated?.();
  }

  private handleCloseAttempt(): void {
    if (this.busy || this.destroyed) return;
    const save = saveService.get();
    if (save.inFlightKeyAmount > 0 && save.pendingChests > 0) {
      this.openLossConfirmOverlay();
      return;
    }
    const outcome: ChestModalOutcome = this.openedAny ? 'opened' : 'closed';
    this.destroy();
    this.onDone?.(outcome);
  }

  private openLossConfirmOverlay(): void {
    if (this.confirmOverlay) return;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const cy = Math.round(h * 0.48);

    const ov = this.scene.add.container(0, 0).setDepth(98);
    const scrim = this.scene.add
      .image(w * 0.5, h * 0.5, EFFECTS_KEYS.FLASH_QUAD)
      .setDisplaySize(w, h)
      .setTint(0x05070e)
      .setAlpha(0.75)
      .setInteractive();
    const panel = createNineSlicePanel(this.scene, w * 0.5, cy, 158, 134, 'red');
    ov.add([scrim, panel]);

    const msg = new PixelText(this.scene, w * 0.5, cy - 26, i18n.t('chest.confirm_lose_body'), {
      size: 8,
      tint: 0xffe073,
      maxWidth: 142
    });
    msg.addToContainer(ov);

    const stayBtn = new PixelButton(this.scene, w * 0.5, cy + 18, {
      width: 132,
      height: 22,
      label: i18n.t('chest.stay_open'),
      fontSize: 8,
      onClick: () => {
        ov.destroy();
        this.confirmOverlay = undefined;
      }
    });

    const leaveBtn = new PixelButton(this.scene, w * 0.5, cy + 44, {
      width: 132,
      height: 20,
      label: i18n.t('chest.leave_lose'),
      fontSize: 8,
      textTint: 0x7a1c2d,
      onClick: () => {
        saveService.discardInFlightKey();
        adsManager.syncQaSnapshot('in_flight_key_lost');
        ov.destroy();
        this.confirmOverlay = undefined;
        this.onUpdated?.();
        this.destroy();
        this.onDone?.('lost_in_flight');
      }
    });

    ov.add([stayBtn.container, leaveBtn.container]);
    this.confirmOverlay = ov;
  }

  public destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.confirmOverlay?.destroy();
    this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.onUpdateBind);
    this.particles.destroy();
    this.root.destroy();
  }
}
