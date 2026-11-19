/**
 * Pixel-art skin catalog (26 shop items across Ninjas, Kunais, and Backgrounds + 4 Targets + 3 Bosses):
 * - 8 Ninja mascot skins baked pixel-by-pixel from the CC0 Ninja Adventure sheet (Tiers 1-4).
 * - 10 Kunai skins baked pixel-by-pixel via palette-swap on the CC0 base kunai sprite (Tiers 1-4).
 * - 8 Nocturnal Background skins composed 128x128 from CC0 pack tilesets with parallax & grading (Tiers 1-4).
 * - 4 Composed 48x48 pixel targets + 3 Composed 64x64 Boss targets.
 */

export type RarityTier = 1 | 2 | 3 | 4;

export type CosmeticCategory = 'ninjas' | 'kunais' | 'backgrounds';

export type UnlockRule =
  | { type: 'free' }
  | { type: 'coins'; price: number }
  | { type: 'streak'; days: number }
  | { type: 'level'; level: number }
  | { type: 'score'; score: number };

export interface NinjaPalette {
  outline: string;
  hoodDark: string;
  hoodMid: string;
  hoodLight: string;
  accentDark: string;
  accentBright: string;
}

export interface NinjaSkinDef {
  id: string;
  nameKey: string;
  tier: RarityTier;
  price: number;
  unlockRule: UnlockRule;
  palette: NinjaPalette;
  isDefaultPalette?: boolean;
}

export interface KunaiPalette {
  outline: string;
  bladeDark: string;
  bladeMid: string;
  bladeLight: string;
  wrapDark: string;
  wrapBright: string;
}

export interface KunaiSkinDef {
  id: string;
  nameKey: string;
  tier: RarityTier;
  price: number;
  unlockRule: UnlockRule;
  palette: KunaiPalette;
  trailColor: number;
}

export interface BgTilePlacement {
  sheet: 'kenney' | 'nature' | 'element' | 'dungeon';
  index: number;
  dx: number;
  dy: number;
}

export interface BackgroundSkinDef {
  id: string;
  nameKey: string;
  tier: RarityTier;
  price: number;
  unlockRule: UnlockRule;
  textureKey: string;
  primarySheet: 'kenney' | 'nature' | 'element' | 'dungeon';
  baseTileA: number;
  baseTileB: number;
  accents: readonly BgTilePlacement[];
  gradeRgb: readonly [number, number, number];
  parallaxFactor: number;
}

export interface TargetSkinDef {
  id: string;
  nameKey: string;
  price: number;
  textureKey: string;
  chipColor: number;
  ringColor: number;
}

export interface BossSkinDef {
  id: string;
  nameKey: string;
  textureKey: string;
  facesetKey: string;
  auraColor: number;
}

export function getTierColorHex(tier: RarityTier): number {
  switch (tier) {
    case 1:
      return 0xb8c7d9;
    case 2:
      return 0x45d68a;
    case 3:
      return 0xc07cff;
    case 4:
      return 0xffe073;
  }
}

export function getTierLabelKey(tier: RarityTier): string {
  return `tier.${tier}`;
}

