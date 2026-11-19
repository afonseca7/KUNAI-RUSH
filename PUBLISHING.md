# Google Play Store & AdMob Publishing Guide — Kunai Rush

This document details every configuration, legal URL rule, store asset constraint, signing step, and release testing requirement needed to publish **Kunai Rush** (`com.tuestudio.kunairush`) on Google Play Store with Google AdMob + UMP consent.

---

## 1. Critical Hosting Rules: Privacy Policy vs. `app-ads.txt`

> [!IMPORTANT]
> Google AdMob **only** crawls `app-ads.txt` from the **exact root of your Developer Website domain** configured in Google Play Console — **never** from a project subpath like `/KUNAI-RUSH/app-ads.txt`.

| Asset | Purpose | Required Public URL | Repository to Host In |
| :--- | :--- | :--- | :--- |
| **Privacy Policy** (`privacy.html`) | Play Console & UMP GDPR link | `https://afonseca7.github.io/KUNAI-RUSH/privacy.html` | This repository (`afonseca7/KUNAI-RUSH`, GitHub Pages `/root`) |
| **Developer Website** | Play Console Store Listing → Website | `https://afonseca7.github.io` | User-site repo (`afonseca7/afonseca7.github.io`) |
| **`app-ads.txt`** | AdMob authorized seller verification | `https://afonseca7.github.io/app-ads.txt` | **Root** of `afonseca7/afonseca7.github.io` (copy `./app-ads.txt` from this repo and replace `pub-0000000000000000` with your real AdMob Publisher ID) |

### Setup Checklist
1. Enable **GitHub Pages** on `afonseca7/KUNAI-RUSH` (`Settings → Pages → Deploy from branch: main / (root)`) so `privacy.html` resolves at `https://afonseca7.github.io/KUNAI-RUSH/privacy.html`.
2. Create or update the user-site repository `afonseca7/afonseca7.github.io` with GitHub Pages enabled, and place `app-ads.txt` at its root containing your exact AdMob publisher record:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
3. In Google Play Console (`Store settings → Developer website`), set `https://afonseca7.github.io`.
4. Verify in a browser / `curl` that `https://afonseca7.github.io/app-ads.txt` returns `HTTP 200` and `text/plain`.

---

## 2. Store Graphics & Valid `400×800` Screenshot Specification

All store graphics in `public/store-assets/` are composed exclusively with **nearest-neighbor (`NEAREST`)** sampling from vendored CC0 16×16 pixel art (`scripts/generate-store-assets.mjs` and Playwright/Edge captures):

- **App Icon**: `public/store-assets/icon-512.png` — `512×512` PNG (also generates Android `mipmap-*` adaptive & legacy launcher icons + `#070912` background).
- **Feature Graphic**: `public/store-assets/feature-1024x500.png` — `1024×500` PNG.
- **Phone Screenshots** (`public/store-assets/screenshots/`):
  - `01-menu-400x800.png`
  - `02-gameplay-400x800.png`
  - `03-shop-400x800.png`
  - `04-settings-400x800.png`

> [!NOTE]
> Google Play rejects portrait screenshots whose aspect ratio exceeds **2:1** (`height / width > 2.0`), such as `360×800` (`2.22:1`). Capturing at `400×800` hits **exact 2:1**, triggers Kunai Rush's adaptive logical grid (`200×400` at exact integer `×2` scale), has **0px letterbox**, and complies with Google Play Phone screenshot dimension requirements (`>= 320px` short side, max `2:1`).

---

## 3. Target Android API Level & Manifest Permissions

Configured in [`capacitor.config.ts`](capacitor.config.ts), [`android/variables.gradle`](android/variables.gradle), [`android/app/build.gradle`](android/app/build.gradle), and [`android/app/src/main/AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml):

- **Application ID**: `com.tuestudio.kunairush`
- **Target & Compile SDK**: `compileSdkVersion = 36`, `targetSdkVersion = 36` (Android 16 — meets Google Play 2025/2026 API 35/36 requirement)
- **Minimum SDK**: `minSdkVersion = 24` (Android 7.0)
- **Orientation**: `android:screenOrientation="portrait"`
- **Version**: `versionCode 1`, `versionName "1.0.0"`
- **Declared Permissions**:
  - `android.permission.INTERNET`
  - `com.google.android.gms.permission.AD_ID` (required on API 33+ for AdMob Advertising ID)

---

## 4. Switching from AdMob Test IDs to Production IDs

By default, [`src/config/adsConfig.ts`](src/config/adsConfig.ts) and [`AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml) use Google's official Android test IDs:
- `appId`: `ca-app-pub-3940256099942544~3347511713`
- `bannerId`: `ca-app-pub-3940256099942544/6300978111`
- `interstitialId`: `ca-app-pub-3940256099942544/1033173712`
- `rewardedId`: `ca-app-pub-3940256099942544/5224354917`
- `appOpenId`: `ca-app-pub-3940256099942544/9257395921`

