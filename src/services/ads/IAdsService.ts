export type UmpConsentState = 'UNKNOWN' | 'OBTAINED' | 'NOT_REQUIRED' | 'FALLBACK_NPA';

export type RewardedPlacement =
  | 'revive'
  | 'double_coins'
  | 'shop_free_coins'
  | 'lucky_spin'
  | 'open_chest';

export interface AdsQaTelemetry {
  mode: 'native' | 'web_mock';
  umpState: UmpConsentState;
  npa: boolean;
  bannerVisible: boolean;
  bannerSuspendedForFullscreen: boolean;
  activeScene: string;
  sessionGameOvers: number;
  lastInterstitialAt: number;
  interstitialShown: number;
  rewardedShown: number;
  rewardedClaimed: number;
  rewardedDismissed: number;
  appOpenShown: number;
  appLaunchCount: number;
  dailyAdSpinsUsed: number;
  freeSpinReady: boolean;
  activeMultiplier: number;
  pendingChests: number;
  keysWhole: number;
  keysFrac: number;
  gold: number;
  inFlightKeyAmount: number;
  lastKeyFromAd: boolean;
  lastEvent: string;
}

export interface IAdsAdapter {
  readonly mode: 'native' | 'web_mock';
  init(): Promise<{ umpState: UmpConsentState; npa: boolean }>;
  showBanner(): Promise<void>;
  hideBanner(): Promise<void>;
  showInterstitial(npa: boolean): Promise<boolean>;
  showRewarded(placement: RewardedPlacement, npa: boolean): Promise<boolean>;
  showAppOpen(npa: boolean, timeoutMs: number): Promise<boolean>;
}