export const NINJA_SKINS: readonly NinjaSkinDef[] = [
  {
    id: 'ninja_shadow',
    nameKey: 'skin.ninja.shadow',
    tier: 1,
    price: 0,
    unlockRule: { type: 'free' },
    isDefaultPalette: true,
    palette: {
      outline: '#141b1b',
      hoodDark: '#3b3643',
      hoodMid: '#4e484a',
      hoodLight: '#5f7160',
      accentDark: '#d14b34',
      accentBright: '#ef914f'
    }
  },
  {
    id: 'ninja_azure',
    nameKey: 'skin.ninja.azure',
    tier: 1,
    price: 80,
    unlockRule: { type: 'coins', price: 80 },
    palette: {
      outline: '#09101f',
      hoodDark: '#1c335e',
      hoodMid: '#2f5696',
      hoodLight: '#4e85cf',
      accentDark: '#2ec4b6',
      accentBright: '#9be7ff'
    }
  },
  {
    id: 'ninja_forest',
    nameKey: 'skin.ninja.forest',
    tier: 2,
    price: 160,
    unlockRule: { type: 'coins', price: 160 },
    palette: {
      outline: '#081410',
      hoodDark: '#1a4a3a',
      hoodMid: '#2a7558',
      hoodLight: '#44a87e',
      accentDark: '#c98838',
      accentBright: '#f5be41'
    }
  },
  {
    id: 'ninja_crimson',
    nameKey: 'skin.ninja.crimson',
    tier: 2,
    price: 220,
    unlockRule: { type: 'coins', price: 220 },
    palette: {
      outline: '#18070d',
      hoodDark: '#591625',
      hoodMid: '#912238',
      hoodLight: '#c93850',
      accentDark: '#d9902b',
      accentBright: '#ffe073'
    }
  },
  {
    id: 'ninja_amber',
    nameKey: 'skin.ninja.amber',
    tier: 3,
    price: 0,
    unlockRule: { type: 'streak', days: 3 },
    palette: {
      outline: '#170f07',
      hoodDark: '#693c14',
      hoodMid: '#ab641d',
      hoodLight: '#e3962b',
      accentDark: '#1e8896',
      accentBright: '#59f2e6'
    }
  },
  {
    id: 'ninja_amethyst',
    nameKey: 'skin.ninja.amethyst',
    tier: 3,
    price: 380,
    unlockRule: { type: 'coins', price: 380 },
    palette: {
      outline: '#12081e',
      hoodDark: '#3f1e6b',
      hoodMid: '#6834ab',
      hoodLight: '#9850eb',
      accentDark: '#e04f8a',
      accentBright: '#ff9ec9'
    }
  },
  {
    id: 'ninja_shogun',
    nameKey: 'skin.ninja.shogun',
    tier: 4,
    price: 600,
    unlockRule: { type: 'coins', price: 600 },
    palette: {
      outline: '#191105',
      hoodDark: '#6e4a12',
      hoodMid: '#b57e1b',
      hoodLight: '#edb528',
      accentDark: '#b81d34',
      accentBright: '#fff3a1'
    }
  },
  {
    id: 'ninja_void',
    nameKey: 'skin.ninja.void',
    tier: 4,
    price: 850,
    unlockRule: { type: 'coins', price: 850 },
    palette: {
      outline: '#05070e',
      hoodDark: '#141e36',
      hoodMid: '#243659',
      hoodLight: '#33537d',
      accentDark: '#1ba39c',
      accentBright: '#59f2e6'
    }
  }
] as const;

