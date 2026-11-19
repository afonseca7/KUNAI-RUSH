/**
 * Centralized game balance, dual pixel-perfect viewport math, level feasibility
 * constraints, economy, juice timings, and ad cadence configuration.
 */

export type ViewportProfile = 'tall' | 'short';

export interface ViewportMetrics {
  profile: ViewportProfile;
  logicalW: number;
  logicalH: number;
  scale: number;
  canvasCssW: number;
  canvasCssH: number;
  letterboxX: number;
  letterboxY: number;
}

export type RotationPattern = 'constant' | 'accel' | 'reverse' | 'sinusoidal';

export interface LevelSpec {
  level: number;
  isBoss: boolean;
  bossIndex: number; // 0..2 cycling through 3 boss variants
  bossPhases: number; // 1 for normal, 3 for boss
  kunaisToThrow: number;
  preStuckCount: number;
  collectibleCount: number;
  baseSpeedDegPerSec: number;
  initialDirection: 1 | -1;
  pattern: RotationPattern;
  targetSkinIndex: number; // 0..3 for normal levels
}

export const VIEWPORT_CONFIG = {
  TALL_LOGICAL_H: 400,
  SHORT_LOGICAL_H: 320,
  MIN_LOGICAL_W: 180,
  MAX_LOGICAL_W: 240,
  MAX_INTEGER_SCALE: 4,
  TILE_SIZE: 16
} as const;

/**
 * Deterministic selector for dual logical profile (180x400 default vs 180x320 short)
 * and integer-only canvas scaling (x1..x4), never fractional or cropped.
 */
export function computeViewportMetrics(cssW: number, cssH: number): ViewportMetrics {
  const safeW = Math.max(1, Math.floor(cssW));
  const safeH = Math.max(1, Math.floor(cssH));

  const profile: ViewportProfile =
    Math.floor(safeH / VIEWPORT_CONFIG.TALL_LOGICAL_H) >= 2 ? 'tall' : 'short';
  const logicalH =
    profile === 'tall'
      ? VIEWPORT_CONFIG.TALL_LOGICAL_H
      : VIEWPORT_CONFIG.SHORT_LOGICAL_H;

  const rawScale = Math.min(
    Math.floor(safeW / VIEWPORT_CONFIG.MIN_LOGICAL_W),
    Math.floor(safeH / logicalH)
  );
  const scale = Math.max(1, Math.min(VIEWPORT_CONFIG.MAX_INTEGER_SCALE, rawScale));

  const adaptiveW = Math.floor(safeW / scale);
  const logicalW = Math.max(
    VIEWPORT_CONFIG.MIN_LOGICAL_W,
    Math.min(VIEWPORT_CONFIG.MAX_LOGICAL_W, adaptiveW)
  );

  const canvasCssW = logicalW * scale;
  const canvasCssH = logicalH * scale;

  return {
    profile,
    logicalW,
    logicalH,
    scale,
    canvasCssW,
    canvasCssH,
    letterboxX: Math.max(0, safeW - canvasCssW),
    letterboxY: Math.max(0, safeH - canvasCssH)
  };
}

/**
 * Proportional vertical layout anchors expressed as fractions of `logicalH`.
 * All scenes position HUD, wheel, ninja mascot and buttons from these anchors
 * so both 400px tall and 320px short profiles render cleanly without overlap.
 */
export const LAYOUT_FRACTIONS = {
  HUD_TOP_Y: 0.065,
  TARGET_CENTER_Y: 0.37,
  READY_KUNAI_Y: 0.72,
  NINJA_MASCOT_Y: 0.84,
  BOTTOM_SAFE_BANNER_FRAC: 0.14
} as const;

