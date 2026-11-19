import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { saveService } from './SaveService';

class HapticsServiceImpl {
  public light(): void {
    this.impact(ImpactStyle.Light, 10);
  }

  public medium(): void {
    this.impact(ImpactStyle.Medium, 22);
  }

  public heavy(): void {
    this.impact(ImpactStyle.Heavy, 36);
  }

  public error(): void {
    if (!saveService.get().hapticsEnabled) return;
    if (Capacitor.isNativePlatform()) {
      void Haptics.notification({ type: NotificationType.Error }).catch(() => {});
      return;
    }
    this.vibrateWeb([24, 30, 40]);
  }

  private impact(style: ImpactStyle, webMs: number): void {
    if (!saveService.get().hapticsEnabled) return;
    if (Capacitor.isNativePlatform()) {
      void Haptics.impact({ style }).catch(() => {});
      return;
    }
    this.vibrateWeb(webMs);
  }

  private vibrateWeb(pattern: number | number[]): void {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore browser vibrate errors prior to user gesture
    }
  }
}

export const hapticsService = new HapticsServiceImpl();
