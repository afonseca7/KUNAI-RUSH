import Phaser from 'phaser';
import { ASSET_KEYS } from './AssetPipeline';
import { EFFECTS_KEYS } from './EffectsFactory';
import { PixelText } from '../ui/UITheme';

interface PixelChip {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  gravity: number;
  lifeMs: number;
  maxLifeMs: number;
}

export class ParticleManager {
  private readonly scene: Phaser.Scene;
  private readonly chipPool: Phaser.GameObjects.Image[] = [];
  private readonly activeChips: PixelChip[] = [];
  private readonly vfxPool: Phaser.GameObjects.Sprite[] = [];
  private readonly popupPool: PixelText[] = [];

  constructor(scene: Phaser.Scene, chipCapacity: number = 64, vfxCapacity: number = 8) {
    this.scene = scene;

    for (let i = 0; i < chipCapacity; i++) {
      const key = i % 2 === 0 ? EFFECTS_KEYS.PARTICLE_2PX : EFFECTS_KEYS.PARTICLE_1PX;
      const img = scene.add.image(-200, -200, key).setOrigin(0.5).setVisible(false).setDepth(24);
      this.chipPool.push(img);
    }

    for (let i = 0; i < vfxCapacity; i++) {
      const sp = scene.add
        .sprite(-200, -200, ASSET_KEYS.VFX_SMOKE, 0)
        .setOrigin(0.5)
        .setVisible(false)
        .setDepth(26);
      sp.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        if (!sp.scene) return;
        sp.setVisible(false).setPosition(-200, -200);
        this.vfxPool.push(sp);
      });
      this.vfxPool.push(sp);
    }

    for (let i = 0; i < 6; i++) {
      const pt = new PixelText(scene, -200, -200, '', { size: 8, depth: 36 }).setVisible(false);
      this.popupPool.push(pt);
    }
  }

  public emitStickChips(x: number, y: number, chipColor: number, trailColor: number): void {
    for (let i = 0; i < 9; i++) {
      const angle = Math.PI * (0.15 + Math.random() * 0.7);
      const speed = 42 + Math.random() * 75;
      const color = i % 3 === 0 ? trailColor : chipColor;
      this.spawnChip(
        x + (Math.random() - 0.5) * 6,
        y,
        Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1),
        Math.sin(angle) * speed * 0.7,
        240,
        color,
        260 + Math.random() * 140
      );
    }
    this.playVfx('vfx_smoke_play', x, y + 2, 0.7);
  }

  public emitCoinSparkle(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.25;
      const speed = 34 + Math.random() * 48;
      const color = i % 2 === 0 ? 0xffe073 : 0xffffff;
      this.spawnChip(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 80, color, 320);
    }
    this.emitPopup(x, y - 6, '+2', 0xffe073);
  }

  public emitMetalClang(x: number, y: number): void {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 55 + Math.random() * 95;
      const color = i % 3 === 0 ? 0xffffff : i % 2 === 0 ? 0xffc845 : 0xff5a5a;
      this.spawnChip(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, 260, color, 380);
    }
    this.playVfx('vfx_spark_play', x, y, 0.9);
  }

  public emitTargetBreak(
    x: number,
    y: number,
    chipColor: number,
    ringColor: number,
    isBoss: boolean
  ): void {
    const count = isBoss ? 34 : 24;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = 50 + Math.random() * 115;
      const color = i % 3 === 0 ? 0xffffff : i % 2 === 0 ? ringColor : chipColor;
      this.spawnChip(
        x + Math.cos(angle) * 6,
        y + Math.sin(angle) * 6,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 20,
        290,
        color,
        460 + Math.random() * 200
      );
    }
    this.playVfx('vfx_explosion_play', x, y, 0.95);
  }

  public emitPopup(x: number, y: number, text: string, tint: number = 0x59f2e6): void {
    const pt = this.popupPool.pop();
    if (!pt) return;

    const rx = Math.round(x);
    const ry = Math.round(y);
    pt.setText(text).setTint(tint).setPosition(rx, ry).setAlpha(1).setVisible(true);

    this.scene.tweens.killTweensOf([pt.main, pt.shadow]);
    this.scene.tweens.add({
      targets: [pt.main, pt.shadow],
      y: '-=14',
      alpha: 0,
      duration: 540,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (!pt.main.scene) return;
        pt.setVisible(false).setPosition(-200, -200);
        this.popupPool.push(pt);
      }
    });
  }

  public update(deltaMs: number): void {
    const dt = deltaMs / 1000;
    for (let i = this.activeChips.length - 1; i >= 0; i--) {
      const c = this.activeChips[i];
      c.vy += c.gravity * dt;
      c.sprite.x += c.vx * dt;
      c.sprite.y += c.vy * dt;
      c.lifeMs -= deltaMs;

      if (c.lifeMs <= 0) {
        c.sprite.setVisible(false).setPosition(-200, -200).setAlpha(1);
        this.chipPool.push(c.sprite);
        this.activeChips.splice(i, 1);
      } else {
        c.sprite.setAlpha(Math.max(0.15, c.lifeMs / c.maxLifeMs));
      }
    }
  }

  public destroy(): void {
    for (const c of this.activeChips) {
      c.sprite.destroy();
    }
    this.activeChips.length = 0;
    for (const img of this.chipPool) img.destroy();
    this.chipPool.length = 0;
    for (const sp of this.vfxPool) sp.destroy();
    this.vfxPool.length = 0;
    for (const pt of this.popupPool) pt.destroy();
    this.popupPool.length = 0;
  }

  private spawnChip(
    x: number,
    y: number,
    vx: number,
    vy: number,
    gravity: number,
    tint: number,
    lifeMs: number
  ): void {
    const img = this.chipPool.pop();
    if (!img) return;
    img
      .setPosition(Math.round(x), Math.round(y))
      .setTint(tint)
      .setAlpha(1)
      .setVisible(true);
    this.activeChips.push({
      sprite: img,
      vx,
      vy,
      gravity,
      lifeMs,
      maxLifeMs: lifeMs
    });
  }

  private playVfx(animKey: string, x: number, y: number, alpha: number): void {
    if (!this.scene.anims.exists(animKey)) return;
    const sp = this.vfxPool.pop();
    if (!sp) return;
    sp.setPosition(Math.round(x), Math.round(y)).setAlpha(alpha).setVisible(true);
    sp.play(animKey);
  }
}
