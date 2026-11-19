/**
 * Google AdMob IDs and UMP Consent configuration.
 * Defaults to Google's official Android Test Ad Unit IDs until release IDs are
 * supplied via environment overrides.
 */

export interface AdMobIds {
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  appOpenId: string;
}

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const ADMOB_TEST_IDS: AdMobIds = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  appOpenId: 'ca-app-pub-3940256099942544/9257395921'
};

/**
 * TODO: Cambiar `PRODUCTION_READY` a `true` después de crear tu app y tus 4 Ad Units
 * reales en https://admob.google.com y reemplazar los IDs de prueba (vía `.env.production`
 * o actualizando los valores reales aquí y en `android/app/src/main/AndroidManifest.xml`).
 */
export const PRODUCTION_READY = false;

export const ADS_RUNTIME_CONFIG = {
  /** Keep true during development & QA; switch via PRODUCTION_READY=true or VITE_ADMOB_TEST_MODE=false for production. */
  isTesting: !PRODUCTION_READY && env.VITE_ADMOB_TEST_MODE !== 'false',
  /** Target audience is 13+ (General / Teen). */
  tagForUnderAgeOfConsent: false,
  ids: {
    appId: env.VITE_ADMOB_APP_ID ?? ADMOB_TEST_IDS.appId,
    bannerId: env.VITE_ADMOB_BANNER_ID ?? ADMOB_TEST_IDS.bannerId,
    interstitialId: env.VITE_ADMOB_INTERSTITIAL_ID ?? ADMOB_TEST_IDS.interstitialId,
    rewardedId: env.VITE_ADMOB_REWARDED_ID ?? ADMOB_TEST_IDS.rewardedId,
    appOpenId: env.VITE_ADMOB_APP_OPEN_ID ?? ADMOB_TEST_IDS.appOpenId
  } satisfies AdMobIds
} as const;
