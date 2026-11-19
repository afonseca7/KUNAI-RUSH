import Phaser from 'phaser';
import { computeViewportMetrics, type ViewportMetrics } from '../config/balance';
import { ASSET_KEYS } from '../objects/AssetPipeline';
import { audioService } from '../services/AudioService';
import { hapticsService } from '../services/HapticsService';
import {
  applyThemedLetterboxStyle,
  attachNocturnalAtmosphere,
  type NocturnalOverlayRefs
} from '../objects/EffectsFactory';

let activeMetrics: ViewportMetrics = computeViewportMetrics(
  typeof window !== 'undefined' ? window.innerWidth : 360,
  typeof window !== 'undefined' ? window.innerHeight : 800
);

let resizeBound = false;

export function getViewportMetrics(): ViewportMetrics {
  return activeMetrics;
}

export function applyViewportToGame(game: Phaser.Game): ViewportMetrics {
  const next = computeViewportMetrics(window.innerWidth, window.innerHeight);
  activeMetrics = next;

  if (game.scale.width !== next.logicalW || game.scale.height !== next.logicalH) {
    game.scale.setGameSize(next.logicalW, next.logicalH);
  }

  const canvas = game.canvas;
  if (canvas) {
    canvas.style.width = `${next.canvasCssW}px`;
    canvas.style.height = `${next.canvasCssH}px`;
    canvas.style.imageRendering = 'pixelated';
  }

  applyThemedLetterboxStyle(next.scale);
  return next;
}

export function bindViewportResize(game: Phaser.Game): void {
  if (resizeBound) return;
  resizeBound = true;

  let timer: number | undefined;
  window.addEventListener('resize', () => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const prevW = activeMetrics.logicalW;
      const prevH = activeMetrics.logicalH;
      const updated = applyViewportToGame(game);
      if (prevW !== updated.logicalW || prevH !== updated.logicalH) {
        for (const scene of game.scene.getScenes(true)) {
          scene.scene.restart();
        }
      }
    }, 80);
  });
}

export function fracX(scene: Phaser.Scene, fraction: number): number {
  return Math.round(scene.scale.width * fraction);
}

export function fracY(scene: Phaser.Scene, fraction: number): number {
  return Math.round(scene.scale.height * fraction);
}

export type PixelFontSize = 8 | 16 | 24;

export interface PixelTextOptions {
  size?: PixelFontSize;
  tint?: number;
  shadowTint?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  originX?: number;
  originY?: number;
  align?: number;
  maxWidth?: number;
  depth?: number;
}

export class PixelText {
  public readonly shadow: Phaser.GameObjects.BitmapText;
  public readonly main: Phaser.GameObjects.BitmapText;
  private readonly ox: number;
  private readonly oy: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    opts: PixelTextOptions = {}
  ) {
    const size = opts.size ?? 8;
    const originX = opts.originX ?? 0.5;
    const originY = opts.originY ?? 0.5;
    const align = opts.align ?? Phaser.GameObjects.BitmapText.ALIGN_CENTER;
    this.ox = opts.shadowOffsetX ?? 0;
    this.oy = opts.shadowOffsetY ?? 1;

    const rx = Math.round(x);
    const ry = Math.round(y);

    this.shadow = scene.add
      .bitmapText(rx + this.ox, ry + this.oy, ASSET_KEYS.FONT_PIXEL, text, size, align)
      .setOrigin(originX, originY)
      .setTint(opts.shadowTint ?? 0x070912);

    this.main = scene.add
      .bitmapText(rx, ry, ASSET_KEYS.FONT_PIXEL, text, size, align)
      .setOrigin(originX, originY)
      .setTint(opts.tint ?? 0xf4f0e8);

    if (opts.maxWidth !== undefined) {
      this.shadow.setMaxWidth(opts.maxWidth);
      this.main.setMaxWidth(opts.maxWidth);
    }

    if (opts.depth !== undefined) {
      this.shadow.setDepth(opts.depth);
      this.main.setDepth(opts.depth + 0.1);
    }
  }

  public setText(text: string): this {
    this.shadow.setText(text);
    this.main.setText(text);
    return this;
  }

  public setTint(color: number): this {
    this.main.setTint(color);
    return this;
  }

  public setPosition(x: number, y: number): this {
    const rx = Math.round(x);
    const ry = Math.round(y);
    this.shadow.setPosition(rx + this.ox, ry + this.oy);
    this.main.setPosition(rx, ry);
    return this;
  }

  public setAlpha(alpha: number): this {
    this.shadow.setAlpha(alpha);
    this.main.setAlpha(alpha);
    return this;
  }

  public setVisible(visible: boolean): this {
    this.shadow.setVisible(visible);
    this.main.setVisible(visible);
    return this;
  }

  public setDepth(depth: number): this {
    this.shadow.setDepth(depth);
    this.main.setDepth(depth + 0.1);
    return this;
  }

  public addToContainer(container: Phaser.GameObjects.Container): this {
    container.add([this.shadow, this.main]);
    return this;
  }

  public destroy(): void {
    this.shadow.destroy();
    this.main.destroy();
  }
}

