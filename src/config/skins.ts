/**
 * Pixel-art skin catalog:
 * - 8 Kunai skins baked pixel-by-pixel via palette-swap on the CC0 base kunai sprite.
 * - 4 Composed 48x48 pixel targets built from Ninja Adventure / Kenney CC0 tiles.
 * - 3 Composed 64x64 Boss targets built from Ninja Adventure CC0 boss sprites & frames.
 */

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
  price: number;
  palette: KunaiPalette;
  trailColor: number;
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

export const KUNAI_SKINS: readonly KunaiSkinDef[] = [
  {
    id: 'kunai_iron',
    nameKey: 'skin.kunai.iron',
    price: 0,
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
    price: 50,
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
    price: 100,
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
    price: 150,
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
    id: 'kunai_amber',
    nameKey: 'skin.kunai.amber',
    price: 200,
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
    price: 300,
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
    price: 400,
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
    price: 500,
    palette: {
      outline: '#05070d',
      bladeDark: '#1f283d',
      bladeMid: '#374c6e',
      bladeLight: '#59f2e6',
      wrapDark: '#123845',
      wrapBright: '#33d6c8'
    },
    trailColor: 0x59f2e6
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

export function getKunaiSkin(id: string): KunaiSkinDef {
  return KUNAI_SKINS.find((skin) => skin.id === id) ?? KUNAI_SKINS[0];
}

export function getTargetSkin(id: string): TargetSkinDef {
  return TARGET_SKINS.find((skin) => skin.id === id) ?? TARGET_SKINS[0];
}
