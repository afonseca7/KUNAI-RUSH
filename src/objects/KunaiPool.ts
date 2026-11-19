/**
 * KunaiPool — Object-pooled pixel kunais (zero allocations per frame) with
 * discrete 24-slot feasibility planner and runtime angular collision check.
 *
 * Runtime angular collision check follows the MIT reference from iagodahlem/knife-hit
 * (Copyright © Iago Dahlem), using Phaser.Math.Angle.ShortestBetween.
 */
import Phaser from 'phaser';
import { GEOMETRY_CONFIG } from '../config/balance';
import type { TargetWheel } from './TargetWheel';

export interface LevelSlotPlan {
  preStuckAnglesDeg: number[];
  collectibleAnglesDeg: number[];
  freeSlotCount: number;
}

/**
 * Generates mathematically feasible pre-stuck kunai and collectible angles
 * on a 24-slot (15° per slot) perimeter grid so freeSlots >= kunaisToThrow.
 */
export function planLevelSlots(
  preStuckCount: number,
  collectibleCount: number,
  kunaisToThrow: number
): LevelSlotPlan {
  const slots = GEOMETRY_CONFIG.SLOT_COUNT;
  const reserved = new Set<number>();
  const preStuckSlots: number[] = [];

  // Candidate order shuffled deterministically using Math.random
  const candidates = Array.from({ length: slots }, (_, i) => i);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  // Reserve 3 slots (center + 1 buffer each side) per pre-stuck kunai
  for (const slot of candidates) {
    if (preStuckSlots.length >= preStuckCount) break;
    const left = (slot - 1 + slots) % slots;
    const right = (slot + 1) % slots;
    if (!reserved.has(slot) && !reserved.has(left) && !reserved.has(right)) {
      reserved.add(slot);
      reserved.add(left);
      reserved.add(right);
      preStuckSlots.push(slot);
    }
  }

  // Place collectibles on remaining unreserved slots (1 slot each)
  const collectibleSlots: number[] = [];
  for (const slot of candidates) {
    if (collectibleSlots.length >= collectibleCount) break;
    if (!reserved.has(slot)) {
      reserved.add(slot);
      collectibleSlots.push(slot);
    }
  }

  let freeSlotCount = slots - reserved.size;
  // Extra safety trim if ever needed
  while (freeSlotCount < kunaisToThrow && collectibleSlots.length > 0) {
    collectibleSlots.pop();
    freeSlotCount += 1;
  }

  const toDeg = (slot: number): number =>
    Phaser.Math.Angle.WrapDegrees(slot * GEOMETRY_CONFIG.SLOT_ANGLE_DEG);

  return {
    preStuckAnglesDeg: preStuckSlots.map(toDeg),
    collectibleAnglesDeg: collectibleSlots.map(toDeg),
    freeSlotCount
  };
}

interface StuckKunai {
  sprite: Phaser.GameObjects.Image;
  localAngleDeg: number;
}

interface BouncingKunai {
  sprite: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  vAngle: number;
  lifeMs: number;
}

export class KunaiPool {
  private readonly scene: Phaser.Scene;
  private readonly pool: Phaser.GameObjects.Image[] = [];
  private readonly stuck: StuckKunai[] = [];
  private readonly bouncing: BouncingKunai[] = [];
  private flying: Phaser.GameObjects.Image | null = null;
  private skinKey: string;

  constructor(scene: Phaser.Scene, initialSkinKey: string, initialCapacity: number = 28) {
    this.scene = scene;
    this.skinKey = initialSkinKey;

    for (let i = 0; i < initialCapacity; i++) {
      const img = scene.add.image(-200, -200, initialSkinKey).setOrigin(0.5).setVisible(false);
      this.pool.push(img);
    }
  }

  public setSkin(skinKey: string): void {
    this.skinKey = skinKey;
    if (this.flying) {
      this.flying.setTexture(skinKey);
    }
  }

  public clearAll(wheel: TargetWheel): void {
    if (this.flying) {
      this.recycleSprite(this.flying);
      this.flying = null;
    }

    for (const item of this.stuck) {
      wheel.stuckLayer.remove(item.sprite, false);
      this.recycleSprite(item.sprite);
    }
    this.stuck.length = 0;

    for (const b of this.bouncing) {
      this.recycleSprite(b.sprite);
    }
    this.bouncing.length = 0;
  }

  public spawnFlying(x: number, y: number, depth: number = 14): Phaser.GameObjects.Image {
    if (this.flying) {
      this.recycleSprite(this.flying);
    }
    const img = this.acquireSprite();
    img
      .setTexture(this.skinKey)
      .setPosition(Math.round(x), Math.round(y))
      .setAngle(0)
      .setScale(1)
      .setAlpha(1)
      .setDepth(depth)
      .setVisible(true);
    this.flying = img;
    return img;
  }

