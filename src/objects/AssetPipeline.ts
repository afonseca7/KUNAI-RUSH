import Phaser from 'phaser';
import { LUCKY_SPIN_CONFIG } from '../config/balance';
import {
  BACKGROUND_SKINS,
  BOSS_SKINS,
  KUNAI_SKINS,
  NINJA_SKINS,
  type KunaiPalette,
  type NinjaPalette
} from '../config/skins';
import { bakeProceduralEffects } from './EffectsFactory';

// Static Vite URL imports for all vendored CC0 assets
import pixelFontPngUrl from '../assets/fonts/pixel_font.png';
import pixelFontXmlUrl from '../assets/fonts/pixel_font.xml?url';

import kunaiBaseUrl from '../assets/sprites/kunai_base.png';
import ninjaIdleUrl from '../assets/sprites/ninja_idle.png';
import ninjaAttackUrl from '../assets/sprites/ninja_attack.png';
import ninjaJumpUrl from '../assets/sprites/ninja_jump.png';
import ninjaSheetUrl from '../assets/sprites/ninja_sheet.png';
import coinSpinUrl from '../assets/sprites/coin_spin.png';
import scrollItemUrl from '../assets/sprites/scroll_item.png';
import vfxSmokeUrl from '../assets/sprites/vfx_smoke.png';
import vfxSparkUrl from '../assets/sprites/vfx_spark.png';
import vfxExplosionUrl from '../assets/sprites/vfx_explosion.png';

import sphereWoodUrl from '../assets/targets/sphere_wood.png';
import sphereIronUrl from '../assets/targets/sphere_iron.png';
import sphereRedUrl from '../assets/targets/sphere_red.png';
import sphereBambooUrl from '../assets/targets/sphere_bamboo.png';
import sphereMetalUrl from '../assets/targets/sphere_metal.png';
import treeStumpUrl from '../assets/targets/tree_stump.png';
import treeStumpDarkUrl from '../assets/targets/tree_stump_dark.png';
import bossBambooFaceUrl from '../assets/targets/boss_bamboo_face.png';
import bossCyclopsFaceUrl from '../assets/targets/boss_cyclops_face.png';
import bossSamuraiFaceUrl from '../assets/targets/boss_samurai_face.png';

import tilesNatureUrl from '../assets/tiles/tiles_nature.png';
import tilesElementUrl from '../assets/tiles/tiles_element.png';
import tilesDungeonUrl from '../assets/tiles/tiles_dungeon.png';
import tilesKenneyUrl from '../assets/tiles/tiles_kenney.png';

import panelWoodUrl from '../assets/ui/panel_wood.png';
import panelDarkUrl from '../assets/ui/panel_dark.png';
import panelRedUrl from '../assets/ui/panel_red.png';
import panelBambooUrl from '../assets/ui/panel_bamboo.png';
import panelBgUrl from '../assets/ui/panel_bg.png';
import panelBgDarkUrl from '../assets/ui/panel_bg_dark.png';
import btnNormalUrl from '../assets/ui/btn_normal.png';
import btnHoverUrl from '../assets/ui/btn_hover.png';
import btnPressedUrl from '../assets/ui/btn_pressed.png';
import btnDisabledUrl from '../assets/ui/btn_disabled.png';
import tabSelectedUrl from '../assets/ui/tab_selected.png';
import tabUnselectedUrl from '../assets/ui/tab_unselected.png';
import arrowLeftUrl from '../assets/ui/arrow_left.png';
import arrowRightUrl from '../assets/ui/arrow_right.png';
import checkedUrl from '../assets/ui/checked.png';
import uncheckedUrl from '../assets/ui/unchecked.png';
import inventoryCellUrl from '../assets/ui/inventory_cell.png';
import iconCoinUrl from '../assets/ui/icon_coin.png';
import iconHeartUrl from '../assets/ui/icon_heart.png';
import iconKunaiBadgeUrl from '../assets/ui/icon_kunai_badge.png';
import iconMoneyBadgeUrl from '../assets/ui/icon_money_badge.png';
import barUnderUrl from '../assets/ui/bar_under.png';
import barProgressUrl from '../assets/ui/bar_progress.png';
import chestClosedUrl from '../assets/ui/chest_closed.png';
import chestOpenUrl from '../assets/ui/chest_open.png';
import iconKeyUrl from '../assets/ui/icon_key.png';
import iconGoldUrl from '../assets/ui/icon_gold.png';

import sfxThrowUrl from '../assets/audio/sfx_throw.wav';
import sfxThunkUrl from '../assets/audio/sfx_thunk.wav';
import sfxCrackUrl from '../assets/audio/sfx_crack.wav';
import sfxClangUrl from '../assets/audio/sfx_clang.wav';
import sfxCoinUrl from '../assets/audio/sfx_coin.wav';
import sfxBossUrl from '../assets/audio/sfx_boss.wav';
import sfxFailUrl from '../assets/audio/sfx_fail.wav';
import sfxLevelupUrl from '../assets/audio/sfx_levelup.wav';
import sfxClickUrl from '../assets/audio/sfx_click.wav';
import bgmNightUrl from '../assets/audio/bgm_night.ogg';