export const KUNAI_SKINS: readonly KunaiSkinDef[] = [
  {
    id: 'kunai_iron',
    nameKey: 'skin.kunai.iron',
    tier: 1,
    price: 0,
    unlockRule: { type: 'free' },
    palette: {
      outline: '#0b0e18',
      bladeDark: '#5b6b82',
      bladeMid: '#94a6bd',
      bladeLight: '#e2ecf7',
      wrapDark: '#7a1c2d',
      wrapBright: '#d9384d'
    },
    trailColor: 0x94a6bd
  },
  {
    id: 'kunai_jade',
    nameKey: 'skin.kunai.jade',
    tier: 1,
    price: 50,
    unlockRule: { type: 'coins', price: 50 },
    palette: {
      outline: '#081412',
      bladeDark: '#1c6b53',
      bladeMid: '#37b887',
      bladeLight: '#9bf5c6',
      wrapDark: '#3f2e1f',
      wrapBright: '#c99846'
    },
    trailColor: 0x37b887
  },
  {
    id: 'kunai_crimson',
    nameKey: 'skin.kunai.crimson',
    tier: 2,
    price: 100,
    unlockRule: { type: 'coins', price: 100 },
    palette: {
      outline: '#16080e',
      bladeDark: '#821c2d',
      bladeMid: '#d93644',
      bladeLight: '#ff9691',
      wrapDark: '#5e4318',
      wrapBright: '#f5be41'
    },
    trailColor: 0xd93644
  },
  {
    id: 'kunai_cobalt',
    nameKey: 'skin.kunai.cobalt',
    tier: 2,
    price: 150,
    unlockRule: { type: 'coins', price: 150 },
    palette: {
      outline: '#080e1c',
      bladeDark: '#234b91',
      bladeMid: '#4888e6',
      bladeLight: '#a6e1ff',
      wrapDark: '#2b3347',
      wrapBright: '#d6e2f5'
    },
    trailColor: 0x4888e6
  },
  {
    id: 'kunai_bamboo',
    nameKey: 'skin.kunai.bamboo',
    tier: 2,
    price: 0,
    unlockRule: { type: 'level', level: 5 },
    palette: {
      outline: '#0d1409',
      bladeDark: '#3d7023',
      bladeMid: '#6fb33b',
      bladeLight: '#c4f576',
      wrapDark: '#69401f',
      wrapBright: '#d99846'
    },
    trailColor: 0x6fb33b
  },
  {
    id: 'kunai_amber',
    nameKey: 'skin.kunai.amber',
    tier: 3,
    price: 240,
    unlockRule: { type: 'coins', price: 240 },
    palette: {
      outline: '#170f08',
      bladeDark: '#995315',
      bladeMid: '#e88b23',
      bladeLight: '#ffe073',
      wrapDark: '#232030',
      wrapBright: '#6b6485'
    },
    trailColor: 0xe88b23
  },
  {
    id: 'kunai_violet',
    nameKey: 'skin.kunai.violet',
    tier: 3,
    price: 340,
    unlockRule: { type: 'coins', price: 340 },
    palette: {
      outline: '#11081c',
      bladeDark: '#57288f',
      bladeMid: '#9850eb',
      bladeLight: '#e0adff',
      wrapDark: '#201833',
      wrapBright: '#f26ba7'
    },
    trailColor: 0x9850eb
  },
  {
    id: 'kunai_gold',
    nameKey: 'skin.kunai.gold',
    tier: 4,
    price: 500,
    unlockRule: { type: 'coins', price: 500 },
    palette: {
      outline: '#1a1106',
      bladeDark: '#9e6c14',
      bladeMid: '#edb528',
      bladeLight: '#fff3a1',
      wrapDark: '#7a1929',
      wrapBright: '#e63549'
    },
    trailColor: 0xedb528
  },
  {
    id: 'kunai_obsidian',
    nameKey: 'skin.kunai.obsidian',
    tier: 4,
    price: 680,
    unlockRule: { type: 'coins', price: 680 },
    palette: {
      outline: '#05070d',
      bladeDark: '#1f283d',
      bladeMid: '#374c6e',
      bladeLight: '#59f2e6',
      wrapDark: '#123845',
      wrapBright: '#33d6c8'
    },
    trailColor: 0x59f2e6
  },
  {
    id: 'kunai_celestial',
    nameKey: 'skin.kunai.celestial',
    tier: 4,
    price: 900,
    unlockRule: { type: 'coins', price: 900 },
    palette: {
      outline: '#0b0a1f',
      bladeDark: '#3675b8',
      bladeMid: '#6be0ff',
      bladeLight: '#ffffff',
      wrapDark: '#822878',
      wrapBright: '#ff94e0'
    },
    trailColor: 0x6be0ff
  }
] as const;

