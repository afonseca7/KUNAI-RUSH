import Phaser from 'phaser';
import { BOSS_SKINS, KUNAI_SKINS, type KunaiPalette } from '../config/skins';
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

/**
 * Runs once inside PreloadScene.create():
 * - Forces NEAREST filtering across all loaded textures & BitmapFont
 * - Bakes 8 pixel-by-pixel palette-swapped kunais
 * - Composes 4 normal 48x48 targets and 3 boss 64x64 targets from CC0 pack assets
 * - Builds repeatable nocturnal dojo/bamboo background pattern from CC0 tiles
 * - Registers ninja, coin, and VFX animations
 * - Bakes procedural 1-2px juice / vignette textures
 */
export function bakeAllRuntimeAssets(scene: Phaser.Scene): void {
  enforceNearestOnAllTextures(scene);
  if (assetsBaked && scene.textures.exists(KUNAI_SKINS[0].id)) {
    return;
  }

  bakeProceduralEffects(scene);
  bakeKunaiPaletteSwaps(scene);
  bakeComposedTargets(scene);
  bakeComposedBossTargets(scene);
  bakeNocturnalBackgroundPattern(scene);
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
        // Upper diamond blade
        if (lum >= 200) chosen = cBladeLight;
        else if (lum >= 128) chosen = cBladeMid;
        else chosen = cBladeDark;
      } else {
        // Handle & pommel ring
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
  // 1. target_composed_log (48x48): tree stump texture outer bark + sphere_wood center + inner ring
  bakeTargetCanvas(scene, 'target_composed_log', 48, (ctx) => {
    for (let ty = 0; ty < 48; ty += 32) {
      for (let tx = 0; tx < 48; tx += 32) {
        drawWholeTexture(ctx, scene, ASSET_KEYS.TREE_STUMP, tx - 4, ty - 4);
      }
    }
    clipCircleWithPixelOutline(ctx, 48, 23.2, '#140c08', '#5e3922');
    drawWholeTexture(ctx, scene, ASSET_KEYS.SPHERE_WOOD, 8, 8);
    // Center target seal: 16x16 wood emblem from TilesetNature
    drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_NATURE, 24 * 8 + 8, 16, 16);
  });

  // 2. target_composed_stone (48x48): dungeon stone tiles + sphere_iron + steel shield emblem
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

  // 3. target_composed_lantern (48x48): warm shrine tiles + sphere_red + gold scroll/lantern center
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

  // 4. target_composed_oni (48x48): dark moss/bamboo tiles + sphere_bamboo + mystic orb
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
  const configs: Array<{
    key: string;
    faceKey: string;
    sphereKey: string;
    tileSheet: string;
    tileIdx: number;
    outline: string;
    rim: string;
  }> = [
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

      // Stamp 4 corner spheres around boss seal
      drawWholeTexture(ctx, scene, cfg.sphereKey, 16, 16);

      // Stamp real 38x38 Boss Faceset into circular center medallion
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

/**
 * Composes a 128x128 seamless nocturnal dojo/bamboo tile pattern purely from
 * vendored CC0 tilesets for parallax backgrounds across all scenes.
 */
function bakeNocturnalBackgroundPattern(scene: Phaser.Scene): void {
  if (scene.textures.exists(ASSET_KEYS.BG_DOJO_PATTERN)) return;
  const size = 128;
  const canvasTex = scene.textures.createCanvas(ASSET_KEYS.BG_DOJO_PATTERN, size, size);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  ctx.imageSmoothingEnabled = false;

  // Base dark bamboo / stone floor mosaic (8x8 grid of 16x16 CC0 tiles)
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const idx = (row + col) % 3 === 0 ? 12 * 3 + 4 : 12 * 4 + 9;
      drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_KENNEY, idx, col * 16, row * 16);
    }
  }
  // Sprinkle bamboo & moss accents from TilesetNature
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_NATURE, 24 * 8 + 10, 16, 16);
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_NATURE, 24 * 9 + 10, 16, 32);
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_NATURE, 24 * 8 + 11, 96, 64);
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_NATURE, 24 * 9 + 11, 96, 80);
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_ELEMENT, 16 * 3 + 6, 64, 96);
  drawSpriteSheetTile(ctx, scene, ASSET_KEYS.TILES_ELEMENT, 16 * 4 + 6, 64, 112);

  canvasTex.refresh();
  canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function registerAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

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