export const ASSET_KEYS = {
  FONT_PIXEL: 'pixel_font',
  KUNAI_BASE: 'kunai_base',
  NINJA_IDLE: 'ninja_idle',
  NINJA_ATTACK: 'ninja_attack',
  NINJA_JUMP: 'ninja_jump',
  NINJA_SHEET: 'ninja_sheet',
  COIN_SPIN: 'coin_spin',
  SCROLL_ITEM: 'scroll_item',
  VFX_SMOKE: 'vfx_smoke',
  VFX_SPARK: 'vfx_spark',
  VFX_EXPLOSION: 'vfx_explosion',

  SPHERE_WOOD: 'sphere_wood',
  SPHERE_IRON: 'sphere_iron',
  SPHERE_RED: 'sphere_red',
  SPHERE_BAMBOO: 'sphere_bamboo',
  SPHERE_METAL: 'sphere_metal',
  TREE_STUMP: 'tree_stump',
  TREE_STUMP_DARK: 'tree_stump_dark',

  BOSS_FACE_0: 'boss_face_0',
  BOSS_FACE_1: 'boss_face_1',
  BOSS_FACE_2: 'boss_face_2',

  TILES_NATURE: 'tiles_nature',
  TILES_ELEMENT: 'tiles_element',
  TILES_DUNGEON: 'tiles_dungeon',
  TILES_KENNEY: 'tiles_kenney',

  UI_PANEL_WOOD: 'ui_panel_wood',
  UI_PANEL_DARK: 'ui_panel_dark',
  UI_PANEL_RED: 'ui_panel_red',
  UI_PANEL_BAMBOO: 'ui_panel_bamboo',
  UI_PANEL_BG: 'ui_panel_bg',
  UI_PANEL_BG_DARK: 'ui_panel_bg_dark',
  UI_BTN_NORMAL: 'ui_btn_normal',
  UI_BTN_HOVER: 'ui_btn_hover',
  UI_BTN_PRESSED: 'ui_btn_pressed',
  UI_BTN_DISABLED: 'ui_btn_disabled',
  UI_TAB_SELECTED: 'ui_tab_selected',
  UI_TAB_UNSELECTED: 'ui_tab_unselected',
  UI_ARROW_LEFT: 'ui_arrow_left',
  UI_ARROW_RIGHT: 'ui_arrow_right',
  UI_CHECKED: 'ui_checked',
  UI_UNCHECKED: 'ui_unchecked',
  UI_CELL: 'ui_inventory_cell',
  UI_ICON_COIN: 'ui_icon_coin',
  UI_ICON_HEART: 'ui_icon_heart',
  UI_ICON_KUNAI_BADGE: 'ui_icon_kunai_badge',
  UI_ICON_MONEY_BADGE: 'ui_icon_money_badge',
  UI_BAR_UNDER: 'ui_bar_under',
  UI_BAR_PROGRESS: 'ui_bar_progress',
  UI_CHEST_CLOSED: 'ui_chest_closed',
  UI_CHEST_OPEN: 'ui_chest_open',
  UI_ICON_KEY: 'ui_icon_key',
  UI_ICON_GOLD: 'ui_icon_gold',
  UI_WHEEL_64: 'ui_lucky_wheel_64',
  UI_WHEEL_MINI: 'ui_lucky_wheel_mini',
  UI_WHEEL_POINTER: 'ui_wheel_pointer',

  BG_DOJO_PATTERN: 'bg_dojo_pattern',

  SFX_THROW: 'sfx_throw',
  SFX_THUNK: 'sfx_thunk',
  SFX_CRACK: 'sfx_crack',
  SFX_CLANG: 'sfx_clang',
  SFX_COIN: 'sfx_coin',
  SFX_BOSS: 'sfx_boss',
  SFX_FAIL: 'sfx_fail',
  SFX_LEVELUP: 'sfx_levelup',
  SFX_CLICK: 'sfx_click',
  BGM_NIGHT: 'bgm_night'
} as const;

