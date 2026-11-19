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
- **Usage:** Supplementary `16x16` dungeon tiles (`tiles_kenney.png`) and pre-baked binary-alpha `BitmapFont` atlas (`src/assets/fonts/pixel_font.png` + `pixel_font.xml`) including full Spanish diacritics (`ñ Ñ á é í ó ú ü Á É Í Ó Ú Ü ¡ ¿ ·`).

---

## 2. Source Code, Formulas & Engine Dependencies (MIT)

### Angular Collision Math Reference (`iagodahlem/knife-hit`)
- **Repository:** https://github.com/iagodahlem/knife-hit
- **License:** MIT License (Copyright © Iago Dahlem)
- **Usage:** Reference trigonometric angular collision check (`Phaser.Math.Angle.ShortestBetween`) and fail bounce kinematics in `TargetWheel.ts` / `KunaiPool.ts`. No artwork or audio assets from that repository are used.

### Phaser 3
- **Website / Repo:** https://phaser.io / https://github.com/phaserjs/phaser
- **License:** MIT License (Copyright © 2013-2025 Phaser Studio Inc. / Richard Davey)

### Capacitor & Plugins (`@capacitor/*`, `@capacitor-community/admob`)
- **License:** MIT License (Copyright © Ionic / Capacitor Community)

---

## 3. Full Legal Texts

### CC0 1.0 Universal (Creative Commons Public Domain Dedication)

```text
CC0 1.0 Universal

Statement of Purpose

The laws of most jurisdictions throughout the world automatically confer
exclusive Copyright and Related Rights (defined below) upon the creator and
subsequent owner(s) (each and all, an "owner") of an original work of
authorship and/or a database (each, a "Work").

Certain owners wish to permanently relinquish those rights to a Work for the
purpose of contributing to a commons of creative, cultural and scientific
works ("Commons") that the public can reliably and without fear of later
claims of infringement build upon, modify, incorporate in other works, reuse
and redistribute as freely as possible in any form whatsoever and for any
purposes, including without limitation commercial purposes. These owners may
contribute to the Commons to promote the ideal of a free culture and the
further production of creative, cultural and scientific works, or to gain
reputation or greater distribution for their Work in part through the use and
efforts of others.

For these and/or other purposes and motivations, and without any expectation
of additional consideration or compensation, the person associating CC0 with a
Work (the "Affirmer"), to the extent that he or she is an owner of Copyright
and Related Rights in the Work, voluntarily elects to apply CC0 to the Work
and publicly distribute the Work under its terms, with knowledge of his or her
Copyright and Related Rights in the Work and the meaning and intended legal
effect of CC0 on those rights.

1. Copyright and Related Rights. A Work made available under CC0 may be
protected by copyright and related or neighboring rights ("Copyright and
Related Rights"). Copyright and Related Rights include, but are not limited
to, the following:

  i. the right to reproduce, adapt, distribute, perform, display, communicate,
  and translate a Work;
  ii. moral rights retained by the original author(s) and/or performer(s);
  iii. publicity and privacy rights pertaining to a person's image or likeness
  depicted in a Work;
  iv. rights protecting against unfair competition in regards to a Work,
  subject to the limitations in paragraph 4(a), below;
  v. rights protecting the extraction, dissemination, use and reuse of data in
  a Work;
  vi. database rights (such as those arising under Directive 96/9/EC of the
  European Parliament and of the Council of 11 March 1996 on the legal
  protection of databases, and under any national implementation thereof,
  including any amended or successor version of such directive); and
  vii. other similar, equivalent or corresponding rights throughout the world
  based on applicable law or treaty, and any national implementations thereof.

2. Waiver. To the greatest extent permitted by, but not in contravention of,
applicable law, Affirmer hereby overtly, fully, permanently, irrevocably and
unconditionally waives, abandons, and surrenders all of Affirmer's Copyright
and Related Rights and associated claims and causes of action, whether now
known or unknown (including existing as well as future claims and causes of
action), in the Work (i) in all territories worldwide, (ii) for the maximum
duration provided by applicable law or treaty (including future time
extensions), (iii) in any current or future medium and for any number of
copies, and (iv) for any purpose whatsoever, including without limitation
commercial, advertising or promotional purposes (the "Waiver").

3. Public License Fallback. Should any part of the Waiver for any reason be
judged legally invalid or ineffective under applicable law, then the Waiver
shall be preserved to the maximum extent permitted taking into account
Affirmer's express Statement of Purpose. In addition, to the extent the Waiver
is so judged Affirmer hereby grants to each affected person a royalty-free,
non transferable, non sublicensable, non exclusive, irrevocable and
unconditional license to exercise Affirmer's Copyright and Related Rights in
the Work (i) in all territories worldwide, (ii) for the maximum duration
provided by applicable law or treaty (including future time extensions), (iii)
in any current or future medium and for any number of copies, and (iv) for any
purpose whatsoever, including without limitation commercial, advertising or
promotional purposes (the "License").

4. Limitations and Disclaimers.
  a. No trademark or patent rights held by Affirmer are waived, abandoned,
     surrendered, licensed or otherwise affected by this document.
  b. Affirmer offers the Work as-is and makes no representations or warranties
     of any kind concerning the Work.
  c. Affirmer disclaims responsibility for clearing rights of other persons.
  d. Creative Commons is not a party to this document.

Full text: https://creativecommons.org/publicdomain/zero/1.0/legalcode
```

### MIT License (Phaser 3, Capacitor, `iagodahlem/knife-hit`)

```text
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