  public getFlying(): Phaser.GameObjects.Image | null {
    return this.flying;
  }

  public clearFlying(): void {
    if (this.flying) {
      this.recycleSprite(this.flying);
      this.flying = null;
    }
  }

  /**
   * Checks collision against all stuck kunais using ShortestBetween angular distance.
   */
  public findCollidingStuck(impactLocalAngleDeg: number): StuckKunai | null {
    for (const entry of this.stuck) {
      const diff = Math.abs(
        Phaser.Math.Angle.ShortestBetween(entry.localAngleDeg, impactLocalAngleDeg)
      );
      if (diff < GEOMETRY_CONFIG.MIN_COLLISION_ANGLE_DEG) {
        return entry;
      }
    }
    return null;
  }

  public attachStuck(
    wheel: TargetWheel,
    localAngleDeg: number,
    skinOverride?: string
  ): Phaser.GameObjects.Image {
    const img = this.flying ?? this.acquireSprite();
    this.flying = null;

    const embedDist = wheel.getRadius() + 2;
    const rad = Phaser.Math.DegToRad(localAngleDeg);
    const lx = Math.cos(rad) * embedDist;
    const ly = Math.sin(rad) * embedDist;

    img
      .setTexture(skinOverride ?? this.skinKey)
      .setPosition(lx, ly)
      .setAngle(localAngleDeg - 90)
      .setAlpha(1)
      .setScale(1)
      .setVisible(true);

    wheel.stuckLayer.add(img);
    this.stuck.push({
      sprite: img,
      localAngleDeg: Phaser.Math.Angle.WrapDegrees(localAngleDeg)
    });

    return img;
  }

  public spawnFailBounce(x: number, y: number): void {
    const img = this.flying ?? this.acquireSprite();
    this.flying = null;

    const side = Math.random() < 0.5 ? -1 : 1;
    img
      .setTexture(this.skinKey)
      .setPosition(x, y)
      .setDepth(25)
      .setVisible(true);

    this.bouncing.push({
      sprite: img,
      vx: side * (55 + Math.random() * 45),
      vy: 140 + Math.random() * 60,
      vAngle: side * 620,
      lifeMs: 1100
    });
  }

  public scatterStuckOnBreak(wheel: TargetWheel): void {
    const wheelAngleRad = Phaser.Math.DegToRad(wheel.angle);
    for (const entry of this.stuck) {
      const worldRad = Phaser.Math.DegToRad(entry.localAngleDeg) + wheelAngleRad;
      const dist = wheel.getRadius() + 2;
      const wx = wheel.x + Math.cos(worldRad) * dist;
      const wy = wheel.y + Math.sin(worldRad) * dist;

      wheel.stuckLayer.remove(entry.sprite, false);
      entry.sprite
        .setPosition(wx, wy)
        .setAngle(wheel.angle + entry.localAngleDeg - 90)
        .setDepth(22);

      const speed = 95 + Math.random() * 85;
      this.bouncing.push({
        sprite: entry.sprite,
        vx: Math.cos(worldRad) * speed,
        vy: Math.sin(worldRad) * speed - 35,
        vAngle: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 320),
        lifeMs: 900
      });
    }
    this.stuck.length = 0;
  }

  public updateBouncing(deltaMs: number): void {
    const dt = deltaMs / 1000;
    for (let i = this.bouncing.length - 1; i >= 0; i--) {
      const b = this.bouncing[i];
      b.vy += 420 * dt;
      b.sprite.x += b.vx * dt;
      b.sprite.y += b.vy * dt;
      b.sprite.angle += b.vAngle * dt;
      b.lifeMs -= deltaMs;

      if (b.lifeMs <= 0 || b.sprite.y > this.scene.scale.height + 40) {
        this.recycleSprite(b.sprite);
        this.bouncing.splice(i, 1);
      }
    }
  }

  public getStuckCount(): number {
    return this.stuck.length;
  }

  public destroy(wheel?: TargetWheel): void {
    if (wheel) this.clearAll(wheel);
    for (const img of this.pool) {
      img.destroy();
    }
    this.pool.length = 0;
  }

  private acquireSprite(): Phaser.GameObjects.Image {
    const existing = this.pool.pop();
    if (existing) return existing;
    return this.scene.add.image(-200, -200, this.skinKey).setOrigin(0.5);
  }

  private recycleSprite(img: Phaser.GameObjects.Image): void {
    if (img.parentContainer) {
      img.parentContainer.remove(img, false);
    }
    img.setVisible(false).setPosition(-200, -200).setAngle(0).setAlpha(1).setScale(1);
    this.pool.push(img);
  }
}