export function queueAllGameAssets(scene: Phaser.Scene): void {
  scene.load.bitmapFont(ASSET_KEYS.FONT_PIXEL, pixelFontPngUrl, pixelFontXmlUrl);

  // Base static sprites
  scene.load.image(ASSET_KEYS.KUNAI_BASE, kunaiBaseUrl);
  scene.load.image(ASSET_KEYS.SCROLL_ITEM, scrollItemUrl);

  // 1px extruded spritesheets -> margin: 1, spacing: 2
  const sheetOpts16 = { frameWidth: 16, frameHeight: 16, margin: 1, spacing: 2 };
  scene.load.spritesheet(ASSET_KEYS.NINJA_IDLE, ninjaIdleUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.NINJA_ATTACK, ninjaAttackUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.NINJA_JUMP, ninjaJumpUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.NINJA_SHEET, ninjaSheetUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.COIN_SPIN, coinSpinUrl, sheetOpts16);

  scene.load.spritesheet(ASSET_KEYS.VFX_SMOKE, vfxSmokeUrl, {
    frameWidth: 30,
    frameHeight: 14,
    margin: 1,
    spacing: 2
  });
  scene.load.spritesheet(ASSET_KEYS.VFX_SPARK, vfxSparkUrl, {
    frameWidth: 30,
    frameHeight: 35,
    margin: 1,
    spacing: 2
  });
  scene.load.spritesheet(ASSET_KEYS.VFX_EXPLOSION, vfxExplosionUrl, {
    frameWidth: 40,
    frameHeight: 40,
    margin: 1,
    spacing: 2
  });

  // Target components & Boss facesets
  scene.load.image(ASSET_KEYS.SPHERE_WOOD, sphereWoodUrl);
  scene.load.image(ASSET_KEYS.SPHERE_IRON, sphereIronUrl);
  scene.load.image(ASSET_KEYS.SPHERE_RED, sphereRedUrl);
  scene.load.image(ASSET_KEYS.SPHERE_BAMBOO, sphereBambooUrl);
  scene.load.image(ASSET_KEYS.SPHERE_METAL, sphereMetalUrl);
  scene.load.image(ASSET_KEYS.TREE_STUMP, treeStumpUrl);
  scene.load.image(ASSET_KEYS.TREE_STUMP_DARK, treeStumpDarkUrl);
  scene.load.image(ASSET_KEYS.BOSS_FACE_0, bossBambooFaceUrl);
  scene.load.image(ASSET_KEYS.BOSS_FACE_1, bossCyclopsFaceUrl);
  scene.load.image(ASSET_KEYS.BOSS_FACE_2, bossSamuraiFaceUrl);

  // 1px extruded tilesets
  scene.load.spritesheet(ASSET_KEYS.TILES_NATURE, tilesNatureUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.TILES_ELEMENT, tilesElementUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.TILES_DUNGEON, tilesDungeonUrl, sheetOpts16);
  scene.load.spritesheet(ASSET_KEYS.TILES_KENNEY, tilesKenneyUrl, sheetOpts16);

  // UI 9-slice assets & icons
  scene.load.image(ASSET_KEYS.UI_PANEL_WOOD, panelWoodUrl);
  scene.load.image(ASSET_KEYS.UI_PANEL_DARK, panelDarkUrl);
  scene.load.image(ASSET_KEYS.UI_PANEL_RED, panelRedUrl);
  scene.load.image(ASSET_KEYS.UI_PANEL_BAMBOO, panelBambooUrl);
  scene.load.image(ASSET_KEYS.UI_PANEL_BG, panelBgUrl);
  scene.load.image(ASSET_KEYS.UI_PANEL_BG_DARK, panelBgDarkUrl);
  scene.load.image(ASSET_KEYS.UI_BTN_NORMAL, btnNormalUrl);
  scene.load.image(ASSET_KEYS.UI_BTN_HOVER, btnHoverUrl);
  scene.load.image(ASSET_KEYS.UI_BTN_PRESSED, btnPressedUrl);
  scene.load.image(ASSET_KEYS.UI_BTN_DISABLED, btnDisabledUrl);
  scene.load.image(ASSET_KEYS.UI_TAB_SELECTED, tabSelectedUrl);
  scene.load.image(ASSET_KEYS.UI_TAB_UNSELECTED, tabUnselectedUrl);
  scene.load.image(ASSET_KEYS.UI_ARROW_LEFT, arrowLeftUrl);
  scene.load.image(ASSET_KEYS.UI_ARROW_RIGHT, arrowRightUrl);
  scene.load.image(ASSET_KEYS.UI_CHECKED, checkedUrl);
  scene.load.image(ASSET_KEYS.UI_UNCHECKED, uncheckedUrl);
  scene.load.image(ASSET_KEYS.UI_CELL, inventoryCellUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_COIN, iconCoinUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_HEART, iconHeartUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_KUNAI_BADGE, iconKunaiBadgeUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_MONEY_BADGE, iconMoneyBadgeUrl);
  scene.load.image(ASSET_KEYS.UI_BAR_UNDER, barUnderUrl);
  scene.load.image(ASSET_KEYS.UI_BAR_PROGRESS, barProgressUrl);
  scene.load.image(ASSET_KEYS.UI_CHEST_CLOSED, chestClosedUrl);
  scene.load.image(ASSET_KEYS.UI_CHEST_OPEN, chestOpenUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_KEY, iconKeyUrl);
  scene.load.image(ASSET_KEYS.UI_ICON_GOLD, iconGoldUrl);

  // CC0 Audio SFX & Music
  scene.load.audio(ASSET_KEYS.SFX_THROW, sfxThrowUrl);
  scene.load.audio(ASSET_KEYS.SFX_THUNK, sfxThunkUrl);
  scene.load.audio(ASSET_KEYS.SFX_CRACK, sfxCrackUrl);
  scene.load.audio(ASSET_KEYS.SFX_CLANG, sfxClangUrl);
  scene.load.audio(ASSET_KEYS.SFX_COIN, sfxCoinUrl);
  scene.load.audio(ASSET_KEYS.SFX_BOSS, sfxBossUrl);
  scene.load.audio(ASSET_KEYS.SFX_FAIL, sfxFailUrl);
  scene.load.audio(ASSET_KEYS.SFX_LEVELUP, sfxLevelupUrl);
  scene.load.audio(ASSET_KEYS.SFX_CLICK, sfxClickUrl);
  scene.load.audio(ASSET_KEYS.BGM_NIGHT, bgmNightUrl);
}