Before publishing to Play Console (never commit `.env` or secret IDs if private):
1. Create `.env.production` (gitignored via `.env.*`):
   ```env
   VITE_ADMOB_TEST_MODE=false
   VITE_ADMOB_APP_ID=ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY
   VITE_ADMOB_BANNER_ID=ca-app-pub-XXXXXXXXXXXXXXXX/1111111111
   VITE_ADMOB_INTERSTITIAL_ID=ca-app-pub-XXXXXXXXXXXXXXXX/2222222222
   VITE_ADMOB_REWARDED_ID=ca-app-pub-XXXXXXXXXXXXXXXX/3333333333
   VITE_ADMOB_APP_OPEN_ID=ca-app-pub-XXXXXXXXXXXXXXXX/4444444444
   ```
2. Update `com.google.android.gms.ads.APPLICATION_ID` in `android/app/src/main/AndroidManifest.xml` to match your production AdMob App ID.
3. Configure your GDPR / European Regulations message in the **AdMob Privacy & Messaging** console so `NativeAdMobAdapter` (UMP SDK) presents your live consent form automatically.

---

## 5. Upload Keystore & Signed Release `.aab` Build

Never commit `.jks`, `.keystore`, or `keystore.properties` (all are in `.gitignore`).

1. Generate the release upload keystore once:
   ```bash
   keytool -genkeypair -v \
     -keystore kunai-rush-release.jks \
     -alias kunai-rush \
     -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Copy [`keystore.properties.example`](keystore.properties.example) to `keystore.properties` and fill in your real `storePassword` and `keyPassword`.
3. Build web assets, sync Capacitor, and generate the signed Android App Bundle (`.aab`):
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew bundleRelease
   ```
4. Output bundle location: `android/app/build/outputs/bundle/release/app-release.aab`.

---

## 6. Play Console Data Safety, IARC & Closed Testing

### Data Safety Questionnaire
- **Does your app collect or share user data?**: **Yes** (shared with Google AdMob SDK; the developer runs **no backend servers** and collects zero direct personal data — save state stays local via `@capacitor/preferences`).
- **Data types collected / shared via AdMob**:
  - *Device or other IDs* → Advertising ID (`AD_ID`), for **Advertising or marketing**, **Analytics**, **Fraud prevention, security, and compliance**.
  - *App activity & App info and performance* → Crash logs, diagnostics, and ad interactions (e.g., views/taps), for **Analytics** and **Advertising or marketing**.
- **Processed ephemerally / encrypted in transit**: Yes (HTTPS/TLS).
- **Deletion request mechanism**: In-game Settings **RESET** wipes local progress immediately; Ad ID reset & personalization revocation are documented in [`privacy.html`](privacy.html) and controllable via the in-game **PRIVACIDAD (UMP)** button in Settings.

### Target Audience & Content Rating (IARC)
- **Target age group**: **13–15, 16–17, 18+** (`tagForUnderAgeOfConsent: false` in `src/config/adsConfig.ts`).
- **Not designed for children** under 13 (avoids Google Play Families Policy restrictions).
- **Content notes**: Mild cartoon ninja action (throwing kunais into wooden/stone/lantern/oni targets and pixel bosses; no blood or gore).

### Personal Developer Account Closed Testing Rule
For personal Google Play developer accounts created after Nov 2023, before applying for Production access you must:
1. Run a **Closed Testing** track with at least **12 testers opted-in continuously for 14 consecutive days**.
2. Upload verified AdMob test device IDs during closed testing so test impressions do not violate invalid-traffic policies.
