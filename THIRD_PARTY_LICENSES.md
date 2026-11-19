# Third-Party Licenses & Attribution — KUNAI RUSH

All runtime assets and third-party libraries bundled in **KUNAI RUSH** are licensed under permissive open-source / public-domain terms compatible with commercial distribution on Google Play Store.

---

## 1. Visual & Audio Assets (CC0 1.0 Universal — Public Domain)

### Ninja Adventure Asset Pack
- **Authors:** Pixel-boy & AAA
- **Authoritative Source:** Official itch.io distribution (`Ninja Adventure - Asset Pack.zip`, upload `16981275`, updated March 29, 2026) — https://pixel-boy.itch.io/ninja-adventure-asset-pack
- **License:** Creative Commons Zero v1.0 Universal (CC0 1.0)
- **Archived License Evidence:**
  - `src/assets/licenses/NINJA_ADVENTURE_LICENSE.txt` (verbatim `LICENSE.txt` from official ZIP)
  - `src/assets/licenses/NINJA_ADVENTURE_README.md` (verbatim `README.md` from official ZIP)
  - `src/assets/licenses/NINJA_ADVENTURE_ITCH_CC0.txt` (declaration captured from itch.io page)
- **Usage:** Animated ninja mascot, kunai base projectile, boss facesets, target sphere/tile textures, VFX spritesheets, 9-slice UI panels/buttons/icons, SFX `.wav` effects, and nocturnal `.ogg` background music. Only the minimal subset (< 1.6 MB) used by the game is vendored in `src/assets/`.

### Kenney Tiny Dungeon & Kenney Fonts
- **Author:** Kenney (https://kenney.nl)
- **Sources:**
  - Tiny Dungeon v1.0 — https://kenney.nl/assets/tiny-dungeon / https://kenney-assets.itch.io/tiny-dungeon
  - Kenney Fonts (`Kenney Mini`) — https://kenney.nl/assets/kenney-fonts
- **License:** Creative Commons Zero v1.0 Universal (CC0 1.0)
- **Archived License Evidence:**
  - `src/assets/licenses/KENNEY_TINY_DUNGEON_LICENSE.txt`
  - `src/assets/licenses/KENNEY_FONTS_LICENSE.txt`
- **Usage:** Supplementary `16x16` dungeon tiles (`tiles_kenney.png`) and pre-baked binary-alpha `BitmapFont` atlas (`src/assets/fonts/pixel_font.png` + `pixel_font.xml`) including full Spanish diacritics (`ñ Ñ á é í ó ú ü Á É Í Ó Ú Ü ¡ ¿`).

---

## 2. Source Code, Formulas & Engine Dependencies (MIT / Apache-2.0)

### Angular Collision Math Reference (`iagodahlem/knife-hit`)
- **Repository:** https://github.com/iagodahlem/knife-hit
- **License:** MIT License (Copyright © Iago Dahlem)
- **Usage:** Reference trigonometric angular collision check (`Phaser.Math.Angle.ShortestBetween`) and fail bounce kinematics in `TargetWheel.ts` / `KunaiPool.ts`. No artwork or audio assets from that repository are used.

### Phaser 3
- **Website / Repo:** https://phaser.io / https://github.com/phaserjs/phaser
- **License:** MIT License (Copyright © Richard Davey, Photon Storm Ltd.)

### Capacitor & Official Plugins + `@capacitor-community/admob`
- **Packages:** `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/app`, `@capacitor/haptics`, `@capacitor/preferences`, `@capacitor/status-bar`, `@capacitor-community/admob`
- **License:** MIT License
