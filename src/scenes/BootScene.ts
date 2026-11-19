import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import Phaser from 'phaser';
import { saveService } from '../services/SaveService';
import { applyViewportToGame, bindViewportResize } from '../ui/UITheme';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    applyViewportToGame(this.game);
    bindViewportResize(this.game);
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.hide();
      } catch {
        // Safe fallback on web/emulators without full status bar plugin
      }
    }

    await saveService.init();
    this.scene.start('PreloadScene');
  }
}
