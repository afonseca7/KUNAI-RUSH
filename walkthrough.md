# Walkthrough — Kunai Rush v1.1.0

Implementación completa end-to-end de **Kunai Rush** (`com.tuestudio.kunairush`, **v1.1.0** / `versionCode 2`) ejecutando las fases **P0 → P5** de `implementation_plan.md` más el **Feature Set v1.1** sobre `origin/main` (`https://github.com/afonseca7/KUNAI-RUSH.git`), con pipeline 100% pixel art CC0 (`NEAREST`), doble perfil lógico entero (`180×400` / `180×320`), monetización AdMob + UMP, Capacitor Android API 36 y binarios firmados listos para distribución.

---

## Resumen de Gates por Fase (P0 – P5)

| Fase | Commits | Resultado y Evidencia Verificada |
| :--- | :--- | :--- |
| **P0 — Preflight, Base & CC0 Assets** | `841eb46` (`C01`) → `bdf584a` (`C05a`) | Preflight verificado (`node v24.20.0`, `npm 11.19.0`, `git 2.56.1`, `gh 2.105.0`, `JDK 17.0.12`, Python `3.14.10` + Pillow `12.3.0`, MS Edge; sin Android SDK local, validado mediante `npx cap sync android`). Assets CC0 vendoreados en `src/assets/` (`1,606,381 bytes` / `1.53 MB` < `5 MB`) con extrusión 1px, `kunai_base.png` rotado 90° CCW lossless, y `pixel_font.png`/`.xml` (`Kenney Mini` 8px alpha binario con glifos ES `ñ Ñ á é í ó ú ü Á É Í Ó Ú Ü ¡ ¿ ·`). |
| **P1 — Core Gameplay Pixel-Perfect** | `60eadb6` (`C05b`) → `01ff459` (`C10`) | Pipeline `AssetPipeline.ts` + `EffectsFactory.ts`, `UITheme.ts` (9-slice pixel y `PixelText`/`PixelButton`), `TargetWheel.ts`, `KunaiPool.ts` (`MIN_COLLISION_ANGLE_DEG = 11°`, `24` slots de `15°`), `CollectiblePool.ts`, `GameScene.ts` (jefe cada 5 niveles de 3 fases), `MenuScene.ts` y `GameOverScene.ts`. QA visual P1 en MS Edge headless (`360×800`, `360×640`, `390×844`): escala entera exacta (`180×400 ×2`, `180×320 ×2`, `195×400 ×2`), lanzamientos validados y `0` excepciones runtime. |
| **P2 — Juice, Audio, Haptics, Tienda & Ajustes** | `a8c80f1` (`C11`) → `eba2d25` (`C16`) | `ParticleManager.ts` (1–2px pooled), `AudioService.ts`, `HapticsService.ts`, `DailyStreakModal.ts` (ciclo 4 días `+10/+15/+25/+40`), `ShopScene.ts` (8 kunais palette-swap + 4 dianas compuestas `48×48` con preview giratoria) y `SettingsScene.ts` (sonido, háptica, `ES/EN`, créditos CC0, reset con confirmación). QA P2 aprobado en MS Edge con `0` excepciones. |
| **P3 — Monetización AdMob + UMP** | `fb06856` (`C17`) → `0313e8c` (`C20`) | Contrato `IAdsService.ts` + `AdsManager.ts` + `NativeAdMobAdapter.ts` (`@capacitor-community/admob` + UMP) + `WebMockAdsAdapter.ts`. QA P3 en MS Edge verificó UMP (`OBTAINED`, `npa=false`), skip de App Open en lanzamiento #1, disparo en lanzamiento #2 (`appOpenShown=1`), ocultamiento automático de Banner durante anuncios fullscreen (`bannerSuspendedForFullscreen=true`, `display=none`) y restauración al cerrar, recompensa Shop `+25` al esperar countdown vs `0` al cancelar, con `0` excepciones. |
| **P4 — Android API 36, Store Art & Legal Docs** | `0f191b0` (`C21`) → `3b6b5cb` (`C24`) | Proyecto Capacitor Android inicializado (`com.tuestudio.kunairush`, `compileSdkVersion=36`, `targetSdkVersion=36`, `minSdkVersion=24`, portrait, `AD_ID`, config de firma `release` leyendo `../keystore.properties`). `scripts/generate-store-assets.mjs` generó `public/store-assets/icon-512.png`, `feature-1024x500.png` y `mipmap-*` Android (`NEAREST`). Documentación completa en `privacy.html` (ES/EN), `app-ads.txt`, `THIRD_PARTY_LICENSES.md`, `PUBLISHING.md` (separando `/KUNAI-RUSH/privacy.html` de `https://afonseca7.github.io/app-ads.txt` en raíz del dominio y regla de capturas `400×800`) y `README.md`. |
| **P5 — QA Multi-Viewport Final, Capturas `400×800` & Release Sync** | `70fd28b` (`C25`) + `C26` | Verificados `360×800` (`tall 180×400 ×2`), `360×640` (`short 180×320 ×2`), `390×844` (`tall 195×400 ×2`, letterbox 44px), `1280×800` (`tall 240×400 ×2`, `480×800` centrado) y `400×800` (`tall 200×400 ×2`, exacto 2:1); cadencia intersticial verificada (`go=1,2` omitidos, `go=3` mostrado con banner suspendido); 4 capturas oficiales `400×800` guardadas en `public/store-assets/screenshots/` e inspeccionadas visualmente con `0` excepciones runtime. |
| **v1.1 Feature 1 — Catálogo Ampliado, Rarezas, Tienda 3 Tabs & Save v2** | `dceee64` | Catálogo ampliado a 26 cosméticos tienda en 4 tiers (`8` Ninjas con animaciones idle/throw/win/fail, `10` Kunais palette-swap y `8` Fondos tilemap nocturnos con parallax), pestañas `NINJAS / KUNAIS / FONDOS` en `ShopScene`, 1 logro por pestaña (`ninja_amber` racha≥3, `kunai_bamboo` nivel≥5, `bg_shrine` score≥25), migración sin pérdida `SaveService v1 → v2`, QA en `360×800` & `360×640` con `0` excepciones. |
| **v1.1 Feature 2 — Ruleta Lucky Spin Rewarded (`Ruleta Shinobi`)** | `cfa8781` | Botón flotante en `MenuScene` (`GRATIS` / badge `xN ACTIVO`) y oferta opt-in post-Game Over `1/3` (`GameOverScene`), modal 9-slice `LuckySpinModal` de 8 segmentos ponderados (`x2, x3, x5, x10, x30, 50, 150, COFRE`), cooldown gratis 4h + máx `3/día` con rewarded ad (`lucky_spin`), cancelación segura sin cobro ni giro, confeti pixel y multiplicador en `GameScene`. |
| **v1.1 Feature 3 — Sistema de Cofres, Llaves Fraccionales y Loss Aversion** | `812f6f8` | `ChestModal.ts` y progresión de llaves (`0.00–1.00`) + oro (`+25/cofre`), drops por jefe individual (`+1.0` / `+0.5` / `+0.25` / `0`), canje cada `3` llaves por cosmético aleatorio de tier superior, regla anti-doble-ad (`lastKeyFromAd`), y alerta "llave en el aire" con modal rojo de confirmación tras vencer jefes con cofre pendiente. QA end-to-end completo en `360×800` y `360×640` con `0` excepciones. |