let assetsBaked = false;

export function bakeAllRuntimeAssets(scene: Phaser.Scene): void {
  enforceNearestOnAllTextures(scene);
  if (assetsBaked && scene.textures.exists(KUNAI_SKINS[0].id) && scene.textures.exists(ASSET_KEYS.UI_WHEEL_64)) {
    return;
  }

  bakeProceduralEffects(scene);
  bakeNinjaPaletteSwaps(scene);
  bakeKunaiPaletteSwaps(scene);
  bakeComposedTargets(scene);
  bakeComposedBossTargets(scene);
  bakeAllBackgroundPatterns(scene);
  bakeLuckyWheelTextures(scene);
  registerAnimations(scene);
  enforceNearestOnAllTextures(scene);
  assetsBaked = true;
}

export function enforceNearestOnAllTextures(scene: Phaser.Scene): void {
  const list = scene.textures.list as Record<string, Phaser.Textures.Texture>;
  for (const key of Object.keys(list)) {
    const tex = list[key];
    if (tex && typeof tex.setFilter === 'function') {
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
  }
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff];
}

function intColorToRgb(color: number): [number, number, number] {
  return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
}

// Quantized original 6-color palette of vendored Ninja Adventure NinjaDark/SpriteSheet.png
const NINJA_SRC_PALETTE: ReadonlyArray<[number, number, number]> = [
  [20, 27, 27], // 0 outline
  [59, 54, 67], // 1 hoodDark
  [78, 72, 74], // 2 hoodMid
  [95, 113, 96], // 3 hoodLight
  [209, 75, 52], // 4 accentDark
  [239, 145, 79] // 5 accentBright
];