export const GEOMETRY_CONFIG = {
  TARGET_RADIUS: 24,
  BOSS_TARGET_RADIUS: 28,
  KUNAI_EMBED_DEPTH: 6,
  KUNAI_LENGTH: 16,
  COLLECTIBLE_ORBIT_EXTRA: 9,
  /** Minimum angular clearance in degrees for kunai-to-kunai collision in runtime. */
  MIN_COLLISION_ANGLE_DEG: 11,
  /** Angular hit radius for collecting perimeter items (scrolls/coins). */
  COLLECTIBLE_HIT_ANGLE_DEG: 13,
  /** Discretized perimeter slots for impossible-level prevention. */
  SLOT_COUNT: 24,
  SLOT_ANGLE_DEG: 15,
  PRE_STUCK_BUFFER_SLOTS: 1,
  MAX_PRE_STUCK: 3,
  MAX_COLLECTIBLES: 3,
  MAX_KUNAIS_PER_WAVE: 10
} as const;

export const GAMEPLAY_CONFIG = {
  KUNAI_THROW_SPEED_PX_PER_SEC: 940,
  INPUT_DEBOUNCE_MS: 85,
  TELEGRAPH_DURATION_MS: 380,
  HIT_STOP_MS: 80,
  SLOW_MO_DURATION_MS: 400,
  SLOW_MO_TIME_SCALE: 0.35,
  COMBO_WINDOW_MS: 950,
  BOSS_INTERVAL_LEVELS: 5,
  BOSS_PHASES: 3,
  MAX_REVIVES_PER_RUN: 1
} as const;

export const ECONOMY_CONFIG = {
  COIN_PER_COLLECTIBLE: 2,
  LEVEL_CLEAR_BASE_COINS: 3,
  BOSS_CLEAR_BONUS_COINS: 15,
  DAILY_STREAK_REWARDS: [10, 15, 25, 40] as const,
  SHOP_FREE_COINS_REWARD: 25
} as const;

export const ADS_CADENCE_CONFIG = {
  INTERSTITIAL_SKIP_FIRST_GAME_OVERS: 2,
  INTERSTITIAL_EVERY_N_GAME_OVERS: 2,
  INTERSTITIAL_COOLDOWN_MS: 60_000,
  APP_OPEN_MIN_LAUNCH_COUNT: 2,
  APP_OPEN_TIMEOUT_MS: 4_000,
  SHOP_FREE_COINS_COOLDOWN_MS: 180_000,
  BANNER_SCENES: ['MenuScene', 'ShopScene', 'GameOverScene'] as readonly string[]
} as const;

export type LuckySpinRewardType = 'multiplier' | 'coins' | 'chest';

export interface LuckySpinSegmentDef {
  id: string;
  index: number;
  type: LuckySpinRewardType;
  value: number;
  label: string;
  weight: number;
  colorHex: number;
  isHighTier: boolean;
}

export const LUCKY_SPIN_CONFIG = {
  FREE_SPIN_COOLDOWN_MS: 4 * 60 * 60 * 1000,
  MAX_DAILY_AD_SPINS: 3,
  POST_GAMEOVER_EVERY_N: 3,
  SEGMENTS: [
    { id: 'spin_x2', index: 0, type: 'multiplier', value: 2, label: 'x2', weight: 350, colorHex: 0x37b887, isHighTier: false },
    { id: 'spin_c50', index: 1, type: 'coins', value: 50, label: '50', weight: 100, colorHex: 0xf5be41, isHighTier: false },
    { id: 'spin_x3', index: 2, type: 'multiplier', value: 3, label: 'x3', weight: 350, colorHex: 0x4888e6, isHighTier: false },
    { id: 'spin_chest', index: 3, type: 'chest', value: 1, label: 'COFRE', weight: 90, colorHex: 0xe88b23, isHighTier: true },
    { id: 'spin_x5', index: 4, type: 'multiplier', value: 5, label: 'x5', weight: 50, colorHex: 0x9850eb, isHighTier: false },
    { id: 'spin_c150', index: 5, type: 'coins', value: 150, label: '150', weight: 30, colorHex: 0xff9691, isHighTier: false },
    { id: 'spin_x10', index: 6, type: 'multiplier', value: 10, label: 'x10', weight: 15, colorHex: 0xd93644, isHighTier: true },
    { id: 'spin_x30', index: 7, type: 'multiplier', value: 30, label: 'x30', weight: 15, colorHex: 0x59f2e6, isHighTier: true }
  ] as readonly LuckySpinSegmentDef[]
} as const;

