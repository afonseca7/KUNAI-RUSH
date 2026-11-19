# Guía de Publicación Gratuita — itch.io, Amazon Appstore & Samsung Galaxy Store

Esta guía reemplaza la publicación en Google Play Store (evitando la tasa de \$25 USD) para distribuir **Kunai Rush** (`com.tuestudio.kunairush`, v1.0.0) gratis en **itch.io**, **Amazon Appstore** y **Samsung Galaxy Store** usando el APK release firmado con `kunai-rush-release.jks`.

---

## 0. Archivos e Identificadores Comunes

- **APK Release firmado (v2 RSA 2048-bit)**: [`public/distribution/app-release.apk`](public/distribution/app-release.apk)
- **AAB Release firmado (respaldo)**: [`public/distribution/app-release.aab`](public/distribution/app-release.aab)
- **Política de Privacidad (ES/EN)**: `https://afonseca7.github.io/KUNAI-RUSH/privacy.html`
- **Sitio web del desarrollador**: `https://afonseca7.github.io`
- **`app-ads.txt` en raíz del dominio**: `https://afonseca7.github.io/app-ads.txt` *(no obligatorio para itch.io / Amazon / Samsung, pero recomendado mantenerlo activo y actualizar `pub-0000000000000000` cuando configures tu cuenta AdMob real)*

### Descripción recomendada (ES / EN, copiar y pegar)

> **ES**: **Kunai Rush** es un arcade ninja nocturno de precisión en 100% pixel art 16×16. Lanza kunais al ritmo de la diana giratoria sin chocar con los ya clavados, recoge monedas, supera jefes cada 5 niveles en combates de 3 fases y desbloquea 8 estilos de kunai y 4 dianas en la Tienda del Dojo.
>
> **Características clave**:
> - Pixel art CC0 16×16 nítido (`NEAREST`) con escalado entero perfecto y perfil nocturno.
> - Niveles garantizados matemáticamente (24 slots discretos de 15°) y jefes cada 5 niveles.
> - 8 kunais desbloqueables, 4 dianas compuestas y racha diaria de recompensas.
> - Bilingüe Español / Inglés, audio arcade y vibración háptica.

---

## 1. itch.io (GRATIS)