export type PanelVariant = 'wood' | 'dark' | 'red' | 'bamboo' | 'bg' | 'bgDark';

const PANEL_TEXTURES: Record<PanelVariant, string> = {
  wood: ASSET_KEYS.UI_PANEL_WOOD,
  dark: ASSET_KEYS.UI_PANEL_DARK,
  red: ASSET_KEYS.UI_PANEL_RED,
  bamboo: ASSET_KEYS.UI_PANEL_BAMBOO,
  bg: ASSET_KEYS.UI_PANEL_BG,
  bgDark: ASSET_KEYS.UI_PANEL_BG_DARK
};

export function createNineSlicePanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  variant: PanelVariant = 'dark',
  depth?: number
): Phaser.GameObjects.NineSlice {
  const inset = variant === 'wood' ? 6 : 4;
  const panel = scene.add.nineslice(
    Math.round(x),
    Math.round(y),
    PANEL_TEXTURES[variant],
    undefined,
    Math.round(width),
    Math.round(height),
    inset,
    inset,
    inset,
    inset
  );
  if (depth !== undefined) panel.setDepth(depth);
  return panel;
}

export interface PixelButtonOptions {
  width: number;
  height: number;
  label: string;
  fontSize?: PixelFontSize;
  textTint?: number;
  iconKey?: string;
  depth?: number;
  disabled?: boolean;
  onClick: () => void;
}