---

## Capturas Oficiales (`public/store-assets/screenshots/` & `platform-specific/`)

- `01-menu-400x800.png` & `amazon-01-menu-480x800.png` — Menú principal v1.1 con badge de Cofre/Llaves, Ruleta Shinobi flotante (`GRATIS`), diana rotatoria y ninja animado (`200×400 ×2` y `240×400 ×2`).
- `02-gameplay-400x800.png` & `amazon-02-gameplay-480x800.png` — Gameplay activo con kunais clavados, diana de madera girando, moneda coleccionable y HUD superior.
- `03-shop-400x800.png` & `amazon-03-shop-480x800.png` — Tienda del Dojo v1.1 con pestañas `NINJAS / KUNAIS / FONDOS`, vista previa animada (`Shinobi Azur`), `+25 Monedas Gratis` y canje de llaves.
- `04-settings-400x800.png` & `amazon-04-settings-480x800.png` — Ajustes en español con controles de sonido/vibración, idioma, créditos CC0 y telemetría QA.

---

## Inventario Final Listo para Publicación (`v1.1.0` / `versionCode 2`)

- **Código & Config**: `src/` (`config/`, `objects/`, `scenes/`, `services/`, `ui/`), `scripts/vendor-cc0-assets.mjs`, `scripts/generate-store-assets.mjs`, `capacitor.config.ts`, `android/`.
- **Publicación y Compliance**: `PUBLISHING.md`, `PUBLISHING-ITCH-AMAZON-SAMSUNG.md`, `README.md`, `privacy.html`, `app-ads.txt`, `THIRD_PARTY_LICENSES.md`, `keystore.properties.example`, `walkthrough-distribution.md`.
- **Binarios Release Firmados (`public/distribution/`)**: `app-release.apk` (`15,118,603` bytes, verificado `apksigner` v2) y `app-release.aab` (`11,483,459` bytes, verificado `jarsigner`).
