# Walkthrough de Distribución — itch.io, Amazon Appstore & Samsung Galaxy Store

Resumen de compilación, verificación de firma, URLs públicas y activos generados para distribuir **Kunai Rush v1.0.0** (`com.tuestudio.kunairush`) de forma gratuita en **itch.io**, **Amazon Appstore** y **Samsung Galaxy Store**.

---

## 1. Compilación y Verificación de Binarios

| Artefacto | Ruta | Tamaño | Verificación |
| :--- | :--- | ---: | :--- |
| **Release APK** (distribución principal) | [`public/distribution/app-release.apk`](public/distribution/app-release.apk) | `15,099,676` bytes | `apksigner verify`: **Verifies** (`v2 scheme: true`, `CN=afonseca7, O=Kunai Rush, C=AR`, RSA 2048-bit) |
| **Release AAB** (respaldo) | [`public/distribution/app-release.aab`](public/distribution/app-release.aab) | `11,464,057` bytes | `jarsigner -verify`: **jar verified.** (`X.509, CN=afonseca7, O=Kunai Rush, C=AR`) |

Checks previos ejecutados sin errores:
- `npm run typecheck` (`tsc --noEmit`) → `exit 0`
- `npm run build` (`vite v6.4.6`, 167 módulos) → `exit 0`
- `npx cap sync android` (`@capacitor/core`, `@capacitor-community/admob`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/preferences`, `@capacitor/status-bar`) → `exit 0`
- `.\gradlew.bat assembleRelease bundleRelease` → `BUILD SUCCESSFUL`

---

## 2. Preparación de AdMob para Producción

- [`src/config/adsConfig.ts`](src/config/adsConfig.ts): añadida constante `export const PRODUCTION_READY = false` con comentario `TODO` indicando cómo activar IDs reales.
- [`android/app/src/main/AndroidManifest.xml`](android/app/src/main/AndroidManifest.xml): conservados los IDs oficiales de prueba de Google con comentario `<!-- TODO -->` señalando el `APPLICATION_ID` a reemplazar.
- [`PUBLISHING.md`](PUBLISHING.md): agregada sección **AdMob IDs de producción** explicando paso a paso cómo crear app + 4 bloques en `https://admob.google.com` y dónde pegarlos.

---

## 3. Activos por Plataforma en `public/store-assets/platform-specific/`

### itch.io (`public/store-assets/platform-specific/itch.io/`)
- **APK**: `public/distribution/app-release.apk`
- **Portada**: `banner-630x500.png` (`630×500`, `18,415` bytes, `NEAREST` pixel-art)
- **Capturas (paquete ZIP o individuales)**: `screenshots-itch.zip` (`286,965` bytes) + los 4 PNG renombrados (`01-kunai-rush-menu-400x800.png` .. `04-kunai-rush-settings-400x800.png`)

### Amazon Appstore (`public/store-assets/platform-specific/amazon/`)
- **APK**: `public/distribution/app-release.apk`
- **Ícono 114×114**: `icon-114x114.png` (`114×114`, `13,492` bytes, `NEAREST`)
- **Capturas (`480×800`, perfil alto `240×400 ×2`)**:
  - `amazon-01-menu-480x800.png` (`480×800`, `87,709` bytes)
  - `amazon-02-gameplay-480x800.png` (`480×800`, `95,214` bytes)
  - `amazon-03-shop-480x800.png` (`480×800`, `88,562` bytes)
  - `amazon-04-settings-480x800.png` (`480×800`, `78,962` bytes)
- **Promo Video (opcional)**: `promo-video.mp4` (`1,011,374` bytes, `1280×720` H.264 + AAC con música `bgm_night.ogg` de Ninja Adventure)

### Samsung Galaxy Store (`public/store-assets/platform-specific/samsung/`)
- **APK**: `public/distribution/app-release.apk`
- **Ícono 512×512**: `icon-512x512.png` (`512×512`, `24,133` bytes)
- **Feature Graphic 1024×500**: `feature-graphic-1024x500.png` (`1024×500`, `35,378` bytes)
- **Capturas (`400×800`)**: `01-menu-400x800.png`, `02-gameplay-400x800.png`, `03-shop-400x800.png`, `04-settings-400x800.png`

---

## 4. URLs Públicas Verificadas

- **Política de Privacidad**: `https://afonseca7.github.io/KUNAI-RUSH/privacy.html` (`HTTP/1.1 200 OK`)
- **Sitio Web del Desarrollador**: `https://afonseca7.github.io` (`HTTP/1.1 200 OK`)
- **`app-ads.txt` en raíz**: `https://afonseca7.github.io/app-ads.txt` (`HTTP/1.1 200 OK` — plantilla activa lista para actualizar con tu `pub-XXXXXXXXXXXXXXXX` real cuando configures AdMob)
- **Guía de subida paso a paso**: [`PUBLISHING-ITCH-AMAZON-SAMSUNG.md`](PUBLISHING-ITCH-AMAZON-SAMSUNG.md)
