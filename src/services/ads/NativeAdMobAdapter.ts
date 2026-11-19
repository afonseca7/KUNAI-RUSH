import {
  AdMob,
  AdmobConsentStatus,
  AppOpenAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  InterstitialAdPluginEvents,
  MaxAdContentRating,
  RewardAdPluginEvents
} from '@capacitor-community/admob';
import type { PluginListenerHandle } from '@capacitor/core';
import { ADS_RUNTIME_CONFIG } from '../../config/adsConfig';
import type { IAdsAdapter, RewardedPlacement, UmpConsentState } from './IAdsService';

export class NativeAdMobAdapter implements IAdsAdapter {
  public readonly mode = 'native' as const;
  private npa = false;
  private bannerLoaded = false;

  public async init(): Promise<{ umpState: UmpConsentState; npa: boolean }> {
    await AdMob.initialize({
      initializeForTesting: ADS_RUNTIME_CONFIG.isTesting,
      tagForUnderAgeOfConsent: ADS_RUNTIME_CONFIG.tagForUnderAgeOfConsent,
      maxAdContentRating: MaxAdContentRating.Teen
    });

    let umpState: UmpConsentState = 'FALLBACK_NPA';
    this.npa = true;

    try {
      let info = await AdMob.requestConsentInfo({
        tagForUnderAgeOfConsent: ADS_RUNTIME_CONFIG.tagForUnderAgeOfConsent
      });

      if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
        info = await AdMob.showConsentForm();
      }

      if (info.status === AdmobConsentStatus.OBTAINED) {
        umpState = 'OBTAINED';
        this.npa = false;
      } else if (info.status === AdmobConsentStatus.NOT_REQUIRED) {
        umpState = 'NOT_REQUIRED';
        this.npa = false;
      } else {
        umpState = 'FALLBACK_NPA';
        this.npa = true;
      }
    } catch {
      umpState = 'FALLBACK_NPA';
      this.npa = true;
    }

    return { umpState, npa: this.npa };
  }

  public async showBanner(): Promise<void> {
    if (this.bannerLoaded) {
      await AdMob.resumeBanner();
      return;
    }
    await AdMob.showBanner({
      adId: ADS_RUNTIME_CONFIG.ids.bannerId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      isTesting: ADS_RUNTIME_CONFIG.isTesting,
      npa: this.npa
    });
    this.bannerLoaded = true;
  }

  public async hideBanner(): Promise<void> {
    if (!this.bannerLoaded) return;
    await AdMob.hideBanner();
  }

  public async showInterstitial(npa: boolean): Promise<boolean> {
    const handles: PluginListenerHandle[] = [];
    try {
      await AdMob.prepareInterstitial({
        adId: ADS_RUNTIME_CONFIG.ids.interstitialId,
        isTesting: ADS_RUNTIME_CONFIG.isTesting,
        npa,
        immersiveMode: true
      });

      return await new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean): void => {
          if (settled) return;
          settled = true;
          resolve(ok);
        };

        void Promise.all([
          AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => finish(true)),
          AdMob.addListener(InterstitialAdPluginEvents.FailedToShow, () => finish(false))
        ]).then((list) => {
          handles.push(...list);
        });

        void AdMob.showInterstitial().catch(() => finish(false));
      });
    } catch {
      return false;
    } finally {
      for (const h of handles) {
        void h.remove().catch(() => {});
      }
    }
  }

  public async showRewarded(_placement: RewardedPlacement, npa: boolean): Promise<boolean> {
    const handles: PluginListenerHandle[] = [];
    try {
      await AdMob.prepareRewardVideoAd({
        adId: ADS_RUNTIME_CONFIG.ids.rewardedId,
        isTesting: ADS_RUNTIME_CONFIG.isTesting,
        npa,
        immersiveMode: true
      });

      return await new Promise<boolean>((resolve) => {
        let earned = false;
        let settled = false;
        const finish = (result: boolean): void => {
          if (settled) return;
          settled = true;
          resolve(result);
        };

        void Promise.all([
          AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            earned = true;
          }),
          AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(earned)),
          AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => finish(false))
        ]).then((list) => {
          handles.push(...list);
        });

        void AdMob.showRewardVideoAd().catch(() => finish(false));
      });
    } catch {
      return false;
    } finally {
      for (const h of handles) {
        void h.remove().catch(() => {});
      }
    }
  }

  public async showAppOpen(_npa: boolean, timeoutMs: number): Promise<boolean> {
    const handles: PluginListenerHandle[] = [];
    try {
      const loaded = await Promise.race([
        AdMob.loadAppOpen({
          adId: ADS_RUNTIME_CONFIG.ids.appOpenId
        }).then(() => true),
        new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), timeoutMs))
      ]);

      if (!loaded) return false;

      return await new Promise<boolean>((resolve) => {
        let settled = false;
        const finish = (ok: boolean): void => {
          if (settled) return;
          settled = true;
          resolve(ok);
        };

        void Promise.all([
          AdMob.addListener(AppOpenAdPluginEvents.Closed, () => finish(true)),
          AdMob.addListener(AppOpenAdPluginEvents.FailedToShow, () => finish(false))
        ]).then((list) => {
          handles.push(...list);
        });

        void AdMob.showAppOpen().catch(() => finish(false));
      });
    } catch {
      return false;
    } finally {
      for (const h of handles) {
        void h.remove().catch(() => {});
      }
    }
  }
}