1. Crea una cuenta gratuita en **[https://itch.io](https://itch.io)** → inicia sesión → **Dashboard → Create new project**.
2. Completa los campos del proyecto:
   - **Title**: `Kunai Rush`
   - **Project URL**: `kunai-rush` *(queda `https://<tu-usuario>.itch.io/kunai-rush`)*
   - **Kind of project**: `Downloadable`
   - **Classification**: `Games`
   - **Pricing**: **`Free`** (o **`No payments` / `Pay what you want`**, ideal para proyectos indie)
3. **Uploads**:
   - Pulsa **Upload files** y sube [`public/distribution/app-release.apk`](public/distribution/app-release.apk).
   - Marca la casilla de plataforma **`Android`**.
4. **Cover image & Screenshots**:
   - **Upload Cover Image**: sube [`public/store-assets/platform-specific/itch.io/banner-630x500.png`](public/store-assets/platform-specific/itch.io/banner-630x500.png) (`630×500`).
   - **Screenshots** (sube los 4 archivos de [`public/store-assets/platform-specific/itch.io/`](public/store-assets/platform-specific/itch.io/) — también empaquetados en `screenshots-itch.zip`):
     - `01-kunai-rush-menu-400x800.png`
     - `02-kunai-rush-gameplay-400x800.png`
     - `03-kunai-rush-shop-400x800.png`
     - `04-kunai-rush-settings-400x800.png`
5. **Metadata & Description**:
   - **Genre**: `Action`
   - **Tags**: `pixel-art`, `one-button`, `hyper-casual`
   - **Description**: pega la descripción ES/EN de arriba e incluye el enlace a la política de privacidad: `https://afonseca7.github.io/KUNAI-RUSH/privacy.html`.
   - **Monetización**: los anuncios de AdMob se sirven de forma nativa dentro del APK en dispositivos Android (en itch.io solo aplica AdSense en web embeds HTML5; para APK Android la monetización va dentro del propio binario).
6. Cambia **Visibility** a **Public** y pulsa **Save & view page**.

---

## 2. Amazon Appstore (GRATIS)

1. Crea una cuenta gratuita en **[Amazon Developer Console](https://developer.amazon.com/apps-and-games)**.
2. Completa tu **Perfil de desarrollador**:
   - Nombre público / estudio: `Kunai Rush Studio` (o `afonseca7`)
   - Email de contacto: `afonseca@frd.utn.edu.ar`
   - **Website**: `https://afonseca7.github.io`
3. Pulsa **Add a New App → Android**:
   - **App title**: `Kunai Rush`
   - **App SKU**: `com.tuestudio.kunairush`
   - **Category**: `Games` → `Arcade`
4. **APK File**:
   - Ve a **APK Files** y sube [`public/distribution/app-release.apk`](public/distribution/app-release.apk).
   - **Supported devices**: teléfonos Android ARM/x86 portrait (`minSdk 24`).
5. **Availability & Pricing**:
   - **Pricing**: `Free` (gratuito en todos los países disponibles).
6. **Images & Multimedia**:
   - **Small App Icon (`114×114`)**: [`public/store-assets/platform-specific/amazon/icon-114x114.png`](public/store-assets/platform-specific/amazon/icon-114x114.png)
   - **Large App Icon (`512×512`)** *(si la consola lo solicita)*: [`public/store-assets/icon-512.png`](public/store-assets/icon-512.png)
   - **Screenshots** (acepta hasta 8; sube las 4 actuales de [`public/store-assets/platform-specific/amazon/`](public/store-assets/platform-specific/amazon/)):
     - `01-menu-400x800.png`
     - `02-gameplay-400x800.png`
     - `03-shop-400x800.png`
     - `04-settings-400x800.png`
   - **Promotional Video** *(opcional)*: [`public/store-assets/platform-specific/amazon/promo-video.mp4`](public/store-assets/platform-specific/amazon/promo-video.mp4) (`1280×720`, slideshow animado con audio CC0).
7. **Content Rating & App Specifications**:
   - **Privacy Policy URL**: `https://afonseca7.github.io/KUNAI-RUSH/privacy.html`
   - **Permisos y APIs usadas**: declarar uso de red (`INTERNET`) y **Android Advertising ID (`com.google.android.gms.permission.AD_ID`)**.
   - **Monetization / AdMob**: selecciona publicidad de terceros (`admob-ads` / Google AdMob) e indica público **13+**.
8. Pulsa **Submit App** para revisión (Amazon valida automáticamente la firma v2 del APK).

---

## 3. Samsung Galaxy Store (GRATIS)

1. Registra una cuenta gratuita en **[Samsung Seller Portal](https://seller.samsung.com)** (como vendedor de apps **gratuitas** no requiere alta comercial de pago).
2. Pulsa **Add New App → Android**:
   - **App Title**: `Kunai Rush`
   - **Default Language**: `Spanish` (añade también `English` opcionalmente).
   - **Category**: `Games` → `Arcade & Puzzle`
3. **Binary**:
   - Sube [`public/distribution/app-release.apk`](public/distribution/app-release.apk) (versionCode `1`, versionName `1.0.0`, firmado RSA 2048 v2).
4. **App Information / Graphics**:
   - **App Icon (`512×512`)**: [`public/store-assets/platform-specific/samsung/icon-512x512.png`](public/store-assets/platform-specific/samsung/icon-512x512.png)
   - **Cover / Feature Image (`1024×500`)**: [`public/store-assets/platform-specific/samsung/feature-graphic-1024x500.png`](public/store-assets/platform-specific/samsung/feature-graphic-1024x500.png)
   - **Screenshots (`400×800`, 2:1)**: sube las 4 capturas de [`public/store-assets/platform-specific/samsung/`](public/store-assets/platform-specific/samsung/):
     - `01-menu-400x800.png`
     - `02-gameplay-400x800.png`
     - `03-shop-400x800.png`
     - `04-settings-400x800.png`
5. **Pricing, Monetization & Compliance**:
   - **Price**: `Free`
   - **Privacy Policy URL**: `https://afonseca7.github.io/KUNAI-RUSH/privacy.html`
   - **Monetization / Ads**: marca **Contains Ads** y declara **Google AdMob** (banners, intersticiales, bonificados y App Open con consentimiento UMP).
   - **Age Rating**: `12+` / `13+` (violencia caricaturesca leve).
6. Pulsa **Save** y **Submit** para la revisión de certificación de Samsung.

---

## 4. Mantenimiento de `app-ads.txt` y Paso a IDs Reales de AdMob

1. `https://afonseca7.github.io/app-ads.txt` ya está publicado y activo desde el repositorio `afonseca7/afonseca7.github.io`.
2. Aunque **itch.io**, **Amazon Appstore** y **Samsung Galaxy Store** no bloquean la publicación si no tienes `app-ads.txt`, mantenerlo en `https://afonseca7.github.io/app-ads.txt` protege tus ingresos cuando **Google AdMob** verifique tu app en tiendas admitidas (Amazon Appstore / Samsung Galaxy Store).
3. Cuando crees tus unidades en **[https://admob.google.com](https://admob.google.com)**, sigue la sección **AdMob IDs de producción** de [`PUBLISHING.md`](PUBLISHING.md) para cambiar `PRODUCTION_READY = true`, actualizar `AndroidManifest.xml`, actualizar `afonseca7.github.io/app-ads.txt` y recompilar `app-release.apk`.
