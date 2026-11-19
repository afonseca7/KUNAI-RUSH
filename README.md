# Kunai Rush

**Kunai Rush** is a nocturnal pixel-art precision knife-throwing arcade game built with **Phaser 3**, **TypeScript**, **Vite**, and **Capacitor 8 (Android)**, using 100% authentic CC0 16×16 pixel art sprites and integer-scaled crisp rendering.

---

## Key Features

- **100% Authentic CC0 16×16 Pixel Art (`NEAREST`)**: Powered by vendored **Pixel-boy & AAA Ninja Adventure** CC0 sprites, **Kenney Tiny Dungeon** accents, and **Kenney Mini** 8px bitmap font — zero blurred vectors, zero SVG/Canvas UI shapes.
- **Dual Logical Profile & Integer Scaling**:
  - Automatically selects `tall` (`180×400`) when `Math.floor(cssH / 400) >= 2`, or `short` (`180×320`) on compact viewports, with adaptive logical width clamped to `[180, 240]`.
  - Renders strictly at integer scale (`×1`..`×4`) with themed `#070912` letterbox padding so texels stay razor sharp across `360×640` (`180×320 ×2`), `360×800` (`180×400 ×2`), `400×800` (`200×400 ×2`), `390×844` (`195×400 ×2`), and desktop displays.
- **Precision Runtime Geometry & 24-Slot Level Feasibility**:
  - Angular collision threshold `minCollisionAngleDeg = 11°` (`Phaser.Math.Angle.ShortestBetween`) with tip-point radial impact.
  - 24 discrete `15°` perimeter slots guaranteeing `freeSlots >= kunaisToThrow` on every level — zero impossible stages.
  - Boss encounters every 5 levels with 3 consecutive phases, animated portraits, telegraph cues, hit-stop, slow-motion finishers, and progressive rotation patterns (`constant`, `accel`, `reverse`, `sinusoidal`).
- **Progression, Shop & Daily Streak**:
  - **8 Kunai skins** baked cleanly via pixel-by-pixel palette swaps on the lossless 90° CCW vertical CC0 kunai sprite.
  - **4 Composed 48×48 targets** (`Madera`, `Piedra`, `Farol`, `Máscara Oni`) + **3 Composed 64×64 bosses**.
  - 4-day Daily Streak reward cycle (`+10`, `+15`, `+25`, `+40` coins), Spanish/English localization (`ES` default) with full `ñ Ñ á é í ó ú ü ¡ ¿` bitmap glyphs, synthesized procedural Web Audio SFX (`AudioService`), and native haptics (`HapticsService`).
- **Dual AdMob + UMP Monetization Architecture**:
  - `NativeAdMobAdapter` (Capacitor `@capacitor-community/admob` v8 + UMP Consent) on Android + interactive `WebMockAdsAdapter` in browser dev/QA.
  - Non-intrusive cadence: Banner only in `MenuScene` / `ShopScene` / `GameOverScene` (auto-hidden during fullscreen ads), Interstitial after `sessionGameOvers > 2` on odd game overs with `60s` cooldown, Rewarded ads for Revive (`1×/run`), `×2 Coins`, and Shop `+25 Coins` (`180s` cooldown), plus App Open (`appLaunchCount >= 2`, `4s` timeout).

---

## Project Structure

```text
├── scripts/
│   ├── vendor-cc0-assets.mjs       # Validates, extrudes (1px), rotates kunai 90° CCW & builds Kenney Mini BitmapFont
│   └── generate-store-assets.mjs   # Generates 512x512 icon, 1024x500 feature graphic & Android mipmaps (NEAREST)
├── src/
│   ├── assets/                     # Vendored CC0 pixel sheets, kunai_base.png, pixel_font.png/.xml
│   ├── config/                     # balance.ts (viewport & level math), skins.ts, adsConfig.ts, i18n.ts
│   ├── objects/                    # AssetPipeline, EffectsFactory, TargetWheel, KunaiPool, CollectiblePool, ParticleManager
│   ├── scenes/                     # Boot, Preload, Menu, Game, GameOver, Shop, Settings
│   ├── services/                   # SaveService, AudioService, HapticsService, ads/ (IAdsService, AdsManager, Native & WebMock)
│   └── ui/                         # UITheme (pixel 9-slice, BitmapText buttons), DailyStreakModal
├── android/                        # Capacitor 8 Android project (com.tuestudio.kunairush, compileSdk=36, targetSdk=36, minSdk=24)
├── public/store-assets/            # Play Store icon-512.png, feature-1024x500.png & 400x800 screenshots
├── privacy.html                    # Bilingual ES/EN privacy policy
├── app-ads.txt                     # Root-domain AdMob authorized seller template
├── PUBLISHING.md                   # Google Play & AdMob release checklist
└── THIRD_PARTY_LICENSES.md         # Full CC0 1.0 & MIT attribution notices
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run local dev server (uses WebMockAdsAdapter in browser)
npm run dev

# Type-check & build production dist/
npm run typecheck
npm run build

# Sync web bundle with Capacitor Android project
npx cap sync android
```

---

## Credits & Licenses

- **Sprites & Tilesets**: *Ninja Adventure - Asset Pack* by **Pixel-boy & AAA** — [CC0 1.0 Universal](THIRD_PARTY_LICENSES.md)
- **Additional Dungeon Accents & Pixel Font**: *Tiny Dungeon* & *Kenney Fonts (Kenney Mini)* by **Kenney** — [CC0 1.0 Universal](THIRD_PARTY_LICENSES.md)
- **Rotation / Collision Pattern Reference**: Inspired by `iagodahlem/knife-hit` — [MIT License](THIRD_PARTY_LICENSES.md)
- **Hosting & Release**: See [`PUBLISHING.md`](PUBLISHING.md) for Play Store signing, `400×800` screenshots, API 36 build steps, and root `app-ads.txt` deployment.