function bakeNinjaPaletteSwaps(scene: Phaser.Scene): void {
  const srcTex = scene.textures.get(ASSET_KEYS.NINJA_SHEET);
  const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const w = srcImg.width;
  const h = srcImg.height;

  const scratch = document.createElement('canvas');
  scratch.width = w;
  scratch.height = h;
  const sctx = scratch.getContext('2d');
  if (!sctx) return;
  sctx.drawImage(srcImg, 0, 0);
  const srcData = sctx.getImageData(0, 0, w, h).data;

  for (const skin of NINJA_SKINS) {
    if (scene.textures.exists(skin.id)) continue;
    const canvasTex = scene.textures.createCanvas(skin.id, w, h);
    if (!canvasTex) continue;
    const ctx = canvasTex.getContext();
    const out = ctx.createImageData(w, h);
    remapNinjaPixels(srcData, out.data, w, h, skin.palette, Boolean(skin.isDefaultPalette));
    ctx.putImageData(out, 0, 0);
    canvasTex.refresh();
    scene.textures.addSpriteSheet(skin.id, canvasTex, {
      frameWidth: 16,
      frameHeight: 16,
      margin: 1,
      spacing: 2
    });
    canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

function remapNinjaPixels(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  palette: NinjaPalette,
  keepOriginal: boolean
): void {
  const targets: ReadonlyArray<[number, number, number]> = [
    hexToRgb(palette.outline),
    hexToRgb(palette.hoodDark),
    hexToRgb(palette.hoodMid),
    hexToRgb(palette.hoodLight),
    hexToRgb(palette.accentDark),
    hexToRgb(palette.accentBright)
  ];

  const totalPixels = w * h;
  for (let p = 0; p < totalPixels; p++) {
    const i = p * 4;
    const a = src[i + 3];
    if (a < 128) {
      dst[i + 3] = 0;
      continue;
    }

    const r = src[i];
    const g = src[i + 1];
    const b = src[i + 2];

    if (keepOriginal) {
      dst[i] = r;
      dst[i + 1] = g;
      dst[i + 2] = b;
      dst[i + 3] = 255;
      continue;
    }

    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let k = 0; k < NINJA_SRC_PALETTE.length; k++) {
      const sp = NINJA_SRC_PALETTE[k];
      const dr = r - sp[0];
      const dg = g - sp[1];
      const db = b - sp[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = k;
      }
    }

    const chosen = targets[bestIdx];
    dst[i] = chosen[0];
    dst[i + 1] = chosen[1];
    dst[i + 2] = chosen[2];
    dst[i + 3] = 255;
  }
}

function bakeKunaiPaletteSwaps(scene: Phaser.Scene): void {
  const srcTex = scene.textures.get(ASSET_KEYS.KUNAI_BASE);
  const srcImg = srcTex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  const w = srcImg.width;
  const h = srcImg.height;

  const scratch = document.createElement('canvas');
  scratch.width = w;
  scratch.height = h;
  const sctx = scratch.getContext('2d');
  if (!sctx) return;
  sctx.drawImage(srcImg, 0, 0);
  const srcData = sctx.getImageData(0, 0, w, h).data;

  for (const skin of KUNAI_SKINS) {
    if (scene.textures.exists(skin.id)) continue;
    const canvasTex = scene.textures.createCanvas(skin.id, w, h);
    if (!canvasTex) continue;
    const ctx = canvasTex.getContext();
    const out = ctx.createImageData(w, h);
    remapKunaiPixels(srcData, out.data, w, h, skin.palette);
    ctx.putImageData(out, 0, 0);
    canvasTex.refresh();
    canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

function remapKunaiPixels(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  palette: KunaiPalette
): void {
  const cOutline = hexToRgb(palette.outline);
  const cBladeDark = hexToRgb(palette.bladeDark);
  const cBladeMid = hexToRgb(palette.bladeMid);
  const cBladeLight = hexToRgb(palette.bladeLight);
  const cWrapDark = hexToRgb(palette.wrapDark);
  const cWrapBright = hexToRgb(palette.wrapBright);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = src[i + 3];
      if (a < 128) {
        dst[i + 3] = 0;
        continue;
      }

      const r = src[i];
      const g = src[i + 1];
      const b = src[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      let chosen: [number, number, number];
      if (lum < 55) {
        chosen = cOutline;
      } else if (y <= 8) {
        if (lum >= 200) chosen = cBladeLight;
        else if (lum >= 128) chosen = cBladeMid;
        else chosen = cBladeDark;
      } else {
        chosen = lum >= 135 ? cWrapBright : cWrapDark;
      }

      dst[i] = chosen[0];
      dst[i + 1] = chosen[1];
      dst[i + 2] = chosen[2];
      dst[i + 3] = 255;
    }
  }
}

function drawSpriteSheetTile(
  ctx: CanvasRenderingContext2D,
  scene: Phaser.Scene,
  sheetKey: string,
  frameIdx: number,
  dx: number,
  dy: number
): void {
  const tex = scene.textures.get(sheetKey);
  const frame = tex.get(frameIdx);
  const src = tex.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  ctx.drawImage(
    src,
    frame.cutX,
    frame.cutY,
    frame.cutWidth,
    frame.cutHeight,
    dx,
    dy,
    frame.cutWidth,
    frame.cutHeight
  );
}

function drawWholeTexture(
  ctx: CanvasRenderingContext2D,
  scene: Phaser.Scene,
  key: string,
  dx: number,
  dy: number
): void {
  const src = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  ctx.drawImage(src, dx, dy);
}

function clipCircleWithPixelOutline(
  ctx: CanvasRenderingContext2D,
  size: number,
  radius: number,
  outlineHex: string,
  innerRimHex: string
): void {
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  const cx = (size - 1) * 0.5;
  const cy = (size - 1) * 0.5;
  const [or, og, ob] = hexToRgb(outlineHex);
  const [rr, rg, rb] = hexToRgb(innerRimHex);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      const idx = (y * size + x) * 4;
      if (dist > radius) {
        data[idx + 3] = 0;
      } else if (dist > radius - 1.35) {
        data[idx] = or;
        data[idx + 1] = og;
        data[idx + 2] = ob;
        data[idx + 3] = 255;
      } else if (dist > radius - 2.65) {
        data[idx] = rr;
        data[idx + 1] = rg;
        data[idx + 2] = rb;
        data[idx + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

function bakeComposedTargets(scene: Phaser.Scene): void {
  bakeTargetCanvas(scene, 'target_composed_log', 48, (ctx) => {
    for (let ty = 0; ty < 3; ty++) {
      for (let tx = 0; tx < 3; tx++) {
        drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_KENNEY, 12 * 5 + 3, tx * 16, ty * 16);
      }
    }
    drawWholeTexture(ctx, scene, ASSET_KEYS.TREE_STUMP, 8, 8);
    clipCircleWithPixelOutline(ctx, 48, 23.2, '#140c08', '#5e3922');
    drawWholeTexture(ctx, scene, ASSET_KEYS.SPHERE_WOOD, 8, 8);
  });

  bakeTargetCanvas(scene, 'target_composed_stone', 48, (ctx) => {
    for (let ty = 0; ty < 3; ty++) {
      for (let tx = 0; tx < 3; tx++) {
        drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_KENNEY, 12 * 4 + 9, tx * 16, ty * 16);
      }
    }
    clipCircleWithPixelOutline(ctx, 48, 23.2, '#0d121f', '#51637a');
    drawWholeTexture(ctx, scene, ASSET_KEYS.SPHERE_IRON, 8, 8);
    drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_KENNEY, 12 * 8 + 6, 16, 16);
  });

  bakeTargetCanvas(scene, 'target_composed_lantern', 48, (ctx) => {
    for (let ty = 0; ty < 3; ty++) {
      for (let tx = 0; tx < 3; tx++) {
        drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_DUNGEON, 12 * 3 + 0, tx * 16, ty * 16);
      }
    }
    clipCircleWithPixelOutline(ctx, 48, 23.2, '#1a0a10', '#d94848');
    drawWholeTexture(ctx, scene, ASSET_KEYS.SPHERE_RED, 8, 8);
    drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_ELEMENT, 16 * 10 + 7, 16, 16);
  });

  bakeTargetCanvas(scene, 'target_composed_oni', 48, (ctx) => {
    for (let ty = 0; ty < 48; ty += 32) {
      for (let tx = 0; tx < 48; tx += 32) {
        drawWholeTexture(ctx, scene, ASSET_KEYS.TREE_STUMP_DARK, tx - 4, ty - 4);
      }
    }
    clipCircleWithPixelOutline(ctx, 48, 23.2, '#0b1412', '#37b887');
    drawWholeTexture(ctx, scene, ASSET_KEYS.SPHERE_BAMBOO, 8, 8);
    drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_DUNGEON, 12 * 2 + 2, 16, 16);
  });
}

