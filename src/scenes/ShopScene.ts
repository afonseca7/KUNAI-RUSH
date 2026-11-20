import Phaser from 'phaser';
import { CHEST_KEY_CONFIG, ECONOMY_CONFIG, LAYOUT_FRACTIONS } from '../config/balance';
import { i18n, type I18nKey } from '../config/i18n';
import {
  BACKGROUND_SKINS,
  KUNAI_SKINS,
  NINJA_SKINS,
  getTargetSkin,
  getTierColorHex,
  getTierLabelKey,
  type CosmeticCategory,
  type RarityTier,
  type UnlockRule
} from '../config/skins';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { TargetWheel } from '../objects/TargetWheel';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import { saveService } from '../services/SaveService';
import { adsManager } from '../services/ads/AdsManager';
import { ChestModal } from '../ui/ChestModal';
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

export class ShopScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private coinBadge!: CoinBadgeRefs;
  private previewWheel!: TargetWheel;
  private previewNinja!: Phaser.GameObjects.Sprite;
  private previewKunais: Phaser.GameObjects.Image[] = [];

  private tabNinjasBg!: Phaser.GameObjects.NineSlice;
  private tabKunaisBg!: Phaser.GameObjects.NineSlice;
  private tabBgsBg!: Phaser.GameObjects.NineSlice;
  private tierText!: PixelText;
  private itemNameText!: PixelText;
  private itemIndexText!: PixelText;
  private actionBtn!: PixelButton;
  private freeCoinsBtn!: PixelButton;
  private redeemKeysBtn!: PixelButton;

  private activeTab: CosmeticCategory = 'ninjas';
  private ninjaCursor = 0;
  private kunaiCursor = 0;
  private bgCursor = 0;
  private freeCooldownTimer?: Phaser.Time.TimerEvent;
  private parallaxSpeed = 1.0;

  constructor() {
    super({ key: 'ShopScene' });
  }

  public create(): void {
    const save = saveService.get();
    const w = this.scale.width;
    this.previewKunais = [];
    void adsManager.syncBannerForScene('ShopScene');

    this.ninjaCursor = Math.max(
      0,
      NINJA_SKINS.findIndex((n) => n.id === save.equippedNinja)
    );
    this.kunaiCursor = Math.max(
      0,
      KUNAI_SKINS.findIndex((k) => k.id === save.equippedKunai)
    );
    this.bgCursor = Math.max(
      0,
      BACKGROUND_SKINS.findIndex((b) => b.id === save.equippedBackground)
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

    // 3 Tabs row: Ninjas / Kunais / Fondos
    const tabY = fracY(this, 0.145);
    this.tabNinjasBg = this.createTab(w * 0.5 - 56, tabY, 'ninjas', i18n.t('shop.tab_ninjas'));
    this.tabKunaisBg = this.createTab(w * 0.5, tabY, 'kunais', i18n.t('shop.tab_kunais'));
    this.tabBgsBg = this.createTab(w * 0.5 + 56, tabY, 'backgrounds', i18n.t('shop.tab_backgrounds'));

    // Live Preview Stage: animated ninja sprite + rotating kunai wheel over scrolling background
    const wheelY = fracY(this, 0.325);
    const initialTarget = getTargetSkin(save.equippedTarget);
    this.previewWheel = new TargetWheel(this, w * 0.5 + 16, wheelY, initialTarget.textureKey);
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

    createNineSlicePanel(this, w * 0.5 - 40, wheelY, 32, 32, 'dark', 14);
    this.previewNinja = this.add
      .sprite(Math.round(w * 0.5 - 40), wheelY, save.equippedNinja, 0)
      .setOrigin(0.5)
      .setDepth(16);
    this.previewNinja.play(`${save.equippedNinja}_idle_front`);

    // Selector carousel card
    const selY = fracY(this, 0.505);
    createNineSlicePanel(this, w * 0.5, selY, 124, 34, 'dark', 20);
    this.tierText = new PixelText(this, w * 0.5, selY - 10, '', {
      size: 8,
      tint: 0xffe073,
      depth: 22
    });
    this.itemNameText = new PixelText(this, w * 0.5, selY, '', {
      size: 8,
      tint: 0xffffff,
      depth: 22
    });
    this.itemIndexText = new PixelText(this, w * 0.5, selY + 10, '', {
      size: 8,
      tint: 0x59f2e6,
      depth: 22
    });

    const leftArrow = this.add
      .image(Math.round(w * 0.5 - 74), selY, ASSET_KEYS.UI_ARROW_LEFT)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });
    leftArrow.on('pointerup', () => {
      this.stepCursor(-1);
    });

    const rightArrow = this.add
      .image(Math.round(w * 0.5 + 74), selY, ASSET_KEYS.UI_ARROW_RIGHT)
      .setDepth(24)
      .setInteractive({ useHandCursor: true });
    rightArrow.on('pointerup', () => {
      this.stepCursor(1);
    });

    // Primary Buy / Equip Button
    this.actionBtn = new PixelButton(this, w * 0.5, fracY(this, 0.625), {
      width: 146,
      height: 22,
      label: '',
      fontSize: 8,
      depth: 25,
      onClick: () => {
        this.handleActionClick();
      }
    });

    // +25 Free Coins Rewarded Button
    this.freeCoinsBtn = new PixelButton(this, w * 0.5, fracY(this, 0.72), {
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

    // Redeem 3 Keys / Open Chest Button
    this.redeemKeysBtn = new PixelButton(this, w * 0.5, fracY(this, 0.808), {
      width: 146,
      height: 18,
      label: '',
      fontSize: 8,
      iconKey: ASSET_KEYS.UI_ICON_KEY,
      depth: 25,
      onClick: () => {
        new ChestModal(this, {
          onUpdated: () => this.refreshShopView(),
          onDone: () => this.refreshShopView()
        });
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
    this.backdrop.bgTile.tilePositionY -= dt * 0.006 * this.parallaxSpeed;
    this.previewWheel.updateRotation(dt);
  }

  private createTab(
    x: number,
    y: number,
    category: CosmeticCategory,
    label: string
  ): Phaser.GameObjects.NineSlice {
    const bg = this.add
      .nineslice(Math.round(x), y, ASSET_KEYS.UI_BTN_DISABLED, undefined, 52, 16, 4, 4, 2, 2)
      .setDepth(22)
      .setInteractive({ useHandCursor: true });
    new PixelText(this, x, y - 1, label, {
      size: 8,
      tint: 0xf4f0e8,
      depth: 23
    });
    bg.on('pointerup', () => {
      audioService.playSfx('click');
      hapticsService.light();
      this.activeTab = category;
      this.refreshShopView();
    });
    return bg;
  }

  private stepCursor(delta: -1 | 1): void {
    audioService.playSfx('click');
    hapticsService.light();
    if (this.activeTab === 'ninjas') {
      const n = NINJA_SKINS.length;
      this.ninjaCursor = (this.ninjaCursor + delta + n) % n;
    } else if (this.activeTab === 'kunais') {
      const n = KUNAI_SKINS.length;
      this.kunaiCursor = (this.kunaiCursor + delta + n) % n;
    } else {
      const n = BACKGROUND_SKINS.length;
      this.bgCursor = (this.bgCursor + delta + n) % n;
    }
    this.refreshShopView();
  }

  private refreshShopView(): void {
    const save = saveService.get();
    this.coinBadge.updateCoins(save.coins);

    this.tabNinjasBg.setTexture(
      this.activeTab === 'ninjas' ? ASSET_KEYS.UI_BTN_NORMAL : ASSET_KEYS.UI_BTN_DISABLED
    );
    this.tabKunaisBg.setTexture(
      this.activeTab === 'kunais' ? ASSET_KEYS.UI_BTN_NORMAL : ASSET_KEYS.UI_BTN_DISABLED
    );
    this.tabBgsBg.setTexture(
      this.activeTab === 'backgrounds' ? ASSET_KEYS.UI_BTN_NORMAL : ASSET_KEYS.UI_BTN_DISABLED
    );

    const pNinja = NINJA_SKINS[this.ninjaCursor];
    const pKunai = KUNAI_SKINS[this.kunaiCursor];
    const pBg = BACKGROUND_SKINS[this.bgCursor];

    const liveNinjaId = this.activeTab === 'ninjas' ? pNinja.id : save.equippedNinja;
    const animKey = `${liveNinjaId}_idle_front`;
    if (this.previewNinja.anims.currentAnim?.key !== animKey) {
      this.previewNinja.setTexture(liveNinjaId, 0);
      if (this.anims.exists(animKey)) {
        this.previewNinja.play(animKey);
      }
    }

    const liveKunaiId = this.activeTab === 'kunais' ? pKunai.id : save.equippedKunai;
    for (const img of this.previewKunais) {
      img.setTexture(liveKunaiId);
    }

    const liveBgId = this.activeTab === 'backgrounds' ? pBg.id : save.equippedBackground;
    const liveBgDef =
      BACKGROUND_SKINS.find((b) => b.id === liveBgId) ?? BACKGROUND_SKINS[0];
    this.backdrop.bgTile.setTexture(liveBgDef.textureKey);
    this.parallaxSpeed = liveBgDef.parallaxFactor;

    if (this.activeTab === 'ninjas') {
      this.renderItemDetails(
        pNinja.tier,
        pNinja.nameKey,
        this.ninjaCursor,
        NINJA_SKINS.length,
        save.unlockedNinjas.includes(pNinja.id),
        save.equippedNinja === pNinja.id,
        pNinja.price,
        pNinja.unlockRule,
        save.coins
      );
    } else if (this.activeTab === 'kunais') {
      this.renderItemDetails(
        pKunai.tier,
        pKunai.nameKey,
        this.kunaiCursor,
        KUNAI_SKINS.length,
        save.unlockedKunais.includes(pKunai.id),
        save.equippedKunai === pKunai.id,
        pKunai.price,
        pKunai.unlockRule,
        save.coins
      );
    } else {
      this.renderItemDetails(
        pBg.tier,
        pBg.nameKey,
        this.bgCursor,
        BACKGROUND_SKINS.length,
        save.unlockedBackgrounds.includes(pBg.id),
        save.equippedBackground === pBg.id,
        pBg.price,
        pBg.unlockRule,
        save.coins
      );
    }

    const keyPct = Math.round(save.keysFrac * 100);
    const haveKeysStr = `${save.keysWhole}+${keyPct}%`;
    this.redeemKeysBtn
      .setLabel(i18n.t('shop.redeem_keys', { need: CHEST_KEY_CONFIG.KEYS_PER_SKIN, have: haveKeysStr }))
      .setDisabled(false);

    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'ShopScene',
      tab: this.activeTab,
      coins: save.coins,
      gold: save.gold,
      keysWhole: save.keysWhole,
      keysFrac: save.keysFrac,
      pendingChests: save.pendingChests,
      equippedNinja: save.equippedNinja,
      equippedKunai: save.equippedKunai,
      equippedBackground: save.equippedBackground,
      equippedTarget: save.equippedTarget,
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale
    };
  }

  private renderItemDetails(
    tier: RarityTier,
    nameKey: string,
    index: number,
    total: number,
    owned: boolean,
    equipped: boolean,
    price: number,
    rule: UnlockRule,
    coins: number
  ): void {
    this.tierText
      .setText(i18n.t(getTierLabelKey(tier) as I18nKey))
      .setTint(getTierColorHex(tier));
    this.itemNameText.setText(i18n.t(nameKey as I18nKey));
    this.itemIndexText.setText(`${index + 1}/${total}`);
    this.updateActionButton(owned, equipped, price, rule, coins);
  }

  private updateActionButton(
    owned: boolean,
    equipped: boolean,
    price: number,
    rule: UnlockRule,
    coins: number
  ): void {
    if (equipped) {
      this.actionBtn.setLabel(i18n.t('shop.equipped')).setDisabled(true);
    } else if (owned) {
      this.actionBtn.setLabel(i18n.t('shop.equip')).setDisabled(false);
    } else if (rule.type === 'streak') {
      this.actionBtn
        .setLabel(i18n.t('shop.unlock_streak', { days: rule.days }))
        .setDisabled(true);
    } else if (rule.type === 'level') {
      this.actionBtn
        .setLabel(i18n.t('shop.unlock_level', { level: rule.level }))
        .setDisabled(true);
    } else if (rule.type === 'score') {
      this.actionBtn
        .setLabel(i18n.t('shop.unlock_score', { score: rule.score }))
        .setDisabled(true);
    } else if (coins >= price) {
      this.actionBtn.setLabel(i18n.t('shop.buy', { price })).setDisabled(false);
    } else {
      this.actionBtn.setLabel(`${i18n.t('shop.no_coins')} (${price})`).setDisabled(true);
    }
  }

  private handleActionClick(): void {
    const save = saveService.get();
    let ok = false;
    let owned = false;

    if (this.activeTab === 'ninjas') {
      const def = NINJA_SKINS[this.ninjaCursor];
      owned = save.unlockedNinjas.includes(def.id);
      ok = owned
        ? saveService.equipNinja(def.id)
        : saveService.unlockAndEquipNinja(def.id, def.price, def.tier);
    } else if (this.activeTab === 'kunais') {
      const def = KUNAI_SKINS[this.kunaiCursor];
      owned = save.unlockedKunais.includes(def.id);
      ok = owned
        ? saveService.equipKunai(def.id)
        : saveService.unlockAndEquipKunai(def.id, def.price, def.tier);
    } else {
      const def = BACKGROUND_SKINS[this.bgCursor];
      owned = save.unlockedBackgrounds.includes(def.id);
      ok = owned
        ? saveService.equipBackground(def.id)
        : saveService.unlockAndEquipBackground(def.id, def.price, def.tier);
    }

    if (ok) {
      audioService.playSfx(owned ? 'click' : 'levelup');
      hapticsService.medium();
    }
    this.refreshShopView();
  }

  private async handleFreeCoinsClick(): Promise<void> {
    if (saveService.getShopFreeCoinsRemainingSec() > 0) return;
    this.freeCoinsBtn.setDisabled(true);
    const rewarded = await adsManager.showRewarded('shop_free_coins');
    if (!this.scene.isActive()) return;

    if (rewarded) {
      saveService.addCoins(ECONOMY_CONFIG.SHOP_FREE_COINS_REWARD);
      saveService.markShopFreeCoinsClaimed();
      audioService.playSfx('coin');
      hapticsService.medium();
    }
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
