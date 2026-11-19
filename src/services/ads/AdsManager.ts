import { ADS_CADENCE_CONFIG } from '../../config/balance';
import { saveService } from '../SaveService';
import type {
  AdsQaTelemetry,
  IAdsAdapter,
  RewardedPlacement,
  UmpConsentState
} from './IAdsService';

class NullAdsAdapter implements IAdsAdapter {
  public readonly mode = 'web_mock' as const;
  public async init(): Promise<{ umpState: UmpConsentState; npa: boolean }> {
    return { umpState: 'NOT_REQUIRED', npa: false };
  }
  public async showBanner(): Promise<void> {}
  public async hideBanner(): Promise<void> {}
  public async showInterstitial(): Promise<boolean> {
    return true;
  }
  public async showRewarded(): Promise<boolean> {
    return true;
  }
  public async showAppOpen(): Promise<boolean> {
    return false;
  }
}

class AdsManagerImpl {
  private adapter: IAdsAdapter = new NullAdsAdapter();
  private initialized = false;
  private appOpenAttempted = false;
  private isFullscreenActive = false;

  private umpState: UmpConsentState = 'UNKNOWN';
  private npa = false;
  private bannerVisible = false;
  private bannerSuspendedForFullscreen = false;
  private activeScene = 'BootScene';
  private sessionGameOvers = 0;
  private lastInterstitialAt = 0;
  private interstitialShown = 0;
  private rewardedShown = 0;
  private rewardedClaimed = 0;
  private rewardedDismissed = 0;
  private appOpenShown = 0;
  private lastEvent = 'created';

