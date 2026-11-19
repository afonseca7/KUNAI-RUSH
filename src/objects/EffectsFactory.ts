import Phaser from 'phaser';

/**
 * Procedural-only post-processing & micro-particle texture factory.
 * Strictly reserved for 1-2px particle quads, nocturnal vignette/grain,
 * impact flashes, and "Ninja Nocturno" color grading overlays.
 * Never used for visible game entities, targets, characters, or UI.
 */
export const EFFECTS_KEYS = {
  PARTICLE_1PX: 'fx_particle_1px',
  PARTICLE_2PX: 'fx_particle_2px',
  NOCTURNAL_VIGNETTE: 'fx_nocturnal_vignette',
  NOCTURNAL_GRAIN: 'fx_nocturnal_grain',
  FLASH_QUAD: 'fx_flash_quad'
} as const;

export function bakeProceduralEffects(scene: Phaser.Scene): void {
  ensureSolidPixelTexture(scene, EFFECTS_KEYS.PARTICLE_1PX, 1, 1, '#ffffff');
  ensureSolidPixelTexture(scene, EFFECTS_KEYS.PARTICLE_2PX, 2, 2, '#ffffff');
  ensureSolidPixelTexture(scene, EFFECTS_KEYS.FLASH_QUAD, 4, 4, '#ffffff');
  ensureNocturnalGrainTexture(scene, EFFECTS_KEYS.NOCTURNAL_GRAIN, 64, 64);
  ensureNocturnalVignetteTexture(scene, EFFECTS_KEYS.NOCTURNAL_VIGNETTE, 128, 256);
}

function ensureSolidPixelTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  hexColor: string
): void {
  if (scene.textures.exists(key)) return;
  const canvasTex = scene.textures.createCanvas(key, w, h);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, w, h);
  canvasTex.refresh();
  canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function ensureNocturnalGrainTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number
): void {
  if (scene.textures.exists(key)) return;
  const canvasTex = scene.textures.createCanvas(key, w, h);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  // Deterministic LCG grain so pixel texture is reproducible across frames
  let seed = 0x5f3759df;
  for (let i = 0; i < data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const val = (seed >>> 24) & 0xff;
    if (val > 232) {
      data[i] = 120;
      data[i + 1] = 160;
      data[i + 2] = 220;
      data[i + 3] = 18;
    } else if (val < 24) {
      data[i] = 4;
      data[i + 1] = 6;
      data[i + 2] = 14;
      data[i + 3] = 28;
    } else {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  canvasTex.refresh();
  canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function ensureNocturnalVignetteTexture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number
): void {
  if (scene.textures.exists(key)) return;
  const canvasTex = scene.textures.createCanvas(key, w, h);
  if (!canvasTex) return;
  const ctx = canvasTex.getContext();
  const imgData = ctx.createImageData(w, h);
  const data = imgData.data;

  const cx = w * 0.5;
  const cy = h * 0.42;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / (w * 0.52);
      const dy = (y - cy) / (h * 0.56);
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Stepped pixel-quantized vignette bands for authentic retro night mood
      const rawAlpha = Math.max(0, Math.min(1, (dist - 0.58) / 0.62));
      const quantized = Math.floor(rawAlpha * 6) / 6;
      const idx = (y * w + x) * 4;
      data[idx] = 5;
      data[idx + 1] = 8;
      data[idx + 2] = 20;
      data[idx + 3] = Math.round(quantized * 195);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  canvasTex.refresh();
  canvasTex.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export interface NocturnalOverlayRefs {
  grading: Phaser.GameObjects.Image;
  vignette: Phaser.GameObjects.Image;
  grain: Phaser.GameObjects.TileSprite;
  flash: Phaser.GameObjects.Image;
}

/**
 * Adds the "Ninja Nocturno" color-grading, pixel vignette, subtle grain,
 * and a reusable full-screen impact flash quad on top of the tiled CC0 backdrop.
 */
export function attachNocturnalAtmosphere(
  scene: Phaser.Scene,
  depthBase: number = 2
): NocturnalOverlayRefs {
  const { width, height } = scene.scale;

  const grading = scene.add
    .image(width * 0.5, height * 0.5, EFFECTS_KEYS.FLASH_QUAD)
    .setDisplaySize(width, height)
    .setTint(0x0c1733)
    .setAlpha(0.42)
    .setDepth(depthBase);

  const grain = scene.add
    .tileSprite(width * 0.5, height * 0.5, width, height, EFFECTS_KEYS.NOCTURNAL_GRAIN)
    .setDepth(depthBase + 1);

  const vignette = scene.add
    .image(width * 0.5, height * 0.5, EFFECTS_KEYS.NOCTURNAL_VIGNETTE)
    .setDisplaySize(width, height)
    .setDepth(depthBase + 2);

  const flash = scene.add
    .image(width * 0.5, height * 0.5, EFFECTS_KEYS.FLASH_QUAD)
    .setDisplaySize(width, height)
    .setAlpha(0)
    .setDepth(depthBase + 90);

  return { grading, vignette, grain, flash };
}

export function triggerScreenFlash(
  scene: Phaser.Scene,
  flashObj: Phaser.GameObjects.Image,
  color: number,
  peakAlpha: number = 0.35,
  durationMs: number = 140
): void {
  scene.tweens.killTweensOf(flashObj);
  flashObj.setTint(color);
  flashObj.setAlpha(peakAlpha);
  scene.tweens.add({
    targets: flashObj,
    alpha: 0,
    duration: durationMs,
    ease: 'Quad.easeOut'
  });
}

/**
 * Syncs the HTML outer letterbox backdrop with subtle nocturnal ninja styling.
 */
export function applyThemedLetterboxStyle(scale: number): void {
  const el = document.getElementById('letterbox');
  if (!el) return;
  el.style.backgroundColor = '#070912';
  el.style.backgroundImage =
    'radial-gradient(circle at 50% 38%, rgba(22, 34, 66, 0.72) 0%, rgba(7, 9, 18, 0.98) 72%)';
  el.dataset.pixelScale = String(scale);
}