function bakeComposedBossTargets(scene: Phaser.Scene): void {
  const configs = [
    {
      key: BOSS_SKINS[0].textureKey,
      faceKey: ASSET_KEYS.BOSS_FACE_0,
      sphereKey: ASSET_KEYS.SPHERE_BAMBOO,
      tileSheet: ASSET_KEYS.TILES_NATURE,
      tileIdx: 24 * 10 + 1,
      outline: '#091710',
      rim: '#45d68a'
    },
    {
      key: BOSS_SKINS[1].textureKey,
      faceKey: ASSET_KEYS.BOSS_FACE_1,
      sphereKey: ASSET_KEYS.SPHERE_RED,
      tileSheet: ASSET_KEYS.TILES_DUNGEON,
      tileIdx: 12 * 3 + 0,
      outline: '#1c080d',
      rim: '#eb5b42'
    },
    {
      key: BOSS_SKINS[2].textureKey,
      faceKey: ASSET_KEYS.BOSS_FACE_2,
      sphereKey: ASSET_KEYS.SPHERE_IRON,
      tileSheet: ASSET_KEYS.TILES_KENNEY,
      tileIdx: 12 * 4 + 9,
      outline: '#0b0a1c',
      rim: '#9850eb'
    }
  ];

  for (const cfg of configs) {
    bakeTargetCanvas(scene, cfg.key, 64, (ctx) => {
      for (let ty = 0; ty < 4; ty++) {
        for (let tx = 0; tx < 4; tx++) {
          drawSpriteSheetTile(ctx, scene, cfg.tileSheet, cfg.tileIdx, tx * 16, ty * 16);
        }
      }
      clipCircleWithPixelOutline(ctx, 64, 30.2, cfg.outline, cfg.rim);
      drawWholeTexture(ctx, scene, cfg.sphereKey, 16, 16);

      const faceSrc = scene.textures.get(cfg.faceKey).getSourceImage() as
        | HTMLImageElement
        | HTMLCanvasElement;
      const tmp = document.createElement('canvas');
      tmp.width = 38;
      tmp.height = 38;
      const tctx = tmp.getContext('2d');
      if (tctx) {
        tctx.drawImage(faceSrc, 0, 0);
        clipCircleWithPixelOutline(tctx, 38, 18.2, cfg.outline, cfg.rim);
        ctx.drawImage(tmp, 13, 13);
      }
    });
  }
}

