import Phaser from 'phaser';
import { GEOMETRY_CONFIG } from '../config/balance';
import { ASSET_KEYS } from './AssetPipeline';
import type { TargetWheel } from './TargetWheel';

export interface ActiveCollectible {
  sprite: Phaser.GameObjects.Sprite;
  localAngleDeg: number;
  collected: boolean;
}

export class CollectiblePool {
  private readonly scene: Phaser.Scene;
  private readonly pool: Phaser.GameObjects.Sprite[] = [];
  private readonly activeItems: ActiveCollectible[] = [];

  constructor(scene: Phaser.Scene, initialCapacity: number = 8) {
    this.scene = scene;
    for (let i = 0; i < initialCapacity; i++) {
      const sprite = scene.add
        .sprite(-200, -200, ASSET_KEYS.COIN_SPIN, 0)
        .setOrigin(0.5)
        .setVisible(false);
      this.pool.push(sprite);
    }
  }

  public spawnOnWheel(wheel: TargetWheel, anglesDeg: readonly number[]): void {
    this.clearAll(wheel);
    const orbitDist = wheel.getRadius() + GEOMETRY_CONFIG.COLLECTIBLE_ORBIT_EXTRA;

    for (const angleDeg of anglesDeg) {
      const sprite = this.acquireSprite();
      const rad = Phaser.Math.DegToRad(angleDeg);
      sprite
        .setTexture(ASSET_KEYS.COIN_SPIN, 0)
        .setPosition(Math.cos(rad) * orbitDist, Math.sin(rad) * orbitDist)
        .setAngle(-wheel.angle)
        .setScale(1)
        .setAlpha(1)
        .setVisible(true);

      if (this.scene.anims.exists('coin_spin_loop')) {
        sprite.play('coin_spin_loop');
      }

      wheel.collectibleLayer.add(sprite);
      this.activeItems.push({
        sprite,
        localAngleDeg: Phaser.Math.Angle.WrapDegrees(angleDeg),
        collected: false
      });
    }
  }

  /**
   * Keeps spinning coin sprites upright in world space while orbiting the wheel.
   */
  public syncWorldOrientation(wheelAngleDeg: number): void {
    for (const item of this.activeItems) {
      if (!item.collected) {
        item.sprite.angle = -wheelAngleDeg;
      }
    }
  }

  /**
   * Checks if a kunai impact at `impactLocalAngleDeg` collects an uncollected perimeter item.
   */
  public tryCollectAt(
    wheel: TargetWheel,
    impactLocalAngleDeg: number
  ): { x: number; y: number } | null {
    for (let i = 0; i < this.activeItems.length; i++) {
      const item = this.activeItems[i];
      if (item.collected) continue;
      const diff = Math.abs(
        Phaser.Math.Angle.ShortestBetween(item.localAngleDeg, impactLocalAngleDeg)
      );
      if (diff <= GEOMETRY_CONFIG.COLLECTIBLE_HIT_ANGLE_DEG) {
        item.collected = true;
        const worldRad = Phaser.Math.DegToRad(item.localAngleDeg + wheel.angle);
        const orbitDist = wheel.getRadius() + GEOMETRY_CONFIG.COLLECTIBLE_ORBIT_EXTRA;
        const wx = wheel.x + Math.cos(worldRad) * orbitDist;
        const wy = wheel.y + Math.sin(worldRad) * orbitDist;

        wheel.collectibleLayer.remove(item.sprite, false);
        this.recycleSprite(item.sprite);
        return { x: wx, y: wy };
      }
    }
    return null;
  }

  public clearAll(wheel: TargetWheel): void {
    for (const item of this.activeItems) {
      if (item.sprite.parentContainer) {
        wheel.collectibleLayer.remove(item.sprite, false);
      }
      this.recycleSprite(item.sprite);
    }
    this.activeItems.length = 0;
  }

  public destroy(wheel?: TargetWheel): void {
    if (wheel) this.clearAll(wheel);
    for (const s of this.pool) {
      s.destroy();
    }
    this.pool.length = 0;
  }

  private acquireSprite(): Phaser.GameObjects.Sprite {
    const existing = this.pool.pop();
    if (existing) return existing;
    return this.scene.add.sprite(-200, -200, ASSET_KEYS.COIN_SPIN, 0).setOrigin(0.5);
  }

  private recycleSprite(sprite: Phaser.GameObjects.Sprite): void {
    if (!sprite.scene) return;
    if (sprite.anims) {
      sprite.stop();
    }
    sprite.setVisible(false).setPosition(-200, -200).setAngle(0).setAlpha(1).setScale(1);
    this.pool.push(sprite);
  }
}