export const BACKGROUND_SKINS: readonly BackgroundSkinDef[] = [
  {
    id: 'bg_dojo',
    nameKey: 'skin.bg.dojo',
    tier: 1,
    price: 0,
    unlockRule: { type: 'free' },
    textureKey: 'bg_dojo_pattern',
    primarySheet: 'kenney',
    baseTileA: 12 * 3 + 4,
    baseTileB: 12 * 4 + 9,
    accents: [
      { sheet: 'nature', index: 24 * 8 + 10, dx: 16, dy: 16 },
      { sheet: 'nature', index: 24 * 9 + 10, dx: 16, dy: 32 },
      { sheet: 'nature', index: 24 * 8 + 11, dx: 96, dy: 64 },
      { sheet: 'nature', index: 24 * 9 + 11, dx: 96, dy: 80 },
      { sheet: 'element', index: 16 * 3 + 6, dx: 64, dy: 96 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 64, dy: 112 }
    ],
    gradeRgb: [0.34, 0.4, 0.58],
    parallaxFactor: 1.0
  },
  {
    id: 'bg_bamboo',
    nameKey: 'skin.bg.bamboo',
    tier: 1,
    price: 90,
    unlockRule: { type: 'coins', price: 90 },
    textureKey: 'bg_bamboo_pattern',
    primarySheet: 'nature',
    baseTileA: 73,
    baseTileB: 74,
    accents: [
      { sheet: 'nature', index: 24 * 8 + 10, dx: 32, dy: 16 },
      { sheet: 'nature', index: 24 * 9 + 10, dx: 32, dy: 32 },
      { sheet: 'nature', index: 24 * 8 + 11, dx: 80, dy: 48 },
      { sheet: 'nature', index: 24 * 9 + 11, dx: 80, dy: 64 },
      { sheet: 'nature', index: 0, dx: 16, dy: 96 },
      { sheet: 'nature', index: 1, dx: 96, dy: 16 }
    ],
    gradeRgb: [0.24, 0.44, 0.42],
    parallaxFactor: 1.15
  },
  {
    id: 'bg_village',
    nameKey: 'skin.bg.village',
    tier: 2,
    price: 170,
    unlockRule: { type: 'coins', price: 170 },
    textureKey: 'bg_village_pattern',
    primarySheet: 'element',
    baseTileA: 134,
    baseTileB: 135,
    accents: [
      { sheet: 'element', index: 16 * 3 + 6, dx: 16, dy: 32 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 16, dy: 48 },
      { sheet: 'element', index: 16 * 3 + 6, dx: 96, dy: 80 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 96, dy: 96 },
      { sheet: 'kenney', index: 63, dx: 48, dy: 16 }
    ],
    gradeRgb: [0.38, 0.36, 0.56],
    parallaxFactor: 1.05
  },
  {
    id: 'bg_temple',
    nameKey: 'skin.bg.temple',
    tier: 2,
    price: 240,
    unlockRule: { type: 'coins', price: 240 },
    textureKey: 'bg_temple_pattern',
    primarySheet: 'dungeon',
    baseTileA: 0,
    baseTileB: 1,
    accents: [
      { sheet: 'dungeon', index: 12, dx: 16, dy: 16 },
      { sheet: 'dungeon', index: 13, dx: 80, dy: 64 },
      { sheet: 'element', index: 16 * 3 + 6, dx: 48, dy: 96 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 48, dy: 112 }
    ],
    gradeRgb: [0.36, 0.32, 0.52],
    parallaxFactor: 0.95
  },
  {
    id: 'bg_shrine',
    nameKey: 'skin.bg.shrine',
    tier: 3,
    price: 0,
    unlockRule: { type: 'score', score: 25 },
    textureKey: 'bg_shrine_pattern',
    primarySheet: 'kenney',
    baseTileA: 0,
    baseTileB: 1,
    accents: [
      { sheet: 'element', index: 16 * 3 + 6, dx: 16, dy: 16 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 16, dy: 32 },
      { sheet: 'nature', index: 24 * 8 + 10, dx: 80, dy: 80 },
      { sheet: 'nature', index: 24 * 9 + 10, dx: 80, dy: 96 }
    ],
    gradeRgb: [0.46, 0.3, 0.48],
    parallaxFactor: 1.2
  },
  {
    id: 'bg_fortress',
    nameKey: 'skin.bg.fortress',
    tier: 3,
    price: 420,
    unlockRule: { type: 'coins', price: 420 },
    textureKey: 'bg_fortress_pattern',
    primarySheet: 'dungeon',
    baseTileA: 16,
    baseTileB: 17,
    accents: [
      { sheet: 'dungeon', index: 27, dx: 32, dy: 32 },
      { sheet: 'dungeon', index: 28, dx: 96, dy: 96 },
      { sheet: 'kenney', index: 54, dx: 16, dy: 80 }
    ],
    gradeRgb: [0.3, 0.34, 0.6],
    parallaxFactor: 1.1
  },
  {
    id: 'bg_moonlit',
    nameKey: 'skin.bg.moonlit',
    tier: 4,
    price: 640,
    unlockRule: { type: 'coins', price: 640 },
    textureKey: 'bg_moonlit_pattern',
    primarySheet: 'kenney',
    baseTileA: 7,
    baseTileB: 8,
    accents: [
      { sheet: 'nature', index: 24 * 8 + 11, dx: 32, dy: 16 },
      { sheet: 'nature', index: 24 * 9 + 11, dx: 32, dy: 32 },
      { sheet: 'element', index: 16 * 3 + 6, dx: 80, dy: 80 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 80, dy: 96 }
    ],
    gradeRgb: [0.28, 0.42, 0.66],
    parallaxFactor: 1.25
  },
  {
    id: 'bg_abyss',
    nameKey: 'skin.bg.abyss',
    tier: 4,
    price: 880,
    unlockRule: { type: 'coins', price: 880 },
    textureKey: 'bg_abyss_pattern',
    primarySheet: 'kenney',
    baseTileA: 9,
    baseTileB: 10,
    accents: [
      { sheet: 'dungeon', index: 12, dx: 48, dy: 48 },
      { sheet: 'element', index: 16 * 3 + 6, dx: 96, dy: 16 },
      { sheet: 'element', index: 16 * 4 + 6, dx: 96, dy: 32 }
    ],
    gradeRgb: [0.36, 0.28, 0.68],
    parallaxFactor: 1.3
  }
] as const;