function bakeTargetCanvas(
  scene: Phaser.Scene,
  key: string,
  size: number,
  painter: (ctx: CanvasRenderingContext2D) => void
): void {
  if (scene.textures.exists(key)) return;
  const canvasTex = scene.textures.createCanvas(key, size, size);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  ctx.imageSmoothingEnabled = false;
  painter(ctx);
  canvasTex.refresh();
  canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function resolveTileSheetKey(sheet: 'kenney' | 'nature' | 'element' | 'dungeon'): string {
  switch (sheet) {
    case 'kenney':
      return ASSET_KEYS.TILES_KENNEY;
    case 'nature':
      return ASSET_KEYS.TILES_NATURE;
    case 'element':
      return ASSET_KEYS.TILES_ELEMENT;
    case 'dungeon':
      return ASSET_KEYS.TILES_DUNGEON;
  }
}

function bakeAllBackgroundPatterns(scene: Phaser.Scene): void {
  const size = 128;
  for (const bg of BACKGROUND_SKINS) {
    if (scene.textures.exists(bg.textureKey)) continue;
    const canvasTex = scene.textures.createCanvas(bg.textureKey, size, size);
    if (!canvasTex) continue;
    const ctx = canvasTex.getContext();
    ctx.imageSmoothingEnabled = false;

    const primarySheetKey = resolveTileSheetKey(bg.primarySheet);
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const idx = (row + col) % 3 === 0 ? bg.baseTileA : bg.baseTileB;
        drawSpriteSheetTile(ctx, scene, primarySheetKey, idx, col * 16, row * 16);
      }
    }

    for (const acc of bg.accents) {
      drawSpriteSheetTile(ctx, scene, resolveTileSheetKey(acc.sheet), acc.index, acc.dx, acc.dy);
    }

    const [gr, gg, gb] = bg.gradeRgb;
    const bgData = ctx.getImageData(0, 0, size, size);
    const px = bgData.data;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] === 0) continue;
      px[i] = Math.min(255, Math.round(px[i] * gr));
      px[i + 1] = Math.min(255, Math.round(px[i + 1] * gg));
      px[i + 2] = Math.min(255, Math.round(px[i + 2] * gb));
    }
    ctx.putImageData(bgData, 0, 0);

    canvasTex.refresh();
    canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }
}

