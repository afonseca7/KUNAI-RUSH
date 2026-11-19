#!/usr/bin/env node
/**
 * Generates Google Play Store assets (512x512 icon, 1024x500 feature graphic)
 * and Android adaptive launcher icons using strict NEAREST integer scaling
 * from vendored CC0 Ninja Adventure & Kenney pixel-art assets (zero SVG).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const OUT_STORE = path.join(ROOT, 'public', 'store-assets');
fs.mkdirSync(OUT_STORE, { recursive: true });

const pyScript = String.raw`
import os
import shutil
import subprocess
import tempfile
import zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw

ROOT = r'''${ROOT.replaceAll('\\', '\\\\')}'''
ASSETS = os.path.join(ROOT, 'src', 'assets')
OUT_STORE = os.path.join(ROOT, 'public', 'store-assets')
PLATFORM_DIR = os.path.join(OUT_STORE, 'platform-specific')
SCREENSHOTS_SRC = os.path.join(OUT_STORE, 'screenshots')
RES_DIR = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')

def load_rgba(rel):
    return Image.open(os.path.join(ASSETS, rel)).convert('RGBA')

def tile_crop(sheet_img, col, row, fw=16, fh=16):
    # All tilesets are 1px extruded: cell = (fw+2) x (fh+2)
    x = col * (fw + 2) + 1
    y = row * (fh + 2) + 1
    return sheet_img.crop((x, y, x + fw, y + fh))

def recolor_kunai(kunai_im, blade_dark, blade_mid, blade_light, wrap_dark, wrap_bright):
    out = kunai_im.copy()
    w, h = out.size
    px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 128:
                px[x, y] = (0, 0, 0, 0)
                continue
            lum = 0.299 * r + 0.587 * g + 0.114 * b
            if lum < 55:
                px[x, y] = (11, 14, 24, 255)
            elif y <= 8:
                px[x, y] = blade_light if lum >= 200 else blade_mid if lum >= 128 else blade_dark
            else:
                px[x, y] = wrap_bright if lum >= 135 else wrap_dark
    return out

def build_target_log():
    kenney = load_rgba('tiles/tiles_kenney.png')
    stump = load_rgba('targets/tree_stump.png')
    sphere = load_rgba('targets/sphere_wood.png')
    base = Image.new('RGBA', (48, 48), (0, 0, 0, 0))
    wood_tile = tile_crop(kenney, 3, 5)
    for ty in range(3):
        for tx in range(3):
            base.paste(wood_tile, (tx * 16, ty * 16))
    base.paste(stump, (8, 8), stump)
    # Clip circular outline
    px = base.load()
    cx, cy = 23.5, 23.5
    for y in range(48):
        for x in range(48):
            d = ((x - cx)**2 + (y - cy)**2) ** 0.5
            if d > 23.2:
                px[x, y] = (0, 0, 0, 0)
            elif d > 21.85:
                px[x, y] = (20, 12, 8, 255)
            elif d > 20.55:
                px[x, y] = (94, 57, 34, 255)
    base.paste(sphere, (8, 8), sphere)
    return base

def build_nocturnal_bg(w, h):
    kenney = load_rgba('tiles/tiles_kenney.png')
    nature = load_rgba('tiles/tiles_nature.png')
    element = load_rgba('tiles/tiles_element.png')
    t1 = tile_crop(kenney, 9, 4)
    t2 = tile_crop(kenney, 4, 3)
    bamboo_top = tile_crop(nature, 10, 8)
    bamboo_mid = tile_crop(nature, 10, 9)
    lantern_top = tile_crop(element, 6, 3)
    lantern_bot = tile_crop(element, 6, 4)

    bg = Image.new('RGBA', (w, h), (7, 9, 18, 255))
    cols = (w + 15) // 16
    rows = (h + 15) // 16
    for r in range(rows):
        for c in range(cols):
            bg.paste(t2 if (r + c) % 3 == 0 else t1, (c * 16, r * 16))
    # Bamboo & lantern accents
    for bx in range(16, w - 16, 80):
        bg.paste(bamboo_top, (bx, 16), bamboo_top)
        bg.paste(bamboo_mid, (bx, 32), bamboo_mid)
        if h > 80:
            bg.paste(lantern_top, (bx + 40, h - 48), lantern_top)
            bg.paste(lantern_bot, (bx + 40, h - 32), lantern_bot)

    px = bg.load()
    cx, cy = w * 0.5, h * 0.45
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            dist = (((x - cx) / (w * 0.6))**2 + ((y - cy) / (h * 0.6))**2) ** 0.5
            vig = max(0.25, 1.0 - max(0.0, dist - 0.35) * 0.75)
            px[x, y] = (
                int(r * 0.34 * vig),
                int(g * 0.40 * vig),
                int(b * 0.62 * vig),
                255
            )
    return bg

def draw_nine_slice(dst, panel_path, x, y, w, h, inset=6):
    src = load_rgba(panel_path)
    sw, sh = src.size
    # 9 regions
    L, R, T, B = inset, inset, inset, inset
    cw = max(1, w - L - R)
    ch = max(1, h - T - B)
    # Corners
    dst.paste(src.crop((0, 0, L, T)), (x, y), src.crop((0, 0, L, T)))
    dst.paste(src.crop((sw - R, 0, sw, T)), (x + w - R, y), src.crop((sw - R, 0, sw, T)))
    dst.paste(src.crop((0, sh - B, L, sh)), (x, y + h - B), src.crop((0, sh - B, L, sh)))
    dst.paste(src.crop((sw - R, sh - B, sw, sh)), (x + w - R, y + h - B), src.crop((sw - R, sh - B, sw, sh)))
    # Edges
    top_e = src.crop((L, 0, sw - R, T)).resize((cw, T), Image.NEAREST)
    bot_e = src.crop((L, sh - B, sw - R, sh)).resize((cw, B), Image.NEAREST)
    left_e = src.crop((0, T, L, sh - B)).resize((L, ch), Image.NEAREST)
    right_e = src.crop((sw - R, T, sw, sh - B)).resize((R, ch), Image.NEAREST)
    center = src.crop((L, T, sw - R, sh - B)).resize((cw, ch), Image.NEAREST)
    dst.paste(center, (x + L, y + T), center)
    dst.paste(top_e, (x + L, y), top_e)
    dst.paste(bot_e, (x + L, y + h - B), bot_e)
    dst.paste(left_e, (x, y + T), left_e)
    dst.paste(right_e, (x + w - R, y + T), right_e)

def draw_bitmap_text(dst, text, cx, cy, scale, color_rgba, shadow_rgba=(7, 9, 18, 255)):
    font_atlas = load_rgba('fonts/pixel_font.png')
    tree = ET.parse(os.path.join(ASSETS, 'fonts', 'pixel_font.xml'))
    glyphs = {}
    for ch_el in tree.findall('.//char'):
        glyphs[int(ch_el.attrib['id'])] = {k: int(v) for k, v in ch_el.attrib.items()}
    total_w = sum(glyphs.get(ord(c), glyphs[32])['xadvance'] * scale for c in text)
    cur_x = int(cx - total_w / 2)
    base_y = int(cy - 4 * scale)
    for c in text:
        g = glyphs.get(ord(c), glyphs[32])
        if g['width'] > 0 and g['height'] > 0:
            gl = font_atlas.crop((g['x'], g['y'], g['x'] + g['width'], g['y'] + g['height']))
            gl = gl.resize((g['width'] * scale, g['height'] * scale), Image.NEAREST)
            # Shadow then color
            sh_img = Image.new('RGBA', gl.size, shadow_rgba)
            fg_img = Image.new('RGBA', gl.size, color_rgba)
            gx = cur_x + g['xoffset'] * scale
            gy = base_y + g['yoffset'] * scale
            dst.paste(sh_img, (gx, gy + scale), gl)
            dst.paste(fg_img, (gx, gy), gl)
        cur_x += g['xadvance'] * scale

# 1. Compose 128x128 master icon -> 512x512 NEAREST
icon_128 = build_nocturnal_bg(128, 128)
target = build_target_log()
kunai_iron = load_rgba('sprites/kunai_base.png')
kunai_gold = recolor_kunai(
    kunai_iron,
    (158, 108, 20, 255), (237, 181, 40, 255), (255, 243, 161, 255),
    (122, 25, 41, 255), (230, 53, 73, 255)
)
kunai_jade = recolor_kunai(
    kunai_iron,
    (28, 107, 83, 255), (55, 184, 135, 255), (155, 245, 198, 255),
    (63, 46, 31, 255), (201, 152, 70, 255)
)
# Paste stuck kunais around target cleanly (top pointing down, left pointing right, right pointing left)
k_down = kunai_gold.transpose(Image.Transpose.ROTATE_180).resize((32, 32), Image.NEAREST)
k_up = kunai_gold.resize((32, 32), Image.NEAREST)
k_right = kunai_iron.transpose(Image.Transpose.ROTATE_270).resize((32, 32), Image.NEAREST)
k_left = kunai_jade.transpose(Image.Transpose.ROTATE_90).resize((32, 32), Image.NEAREST)
icon_128.paste(k_down, (48, 2), k_down)
icon_128.paste(k_right, (14, 34), k_right)
icon_128.paste(k_left, (82, 34), k_left)
t_scaled = target.resize((64, 64), Image.NEAREST)
icon_128.paste(t_scaled, (32, 18), t_scaled)

# Front-facing Ninja Mascot (red eyes & headband) below target + flying kunai
ninja_sheet = load_rgba('sprites/ninja_sheet.png')
ninja_front = tile_crop(ninja_sheet, 0, 0)
ninja_2x = ninja_front.resize((32, 32), Image.NEAREST)
icon_128.paste(k_up, (48, 78), k_up)
icon_128.paste(ninja_2x, (10, 88), ninja_2x)

icon_512 = icon_128.resize((512, 512), Image.NEAREST)
icon_512.save(os.path.join(OUT_STORE, 'icon-512.png'))

# 2. Compose 256x125 master feature graphic -> 1024x500 NEAREST
feat_256 = build_nocturnal_bg(256, 125)
feat_256.paste(k_down, (48, 2), k_down)
feat_256.paste(k_right, (14, 34), k_right)
feat_256.paste(k_left, (82, 34), k_left)
feat_256.paste(t_scaled, (32, 18), t_scaled)
feat_256.paste(k_up, (48, 78), k_up)
feat_256.paste(ninja_2x, (12, 86), ninja_2x)

# Gold coin floating beside wheel in clear open area
coin = tile_crop(load_rgba('sprites/coin_spin.png'), 0, 0)
feat_256.paste(coin.resize((16, 16), Image.NEAREST), (96, 14), coin.resize((16, 16), Image.NEAREST))

# Right plaque: 9-slice wood banner + pixel_font title
draw_nine_slice(feat_256, 'ui/panel_wood.png', 118, 30, 126, 62, inset=6)
draw_bitmap_text(feat_256, 'KUNAI RUSH', 181, 50, 2, (255, 224, 115, 255))
draw_bitmap_text(feat_256, 'NINJA NOCTURNO', 181, 70, 1, (89, 242, 230, 255))

feat_1024 = feat_256.resize((1024, 500), Image.NEAREST)
feat_1024.save(os.path.join(OUT_STORE, 'feature-1024x500.png'))

# 3. Android mipmap icons (NEAREST) + adaptive background color
MIPMAPS = {
    'mipmap-mdpi': (48, 108),
    'mipmap-hdpi': (72, 162),
    'mipmap-xhdpi': (96, 216),
    'mipmap-xxhdpi': (144, 324),
    'mipmap-xxxhdpi': (192, 432),
}

# Build clean foreground (target + kunais on transparent background) for adaptive icon
fg_108 = Image.new('RGBA', (108, 108), (0, 0, 0, 0))
fg_108.paste(k_up.resize((24, 24), Image.NEAREST), (42, 62), k_up.resize((24, 24), Image.NEAREST))
fg_108.paste(k_right.resize((24, 24), Image.NEAREST), (16, 36), k_right.resize((24, 24), Image.NEAREST))
fg_108.paste(k_left.resize((24, 24), Image.NEAREST), (68, 36), k_left.resize((24, 24), Image.NEAREST))
fg_108.paste(target.resize((48, 48), Image.NEAREST), (30, 24), target.resize((48, 48), Image.NEAREST))

for folder, (legacy_sz, fg_sz) in MIPMAPS.items():
    mdir = os.path.join(RES_DIR, folder)
    os.makedirs(mdir, exist_ok=True)
    leg = icon_128.resize((legacy_sz, legacy_sz), Image.NEAREST)
    leg.save(os.path.join(mdir, 'ic_launcher.png'))
    leg.save(os.path.join(mdir, 'ic_launcher_round.png'))
    fg = fg_108.resize((fg_sz, fg_sz), Image.NEAREST)
    fg.save(os.path.join(mdir, 'ic_launcher_foreground.png'))

bg_xml_path = os.path.join(RES_DIR, 'values', 'ic_launcher_background.xml')
with open(bg_xml_path, 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n  <color name="ic_launcher_background">#070912</color>\n</resources>\n')

# 4. Platform-specific distribution packages (itch.io, Amazon Appstore, Samsung Galaxy Store)
itch_dir = os.path.join(PLATFORM_DIR, 'itch.io')
amazon_dir = os.path.join(PLATFORM_DIR, 'amazon')
samsung_dir = os.path.join(PLATFORM_DIR, 'samsung')
for d in (itch_dir, amazon_dir, samsung_dir):
    os.makedirs(d, exist_ok=True)

# 4a. itch.io cover banner 630x500 (126x100 master scaled x5 NEAREST)
itch_126 = build_nocturnal_bg(126, 100)
k_down_20 = kunai_gold.transpose(Image.Transpose.ROTATE_180).resize((20, 20), Image.NEAREST)
k_up_20 = kunai_gold.resize((20, 20), Image.NEAREST)
k_right_20 = kunai_iron.transpose(Image.Transpose.ROTATE_270).resize((20, 20), Image.NEAREST)
k_left_20 = kunai_jade.transpose(Image.Transpose.ROTATE_90).resize((20, 20), Image.NEAREST)
target_36 = target.resize((36, 36), Image.NEAREST)
ninja_24 = ninja_front.resize((24, 24), Image.NEAREST)

# Wheel + ninja showcase centered cleanly below wood title plaque
draw_nine_slice(itch_126, 'ui/panel_wood.png', 11, 5, 104, 30, inset=6)
draw_bitmap_text(itch_126, 'KUNAI RUSH', 63, 15, 1, (255, 224, 115, 255))
draw_bitmap_text(itch_126, 'NINJA NOCTURNO', 63, 23, 1, (89, 242, 230, 255))

itch_126.paste(k_down_20, (53, 35), k_down_20)
itch_126.paste(k_right_20, (31, 52), k_right_20)
itch_126.paste(k_left_20, (75, 52), k_left_20)
itch_126.paste(target_36, (45, 44), target_36)
itch_126.paste(k_up_20, (53, 79), k_up_20)
itch_126.paste(ninja_24, (14, 72), ninja_24)
itch_126.paste(coin.resize((12, 12), Image.NEAREST), (96, 76), coin.resize((12, 12), Image.NEAREST))

itch_banner = itch_126.resize((630, 500), Image.NEAREST)
itch_banner.save(os.path.join(itch_dir, 'banner-630x500.png'))

# 4a-bis. Screenshots for itch.io (renamed + zipped), Amazon, and Samsung
shot_files = [
    ('01-menu-400x800.png', '01-kunai-rush-menu-400x800.png'),
    ('02-gameplay-400x800.png', '02-kunai-rush-gameplay-400x800.png'),
    ('03-shop-400x800.png', '03-kunai-rush-shop-400x800.png'),
    ('04-settings-400x800.png', '04-kunai-rush-settings-400x800.png'),
]
if os.path.isdir(SCREENSHOTS_SRC):
    zip_path = os.path.join(itch_dir, 'screenshots-itch.zip')
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for src_name, itch_name in shot_files:
            src_path = os.path.join(SCREENSHOTS_SRC, src_name)
            if not os.path.exists(src_path):
                continue
            shutil.copy2(src_path, os.path.join(itch_dir, itch_name))
            shutil.copy2(src_path, os.path.join(samsung_dir, src_name))
            zf.write(src_path, arcname=itch_name)

# 4b. Amazon Appstore icon-114x114.png + optional promo-video.mp4 slideshow
icon_114 = icon_128.resize((114, 114), Image.NEAREST)
icon_114.save(os.path.join(amazon_dir, 'icon-114x114.png'))

# 4c. Samsung Galaxy Store reused 512x512 icon & 1024x500 feature graphic
shutil.copy2(os.path.join(OUT_STORE, 'icon-512.png'), os.path.join(samsung_dir, 'icon-512x512.png'))
shutil.copy2(os.path.join(OUT_STORE, 'feature-1024x500.png'), os.path.join(samsung_dir, 'feature-graphic-1024x500.png'))

# 4d. Amazon promo-video.mp4 (1280x720 slideshow of the 4 screenshots + bgm_night.ogg)
try:
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    bgm_path = os.path.join(ASSETS, 'audio', 'bgm_night.ogg')
    if os.path.isdir(SCREENSHOTS_SRC) and os.path.exists(bgm_path):
        captions = [
            ('KUNAI RUSH', 'DOJO NOCTURNO PIXEL ART', 'DESAFIA TU PRECISION'),
            ('LANZA Y CLAVA', '24 SLOTS GARANTIZADOS', 'JEFES CADA 5 NIVELES'),
            ('TIENDA DEL DOJO', '8 KUNAIS + 4 DIANAS', 'DESBLOQUEA CON MONEDAS'),
            ('100% PIXEL ART', 'ESPANOL E INGLES', 'OPTIMIZADO PARA ANDROID'),
        ]
        with tempfile.TemporaryDirectory() as tmpd:
            slide_paths = []
            for idx, ((src_name, _), (h1, h2, h3)) in enumerate(zip(shot_files, captions)):
                src_path = os.path.join(SCREENSHOTS_SRC, src_name)
                bg_small = build_nocturnal_bg(320, 180)
                bg_1280 = bg_small.resize((1280, 720), Image.NEAREST)

                # Right copy card
                card_320 = Image.new('RGBA', (320, 180), (0, 0, 0, 0))
                draw_nine_slice(card_320, 'ui/panel_wood.png', 132, 32, 168, 44, inset=6)
                draw_bitmap_text(card_320, h1, 216, 48, 2, (255, 224, 115, 255))
                draw_bitmap_text(card_320, h2, 216, 65, 1, (89, 242, 230, 255))
                draw_nine_slice(card_320, 'ui/panel_dark.png', 132, 86, 168, 56, inset=4)
                draw_bitmap_text(card_320, h3, 216, 114, 1, (244, 240, 232, 255))
                card_320.paste(target.resize((32, 32), Image.NEAREST), (278, 138), target.resize((32, 32), Image.NEAREST))
                card_320.paste(ninja_front.resize((24, 24), Image.NEAREST), (140, 144), ninja_front.resize((24, 24), Image.NEAREST))
                card_1280 = card_320.resize((1280, 720), Image.NEAREST)
                bg_1280.alpha_composite(card_1280)

                # Left crisp portrait phone screenshot inside 1280x720 frame (scale 0.8x integer-preserving? Wait: 320x640 -> exact 400x800 * 0.8 or crop-fit? Keep 320x640 via NEAREST!)
                shot_im = Image.open(src_path).convert('RGBA').resize((320, 640), Image.NEAREST)
                frame = Image.new('RGBA', (336, 656), (240, 138, 75, 255))
                frame.paste(shot_im, (8, 8))
                bg_1280.paste(frame, (108, 32))

                sp = os.path.join(tmpd, f'slide_{idx}.png')
                bg_1280.convert('RGB').save(sp)
                slide_paths.append(sp)

            promo_out = os.path.join(amazon_dir, 'promo-video.mp4')
            cmd = [
                ffmpeg_exe, '-y',
                '-loop', '1', '-t', '4', '-i', slide_paths[0],
                '-loop', '1', '-t', '4', '-i', slide_paths[1],
                '-loop', '1', '-t', '4', '-i', slide_paths[2],
                '-loop', '1', '-t', '4.5', '-i', slide_paths[3],
                '-stream_loop', '-1', '-t', '15', '-i', bgm_path,
                '-filter_complex',
                '[0:v]fps=30,format=yuv420p[v0];'
                '[1:v]fps=30,format=yuv420p[v1];'
                '[2:v]fps=30,format=yuv420p[v2];'
                '[3:v]fps=30,format=yuv420p[v3];'
                '[v0][v1]xfade=transition=fade:duration=0.5:offset=3.5[x01];'
                '[x01][v2]xfade=transition=fade:duration=0.5:offset=7.0[x12];'
                '[x12][v3]xfade=transition=fade:duration=0.5:offset=10.5,format=yuv420p[v];'
                '[4:a]afade=t=in:st=0:d=0.4,afade=t=out:st=13.5:d=1.5[a]',
                '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
                '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart',
                promo_out
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print('Generated Amazon promo-video.mp4 successfully.')
except Exception as ex:
    print('Skipped promo-video.mp4:', ex)

print('Generated store assets, platform-specific packages, and Android launcher icons successfully.')
`;

execFileSync('python', ['-c', pyScript], { stdio: 'inherit' });
