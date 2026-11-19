import Phaser from 'phaser';
import { ECONOMY_CONFIG, LAYOUT_FRACTIONS } from '../config/balance';
import { i18n, type I18nKey } from '../config/i18n';
import { KUNAI_SKINS, TARGET_SKINS, getTargetSkin } from '../config/skins';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { TargetWheel } from '../objects/TargetWheel';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
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

type ShopTab = 'kunais' | 'targets';

export class ShopScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private coinBadge!: CoinBadgeRefs;
  private previewWheel!: TargetWheel;
  private previewKunais: Phaser.GameObjects.Image[] = [];

  private tabKunaisBg!: Phaser.GameObjects.NineSlice;
  private tabTargetsBg!: Phaser.GameObjects.NineSlice;
  private itemNameText!: PixelText;
  private itemIndexText!: PixelText;
  private actionBtn!: PixelButton;
  private freeCoinsBtn!: PixelButton;

  private activeTab: ShopTab = 'kunais';
  private kunaiCursor = 0;
  private targetCursor = 0;
  private freeCooldownTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'ShopScene' });
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;
    this.previewKunais = [];

    this.kunaiCursor = Math.max(
      0,
      KUNAI_SKINS.findIndex((k) => k.id === save.equippedKunai)
    );
    this.targetCursor = Math.max(
      0,
      TARGET_SKINS.findIndex((t) => t.id === save.equippedTarget)
    );

    this.backdrop = createSceneBackdrop(this);

    // Top HUD Bar
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

    new PixelText(this, w * 0.52, topY, i18n.t('shop.title'), {
      size: 8,
      tint: 0xffe073,
      depth: 30
    });

    this.coinBadge = createCoinBadge(this, w - 31, topY, save.coins, 30);

    // Tabs row
    const tabY = fracY(this, 0.155);
    this.tabKunaisBg = this.add
      .nineslice(Math.round(w * 0.5 - 39), tabY, ASSET_KEYS.UI_BTN_NORMAL, undefined, 72, 18, 4, 4, 2, 2)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    new PixelText(this, w * 0.5 - 39, tabY - 1, i18n.t('shop.tab_kunais'), {
      size: 8,
      tint: 0xf4f0e8,
      depth: 23
    });

    this.tabTargetsBg = this.add
      .nineslice(Math.round(w * 0.5 + 39), tabY, ASSET_KEYS.UI_BTN_DISABLED, undefined, 72, 18, 4, 4, 2, 2)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    new PixelText(this, w * 0.5 + 39, tabY - 1, i18n.t('shop.tab_targets'), {
      size: 8,
      tint: 0xf4f0e8,
      depth: 23
    });

    this.tabKunaisBg.on('pointerup', () => {
      audioService.playSfx('click');
      hapticsService.light();
      this.activeTab = 'kunais';
      this.refreshShopView();
    });

    this.tabTargetsBg.on('pointerup', () => {
      audioService.playSfx('click');
      hapticsService.light();
      this.activeTab = 'targets';
      this.refreshShopView();
    });

    // Live Rotating Preview Wheel
    const wheelY = fracY(this, 0.34);
    const initialTarget = getTargetSkin(save.equippedTarget);
    this.previewWheel = new TargetWheel(this, w * 0.5, wheelY, initialTarget.textureKey);
    this.previewWheel.configure(initialTarget.textureKey, 24, 54, 1, 'constant');
    this.previewWheel.setDepth(15);

    for (const deg of [0, 120, 240]) {
      const rad = Phaser.Math.DegToRad(deg);
      const dist = 26;
      const kImg = this.add
        .image(Math.cos(rad) * dist, Math.sin(rad) * dist, save.equippedKunai)
        .setOrigin(0.5)
        .setAngle(deg - 90);
      this.previewWheel.stuckLayer.add(kImg);
      this.previewKunais.push(kImg);
    }

    // Selector carousel row
    const selY = fracY(this, 0.515);
    createNineSlicePanel(this, w * 0.5, selY, 118, 26, 'dark', 20);
    this.itemNameText = new PixelText(this, w * 0.5, selY - 4, '', {
      size: 8,
      tint: 0xffffff,
      depth: 22
    });
    this.itemIndexText = new PixelText(this, w * 0.5, selY + 6, '', {
      size: 8,
      tint: 0x59f2e6,
      depth: 22
    });

    const leftArrow = this.add
      .image(Math.round(w * 0.5 - 72), selY, ASSET_KEYS.UI_ARROW_LEFT)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });
    leftArrow.on('pointerup', () => {
      this.stepCursor(-1);
    });

    const rightArrow = this.add
      .image(Math.round(w * 0.5 + 72), selY, ASSET_KEYS.UI_ARROW_RIGHT)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });
    rightArrow.on('pointerup', () => {
      this.stepCursor(1);
    });

    // Primary Buy / Equip Button
    this.actionBtn = new PixelButton(this, w * 0.5, fracY(this, 0.64), {
      width: 132,
      height: 24,
      label: '',
      fontSize: 8,
      depth: 25,
      onClick: () => {
        this.handleActionClick();
      }
    });

    // +25 Free Coins Rewarded Button
    this.freeCoinsBtn = new PixelButton(this, w * 0.5, fracY(this, 0.76), {
      width: 146,
      height: 22,
      label: i18n.t('shop.free_coins'),
      fontSize: 8,
      iconKey: ASSET_KEYS.UI_ICON_COIN,
      depth: 25,
      onClick: () => {
        void this.handleFreeCoinsClick();
      }
    });

    this.freeCooldownTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.refreshFreeCoinsButton()
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.freeCooldownTimer?.remove();
    });

    this.refreshShopView();
    this.refreshFreeCoinsButton();
  }

  public update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50);
    this.backdrop.bgTile.tilePositionY -= dt * 0.005;
    this.previewWheel.updateRotation(dt);
  }

  private stepCursor(delta: -1 | 1): void {
    audioService.playSfx('click');
    hapticsService.light();
    if (this.activeTab === 'kunais') {
      const n = KUNAI_SKINS.length;
      this.kunaiCursor = (this.kunaiCursor + delta + n) % n;
    } else {
      const n = TARGET_SKINS.length;
      this.targetCursor = (this.targetCursor + delta + n) % n;
    }
    this.refreshShopView();
  }

  private refreshShopView(): void {
    const save = saveService.get();
    this.coinBadge.updateCoins(save.coins);

    this.tabKunaisBg.setTexture(
      this.activeTab === 'kunais' ? ASSET_KEYS.UI_BTN_NORMAL : ASSET_KEYS.UI_BTN_DISABLED
    );
    this.tabTargetsBg.setTexture(
      this.activeTab === 'targets' ? ASSET_KEYS.UI_BTN_NORMAL : ASSET_KEYS.UI_BTN_DISABLED
    );

    const previewKunai = KUNAI_SKINS[this.kunaiCursor];
    const previewTarget = TARGET_SKINS[this.targetCursor];

    this.previewWheel.wheelSprite.setTexture(
      this.activeTab === 'targets'
        ? previewTarget.textureKey
        : getTargetSkin(save.equippedTarget).textureKey
    );
    const activeKunaiTex =
      this.activeTab === 'kunais' ? previewKunai.id : save.equippedKunai;
    for (const img of this.previewKunais) {
      img.setTexture(activeKunaiTex);
    }

    if (this.activeTab === 'kunais') {
      const def = previewKunai;
      this.itemNameText.setText(i18n.t(def.nameKey as I18nKey));
      this.itemIndexText.setText(`${this.kunaiCursor + 1}/${KUNAI_SKINS.length}`);

      const owned = save.unlockedKunais.includes(def.id);
      const equipped = save.equippedKunai === def.id;
      this.updateActionButton(owned, equipped, def.price, save.coins);
    } else {
      const def = previewTarget;
      this.itemNameText.setText(i18n.t(def.nameKey as I18nKey));
      this.itemIndexText.setText(`${this.targetCursor + 1}/${TARGET_SKINS.length}`);

      const owned = save.unlockedTargets.includes(def.id);
      const equipped = save.equippedTarget === def.id;
      this.updateActionButton(owned, equipped, def.price, save.coins);
    }

    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'ShopScene',
      tab: this.activeTab,
      coins: save.coins,
      equippedKunai: save.equippedKunai,
      equippedTarget: save.equippedTarget,
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale
    };
  }

  private updateActionButton(
    owned: boolean,
    equipped: boolean,
    price: number,
    coins: number
  ): void {
    if (equipped) {
      this.actionBtn.setLabel(i18n.t('shop.equipped')).setDisabled(true);
    } else if (owned) {
      this.actionBtn.setLabel(i18n.t('shop.equip')).setDisabled(false);
    } else if (coins >= price) {
      this.actionBtn.setLabel(i18n.t('shop.buy', { price })).setDisabled(false);
    } else {
      this.actionBtn.setLabel(`${i18n.t('shop.no_coins')} (${price})`).setDisabled(true);
    }
  }

  private handleActionClick(): void {
    const save = saveService.get();
    if (this.activeTab === 'kunais') {
      const def = KUNAI_SKINS[this.kunaiCursor];
      const owned = save.unlockedKunais.includes(def.id);
      const ok = owned
        ? saveService.equipKunai(def.id)
        : saveService.unlockAndEquipKunai(def.id, def.price);
      if (ok) {
        audioService.playSfx(owned ? 'click' : 'levelup');
        hapticsService.medium();
      }
    } else {
      const def = TARGET_SKINS[this.targetCursor];
      const owned = save.unlockedTargets.includes(def.id);
      const ok = owned
        ? saveService.equipTarget(def.id)
        : saveService.unlockAndEquipTarget(def.id, def.price);
      if (ok) {
        audioService.playSfx(owned ? 'click' : 'levelup');
        hapticsService.medium();
      }
    }
    this.refreshShopView();
  }

  private async handleFreeCoinsClick(): Promise<void> {
    if (saveService.getShopFreeCoinsRemainingSec() > 0) return;
    // Rewarded Ad hook is wired in P3 (C20); in P2 grants directly cleanly
    saveService.addCoins(ECONOMY_CONFIG.SHOP_FREE_COINS_REWARD);
    saveService.markShopFreeCoinsClaimed();
    audioService.playSfx('coin');
    hapticsService.medium();
    this.refreshShopView();
    this.refreshFreeCoinsButton();
  }

  private refreshFreeCoinsButton(): void {
    const rem = saveService.getShopFreeCoinsRemainingSec();
    if (rem > 0) {
      this.freeCoinsBtn
        .setLabel(i18n.t('shop.free_cooldown', { sec: rem }))
        .setDisabled(true);
    } else {
      this.freeCoinsBtn.setLabel(i18n.t('shop.free_coins')).setDisabled(false);
    }
  }
}
