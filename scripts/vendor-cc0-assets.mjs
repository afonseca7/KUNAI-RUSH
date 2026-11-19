#!/usr/bin/env node
/**
 * Reproducible CC0 Asset Vendoring & Pixel-Art Atlas Pipeline (P0.5)
 *
 * Extracts ONLY the lightweight subset (< 5 MB) from:
 *  1. Official Ninja Adventure - Asset Pack.zip (Pixel-boy & AAA, itch.io CC0 1.0)
 *  2. Kenney Tiny Dungeon (CC0 1.0)
 *  3. Kenney Fonts - Kenney Mini (CC0 1.0)
 *
 * Applies:
 *  - Binary-alpha-threshold BitmapFont atlas generation (ASCII + ES: ñÑáéíóúüÁÉÍÓÚÜ¡¿·)
 *  - 1px edge extrusion on all multi-frame spritesheets & tilesets (anti-bleeding)
 *  - Lossless 90-deg CCW rotation of FX/Projectile/Kunai.png into vertical 16x16 kunai_base.png
 *  - Verbatim license archiving in src/assets/licenses/
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const DEFAULT_EXTRACTED =
  process.env.KUNAI_PACKS_DIR ??
  path.join(
    process.env.USERPROFILE ?? process.env.HOME ?? '',
    '.gemini/antigravity/brain/5f8fb400-3a9f-4647-80d6-226db4261008/scratch/extracted'
  );

if (!fs.existsSync(DEFAULT_EXTRACTED)) {
  console.error(`Extracted packs directory not found: ${DEFAULT_EXTRACTED}`);
  console.error('Set KUNAI_PACKS_DIR to the extracted Ninja Adventure / Kenney directory.');
  process.exit(1);
}

const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const SUBDIRS = ['licenses', 'fonts', 'sprites', 'targets', 'tiles', 'ui', 'audio'];
for (const sub of SUBDIRS) {
  fs.mkdirSync(path.join(ASSETS_DIR, sub), { recursive: true });
}

const pyScript = String.raw`
import os
import shutil
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont

EXT = r'''${DEFAULT_EXTRACTED.replaceAll('\\', '\\\\')}'''
NINJA = os.path.join(EXT, 'ninja', 'Ninja Adventure - Asset Pack')
TINY = os.path.join(EXT, 'tiny-dungeon')
KFONT = os.path.join(EXT, 'kenney-fonts')
OUT = r'''${ASSETS_DIR.replaceAll('\\', '\\\\')}'''

def copy_file(src, dst_rel):
    dst = os.path.join(OUT, dst_rel)
    shutil.copy2(src, dst)
    return dst

def extrude_grid(img, fw, fh, cols, rows, src_spacing=0):
    """
    Create a spritesheet with 1px edge extrusion around every frame so
    rotating or sub-pixel sampling never bleeds neighbor pixels.
    Each cell becomes (fw + 2) x (fh + 2) with 1px extruded border.
    Frame rect inside extruded sheet starts at (col*(fw+2)+1, row*(fh+2)+1).
    """
    im = img.convert('RGBA')
    cell_w = fw + 2
    cell_h = fh + 2
    out = Image.new('RGBA', (cols * cell_w, rows * cell_h), (0, 0, 0, 0))
    for r in range(rows):
        for c in range(cols):
            sx = c * (fw + src_spacing)
            sy = r * (fh + src_spacing)
            tile = im.crop((sx, sy, sx + fw, sy + fh))
            dx = c * cell_w + 1
            dy = r * cell_h + 1
            out.paste(tile, (dx, dy))
            # Extrude top/bottom edges
            top_row = tile.crop((0, 0, fw, 1))
            bot_row = tile.crop((0, fh - 1, fw, fh))
            out.paste(top_row, (dx, dy - 1))
            out.paste(bot_row, (dx, dy + fh))
            # Extrude left/right edges
            left_col = tile.crop((0, 0, 1, fh))
            right_col = tile.crop((fw - 1, 0, fw, fh))
            out.paste(left_col, (dx - 1, dy))
            out.paste(right_col, (dx + fw, dy))
            # Extrude 4 corners
            out.putpixel((dx - 1, dy - 1), tile.getpixel((0, 0)))
            out.putpixel((dx + fw, dy - 1), tile.getpixel((fw - 1, 0)))
            out.putpixel((dx - 1, dy + fh), tile.getpixel((0, fh - 1)))
            out.putpixel((dx + fw, dy + fh), tile.getpixel((fw - 1, fh - 1)))
    return out

# 1. Licenses
copy_file(os.path.join(NINJA, 'LICENSE.txt'), 'licenses/NINJA_ADVENTURE_LICENSE.txt')
copy_file(os.path.join(NINJA, 'README.md'), 'licenses/NINJA_ADVENTURE_README.md')
copy_file(os.path.join(TINY, 'License.txt'), 'licenses/KENNEY_TINY_DUNGEON_LICENSE.txt')
copy_file(os.path.join(KFONT, 'License.txt'), 'licenses/KENNEY_FONTS_LICENSE.txt')

with open(os.path.join(OUT, 'licenses', 'NINJA_ADVENTURE_ITCH_CC0.txt'), 'w', encoding='utf-8') as f:
    f.write(
        'Authoritative Source: https://pixel-boy.itch.io/ninja-adventure-asset-pack\n'
        'Authors: Pixel-boy & AAA\n'
        'Official Archive: Ninja Adventure - Asset Pack.zip (itch.io upload_id 16981275, Mar 29, 2026)\n'
        'Declared License on itch.io page and internal LICENSE.txt:\n'
        '  Creative Commons Zero (CC0 1.0 Universal) - Public Domain Dedication\n'
        '  "They are released under the Creative Commons Zero (CC0) license.\n'
        '   You can use any and all of the assets found in this package in your own games,\n'
        '   even commercial ones. Attribution is not required but appreciated."\n'
    )

# 2. Bake BitmapFont atlas from Kenney Mini.ttf @ 8px with binary alpha threshold (0 antialiasing)
font_path = os.path.join(KFONT, 'Fonts', 'Kenney Mini.ttf')
font = ImageFont.truetype(font_path, 8)
chars = [chr(c) for c in range(32, 127)] + list('ñÑáéíóúüÁÉÍÓÚÜ¡¿·')
chars = list(dict.fromkeys(chars))

atlas_w = 256
atlas_h = 128
atlas = Image.new('RGBA', (atlas_w, atlas_h), (0, 0, 0, 0))
cell_pad = 2
cur_x = cell_pad
cur_y = cell_pad
row_max_h = 0
glyph_records = []

for ch in chars:
    code = ord(ch)
    adv = max(2, int(round(font.getlength(ch))))
    if ch == ' ':
        glyph_records.append({
            'id': code, 'x': 0, 'y': 0, 'w': 0, 'h': 0,
            'xoffset': 0, 'yoffset': 0, 'xadvance': max(3, adv)
        })
        continue
    tmp = Image.new('L', (16, 16), 0)
    # Draw at (1, 2) so ascenders/accents above baseline never clip
    ImageDraw.Draw(tmp).text((1, 2), ch, font=font, fill=255)
    # Binary threshold alpha -> zero antialiasing
    bin_mask = tmp.point(lambda p: 255 if p >= 128 else 0)
    bbox = bin_mask.getbbox()
    if bbox is None:
        glyph_records.append({
            'id': code, 'x': 0, 'y': 0, 'w': 0, 'h': 0,
            'xoffset': 0, 'yoffset': 0, 'xadvance': adv
        })
        continue
    x0, y0, x1, y1 = bbox
    gw = x1 - x0
    gh = y1 - y0
    if cur_x + gw + cell_pad > atlas_w:
        cur_x = cell_pad
        cur_y += row_max_h + cell_pad
        row_max_h = 0
    if cur_y + gh + cell_pad > atlas_h:
        raise RuntimeError('BitmapFont atlas overflow')
    # Paste pure white RGB + binary alpha into atlas
    for py in range(gh):
        for px in range(gw):
            if bin_mask.getpixel((x0 + px, y0 + py)) == 255:
                atlas.putpixel((cur_x + px, cur_y + py), (255, 255, 255, 255))
    glyph_records.append({
        'id': code,
        'x': cur_x,
        'y': cur_y,
        'w': gw,
        'h': gh,
        'xoffset': x0 - 1,
        'yoffset': y0 - 2,
        'xadvance': max(gw + 1, adv)
    })
    cur_x += gw + cell_pad
    row_max_h = max(row_max_h, gh)

atlas.save(os.path.join(OUT, 'fonts', 'pixel_font.png'))

root_xml = ET.Element('font')
ET.SubElement(root_xml, 'info', {
    'face': 'KenneyMiniPixel', 'size': '8', 'bold': '0', 'italic': '0',
    'charset': '', 'unicode': '1', 'stretchH': '100', 'smooth': '0',
    'aa': '0', 'padding': '0,0,0,0', 'spacing': '1,1', 'outline': '0'
})
ET.SubElement(root_xml, 'common', {
    'lineHeight': '10', 'base': '8', 'scaleW': str(atlas_w), 'scaleH': str(atlas_h),
    'pages': '1', 'packed': '0'
})
pages_el = ET.SubElement(root_xml, 'pages')
ET.SubElement(pages_el, 'page', {'id': '0', 'file': 'pixel_font.png'})
chars_el = ET.SubElement(root_xml, 'chars', {'count': str(len(glyph_records))})
for g in glyph_records:
    ET.SubElement(chars_el, 'char', {
        'id': str(g['id']),
        'x': str(g['x']),
        'y': str(g['y']),
        'width': str(g['w']),
        'height': str(g['h']),
        'xoffset': str(g['xoffset']),
        'yoffset': str(g['yoffset']),
        'xadvance': str(g['xadvance']),
        'page': '0',
        'chnl': '15'
    })
ET.indent(root_xml, space='  ')
ET.ElementTree(root_xml).write(os.path.join(OUT, 'fonts', 'pixel_font.xml'), encoding='utf-8', xml_declaration=True)

# 3. Sprites (vertical 16x16 kunai + 1px extruded ninja/coin/vfx sheets)
# FX/Projectile/Kunai.png (14x5 horizontal pointing right) -> lossless 90 deg CCW -> 5x14 pointing UP
kunai_src = Image.open(os.path.join(NINJA, 'FX/Projectile/Kunai.png')).convert('RGBA')
kunai_rot = kunai_src.transpose(Image.Transpose.ROTATE_90)
kunai_canvas = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
kunai_canvas.paste(kunai_rot, ((16 - kunai_rot.width) // 2, 1))
kunai_canvas.save(os.path.join(OUT, 'sprites', 'kunai_base.png'))

# Ninja Dark SeparateAnim (64x16 -> 4 frames of 16x16, extruded -> 72x18)
for src_rel, dst_name in [
    ('Actor/Character/NinjaDark/SeparateAnim/Idle.png', 'sprites/ninja_idle.png'),
    ('Actor/Character/NinjaDark/SeparateAnim/Attack.png', 'sprites/ninja_attack.png'),
    ('Actor/Character/NinjaDark/SeparateAnim/Jump.png', 'sprites/ninja_jump.png'),
]:
    im = Image.open(os.path.join(NINJA, src_rel))
    extrude_grid(im, 16, 16, 4, 1).save(os.path.join(OUT, dst_name))

# Ninja Dark full SpriteSheet (64x112 -> 4x7 frames of 16x16, extruded -> 72x126)
ninja_sheet = Image.open(os.path.join(NINJA, 'Actor/Character/NinjaDark/SpriteSheet.png'))
extrude_grid(ninja_sheet, 16, 16, 4, 7).save(os.path.join(OUT, 'sprites', 'ninja_sheet.png'))

# Coin spin (40x10 -> 4 frames of 10x10 padded to 16x16 then extruded -> 72x18)
coin_src = Image.open(os.path.join(NINJA, 'Items/Treasure/Coin2.png')).convert('RGBA')
coin_padded = Image.new('RGBA', (64, 16), (0, 0, 0, 0))
for i in range(4):
    fr = coin_src.crop((i * 10, 0, (i + 1) * 10, 10))
    coin_padded.paste(fr, (i * 16 + 3, 3))
extrude_grid(coin_padded, 16, 16, 4, 1).save(os.path.join(OUT, 'sprites', 'coin_spin.png'))

# Scroll collectible (14x14 centered on 16x16)
scroll_src = Image.open(os.path.join(NINJA, 'Items/Scroll/Scroll.png')).convert('RGBA')
scroll_out = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
scroll_out.paste(scroll_src, (1, 1))
scroll_out.save(os.path.join(OUT, 'sprites', 'scroll_item.png'))

# VFX Sheets extruded
smoke = Image.open(os.path.join(NINJA, 'FX/Smoke/SmokeCircular/SpriteSheet.png'))
extrude_grid(smoke, 30, 14, 8, 1).save(os.path.join(OUT, 'sprites', 'vfx_smoke.png'))

spark = Image.open(os.path.join(NINJA, 'FX/Magic/Spark/SpriteSheet.png'))
extrude_grid(spark, 30, 35, 9, 1).save(os.path.join(OUT, 'sprites', 'vfx_spark.png'))

explosion = Image.open(os.path.join(NINJA, 'FX/Elemental/Explosion/SpriteSheet.png'))
extrude_grid(explosion, 40, 40, 9, 1).save(os.path.join(OUT, 'sprites', 'vfx_explosion.png'))

# 4. Target parts & Boss assets (all 1:1 native pack sprites)
for src_rel, dst_name in [
    ('Ui/Receptacle/Receptacle Sphere/BackgroundWood.png', 'targets/sphere_wood.png'),
    ('Ui/Receptacle/Receptacle Sphere/BackgroundIron.png', 'targets/sphere_iron.png'),
    ('Ui/Receptacle/Receptacle Sphere/BackgroundRed.png', 'targets/sphere_red.png'),
    ('Ui/Receptacle/Receptacle Sphere/BackgroundBamboo.png', 'targets/sphere_bamboo.png'),
    ('Ui/Receptacle/Receptacle Sphere/BackgroundMetal.png', 'targets/sphere_metal.png'),
    ('Actor/Boss/GiantBamboo/Faceset.png', 'targets/boss_bamboo_face.png'),
    ('Actor/Boss/DemonCyclop/Faceset.png', 'targets/boss_cyclops_face.png'),
    ('Actor/Boss/GiantBlueSamurai/Faceset.png', 'targets/boss_samurai_face.png'),
]:
    copy_file(os.path.join(NINJA, src_rel), dst_name)

# Extract first frame of each boss Idle sheet (square) and tree stump 32x32 from TilesetNature
nature = Image.open(os.path.join(NINJA, 'Backgrounds/Tilesets/TilesetNature.png')).convert('RGBA')
nature.crop((32, 128, 64, 160)).save(os.path.join(OUT, 'targets', 'tree_stump.png'))
nature.crop((0, 128, 32, 160)).save(os.path.join(OUT, 'targets', 'tree_stump_dark.png'))

# Extruded tilesets for target composition, background parallax, and themed letterbox
extrude_grid(nature, 16, 16, 24, 21).save(os.path.join(OUT, 'tiles', 'tiles_nature.png'))

element = Image.open(os.path.join(NINJA, 'Backgrounds/Tilesets/TilesetElement.png')).convert('RGBA')
extrude_grid(element, 16, 16, 16, 15).save(os.path.join(OUT, 'tiles', 'tiles_element.png'))

dungeon = Image.open(os.path.join(NINJA, 'Backgrounds/Tilesets/TilesetDungeon.png')).convert('RGBA')
extrude_grid(dungeon, 16, 16, 12, 4).save(os.path.join(OUT, 'tiles', 'tiles_dungeon.png'))

kenney_tiles = Image.open(os.path.join(TINY, 'Tilemap/tilemap_packed.png')).convert('RGBA')
extrude_grid(kenney_tiles, 16, 16, 12, 11).save(os.path.join(OUT, 'tiles', 'tiles_kenney.png'))

# 5. UI 9-slice panels, buttons, tabs & icons
ui_copies = [
    ('Ui/Theme/Theme Wood/nine_path_panel.png', 'ui/panel_wood.png'),
    ('Ui/Theme/Theme Wood/nine_path_bg.png', 'ui/panel_bg.png'),
    ('Ui/Theme/Theme Wood/nine_path_bg_2.png', 'ui/panel_bg_dark.png'),
    ('Ui/Theme/Wip/ThemeDark/nine_path_panel.png', 'ui/panel_dark.png'),
    ('Ui/Theme/Wip/ThemeRed/nine_path_panel.png', 'ui/panel_red.png'),
    ('Ui/Theme/Wip/ThemeBamboo/nine_path_panel.png', 'ui/panel_bamboo.png'),
    ('Ui/Theme/Theme Wood/button_normal.png', 'ui/btn_normal.png'),
    ('Ui/Theme/Theme Wood/button_hover.png', 'ui/btn_hover.png'),
    ('Ui/Theme/Theme Wood/button_pressed.png', 'ui/btn_pressed.png'),
    ('Ui/Theme/Theme Wood/button_disabled.png', 'ui/btn_disabled.png'),
    ('Ui/Theme/Theme Wood/tab_selected.png', 'ui/tab_selected.png'),
    ('Ui/Theme/Theme Wood/tab_unselected.png', 'ui/tab_unselected.png'),
    ('Ui/Theme/Theme Wood/arrow_left.png', 'ui/arrow_left.png'),
    ('Ui/Theme/Theme Wood/arrow_right.png', 'ui/arrow_right.png'),
    ('Ui/Theme/Theme Wood/checked.png', 'ui/checked.png'),
    ('Ui/Theme/Theme Wood/unchecked.png', 'ui/unchecked.png'),
    ('Ui/Theme/Theme Wood/inventory_cell.png', 'ui/inventory_cell.png'),
    ('Ui/Skill Icon/Items & Weapon/Kunai.png', 'ui/icon_kunai_badge.png'),
    ('Ui/Skill Icon/Items & Weapon/Money.png', 'ui/icon_money_badge.png'),
    ('Ui/Receptacle/LifeBarMiniUnder.png', 'ui/bar_under.png'),
    ('Ui/Receptacle/LifeBarMiniProgress.png', 'ui/bar_progress.png'),
]
for src_rel, dst_rel in ui_copies:
    copy_file(os.path.join(NINJA, src_rel), dst_rel)

# 16x16 Coin icon & Heart icon padded/cropped cleanly
gold_coin = Image.open(os.path.join(NINJA, 'Items/Treasure/GoldCoin.png')).convert('RGBA')
gc_16 = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
gc_16.paste(gold_coin, ((16 - gold_coin.width) // 2, (16 - gold_coin.height) // 2))
gc_16.save(os.path.join(OUT, 'ui', 'icon_coin.png'))

heart_sheet = Image.open(os.path.join(NINJA, 'Ui/Receptacle/Heart.png')).convert('RGBA')
heart_sheet.crop((0, 0, 16, 16)).save(os.path.join(OUT, 'ui', 'icon_heart.png'))

# 6. Audio (CC0 SFX & nocturnal BGM)
audio_copies = [
    ('Audio/Sounds/Whoosh & Slash/Launch.wav', 'audio/sfx_throw.wav'),
    ('Audio/Sounds/Hit & Impact/Impact.wav', 'audio/sfx_thunk.wav'),
    ('Audio/Sounds/Hit & Impact/Impact2.wav', 'audio/sfx_crack.wav'),
    ('Audio/Sounds/Hit & Impact/Hit3.wav', 'audio/sfx_clang.wav'),
    ('Audio/Sounds/Bonus/Coin.wav', 'audio/sfx_coin.wav'),
    ('Audio/Sounds/Elemental/Explosion.wav', 'audio/sfx_boss.wav'),
    ('Audio/Jingles/GameOver.wav', 'audio/sfx_fail.wav'),
    ('Audio/Jingles/Success1.wav', 'audio/sfx_levelup.wav'),
    ('Audio/Sounds/Menu/Menu8.wav', 'audio/sfx_click.wav'),
    ('Audio/Musics/10 - Dark Castle.ogg', 'audio/bgm_night.ogg'),
]
for src_rel, dst_rel in audio_copies:
    copy_file(os.path.join(NINJA, src_rel), dst_rel)

print('Vendored CC0 assets successfully.')
`;

execFileSync('python', ['-c', pyScript], { stdio: 'inherit' });

// Verify total size < 5 MB
let totalBytes = 0;
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else totalBytes += fs.statSync(full).size;
  }
};
walk(ASSETS_DIR);
const mb = (totalBytes / (1024 * 1024)).toFixed(2);
console.log(`Total src/assets size: ${totalBytes} bytes (${mb} MB)`);
if (totalBytes > 5 * 1024 * 1024) {
  console.error('ERROR: src/assets exceeds 5 MB limit!');
  process.exit(1);
}
