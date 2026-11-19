import Phaser from 'phaser';
import {
  ECONOMY_CONFIG,
  GAMEPLAY_CONFIG,
  GEOMETRY_CONFIG,
  LAYOUT_FRACTIONS,
  getLevelSpec,
  type LevelSpec
} from '../config/balance';
import { i18n } from '../config/i18n';
import { BOSS_SKINS, getTargetSkin } from '../config/skins';
import { saveService } from '../services/SaveService';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { CollectiblePool } from '../objects/CollectiblePool';
import { triggerScreenFlash } from '../objects/EffectsFactory';
import { KunaiPool, planLevelSlots } from '../objects/KunaiPool';
import { TargetWheel } from '../objects/TargetWheel';
import {
  PixelButton,
  PixelText,
  createCoinBadge,
  createNineSlicePanel,
  createSceneBackdrop,
  fracX,
  fracY,
  getViewportMetrics,
  type BackdropRefs,
  type CoinBadgeRefs
} from '../ui/UITheme';

export interface GameSceneInitData {
  level?: number;
  score?: number;
  runCoins?: number;
  revivesUsed?: number;
}

export class GameScene extends Phaser.Scene {
  private backdrop!: BackdropRefs;
  private wheel!: TargetWheel;
  private kunaiPool!: KunaiPool;
  private collectiblePool!: CollectiblePool;

  private ninjaMascot!: Phaser.GameObjects.Sprite;
  private readyKunai!: Phaser.GameObjects.Image;
  private levelText!: PixelText;
  private scoreText!: PixelText;
  private bannerText!: PixelText;
  private coinBadge!: CoinBadgeRefs;

  private bossPanel?: Phaser.GameObjects.NineSlice;
  private bossNameText?: PixelText;
  private bossBarUnder?: Phaser.GameObjects.Image;
  private bossBarProg?: Phaser.GameObjects.Image;

  private pauseOverlay?: Phaser.GameObjects.Container;
  private pauseBtn?: Phaser.GameObjects.Container;
  private remainingIcons: Phaser.GameObjects.Image[] = [];

  private level = 1;
  private score = 0;
  private runCoins = 0;
  private revivesUsed = 0;
  private bossPhase = 1;
  private currentSpec!: LevelSpec;

  private kunaisLeftToThrow = 0;
  private kunaisRequiredInWave = 0;
  private kunaisStuckInWave = 0;

  private comboCount = 0;
  private lastStickAtMs = 0;
  private lastThrowAtMs = 0;

  private isPaused = false;
  private isTransitioning = false;
  private isGameOver = false;
  private readyY = 0;
  private wheelCenterY = 0;
  private equippedKunaiId = 'kunai_iron';