export const TARGET_SKINS: readonly TargetSkinDef[] = [
  {
    id: 'target_log',
    nameKey: 'skin.target.log',
    price: 0,
    textureKey: 'target_composed_log',
    chipColor: 0x9c6538,
    ringColor: 0xd9a066
  },
  {
    id: 'target_stone',
    nameKey: 'skin.target.stone',
    price: 150,
    textureKey: 'target_composed_stone',
    chipColor: 0x6b7c94,
    ringColor: 0x9fb3cc
  },
  {
    id: 'target_lantern',
    nameKey: 'skin.target.lantern',
    price: 350,
    textureKey: 'target_composed_lantern',
    chipColor: 0xd94848,
    ringColor: 0xf7b945
  },
  {
    id: 'target_oni',
    nameKey: 'skin.target.oni',
    price: 650,
    textureKey: 'target_composed_oni',
    chipColor: 0x7332a8,
    ringColor: 0x3ef0be
  }
] as const;

export const BOSS_SKINS: readonly BossSkinDef[] = [
  {
    id: 'boss_bamboo',
    nameKey: 'boss.bamboo.name',
    textureKey: 'target_boss_0',
    facesetKey: 'boss_face_0',
    auraColor: 0x45d68a
  },
  {
    id: 'boss_cyclops',
    nameKey: 'boss.cyclops.name',
    textureKey: 'target_boss_1',
    facesetKey: 'boss_face_1',
    auraColor: 0xeb5b42
  },
  {
    id: 'boss_samurai',
    nameKey: 'boss.samurai.name',
    textureKey: 'target_boss_2',
    facesetKey: 'boss_face_2',
    auraColor: 0x9850eb
  }
] as const;

export interface CosmeticPoolEntry {
  category: CosmeticCategory;
  id: string;
  nameKey: string;
  tier: RarityTier;
}

export function getAllShopCosmetics(): CosmeticPoolEntry[] {
  const list: CosmeticPoolEntry[] = [];
  for (const n of NINJA_SKINS) {
    list.push({ category: 'ninjas', id: n.id, nameKey: n.nameKey, tier: n.tier });
  }
  for (const k of KUNAI_SKINS) {
    list.push({ category: 'kunais', id: k.id, nameKey: k.nameKey, tier: k.tier });
  }
  for (const b of BACKGROUND_SKINS) {
    list.push({ category: 'backgrounds', id: b.id, nameKey: b.nameKey, tier: b.tier });
  }
  return list;
}

export function getNinjaSkin(id: string): NinjaSkinDef {
  return NINJA_SKINS.find((skin) => skin.id === id) ?? NINJA_SKINS[0];
}

export function getKunaiSkin(id: string): KunaiSkinDef {
  return KUNAI_SKINS.find((skin) => skin.id === id) ?? KUNAI_SKINS[0];
}

export function getBackgroundSkin(id: string): BackgroundSkinDef {
  return BACKGROUND_SKINS.find((skin) => skin.id === id) ?? BACKGROUND_SKINS[0];
}

export function getTargetSkin(id: string): TargetSkinDef {
  return TARGET_SKINS.find((skin) => skin.id === id) ?? TARGET_SKINS[0];
}
