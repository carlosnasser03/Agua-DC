"""
AguaDC V2 — Asset Generator
Genera icon.png, adaptive-icon.png, splash.png y favicon.png
basado en la identidad visual oficial de Agua DC.

Paleta oficial:
  Deep Cobalt Blue : #003B7A  (azul marino del isotipo)
  Sky Blue         : #87CEEB  (azul cielo, detalles)
  Clean White      : #FFFFFF
"""

import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------------------------------------------------------------------------
# Paleta
# ---------------------------------------------------------------------------
DEEP_COBALT   = (0,   59, 122)   # #003B7A
SKY_BLUE      = (135, 206, 235)  # #87CEEB
CLEAN_WHITE   = (255, 255, 255)  # #FFFFFF
GRADIENT_MID  = (10,  90, 160)   # azul medio para gradiente
SHADOW_COLOR  = (0,   40,  90, 80)

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "mobile", "src", "assets")
os.makedirs(OUT_DIR, exist_ok=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_canvas(size: int, bg=CLEAN_WHITE, alpha=False) -> Image.Image:
    mode = "RGBA" if alpha else "RGB"
    bg_color = bg + (255,) if alpha and len(bg) == 3 else bg
    return Image.new(mode, (size, size), bg_color)


def apply_rounded_mask(img: Image.Image, radius_pct: float = 0.225) -> Image.Image:
    """Aplica máscara redondeada (para iOS icon y splash preview)."""
    size = img.size
    mask = Image.new("L", size, 0)
    d = ImageDraw.Draw(mask)
    r = int(min(size) * radius_pct)
    d.rounded_rectangle([0, 0, size[0]-1, size[1]-1], radius=r, fill=255)
    result = img.copy().convert("RGBA")
    result.putalpha(mask)
    return result


def vertical_gradient(img: Image.Image, top_color, bottom_color):
    """Rellena img con gradiente vertical (modifica in place)."""
    w, h = img.size
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / (h - 1)
        r = int(top_color[0] * (1-t) + bottom_color[0] * t)
        g = int(top_color[1] * (1-t) + bottom_color[1] * t)
        b = int(top_color[2] * (1-t) + bottom_color[2] * t)
        draw.line([(0, y), (w-1, y)], fill=(r, g, b))


def draw_water_drop(draw: ImageDraw.ImageDraw,
                    cx: float, cy: float, size: float,
                    fill_top, fill_bottom, outline=None):
    """
    Dibuja una gota de agua.
    La gota tiene forma de lágrima: círculo en la parte inferior +
    curvas que se unen en un pico en la parte superior.
    cx, cy = centro geométrico del bounding box
    size   = altura total de la gota
    """
    # --- Parámetros geométricos ---
    w = size * 0.72          # ancho
    h = size                 # altura total
    # El círculo base ocupa ~60% de la altura
    r = w * 0.50             # radio del círculo base
    # Top-point: pico superior
    top_y   = cy - h * 0.50
    bot_y   = cy + h * 0.50
    left_x  = cx - w * 0.50
    right_x = cx + w * 0.50
    # Centro del círculo base (más abajo)
    circ_cy = bot_y - r

    # Construimos el polígono como serie de puntos de la curva
    steps = 120
    pts = []

    # Mitad izquierda: desde el pico hacia abajo hasta la tangente izquierda
    for i in range(steps // 2 + 1):
        t = i / (steps // 2)
        angle = math.pi + t * math.pi   # π -> 2π (mitad izq del círculo)
        x = cx + r * math.cos(angle)
        y = circ_cy + r * math.sin(angle)
        # Mezcla con curva hacia el pico (bezier aproximado)
        blend = 1 - t
        bx = cx + (x - cx) * (1 - blend * 0.0)
        by = y * (1 - blend) + (top_y + 0.08*size) * blend if t < 0.35 else y
        pts.append((bx, by))

    # Pico superior
    pts.append((cx, top_y))

    # Mitad derecha: del pico hacia abajo
    for i in range(steps // 2 + 1):
        t = i / (steps // 2)
        angle = 2 * math.pi - t * math.pi   # 2π -> π (mitad der)
        x = cx + r * math.cos(angle)
        y = circ_cy + r * math.sin(angle)
        blend = 1 - t
        by = y * (1 - blend) + (top_y + 0.08*size) * blend if (1-t) < 0.35 else y
        pts.append((x, by))

    # --- Dibuja con gradiente simulado en capas ---
    # Capa base (color inferior)
    draw.polygon(pts, fill=fill_bottom, outline=outline)
    # Capa superior (más clara, altura 40%)
    clip_h = int(h * 0.4)
    # Dibuja un rectángulo recortado — no podemos clip directo, usamos
    # un polígono que cubre sólo la parte alta
    clip_pts = [(p[0], min(p[1], cy - h*0.10)) for p in pts]
    draw.polygon(clip_pts, fill=fill_top)


# ---------------------------------------------------------------------------
# Isotipo: gota + calendario + reloj
# ---------------------------------------------------------------------------

def draw_isotipo(img: Image.Image,
                 cx: float, cy: float,
                 drop_size: float,
                 show_shine: bool = True):
    """
    Dibuja el isotipo completo (gota + calendario/reloj) sobre img.
    drop_size: altura de la gota en píxeles.
    """
    draw = ImageDraw.Draw(img, "RGBA")
    w_img, h_img = img.size

    # --- Gota (usa una imagen temporal para gradiente real) ---
    # Construimos la gota como máscara y rellenamos con gradiente
    drop_w = int(drop_size * 0.72)
    drop_h = int(drop_size)
    pad = int(drop_size * 0.05)

    drop_img = Image.new("RGBA", (drop_w + pad*2, drop_h + pad*2), (0,0,0,0))
    # Gradiente vertical
    grad = Image.new("RGBA", (drop_w + pad*2, drop_h + pad*2), (0,0,0,0))
    gd = ImageDraw.Draw(grad)
    for y in range(drop_h + pad*2):
        t = y / (drop_h + pad*2 - 1)
        r_ = int(GRADIENT_MID[0]*(1-t) + DEEP_COBALT[0]*t)
        g_ = int(GRADIENT_MID[1]*(1-t) + DEEP_COBALT[1]*t)
        b_ = int(GRADIENT_MID[2]*(1-t) + DEEP_COBALT[2]*t)
        gd.line([(0,y),(drop_w+pad*2-1,y)], fill=(r_,g_,b_,255))

    # Máscara de la gota
    mask_img = Image.new("L", (drop_w + pad*2, drop_h + pad*2), 0)
    md = ImageDraw.Draw(mask_img)
    dcx = drop_w/2 + pad
    dcy = drop_h/2 + pad
    # Pico y círculo base
    dh = drop_h
    dw = drop_w
    r = dw * 0.50
    circ_cy = dcy + dh*0.50 - r
    top_y = dcy - dh*0.50

    steps = 200
    pts = []
    for i in range(steps//2 + 1):
        t = i / (steps//2)
        angle = math.pi + t * math.pi
        x = dcx + r * math.cos(angle)
        y = circ_cy + r * math.sin(angle)
        if t < 0.3:
            blend = 1 - t/0.3
            y = y*(1-blend) + (top_y + 0.12*dh)*blend
            x = dcx + (x-dcx)*(1-blend*0.3)
        pts.append((x, y))
    pts.append((dcx, top_y))
    for i in range(steps//2 + 1):
        t = i / (steps//2)
        angle = 2*math.pi - t*math.pi
        x = dcx + r * math.cos(angle)
        y = circ_cy + r * math.sin(angle)
        ti = 1-t
        if ti < 0.3:
            blend = 1 - ti/0.3
            y = y*(1-blend) + (top_y + 0.12*dh)*blend
            x = dcx + (x-dcx)*(1-blend*0.3)
        pts.append((x, y))

    md.polygon(pts, fill=255)
    # Suavizar bordes
    mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=max(1, int(drop_size*0.008))))

    drop_img = Image.composite(grad, Image.new("RGBA", grad.size, (0,0,0,0)), mask_img)

    # Brillo superior-izquierdo
    if show_shine:
        shine = Image.new("RGBA", drop_img.size, (0,0,0,0))
        sd = ImageDraw.Draw(shine, "RGBA")
        shine_r = int(drop_w * 0.18)
        shine_x = int(dcx - drop_w*0.20)
        shine_y = int(top_y + drop_h*0.15)
        sd.ellipse([shine_x-shine_r, shine_y-shine_r//2,
                    shine_x+shine_r, shine_y+shine_r], fill=(255,255,255,55))
        drop_img = Image.alpha_composite(drop_img, shine)

    # Pegar gota sobre img
    paste_x = int(cx - drop_w/2 - pad)
    paste_y = int(cy - drop_h/2 - pad)
    img.paste(drop_img, (paste_x, paste_y), drop_img)

    # --- Icono calendario + reloj dentro de la gota ---
    draw2 = ImageDraw.Draw(img, "RGBA")
    icon_size = drop_size * 0.48
    icon_cx = cx
    icon_cy = cy + drop_size * 0.06   # ligeramente abajo del centro

    cal_w = icon_size
    cal_h = icon_size * 0.85
    cal_x0 = icon_cx - cal_w/2
    cal_y0 = icon_cy - cal_h/2
    cal_x1 = icon_cx + cal_w/2
    cal_y1 = icon_cy + cal_h/2
    line_w = max(2, int(drop_size * 0.012))

    # Cuerpo del calendario
    cr = int(cal_w * 0.12)
    draw2.rounded_rectangle([cal_x0, cal_y0, cal_x1, cal_y1],
                             radius=cr, fill=(255,255,255,230), outline=None)

    # Header del calendario (banda superior)
    header_h = cal_h * 0.28
    draw2.rounded_rectangle([cal_x0, cal_y0, cal_x1, cal_y0+header_h],
                             radius=cr, fill=(255,255,255,255))
    draw2.rectangle([cal_x0, cal_y0+header_h*0.5, cal_x1, cal_y0+header_h],
                    fill=(255,255,255,255))

    # Grillado del calendario (3 cols x 2 rows)
    grid_x0 = cal_x0 + cal_w*0.10
    grid_x1 = cal_x1 - cal_w*0.10
    grid_y0 = cal_y0 + header_h + cal_h*0.08
    grid_y1 = cal_y1 - cal_h*0.08
    dot_r = max(2, int(cal_w * 0.058))
    cols = 3
    rows = 2
    dot_color = (DEEP_COBALT[0], DEEP_COBALT[1], DEEP_COBALT[2], 200)
    for row in range(rows):
        for col in range(cols):
            tx = grid_x0 + (grid_x1-grid_x0) * (col+0.5) / cols
            ty = grid_y0 + (grid_y1-grid_y0) * (row+0.5) / rows
            draw2.ellipse([tx-dot_r, ty-dot_r, tx+dot_r, ty+dot_r], fill=dot_color)

    # Argollas del calendario
    ring_w = max(2, int(cal_w*0.06))
    ring_h = cal_h * 0.16
    for rx in [cal_x0+cal_w*0.28, cal_x1-cal_w*0.28]:
        draw2.rectangle([rx-ring_w//2, cal_y0-ring_h*0.5, rx+ring_w//2, cal_y0+ring_h*0.5],
                        fill=(255,255,255,255))

    # Reloj (pequeño, esquina inferior derecha de la gota)
    clk_r = icon_size * 0.30
    clk_cx = icon_cx + drop_size * 0.16
    clk_cy = icon_cy + drop_size * 0.22
    clk_bg = (GRADIENT_MID[0], GRADIENT_MID[1], GRADIENT_MID[2], 255)
    # Sombra del reloj
    draw2.ellipse([clk_cx-clk_r-2, clk_cy-clk_r-2,
                   clk_cx+clk_r+2, clk_cy+clk_r+2], fill=(0,30,80,100))
    # Fondo
    draw2.ellipse([clk_cx-clk_r, clk_cy-clk_r, clk_cx+clk_r, clk_cy+clk_r],
                  fill=clk_bg, outline=(255,255,255,220), width=line_w)
    # Manecillas
    hw = max(1, int(clk_r*0.12))
    # hora (corta, apunta a ~10)
    hx = clk_cx + clk_r*0.45 * math.cos(math.radians(-60))
    hy = clk_cy + clk_r*0.45 * math.sin(math.radians(-60))
    draw2.line([(clk_cx, clk_cy), (hx, hy)], fill=(255,255,255,240), width=hw+1)
    # minuto (larga, apunta a ~12)
    mx_ = clk_cx + clk_r*0.65 * math.cos(math.radians(-90))
    my_ = clk_cy + clk_r*0.65 * math.sin(math.radians(-90))
    draw2.line([(clk_cx, clk_cy), (mx_, my_)], fill=(255,255,255,240), width=hw)
    # Centro del reloj
    draw2.ellipse([clk_cx-hw, clk_cy-hw, clk_cx+hw, clk_cy+hw],
                  fill=(255,255,255,255))


# ---------------------------------------------------------------------------
# 1. icon.png  (1024x1024)
# ---------------------------------------------------------------------------

def gen_icon(size=1024, path=None):
    img = Image.new("RGBA", (size, size), CLEAN_WHITE + (255,))
    draw = ImageDraw.Draw(img)

    # Fondo blanco con sombra interna sutil
    draw.rectangle([0, 0, size-1, size-1], fill=CLEAN_WHITE)

    # Gota centrada, ~72% del canvas
    drop_size = size * 0.72
    draw_isotipo(img, size/2, size/2, drop_size, show_shine=True)

    out = path or os.path.join(OUT_DIR, "icon.png")
    img = img.convert("RGB")
    img.save(out, "PNG", optimize=True)
    print(f"  [OK] icon.png  -> {out}  ({size}x{size})")
    return out


# ---------------------------------------------------------------------------
# 2. adaptive-icon.png  (1024x1024, foreground sobre transparente)
# ---------------------------------------------------------------------------

def gen_adaptive_icon(size=1024, path=None):
    # El foreground del adaptive icon debe ser sobre fondo transparente.
    # Android recortará a un círculo/squircle según el launcher.
    # El "safe zone" es el 66% central -> dejamos la gota en ~58% del canvas.
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    drop_size = size * 0.58
    draw_isotipo(img, size/2, size/2, drop_size, show_shine=True)

    out = path or os.path.join(OUT_DIR, "adaptive-icon.png")
    img.save(out, "PNG", optimize=True)
    print(f"  [OK] adaptive-icon.png  -> {out}  ({size}x{size})")
    return out


# ---------------------------------------------------------------------------
# 3. splash.png  (1284x2778 — iPhone 14 Pro Max)
# ---------------------------------------------------------------------------

def gen_splash(width=1284, height=2778, path=None):
    img = Image.new("RGB", (width, height), CLEAN_WHITE)
    draw = ImageDraw.Draw(img, "RGBA")

    cx = width / 2
    cy = height / 2

    # Gota grande centrada verticalmente un poco arriba del centro
    drop_size = width * 0.52
    draw_isotipo(img.convert("RGBA").copy() if False else img.convert("RGBA"),
                 cx, cy * 0.88, drop_size, show_shine=True)
    # Necesitamos trabajar en RGBA para pegar
    img_rgba = img.convert("RGBA")
    draw_isotipo(img_rgba, cx, cy * 0.88, drop_size, show_shine=True)

    # Texto "AGUA DC"
    text_y = cy * 0.88 + drop_size * 0.58

    # Texto principal
    try:
        from PIL import ImageFont
        font_big = ImageFont.truetype("arial.ttf", int(width * 0.11))
        font_sub = ImageFont.truetype("arial.ttf", int(width * 0.038))
        font_tag = ImageFont.truetype("arial.ttf", int(width * 0.030))
    except Exception:
        font_big = ImageFont.load_default()
        font_sub = font_big
        font_tag = font_big

    draw_r = ImageDraw.Draw(img_rgba)

    # "AGUA DC" bold
    title = "AGUA DC"
    bbox = draw_r.textbbox((0, 0), title, font=font_big)
    tw = bbox[2] - bbox[0]
    draw_r.text((cx - tw/2, text_y), title,
                font=font_big, fill=DEEP_COBALT + (255,))

    # "Horario de Agua para el Distrito Central"
    subtitle = "Horario de Agua para el Distrito Central"
    text_y2 = text_y + (bbox[3]-bbox[1]) + int(width*0.018)
    bbox2 = draw_r.textbbox((0, 0), subtitle, font=font_sub)
    tw2 = bbox2[2] - bbox2[0]
    draw_r.text((cx - tw2/2, text_y2), subtitle,
                font=font_sub, fill=GRADIENT_MID + (200,))

    # Línea decorativa
    line_y = text_y2 + (bbox2[3]-bbox2[1]) + int(width*0.025)
    draw_r.line([(cx-width*0.12, line_y), (cx+width*0.12, line_y)],
                fill=SKY_BLUE + (180,), width=max(2, int(width*0.003)))

    # "UMAPS" pequeño al fondo
    footer = "UMAPS • Unidad Municipal de Agua Potable y Saneamiento"
    try:
        font_footer = ImageFont.truetype("arial.ttf", int(width * 0.024))
    except Exception:
        font_footer = font_tag
    bbox_f = draw_r.textbbox((0, 0), footer, font=font_footer)
    tfw = bbox_f[2] - bbox_f[0]
    draw_r.text((cx - tfw/2, height * 0.91), footer,
                font=font_footer, fill=(150, 150, 160, 180))

    # Convertir a RGB para guardar
    final = img_rgba.convert("RGB")
    out = path or os.path.join(OUT_DIR, "splash.png")
    final.save(out, "PNG", optimize=True)
    print(f"  [OK] splash.png  -> {out}  ({width}x{height})")
    return out


# ---------------------------------------------------------------------------
# 4. favicon.png  (64x64)
# ---------------------------------------------------------------------------

def gen_favicon(size=64, path=None):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    drop_size = size * 0.85
    draw_isotipo(img, size/2, size/2, drop_size, show_shine=False)

    out = path or os.path.join(OUT_DIR, "favicon.png")
    img.save(out, "PNG", optimize=True)
    print(f"  [OK] favicon.png  -> {out}  ({size}x{size})")
    return out


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("\nAguaDC Asset Generator\n" + "="*40)
    gen_icon()
    gen_adaptive_icon()
    gen_splash()
    gen_favicon()
    print("\n[OK] Todos los assets generados en:", OUT_DIR)