  private boundBlurHandler?: () => void;
  private boundVisHandler?: () => void;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data?: GameSceneInitData): void {
    this.level = data?.level ?? 1;
    this.score = data?.score ?? 0;
    this.runCoins = data?.runCoins ?? 0;
    this.revivesUsed = data?.revivesUsed ?? 0;
    this.bossPhase = 1;
    this.comboCount = 0;
    this.lastStickAtMs = 0;
    this.lastThrowAtMs = 0;
    this.isPaused = false;
    this.isTransitioning = false;
    this.isGameOver = false;
  }

  public create(): void {
    const save = saveService.get();
    this.equippedKunaiId = save.equippedKunai;
    const w = this.scale.width;
    const h = this.scale.height;

    this.backdrop = createSceneBackdrop(this);

    this.wheelCenterY = fracY(this, LAYOUT_FRACTIONS.TARGET_CENTER_Y);
    this.readyY = fracY(this, LAYOUT_FRACTIONS.READY_KUNAI_Y);
    const mascotY = fracY(this, LAYOUT_FRACTIONS.NINJA_MASCOT_Y);

    // Wheel & Pools
    const equippedTarget = getTargetSkin(save.equippedTarget);
    this.wheel = new TargetWheel(this, w * 0.5, this.wheelCenterY, equippedTarget.textureKey);
    this.wheel.setDepth(12);

    this.kunaiPool = new KunaiPool(this, this.equippedKunaiId, 28);
    this.collectiblePool = new CollectiblePool(this, 8);

    // Ready kunai & animated ninja mascot at foot
    this.readyKunai = this.add
      .image(Math.round(w * 0.5), this.readyY, this.equippedKunaiId)
      .setOrigin(0.5)
      .setDepth(14);

    this.ninjaMascot = this.add
      .sprite(Math.round(w * 0.5), mascotY, ASSET_KEYS.NINJA_SHEET, 1)
      .setOrigin(0.5)
      .setDepth(16);
    this.ninjaMascot.play('ninja_idle_up');
    this.ninjaMascot.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim: Phaser.Animations.Animation) => {
      if (anim.key === 'ninja_throw_up' && this.ninjaMascot.active) {
        this.ninjaMascot.play('ninja_idle_up');
      }
    });

    this.buildHud(w, h, save.coins);
    this.startWave(this.level, this.bossPhase);
    this.bindInputAndFocusHandlers();
    this.publishQaSnapshot();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cleanupHandlers();
    });
  }

  public update(_time: number, delta: number): void {
    const clampedDelta = Math.min(delta, 50);

    // Subtle nocturnal parallax
    this.backdrop.bgTile.tilePositionY -= clampedDelta * 0.008;

    if (this.isPaused) return;

    const scaledDelta = clampedDelta * this.time.timeScale;
    this.kunaiPool.updateBouncing(scaledDelta);

    if (!this.isGameOver) {
      this.wheel.updateRotation(scaledDelta);
      this.collectiblePool.syncWorldOrientation(this.wheel.angle);
    }

    const flying = this.kunaiPool.getFlying();
    if (flying && !this.isTransitioning && !this.isGameOver) {
      const stepY = (GAMEPLAY_CONFIG.KUNAI_THROW_SPEED_PX_PER_SEC * scaledDelta) / 1000;
      flying.y -= stepY;

      // Collectible check on perimeter entry
      const orbitDist = this.wheel.getRadius() + GEOMETRY_CONFIG.COLLECTIBLE_ORBIT_EXTRA;
      if (flying.y <= this.wheel.y + orbitDist + 4) {
        const hitPos = this.collectiblePool.tryCollectAt(
          this.wheel,
          this.wheel.getBottomLocalAngleDeg()
        );
        if (hitPos) {
          this.handleCoinCollected(hitPos.x, hitPos.y);
        }
      }

      // Target surface impact check
      const impactY = this.wheel.y + this.wheel.getRadius() + 2;
      if (flying.y <= impactY) {
        flying.y = impactY;
        this.resolveImpact();
      }
    }
  }

  private buildHud(w: number, _h: number, totalCoins: number): void {
    const hudY = fracY(this, LAYOUT_FRACTIONS.HUD_TOP_Y);

    // Left pause button (9-slice square)
    this.pauseBtn = this.add.container(fracX(this, 0.095), hudY).setDepth(30);
    const pBg = createNineSlicePanel(this, 0, 0, 18, 16, 'wood');
    const pTxt = new PixelText(this, 0, 0, 'II', { size: 8, tint: 0xf4f0e8 });
    pTxt.addToContainer(this.pauseBtn);
    this.pauseBtn.addAt(pBg, 0);
    pBg.setInteractive({ useHandCursor: true });
    pBg.on('pointerup', () => {
      if (!this.isGameOver && !this.isTransitioning) {
        this.openPauseOverlay();
      }
    });

    // Level pill
    createNineSlicePanel(this, fracX(this, 0.31), hudY, 54, 16, 'dark', 29);
    this.levelText = new PixelText(this, fracX(this, 0.31), hudY, '', {
      size: 8,
      tint: 0x9bf5c6,
      depth: 30
    });

    // Center score
    this.scoreText = new PixelText(this, w * 0.54, hudY, String(this.score), {
      size: 16,
      tint: 0xffffff,
      depth: 30
    });

    // Right coin badge
    this.coinBadge = createCoinBadge(this, w - 31, hudY, totalCoins, 30);

    // Floating announcement banner
    this.bannerText = new PixelText(this, w * 0.5, fracY(this, 0.22), '', {
      size: 8,
      tint: 0xffe073,
      depth: 35
    }).setAlpha(0);

    // Boss HP UI (shown on boss levels)
    const bossY = fracY(this, 0.145);
    this.bossPanel = createNineSlicePanel(this, w * 0.5, bossY, 126, 20, 'red', 28).setVisible(false);
    this.bossNameText = new PixelText(this, w * 0.5, bossY - 4, '', {
      size: 8,
      tint: 0xffe073,
      depth: 29
    }).setVisible(false);
    this.bossBarUnder = this.add
      .image(Math.round(w * 0.5), bossY + 5, ASSET_KEYS.UI_BAR_UNDER)
      .setDisplaySize(90, 4)
      .setDepth(29)
      .setVisible(false);
    this.bossBarProg = this.add
      .image(Math.round(w * 0.5 - 45), bossY + 5, ASSET_KEYS.UI_BAR_PROGRESS)
      .setOrigin(0, 0.5)
      .setDisplaySize(90, 4)
      .setDepth(29.5)
      .setVisible(false);

    // Pre-allocate remaining kunai pips column
    const colX = fracX(this, 0.085);
    const startY = fracY(this, 0.58);
    for (let i = 0; i < GEOMETRY_CONFIG.MAX_KUNAIS_PER_WAVE; i++) {
      const icon = this.add
        .image(colX, startY - i * 11, this.equippedKunaiId)
        .setOrigin(0.5)
        .setAngle(-45)
        .setDepth(20)
        .setVisible(false);
      this.remainingIcons.push(icon);
    }
  }

  private startWave(level: number, bossPhase: number): void {
    this.currentSpec = getLevelSpec(level);
    this.kunaiPool.clearAll(this.wheel);
    this.collectiblePool.clearAll(this.wheel);
    this.isTransitioning = false;

    const save = saveService.get();
    const isBoss = this.currentSpec.isBoss;
    const targetTexture = isBoss
      ? BOSS_SKINS[this.currentSpec.bossIndex].textureKey
      : getTargetSkin(save.equippedTarget).textureKey;
    const radius = isBoss ? GEOMETRY_CONFIG.BOSS_TARGET_RADIUS : GEOMETRY_CONFIG.TARGET_RADIUS;
    const speedMultiplier = isBoss ? 1 + (bossPhase - 1) * 0.16 : 1;
    const dir: 1 | -1 =
      isBoss && bossPhase % 2 === 0
        ? (this.currentSpec.initialDirection === 1 ? -1 : 1)
        : this.currentSpec.initialDirection;

    this.wheel.configure(
      targetTexture,
      radius,
      this.currentSpec.baseSpeedDegPerSec * speedMultiplier,
      dir,
      this.currentSpec.pattern
    );

    const slotPlan = planLevelSlots(
      this.currentSpec.preStuckCount,
      this.currentSpec.collectibleCount,
      this.currentSpec.kunaisToThrow
    );

    for (const angle of slotPlan.preStuckAnglesDeg) {
      this.kunaiPool.attachStuck(this.wheel, angle, this.equippedKunaiId);
    }
    this.collectiblePool.spawnOnWheel(this.wheel, slotPlan.collectibleAnglesDeg);

    this.kunaisRequiredInWave = this.currentSpec.kunaisToThrow;
    this.kunaisLeftToThrow = this.currentSpec.kunaisToThrow;
    this.kunaisStuckInWave = 0;
    this.readyKunai.setVisible(true).setY(this.readyY);

    if (isBoss) {
      this.levelText.setText(i18n.t('game.boss_badge', { phase: bossPhase }));
      const bossDef = BOSS_SKINS[this.currentSpec.bossIndex];
      this.bossPanel?.setVisible(true);
      this.bossNameText?.setText(i18n.t(bossDef.nameKey as never)).setVisible(true);
      this.bossBarUnder?.setVisible(true);
      const hpRatio = (4 - bossPhase) / 3;
      this.bossBarProg?.setDisplaySize(Math.round(90 * hpRatio), 4).setVisible(true);
      if (bossPhase === 1) {
        this.showAnnouncement(i18n.t('game.boss_incoming'), 0xff9691);
      }
    } else {
      this.levelText.setText(i18n.t('game.level', { level }));
      this.bossPanel?.setVisible(false);
      this.bossNameText?.setVisible(false);
      this.bossBarUnder?.setVisible(false);
      this.bossBarProg?.setVisible(false);
    }

    this.refreshRemainingIcons();
    this.publishQaSnapshot();
  }

  private refreshRemainingIcons(): void {
    for (let i = 0; i < this.remainingIcons.length; i++) {
      const icon = this.remainingIcons[i];
      if (i < this.kunaisRequiredInWave) {
        icon.setVisible(true);
        const isSpent = i >= this.kunaisLeftToThrow;
        icon.setAlpha(isSpent ? 0.25 : 1);
        if (isSpent) icon.setTint(0x28324d);
        else icon.clearTint();
      } else {
        icon.setVisible(false);
      }
    }
  }

  private tryThrowKunai(): void {
    if (this.isPaused || this.isTransitioning || this.isGameOver) return;
    if (this.kunaisLeftToThrow <= 0) return;
    if (this.kunaiPool.getFlying() !== null) return;

    const now = this.time.now;
    if (now - this.lastThrowAtMs < GAMEPLAY_CONFIG.INPUT_DEBOUNCE_MS) return;
    this.lastThrowAtMs = now;

    this.kunaisLeftToThrow -= 1;
    this.refreshRemainingIcons();

    this.readyKunai.setVisible(this.kunaisLeftToThrow > 0);
    this.ninjaMascot.play('ninja_throw_up');
    this.kunaiPool.spawnFlying(this.wheel.x, this.readyY, 14);
  }

  private resolveImpact(): void {
    const impactAngle = this.wheel.getBottomLocalAngleDeg();
    const colliding = this.kunaiPool.findCollidingStuck(impactAngle);

    if (colliding) {
      this.handleCollisionFail();
      return;
    }

    this.kunaiPool.attachStuck(this.wheel, impactAngle);
    this.wheel.pulseImpact();
    this.wheel.flashImpactTint(0xfff0b3, 65);

    const now = this.time.now;
    if (now - this.lastStickAtMs <= GAMEPLAY_CONFIG.COMBO_WINDOW_MS) {
      this.comboCount += 1;
    } else {
      this.comboCount = 1;
    }
    this.lastStickAtMs = now;

    const bonus = this.comboCount >= 3 ? 1 : 0;
    this.score += 1 + bonus;
    this.scoreText.setText(String(this.score));

    if (this.comboCount >= 3) {
      this.showAnnouncement(i18n.t('game.combo', { combo: this.comboCount }), 0x59f2e6);
    }

    this.kunaisStuckInWave += 1;
    this.publishQaSnapshot();

    if (this.kunaisStuckInWave >= this.kunaisRequiredInWave) {
      this.handleWaveCleared();
    }
  }

  private handleCoinCollected(_wx: number, _wy: number): void {
    const gain = ECONOMY_CONFIG.COIN_PER_COLLECTIBLE;
    this.runCoins += gain;
    const total = saveService.addCoins(gain);
    this.coinBadge.updateCoins(total);
    this.showAnnouncement(`+${gain}`, 0xffe073);
  }

  private handleWaveCleared(): void {
    this.isTransitioning = true;
    this.readyKunai.setVisible(false);
    this.kunaiPool.scatterStuckOnBreak(this.wheel);
    this.collectiblePool.clearAll(this.wheel);

    if (this.currentSpec.isBoss && this.bossPhase < this.currentSpec.bossPhases) {
      this.bossPhase += 1;
      triggerScreenFlash(this, this.backdrop.atmosphere.flash, 0xffe073, 0.32, 160);
      this.showAnnouncement(i18n.t('game.phase_clear', { phase: this.bossPhase - 1 }), 0xffe073);
      this.time.delayedCall(460, () => {
        if (this.scene.isActive()) {
          this.startWave(this.level, this.bossPhase);
        }
      });
      return;
    }

    const levelBonus =
      ECONOMY_CONFIG.LEVEL_CLEAR_BASE_COINS +
      (this.currentSpec.isBoss ? ECONOMY_CONFIG.BOSS_CLEAR_BONUS_COINS : 0);
    this.runCoins += levelBonus;
    const total = saveService.addCoins(levelBonus);
    this.coinBadge.updateCoins(total);

    triggerScreenFlash(this, this.backdrop.atmosphere.flash, 0x37b887, 0.38, 190);
    this.showAnnouncement(
      this.currentSpec.isBoss
        ? i18n.t('game.boss_clear', { coins: levelBonus })
        : i18n.t('game.level_clear'),
      0x9bf5c6
    );

    this.level += 1;
    this.bossPhase = 1;
    this.time.delayedCall(540, () => {
      if (this.scene.isActive()) {
        this.startWave(this.level, this.bossPhase);
      }
    });
  }

  private handleCollisionFail(): void {
    this.isTransitioning = true;
    this.isGameOver = true;
    this.readyKunai.setVisible(false);

    const impactY = this.wheel.y + this.wheel.getRadius() + 2;
    this.kunaiPool.spawnFailBounce(this.wheel.x, impactY);
    this.wheel.setRotationPaused(true);

    triggerScreenFlash(this, this.backdrop.atmosphere.flash, 0xd93644, 0.45, 210);
    this.cameras.main.shake(180, 0.016);

    // Hit-stop + Slow-mo bounce before Game Over
    this.time.timeScale = GAMEPLAY_CONFIG.SLOW_MO_TIME_SCALE;
    this.time.delayedCall(GAMEPLAY_CONFIG.HIT_STOP_MS + GAMEPLAY_CONFIG.SLOW_MO_DURATION_MS * 0.35, () => {
      this.time.timeScale = 1;
      if (!this.scene.isActive()) return;
      this.finishRunToGameOver();
    });
  }

  private finishRunToGameOver(): void {
    const { isNewBestScore } = saveService.recordRunResult(this.score, this.level);
    this.scene.start('GameOverScene', {
      score: this.score,
      level: this.level,
      runCoins: this.runCoins,
      isNewBestScore,
      revivesUsed: this.revivesUsed
    });
  }

  private showAnnouncement(msg: string, tint: number): void {
    this.tweens.killTweensOf([this.bannerText.main, this.bannerText.shadow]);
    this.bannerText.setText(msg).setTint(tint).setAlpha(1);
    this.bannerText.setPosition(this.scale.width * 0.5, fracY(this, 0.22));
    this.tweens.add({
      targets: [this.bannerText.main, this.bannerText.shadow],
      y: '-=8',
      alpha: 0,
      duration: 720,
      ease: 'Quad.easeOut'
    });
  }

  private openPauseOverlay(): void {
    if (this.isPaused || this.pauseOverlay) return;
    this.isPaused = true;
    this.wheel.setRotationPaused(true);

    const w = this.scale.width;
    const h = this.scale.height;
    const container = this.add.container(w * 0.5, h * 0.5).setDepth(80);

    const panel = createNineSlicePanel(this, 0, 0, 146, 108, 'dark');
    const title = new PixelText(this, 0, -34, i18n.t('game.paused'), {
      size: 16,
      tint: 0xffe073
    });

    const resumeBtn = new PixelButton(this, 0, 0, {
      width: 112,
      height: 24,
      label: i18n.t('game.resume'),
      onClick: () => {
        this.closePauseOverlay();
      }
    });

    const quitBtn = new PixelButton(this, 0, 30, {
      width: 112,
      height: 24,
      label: i18n.t('game.quit'),
      onClick: () => {
        this.closePauseOverlay();
        this.scene.start('MenuScene');
      }
    });

    container.add([panel, resumeBtn.container, quitBtn.container]);
    title.addToContainer(container);
    this.pauseOverlay = container;
  }

  private closePauseOverlay(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.wheel.setRotationPaused(false);
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
  }

  private bindInputAndFocusHandlers(): void {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignore clicks on top HUD pause zone
      if (pointer.y < fracY(this, 0.12) && pointer.x < fracX(this, 0.2)) return;
      this.tryThrowKunai();
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.tryThrowKunai();
    });
    this.input.keyboard?.on('keydown-UP', () => {
      this.tryThrowKunai();
    });

    this.boundBlurHandler = () => {
      if (!this.isGameOver && !this.isTransitioning) {
        this.openPauseOverlay();
      }
    };
    this.boundVisHandler = () => {
      if (document.hidden && !this.isGameOver && !this.isTransitioning) {
        this.openPauseOverlay();
      }
    };
    window.addEventListener('blur', this.boundBlurHandler);
    document.addEventListener('visibilitychange', this.boundVisHandler);
  }

  private cleanupHandlers(): void {
    if (this.boundBlurHandler) {
      window.removeEventListener('blur', this.boundBlurHandler);
    }
    if (this.boundVisHandler) {
      document.removeEventListener('visibilitychange', this.boundVisHandler);
    }
    this.kunaiPool.destroy(this.wheel);
    this.collectiblePool.destroy(this.wheel);
  }

  private publishQaSnapshot(): void {
    const metrics = getViewportMetrics();
    (window as unknown as Record<string, unknown>).__KUNAI_STATE__ = {
      scene: 'GameScene',
      level: this.level,
      bossPhase: this.bossPhase,
      score: this.score,
      runCoins: this.runCoins,
      kunaisLeft: this.kunaisLeftToThrow,
      stuckCount: this.kunaiPool.getStuckCount(),
      profile: metrics.profile,
      logicalW: metrics.logicalW,
      logicalH: metrics.logicalH,
      scale: metrics.scale
    };
  }
}
