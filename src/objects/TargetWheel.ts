/**
 * TargetWheel — Rotating pixel-art target container with delta-time patterns.
 * Angular impact math follows the MIT reference from iagodahlem/knife-hit
 * (Copyright © Iago Dahlem), using Phaser.Math.Angle.ShortestBetween.
 */
import Phaser from 'phaser';
import { GAMEPLAY_CONFIG, type RotationPattern } from '../config/balance';

export class TargetWheel extends Phaser.GameObjects.Container {
  public readonly wheelSprite: Phaser.GameObjects.Image;
  public readonly stuckLayer: Phaser.GameObjects.Container;
  public readonly collectibleLayer: Phaser.GameObjects.Container;

  private radiusPx = 24;
  private baseSpeedDeg = 90;
  private direction: 1 | -1 = 1;
  private pattern: RotationPattern = 'constant';
  private elapsedPatternMs = 0;
  private telegraphTimerMs = 0;
  private paused = false;
  private baseTint = 0xffffff;

  constructor(scene: Phaser.Scene, x: number, y: number, initialTexture: string) {
    super(scene, Math.round(x), Math.round(y));
    scene.add.existing(this);

    this.wheelSprite = scene.add.image(0, 0, initialTexture).setOrigin(0.5);
    this.stuckLayer = scene.add.container(0, 0);
    this.collectibleLayer = scene.add.container(0, 0);

    // Stuck kunais appear behind the target rim slightly, collectibles orbit outside
    this.add([this.stuckLayer, this.wheelSprite, this.collectibleLayer]);
  }

  public configure(
    textureKey: string,
    radiusPx: number,
    baseSpeedDegPerSec: number,
    initialDirection: 1 | -1,
    pattern: RotationPattern
  ): void {
    this.radiusPx = radiusPx;
    this.baseSpeedDeg = baseSpeedDegPerSec;
    this.direction = initialDirection;
    this.pattern = pattern;
    this.elapsedPatternMs = 0;
    this.telegraphTimerMs = 0;
    this.paused = false;
    this.baseTint = 0xffffff;
    this.angle = 0;
    this.setScale(1, 1);

    this.wheelSprite.setTexture(textureKey);
    this.wheelSprite.clearTint();
  }

  public getRadius(): number {
    return this.radiusPx;
  }

  public setBaseTint(tint: number): void {
    this.baseTint = tint;
    if (this.telegraphTimerMs <= 0) {
      if (tint === 0xffffff) this.wheelSprite.clearTint();
      else this.wheelSprite.setTint(tint);
    }
  }

  public setRotationPaused(paused: boolean): void {
    this.paused = paused;
  }

  public updateRotation(deltaMs: number): void {
    if (this.paused) return;

    const dtSec = deltaMs / 1000;
    this.elapsedPatternMs += deltaMs;

    let angularVel = this.baseSpeedDeg * this.direction;

    if (this.pattern === 'accel') {
      const wave = 0.65 + 0.7 * Math.abs(Math.sin((this.elapsedPatternMs / 1000) * 1.45));
      angularVel = this.baseSpeedDeg * wave * this.direction;
    } else if (this.pattern === 'reverse') {
      const cycleMs = 2600;
      const phase = this.elapsedPatternMs % cycleMs;
      const prevPhase = (this.elapsedPatternMs - deltaMs) % cycleMs;
      if (phase < prevPhase) {
        this.direction = this.direction === 1 ? -1 : 1;
      }

      const telegraphStart = cycleMs - GAMEPLAY_CONFIG.TELEGRAPH_DURATION_MS - 220;
      if (phase >= telegraphStart && phase < cycleMs - 220) {
        this.activateTelegraph();
        angularVel = this.baseSpeedDeg * 0.45 * this.direction;
      } else if (phase >= cycleMs - 220) {
        angularVel = 0;
      } else {
        angularVel = this.baseSpeedDeg * this.direction;
      }
    } else if (this.pattern === 'sinusoidal') {
      const cycleMs = 2400;
      const phase = this.elapsedPatternMs % cycleMs;
      const prevPhase = (this.elapsedPatternMs - deltaMs) % cycleMs;
      if (phase < prevPhase) {
        this.direction = this.direction === 1 ? -1 : 1;
      }
      const telegraphStart = cycleMs - GAMEPLAY_CONFIG.TELEGRAPH_DURATION_MS;
      if (phase >= telegraphStart) {
        this.activateTelegraph();
      }
      const t = this.elapsedPatternMs / 1000;
      const mod = 0.55 + 0.85 * Math.pow(Math.sin(t * 2.2), 2);
      angularVel = this.baseSpeedDeg * mod * this.direction;
    }

    if (this.telegraphTimerMs > 0) {
      this.telegraphTimerMs = Math.max(0, this.telegraphTimerMs - deltaMs);
      if (this.telegraphTimerMs === 0) {
        if (this.baseTint === 0xffffff) this.wheelSprite.clearTint();
        else this.wheelSprite.setTint(this.baseTint);
      }
    }

    this.angle = Phaser.Math.Angle.WrapDegrees(this.angle + angularVel * dtSec);
  }

  /**
   * Returns the local polar angle (degrees, -180..180) on this rotating wheel
   * currently aligned with world bottom (+Y, 90° in Phaser coordinates).
   */
  public getBottomLocalAngleDeg(): number {
    return Phaser.Math.Angle.WrapDegrees(90 - this.angle);
  }

  public pulseImpact(): void {
    this.scene.tweens.killTweensOf(this);
    this.setScale(1.07, 0.93);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 85,
      ease: 'Back.easeOut'
    });
  }

  public flashImpactTint(color: number = 0xfff0b3, durationMs: number = 70): void {
    this.wheelSprite.setTint(color);
    this.scene.time.delayedCall(durationMs, () => {
      if (!this.scene || !this.wheelSprite.active) return;
      if (this.telegraphTimerMs > 0) {
        this.wheelSprite.setTint(0xffc845);
      } else if (this.baseTint === 0xffffff) {
        this.wheelSprite.clearTint();
      } else {
        this.wheelSprite.setTint(this.baseTint);
      }
    });
  }

  private activateTelegraph(): void {
    if (this.telegraphTimerMs <= 0) {
      this.telegraphTimerMs = 120;
      this.wheelSprite.setTint(0xffc845);
    }
  }
}
