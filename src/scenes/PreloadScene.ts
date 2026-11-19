import Phaser from 'phaser';
import { bakeAllRuntimeAssets, queueAllGameAssets } from '../objects/AssetPipeline';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload(): void {
    queueAllGameAssets(this);
  }

  public create(): void {
    bakeAllRuntimeAssets(this);
    this.scene.start('MenuScene');
  }
}