  public setAdapter(adapter: IAdsAdapter): void {
    this.adapter = adapter;
    this.publishQa();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      const consent = await this.adapter.init();
      this.umpState = consent.umpState;
      this.npa = consent.npa;
    } catch {
      this.umpState = 'FALLBACK_NPA';
      this.npa = true;
    }
    this.lastEvent = `init:${this.umpState}`;
    this.publishQa();
  }

  public async syncBannerForScene(sceneKey: string): Promise<void> {
    this.activeScene = sceneKey;
    const wantBanner = ADS_CADENCE_CONFIG.BANNER_SCENES.includes(sceneKey);

    if (this.isFullscreenActive) {
      if (this.bannerVisible) {
        await this.hideBannerInternal();
      }
      this.publishQa();
      return;
    }

    if (wantBanner && !this.bannerVisible) {
      await this.showBannerInternal();
    } else if (!wantBanner && this.bannerVisible) {
      await this.hideBannerInternal();
    }
    this.publishQa();
  }

  public shouldShowInterstitial(now: number = Date.now()): boolean {
    const {
      INTERSTIAL_SKIP,
      everyN,
      cooldown
    } = {
      INTERSTIAL_SKIP: ADS_CADENCE_CONFIG.INTERSTITIAL_SKIP_FIRST_GAME_OVERS,
      everyN: ADS_CADENCE_CONFIG.INTERSTITIAL_EVERY_N_GAME_OVERS,
      cooldown: ADS_CADENCE_CONFIG.INTERSTITIAL_COOLDOWN_MS
    };
    return (
      this.sessionGameOvers > INTERSTIAL_SKIP &&
      this.sessionGameOvers % everyN === 1 &&
      now - this.lastInterstitialAt >= cooldown
    );
  }

  public async onGameOverNavigation(
    targetScene?: string,
    now: number = Date.now()
  ): Promise<boolean> {
    this.sessionGameOvers += 1;
    if (!this.shouldShowInterstitial(now)) {
      this.lastEvent = `interstitial_skipped(go=${this.sessionGameOvers})`;
      this.publishQa();
      return false;
    }

    if (targetScene) {
      this.activeScene = targetScene;
    }

    const shown = await this.runFullscreenWithBannerAutoHide(async () =>
      this.adapter.showInterstitial(this.npa)
    );
    if (shown) {
      this.lastInterstitialAt = Date.now();
      this.interstitialShown += 1;
      saveService.incrementAdCounter('interstitialShown');
      this.lastEvent = `interstitial_shown(#${this.interstitialShown})`;
    }
    this.publishQa();
    return shown;
  }

  public async showRewarded(placement: RewardedPlacement): Promise<boolean> {
    const rewarded = await this.runFullscreenWithBannerAutoHide(async () =>
      this.adapter.showRewarded(placement, this.npa)
    );
    this.rewardedShown += 1;
    saveService.incrementAdCounter('rewardedShown');
    if (rewarded) {
      this.rewardedClaimed += 1;
      this.lastEvent = `rewarded_claimed:${placement}`;
    } else {
      this.rewardedDismissed += 1;
      this.lastEvent = `rewarded_dismissed:${placement}`;
    }
    this.publishQa();
    return rewarded;
  }

  public async tryShowAppOpenAd(): Promise<boolean> {
    if (this.appOpenAttempted) return false;
    this.appOpenAttempted = true;

    const launches = saveService.get().appLaunchCount;
    if (launches < ADS_CADENCE_CONFIG.APP_OPEN_MIN_LAUNCH_COUNT) {
      this.lastEvent = `app_open_skipped(launch=${launches})`;
      this.publishQa();
      return false;
    }

    const shown = await this.runFullscreenWithBannerAutoHide(async () =>
      this.adapter.showAppOpen(this.npa, ADS_CADENCE_CONFIG.APP_OPEN_TIMEOUT_MS)
    );
    if (shown) {
      this.appOpenShown += 1;
      saveService.incrementAdCounter('appOpenShown');
      this.lastEvent = `app_open_shown(launch=${launches})`;
    } else {
      this.lastEvent = 'app_open_timeout_or_unavailable';
    }
    this.publishQa();
    return shown;
  }

  public getTelemetry(): AdsQaTelemetry {
    const save = saveService.get();
    return {
      mode: this.adapter.mode,
      umpState: this.umpState,
      npa: this.npa,
      bannerVisible: this.bannerVisible,
      bannerSuspendedForFullscreen: this.bannerSuspendedForFullscreen,
      activeScene: this.activeScene,
      sessionGameOvers: this.sessionGameOvers,
      lastInterstitialAt: this.lastInterstitialAt,
      interstitialShown: this.interstitialShown,
      rewardedShown: this.rewardedShown,
      rewardedClaimed: this.rewardedClaimed,
      rewardedDismissed: this.rewardedDismissed,
      appOpenShown: this.appOpenShown,
      appLaunchCount: save.appLaunchCount,
      lastEvent: this.lastEvent
    };
  }

  private async runFullscreenWithBannerAutoHide<T>(task: () => Promise<T>): Promise<T> {
    this.isFullscreenActive = true;
    const wasBannerVisible = this.bannerVisible;
    if (wasBannerVisible) {
      this.bannerSuspendedForFullscreen = true;
      await this.hideBannerInternal();
      this.lastEvent = 'banner_suspended_for_fullscreen';
      this.publishQa();
    }

    try {
      return await task();
    } finally {
      this.isFullscreenActive = false;
      this.bannerSuspendedForFullscreen = false;
      if (ADS_CADENCE_CONFIG.BANNER_SCENES.includes(this.activeScene)) {
        await this.showBannerInternal();
        this.lastEvent = 'banner_restored_after_fullscreen';
      }
      this.publishQa();
    }
  }

  private async showBannerInternal(): Promise<void> {
    if (this.bannerVisible) return;
    try {
      await this.adapter.showBanner();
      this.bannerVisible = true;
      saveService.incrementAdCounter('bannerShown');
    } catch {
      this.bannerVisible = false;
    }
  }

  private async hideBannerInternal(): Promise<void> {
    if (!this.bannerVisible) return;
    try {
      await this.adapter.hideBanner();
    } catch {
      // Safe fallback
    }
    this.bannerVisible = false;
  }

  private publishQa(): void {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__KUNAI_QA__ = this.getTelemetry();
    }
  }
}

export const adsManager = new AdsManagerImpl();