export function rollWeightedLuckySegment(randFn: () => number = Math.random): LuckySpinSegmentDef {
  const segs = LUCKY_SPIN_CONFIG.SEGMENTS;
  let totalWeight = 0;
  for (const s of segs) totalWeight += s.weight;
  let roll = randFn() * totalWeight;
  for (const s of segs) {
    roll -= s.weight;
    if (roll < 0) return s;
  }
  return segs[0];
}

export const CHEST_KEY_CONFIG = {
  KEYS_PER_SKIN: 3,
  CHEST_KEY_REWARD: 1.0,
  CHEST_GOLD_REWARD: 25,
  /** Key reward fractions for 1st, 2nd, 3rd kill of each unique boss; 4th+ yields 0. */
  BOSS_KEY_DROPS: [1.0, 0.5, 0.25] as readonly number[]
} as const;

export function getRotationPatternForLevel(level: number): RotationPattern {
  if (level <= 4) return 'constant';
  if (level <= 9) return 'accel';
  if (level <= 14) return 'reverse';
  return 'sinusoidal';
}

export function getLevelSpec(level: number): LevelSpec {
  const safeLevel = Math.max(1, Math.floor(level));
  const isBoss = safeLevel % GAMEPLAY_CONFIG.BOSS_INTERVAL_LEVELS === 0;
  const bossIndex = isBoss
    ? Math.floor(safeLevel / GAMEPLAY_CONFIG.BOSS_INTERVAL_LEVELS - 1) % 3
    : 0;

  // Normal waves scale from 5 kunais (lv1) to max 10 so 24-slot guarantees hold.
  // Boss levels run 3 consecutive phases with 4..7 kunais per phase.
  const rawKunais = isBoss
    ? Math.min(7, 4 + Math.floor(safeLevel / 10))
    : Math.min(GEOMETRY_CONFIG.MAX_KUNAIS_PER_WAVE, 5 + Math.floor((safeLevel - 1) / 3));

  let preStuckCount = 0;
  if (!isBoss) {
    if (safeLevel === 2 || safeLevel === 3) preStuckCount = 1;
    else if (safeLevel >= 4 && safeLevel <= 9) preStuckCount = 2;
    else if (safeLevel >= 10) preStuckCount = GEOMETRY_CONFIG.MAX_PRE_STUCK;
  } else {
    preStuckCount = safeLevel >= 10 ? 2 : 1;
  }

  const collectibleCount = isBoss
    ? 2
    : safeLevel === 1
      ? 1
      : Math.min(GEOMETRY_CONFIG.MAX_COLLECTIBLES, 1 + (safeLevel % 3));

  // Enforce 24-slot mathematical feasibility:
  // Each pre-stuck reserves (1 + 2 * PRE_STUCK_BUFFER_SLOTS) = 3 slots; each collectible reserves 1 slot.
  const reservedSlots =
    preStuckCount * (1 + GEOMETRY_CONFIG.PRE_STUCK_BUFFER_SLOTS * 2) + collectibleCount;
  const freeSlots = GEOMETRY_CONFIG.SLOT_COUNT - reservedSlots;
  const kunaisToThrow = Math.min(rawKunais, Math.max(1, freeSlots));

  const baseSpeedDegPerSec = Math.min(198, 86 + (safeLevel - 1) * 5.2 + (isBoss ? 14 : 0));
  const initialDirection: 1 | -1 = safeLevel % 2 === 1 ? 1 : -1;
  const targetSkinIndex = Math.floor((safeLevel - 1) / 2) % 4;

  return {
    level: safeLevel,
    isBoss,
    bossIndex,
    bossPhases: isBoss ? GAMEPLAY_CONFIG.BOSS_PHASES : 1,
    kunaisToThrow,
    preStuckCount,
    collectibleCount,
    baseSpeedDegPerSec,
    initialDirection,
    pattern: getRotationPatternForLevel(safeLevel),
    targetSkinIndex
  };
}