function bakeLuckyWheelTextures(scene: Phaser.Scene): void {
  // 1. Main 72x72 8-segment pixel-art wheel
  bakeTargetCanvas(scene, ASSET_KEYS.UI_WHEEL_64, 72, (ctx) => {
    const size = 72;
    const img = ctx.createImageData(size, size);
    const data = img.data;
    const cx = (size - 1) * 0.5;
    const cy = (size - 1) * 0.5;
    const segColors = LUCKY_SPIN_CONFIG.SEGMENTS.map((s) => intColorToRgb(s.colorHex));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const idx = (y * size + x) * 4;
        if (dist > 34.5) continue;

        if (dist <= 6.2) {
          // Central gold/dark hub cap
          const col: [number, number, number] =
            dist > 4.8 ? [11, 14, 24] : dist < 2.5 ? [255, 243, 161] : [237, 181, 40];
          data[idx] = col[0];
          data[idx + 1] = col[1];
          data[idx + 2] = col[2];
          data[idx + 3] = 255;
          continue;
        }

        if (dist >= 32.8) {
          // Outer dark border
          data[idx] = 11;
          data[idx + 1] = 14;
          data[idx + 2] = 24;
          data[idx + 3] = 255;
          continue;
        }

        if (dist >= 30.2) {
          // Wooden gold rim with sector divider notches
          data[idx] = 217;
          data[idx + 1] = 152;
          data[idx + 2] = 70;
          data[idx + 3] = 255;
          continue;
        }

        const cwDeg = (((Math.atan2(dy, dx) * 180) / Math.PI) + 90 + 360) % 360;
        const shifted = (cwDeg + 22.5) % 360;
        const segIdx = Math.floor(shifted / 45) % 8;
        const edgeDistDeg = Math.min(shifted % 45, 45 - (shifted % 45));
        const arcDistPx = (edgeDistDeg * Math.PI * dist) / 180;

        if (arcDistPx < 0.72) {
          data[idx] = 11;
          data[idx + 1] = 14;
          data[idx + 2] = 24;
          data[idx + 3] = 255;
        } else {
          const [sr, sg, sb] = segColors[segIdx];
          const shade = dist > 26.5 ? 0.78 : dist < 12 ? 1.12 : 1.0;
          data[idx] = Math.min(255, Math.round(sr * shade));
          data[idx + 1] = Math.min(255, Math.round(sg * shade));
          data[idx + 2] = Math.min(255, Math.round(sb * shade));
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  });

  // 2. Mini 18x18 spinning icon for MenuScene floating button
  bakeTargetCanvas(scene, ASSET_KEYS.UI_WHEEL_MINI, 18, (ctx) => {
    const size = 18;
    const img = ctx.createImageData(size, size);
    const data = img.data;
    const cx = (size - 1) * 0.5;
    const cy = (size - 1) * 0.5;
    const segColors = LUCKY_SPIN_CONFIG.SEGMENTS.map((s) => intColorToRgb(s.colorHex));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const idx = (y * size + x) * 4;
        if (dist > 8.6) continue;
        if (dist <= 2.2) {
          data[idx] = 255;
          data[idx + 1] = 224;
          data[idx + 2] = 115;
          data[idx + 3] = 255;
        } else if (dist >= 7.2) {
          data[idx] = 11;
          data[idx + 1] = 14;
          data[idx + 2] = 24;
          data[idx + 3] = 255;
        } else {
          const cwDeg = (((Math.atan2(dy, dx) * 180) / Math.PI) + 90 + 360) % 360;
          const segIdx = Math.floor(((cwDeg + 22.5) % 360) / 45) % 8;
          const [sr, sg, sb] = segColors[segIdx];
          data[idx] = sr;
          data[idx + 1] = sg;
          data[idx + 2] = sb;
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  });

  // 3. Downward pointer arrow 9x9
  bakeTargetCanvas(scene, ASSET_KEYS.UI_WHEEL_POINTER, 9, (ctx) => {
    const rows = [
      '#########',
      '#GGGGGGG#',
      ' #GGGGG# ',
      ' #GGGGG# ',
      '  #GGG#  ',
      '  #GGG#  ',
      '   #G#   ',
      '   ###   ',
      '         '
    ];
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        const ch = rows[y][x];
        if (ch === '#') {
          ctx.fillStyle = '#0b0e18';
          ctx.fillRect(x, y, 1, 1);
        } else if (ch === 'G') {
          ctx.fillStyle = y <= 2 ? '#fff3a1' : '#ffe073';
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  });
}

function registerAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

  // Register full animation set for every baked ninja skin
  for (const skin of NINJA_SKINS) {
    const sheet = skin.id;
    if (!anims.exists(`${sheet}_idle_front`)) {
      anims.create({
        key: `${sheet}_idle_front`,
        frames: [
          { key: sheet, frame: 0 },
          { key: sheet, frame: 0 },
          { key: sheet, frame: 4 },
          { key: sheet, frame: 8 }
        ],
        frameRate: 4,
        repeat: -1
      });
    }
    if (!anims.exists(`${sheet}_idle_up`)) {
      anims.create({
        key: `${sheet}_idle_up`,
        frames: [
          { key: sheet, frame: 1 },
          { key: sheet, frame: 1 },
          { key: sheet, frame: 5 },
          { key: sheet, frame: 9 }
        ],
        frameRate: 5,
        repeat: -1
      });
    }
    if (!anims.exists(`${sheet}_throw_up`)) {
      anims.create({
        key: `${sheet}_throw_up`,
        frames: [
          { key: sheet, frame: 17 },
          { key: sheet, frame: 21 },
          { key: sheet, frame: 1 }
        ],
        frameRate: 18,
        repeat: 0
      });
    }
    if (!anims.exists(`${sheet}_win`)) {
      anims.create({
        key: `${sheet}_win`,
        frames: [
          { key: sheet, frame: 20 },
          { key: sheet, frame: 25 },
          { key: sheet, frame: 21 },
          { key: sheet, frame: 25 }
        ],
        frameRate: 8,
        repeat: 1
      });
    }
    if (!anims.exists(`${sheet}_fail`)) {
      anims.create({
        key: `${sheet}_fail`,
        frames: [
          { key: sheet, frame: 16 },
          { key: sheet, frame: 24 },
          { key: sheet, frame: 24 }
        ],
        frameRate: 6,
        repeat: 0
      });
    }
  }

  // Legacy default animation aliases
  if (!anims.exists('ninja_idle_front')) {
    anims.create({
      key: 'ninja_idle_front',
      frames: [
        { key: ASSET_KEYS.NINJA_SHEET, frame: 0 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 0 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 4 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 8 }
      ],
      frameRate: 4,
      repeat: -1
    });
  }

  if (!anims.exists('ninja_idle_up')) {
    anims.create({
      key: 'ninja_idle_up',
      frames: [
        { key: ASSET_KEYS.NINJA_SHEET, frame: 1 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 1 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 5 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 9 }
      ],
      frameRate: 5,
      repeat: -1
    });
  }

  if (!anims.exists('ninja_throw_up')) {
    anims.create({
      key: 'ninja_throw_up',
      frames: [
        { key: ASSET_KEYS.NINJA_SHEET, frame: 17 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 21 },
        { key: ASSET_KEYS.NINJA_SHEET, frame: 1 }
      ],
      frameRate: 18,
      repeat: 0
    });
  }

  if (!anims.exists('coin_spin_loop')) {
    anims.create({
      key: 'coin_spin_loop',
      frames: anims.generateFrameNumbers(ASSET_KEYS.COIN_SPIN, { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }

  if (!anims.exists('vfx_smoke_play')) {
    anims.create({
      key: 'vfx_smoke_play',
      frames: anims.generateFrameNumbers(ASSET_KEYS.VFX_SMOKE, { start: 0, end: 7 }),
      frameRate: 18,
      repeat: 0
    });
  }

  if (!anims.exists('vfx_spark_play')) {
    anims.create({
      key: 'vfx_spark_play',
      frames: anims.generateFrameNumbers(ASSET_KEYS.VFX_SPARK, { start: 0, end: 8 }),
      frameRate: 22,
      repeat: 0
    });
  }

  if (!anims.exists('vfx_explosion_play')) {
    anims.create({
      key: 'vfx_explosion_play',
      frames: anims.generateFrameNumbers(ASSET_KEYS.VFX_EXPLOSION, { start: 0, end: 8 }),
      frameRate: 20,
      repeat: 0
    });
  }
}