export class PixelButton {
  public readonly container: Phaser.GameObjects.Container;
  public readonly bg: Phaser.GameObjects.NineSlice;
  public readonly labelText: PixelText;
  public readonly icon?: Phaser.GameObjects.Image;
  private isDisabled = false;
  private isPressed = false;
  private baseLabelY = -1;
  private onClickCb: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, opts: PixelButtonOptions) {
    this.onClickCb = opts.onClick;
    const w = Math.round(opts.width);
    const h = Math.round(opts.height);

    this.container = scene.add.container(Math.round(x), Math.round(y));
    if (opts.depth !== undefined) this.container.setDepth(opts.depth);

    this.bg = scene.add.nineslice(0, 0, ASSET_KEYS.UI_BTN_NORMAL, undefined, w, h, 4, 4, 2, 2);
    this.container.add(this.bg);

    const fontSize = opts.fontSize ?? 8;
    const textX = opts.iconKey ? 7 : 0;

    if (opts.iconKey) {
      this.icon = scene.add.image(-Math.round(w * 0.34), -1, opts.iconKey).setOrigin(0.5);
      this.container.add(this.icon);
    }

    this.labelText = new PixelText(scene, textX, this.baseLabelY, opts.label, {
      size: fontSize,
      tint: opts.textTint ?? 0x261712,
      shadowTint: 0xf7e3c6,
      shadowOffsetX: 0,
      shadowOffsetY: 1
    });
    this.labelText.addToContainer(this.container);

    this.bg.setInteractive({ useHandCursor: true });
    this.bg.on('pointerover', () => {
      if (this.isDisabled || this.isPressed) return;
      this.bg.setTexture(ASSET_KEYS.UI_BTN_HOVER);
    });
    this.bg.on('pointerout', () => {
      if (this.isDisabled) return;
      this.isPressed = false;
      this.bg.setTexture(ASSET_KEYS.UI_BTN_NORMAL);
      this.labelText.setPosition(textX, this.baseLabelY);
      if (this.icon) this.icon.y = -1;
    });
    this.bg.on('pointerdown', () => {
      if (this.isDisabled) return;
      this.isPressed = true;
      this.bg.setTexture(ASSET_KEYS.UI_BTN_PRESSED);
      this.labelText.setPosition(textX, this.baseLabelY + 1);
      if (this.icon) this.icon.y = 0;
    });
    this.bg.on('pointerup', () => {
      if (this.isDisabled || !this.isPressed) return;
      this.isPressed = false;
      this.bg.setTexture(ASSET_KEYS.UI_BTN_NORMAL);
      this.labelText.setPosition(textX, this.baseLabelY);
      if (this.icon) this.icon.y = -1;
      audioService.playSfx('click');
      hapticsService.light();
      this.onClickCb();
    });

    if (opts.disabled) {
      this.setDisabled(true);
    }
  }

  public setLabel(label: string): this {
    this.labelText.setText(label);
    return this;
  }

  public setDisabled(disabled: boolean): this {
    this.isDisabled = disabled;
    this.isPressed = false;
    this.bg.setTexture(disabled ? ASSET_KEYS.UI_BTN_DISABLED : ASSET_KEYS.UI_BTN_NORMAL);
    this.labelText.setTint(disabled ? 0x6f6770 : 0x261712);
    if (disabled) {
      this.bg.disableInteractive();
    } else {
      this.bg.setInteractive({ useHandCursor: true });
    }
    return this;
  }

  public setVisible(visible: boolean): this {
    this.container.setVisible(visible);
    return this;
  }

  public destroy(): void {
    this.container.destroy();
  }
}

export interface BackdropRefs {
  bgTile: Phaser.GameObjects.TileSprite;
  atmosphere: NocturnalOverlayRefs;
}

export function createSceneBackdrop(scene: Phaser.Scene): BackdropRefs {
  const { width, height } = scene.scale;
  const bgTile = scene.add
    .tileSprite(width * 0.5, height * 0.5, width, height, ASSET_KEYS.BG_DOJO_PATTERN)
    .setDepth(0);
  const atmosphere = attachNocturnalAtmosphere(scene, 1);
  return { bgTile, atmosphere };
}

export interface CoinBadgeRefs {
  container: Phaser.GameObjects.Container;
  text: PixelText;
  updateCoins: (coins: number) => void;
}

export function createCoinBadge(
  scene: Phaser.Scene,
  x: number,
  y: number,
  coins: number,
  depth: number = 30
): CoinBadgeRefs {
  const container = scene.add.container(Math.round(x), Math.round(y)).setDepth(depth);
  const panel = scene.add.nineslice(0, 0, ASSET_KEYS.UI_PANEL_DARK, undefined, 54, 16, 4, 4, 4, 4);
  const coinSprite = scene.add.sprite(-18, 0, ASSET_KEYS.COIN_SPIN, 0);
  if (scene.anims.exists('coin_spin_loop')) {
    coinSprite.play('coin_spin_loop');
  }
  const text = new PixelText(scene, 6, 0, String(coins), {
    size: 8,
    tint: 0xffe073,
    originX: 0.5,
    originY: 0.5
  });

  container.add([panel, coinSprite]);
  text.addToContainer(container);

  return {
    container,
    text,
    updateCoins: (next: number) => {
      text.setText(String(next));
    }
  };
}
