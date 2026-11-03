import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_tech_banner():
    W, H = 1640, 720
    
    # 1. Base Dark Canvas #05070d (Obsidian Tech Black)
    base = Image.new('RGBA', (W, H), (5, 7, 13, 255))
    
    # 2. Tech Atmosphere & Ambient Glows
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    
    # Left Cyan / Azure Reactor Glow (Behind the 3D emblem)
    cx_logo, cy_logo = 290, 150
    for r in range(350, 0, -12):
        alpha = int(45 * (1 - r / 350))
        glow_draw.ellipse([cx_logo - r, cy_logo - r, cx_logo + r, cy_logo + r], fill=(0, 180, 255, alpha))
        
    # Right-hand Deep Electric Violet / Purple Glow
    cx_r, cy_r = 1350, 280
    for r in range(500, 0, -15):
        alpha = int(38 * (1 - r / 500))
        glow_draw.ellipse([cx_r - r, cy_r - r, cx_r + r, cy_r + r], fill=(113, 55, 242, alpha))
        
    # Bottom subtle floor glow
    for r in range(300, 0, -20):
        alpha = int(25 * (1 - r / 300))
        glow_draw.ellipse([820 - r * 2, 700 - r, 820 + r * 2, 700 + r], fill=(0, 210, 255, alpha))

    base = Image.alpha_composite(base, glow)

    # 3. Cybernetic Circuit & Matrix Overlay
    circuit_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(circuit_img)
    
    # Grid lines (40px pitch)
    for x in range(0, W, 40):
        cd.line([(x, 0), (x, H)], fill=(0, 180, 255, 9), width=1)
    for y in range(0, H, 40):
        cd.line([(0, y), (W, y)], fill=(0, 180, 255, 9), width=1)
        
    # High-tech perspective floor grid at the bottom (y: 540 to 720)
    for y in range(540, H, 25):
        alpha = int(18 * ((y - 540) / 180))
        cd.line([(0, y), (W, y)], fill=(0, 210, 255, alpha), width=1)
    for x in range(0, W, 80):
        cd.line([(x, 540), (int(W/2 + (x - W/2) * 1.6), H)], fill=(0, 210, 255, 12), width=1)
        
    # Circuit traces with 45-degree angled routing
    traces = [
        # Top-left circuit trace
        [(100, 48), (220, 48), (260, 88), (260, 120)],
        [(40, 180), (120, 180), (160, 220), (160, 340), (220, 400)],
        # Top-right telemetry bus line
        [(1150, 48), (1480, 48), (1520, 88), (1520, 220)],
        [(1250, 80), (1560, 80)],
        # Far-right circuit branches
        [(1350, 380), (1450, 380), (1490, 420), (1580, 420)],
        [(1100, 620), (1240, 620), (1290, 570), (1460, 570)]
    ]
    for pts in traces:
        for i in range(len(pts) - 1):
            cd.line([pts[i], pts[i+1]], fill=(0, 190, 255, 45), width=2)
        # Solder pads / nodes
        p_start, p_end = pts[0], pts[-1]
        cd.ellipse([p_start[0]-3, p_start[1]-3, p_start[0]+3, p_start[1]+3], fill=(0, 220, 255, 160))
        cd.ellipse([p_end[0]-4, p_end[1]-4, p_end[0]+4, p_end[1]+4], fill=(0, 240, 255, 220))

    # Binary data stream watermark in background
    font_mono = "C:\\Windows\\Fonts\\consola.ttf"
    font_bold = "C:\\Windows\\Fonts\\segoeuib.ttf"
    font_reg = "C:\\Windows\\Fonts\\segoeui.ttf"
    font_bahn = "C:\\Windows\\Fonts\\bahnschrift.ttf"
    
    try:
        micro_mono = ImageFont.truetype(font_mono, 11)
        hud_mono = ImageFont.truetype(font_mono, 13)
        code_mono = ImageFont.truetype(font_mono, 15)
        title_bold = ImageFont.truetype(font_bahn, 34)
        subtitle_mono = ImageFont.truetype(font_mono, 15)
        eyebrow_mono = ImageFont.truetype(font_mono, 14)
        hl_font1 = ImageFont.truetype(font_bold, 50)
        hl_font2 = ImageFont.truetype(font_bold, 50)
        lead_font = ImageFont.truetype(font_reg, 21)
        chip_font = ImageFont.truetype(font_mono, 14)
        url_font = ImageFont.truetype(font_mono, 22)
    except Exception:
        micro_mono = ImageFont.load_default()
        hud_mono = micro_mono
        code_mono = micro_mono
        title_bold = micro_mono
        subtitle_mono = micro_mono
        eyebrow_mono = micro_mono
        hl_font1 = micro_mono
        hl_font2 = micro_mono
        lead_font = micro_mono
        chip_font = micro_mono
        url_font = micro_mono

    # Faint tech telemetry labels in background
    cd.text((120, 68), "01000100 01000100 01000100 // DDD_SYS", font=micro_mono, fill=(0, 180, 255, 28))
    cd.text((120, 84), "SYS_ARCH: CLOUD_NATIVE // EDGE_NET", font=micro_mono, fill=(0, 180, 255, 24))
    cd.text((1400, 650), "LAT: 43.7334° N // LON: 80.9538° W", font=micro_mono, fill=(0, 180, 255, 35))

    base = Image.alpha_composite(base, circuit_img)
    base.save(r'C:/Users/Total/.gemini/antigravity/scratch/fb-cover-sizer/assets/cyber_background.png', 'PNG')
    base.save(r'C:/Users/Total/.gemini/antigravity/scratch/fb-cover-sizer/cyber_background.png', 'PNG')

    # 4. Content Layer
    content_img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(content_img)

    # --- TOP RIGHT HUD TELEMETRY MODULE ---
    # Placed within safe zone (x = 1050..1440, y = 60..140)
    hud_w, hud_h = 390, 72
    hud_x, hud_y = 1430 - hud_w, 64
    
    # Translucent glass panel
    d.rounded_rectangle([hud_x, hud_y, hud_x + hud_w, hud_y + hud_h], radius=6, fill=(10, 16, 28, 200), outline=(0, 180, 255, 75), width=1)
    
    # Corner HUD crosshairs
    bracket_len = 8
    d.line([(hud_x, hud_y + bracket_len), (hud_x, hud_y), (hud_x + bracket_len, hud_y)], fill=(0, 230, 255, 220), width=2)
    d.line([(hud_x + hud_w, hud_y + bracket_len), (hud_x + hud_w, hud_y), (hud_x + hud_w - bracket_len, hud_y)], fill=(0, 230, 255, 220), width=2)
    d.line([(hud_x, hud_y + hud_h - bracket_len), (hud_x, hud_y + hud_h), (hud_x + bracket_len, hud_y + hud_h)], fill=(0, 230, 255, 220), width=2)
    d.line([(hud_x + hud_w, hud_y + hud_h - bracket_len), (hud_x + hud_w, hud_y + hud_h), (hud_x + hud_w - bracket_len, hud_y + hud_h)], fill=(0, 230, 255, 220), width=2)
    
    # Live status dot
    d.ellipse([hud_x + 16, hud_y + 19, hud_x + 26, hud_y + 29], fill=(0, 230, 255, 255))
    d.ellipse([hud_x + 13, hud_y + 16, hud_x + 29, hud_y + 32], outline=(0, 230, 255, 110), width=1)
    
    d.text((hud_x + 36, hud_y + 15), "SYS_STATUS: ONLINE // PERTH NODE", font=hud_mono, fill=(0, 230, 255, 255))
    d.text((hud_x + 36, hud_y + 38), "HEADQUARTERS: LISTOWEL, ONTARIO", font=micro_mono, fill=(180, 200, 225, 240))
    d.text((hud_x + 275, hud_y + 38), "RTT: 12ms", font=micro_mono, fill=(113, 55, 242, 255))

    # --- BRAND HEADER: 3D EMBLEM & LOGO ---
    # Safe zone left starts at x=210, top at y=75
    emblem_path = r'C:/Users/Total/.gemini/antigravity/scratch/fb-cover-sizer/assets/emblem_clean_alpha.png'
    if os.path.exists(emblem_path):
        emblem_raw = Image.open(emblem_path).convert('RGBA')
        # Scale to 120 x 109 px
        emblem_w, emblem_h = 120, int(emblem_raw.height * (120.0 / emblem_raw.width))
        emblem_scaled = emblem_raw.resize((emblem_w, emblem_h), Image.Resampling.LANCZOS)
        
        # Paste with halo glow behind it
        emb_x, emb_y = 210, 68
        
        # Halo ring around emblem
        halo_cx = emb_x + emblem_w // 2
        halo_cy = emb_y + emblem_h // 2
        d.ellipse([halo_cx - 68, halo_cy - 68, halo_cx + 68, halo_cy + 68], outline=(0, 180, 255, 60), width=1)
        d.ellipse([halo_cx - 75, halo_cy - 75, halo_cx + 75, halo_cy + 75], outline=(113, 55, 242, 45), width=1)
        
        content_img.alpha_composite(emblem_scaled, (emb_x, emb_y))
        
        # Text next to emblem
        t_x = emb_x + emblem_w + 22
        t_y = emb_y + 10
        
        # "DAVIDSON DIGITAL DESIGN"
        d.text((t_x, t_y), "DAVIDSON", font=title_bold, fill=(255, 255, 255, 255))
        # Measure DAVIDSON width to place DIGITAL DESIGN
        bbox_d = d.textbbox((t_x, t_y), "DAVIDSON ", font=title_bold)
        d.text((bbox_d[2], t_y), "DIGITAL DESIGN", font=title_bold, fill=(0, 180, 255, 255))
        
        # Subtitle: "LOCAL WEBSITES • SIMPLE AI • HONEST SERVICE"
        sub_y = t_y + 44
        d.text((t_x, sub_y), "LOCAL WEBSITES", font=subtitle_mono, fill=(185, 205, 225, 230))
        bbox_s1 = d.textbbox((t_x, sub_y), "LOCAL WEBSITES ", font=subtitle_mono)
        d.text((bbox_s1[2], sub_y), "•", font=subtitle_mono, fill=(0, 210, 255, 255))
        bbox_dot1 = d.textbbox((bbox_s1[2], sub_y), "• ", font=subtitle_mono)
        d.text((bbox_dot1[2], sub_y), "SIMPLE AI", font=subtitle_mono, fill=(185, 205, 225, 230))
        bbox_s2 = d.textbbox((bbox_dot1[2], sub_y), "SIMPLE AI ", font=subtitle_mono)
        d.text((bbox_s2[2], sub_y), "•", font=subtitle_mono, fill=(0, 210, 255, 255))
        bbox_dot2 = d.textbbox((bbox_s2[2], sub_y), "• ", font=subtitle_mono)
        d.text((bbox_dot2[2], sub_y), "HONEST SERVICE", font=subtitle_mono, fill=(185, 205, 225, 230))

    # --- HERO STATEMENT & IMPACT HEADLINE ---
    # Elevated to sit completely above both Facebook profile avatar circles
    # Desktop avatar top edge is Y=455, Mobile avatar top edge is Y=470
    core_x = 210
    core_y = 175
    
    # Eyebrow tag
    d.text((core_x, core_y), "[ 01 // ARCHITECTURE & INTELLIGENCE ]", font=eyebrow_mono, fill=(0, 210, 255, 240))
    d.line([(core_x + 360, core_y + 10), (core_x + 520, core_y + 10)], fill=(0, 210, 255, 80), width=1)
    
    # Headline Line 1 & Line 2
    hl1_y = core_y + 26
    hl2_y = hl1_y + 50
    d.text((core_x, hl1_y), "High-Performance Web Platforms.", font=hl_font1, fill=(255, 255, 255, 255))
    d.text((core_x, hl2_y), "Autonomous AI Systems.", font=hl_font2, fill=(0, 190, 255, 255))
    
    # Sub-lead
    lead_y = hl2_y + 60
    d.text((core_x, lead_y), "Engineered for pure speed, local organic dominance, and automated lead workflows.", font=lead_font, fill=(205, 218, 235, 240))

    # --- THREE HIGH-TECH TELEMETRY CHIPS ---
    # Positioned at Y=365..423: 100% above Desktop Avatar (Y=455) & Mobile Avatar (Y=470)
    chip_y = 365
    chips = [
        ("⚡ 99+ SPEED", "Zero bloat · Sub-second TTFB"),
        ("🤖 CUSTOM AI", "Autonomous workflows & bots"),
        ("🎯 LOCAL RANK", "Top 3-Pack SEO in Perth & Minto")
    ]
    chip_w = 270
    chip_h = 58
    
    for i, (tag, detail) in enumerate(chips):
        cx = core_x + i * (chip_w + 14)
        
        # Cyber chip background
        if i == 0:
            border_col = (0, 210, 255, 120)
            fill_col = (10, 22, 38, 220)
            tag_col = (0, 230, 255, 255)
        elif i == 1:
            border_col = (113, 55, 242, 140)
            fill_col = (20, 14, 38, 220)
            tag_col = (180, 140, 255, 255)
        else:
            border_col = (0, 210, 255, 80)
            fill_col = (10, 18, 30, 220)
            tag_col = (255, 255, 255, 255)
            
        d.rounded_rectangle([cx, chip_y, cx + chip_w, chip_y + chip_h], radius=6, fill=fill_col, outline=border_col, width=1)
        # Left accent vertical marker
        d.line([(cx + 3, chip_y + 6), (cx + 3, chip_y + chip_h - 6)], fill=tag_col, width=3)
        
        d.text((cx + 14, chip_y + 11), tag, font=chip_font, fill=tag_col)
        d.text((cx + 14, chip_y + 32), detail, font=micro_mono, fill=(160, 180, 205, 240))

    # --- TERMINAL PORTFOLIO URL MODULE (Right Aligned in Safe Zone) ---
    url_box_w = 340
    url_box_h = 64
    url_x = 1430 - url_box_w
    url_y = chip_y - 3
    
    # Outer illuminated terminal
    d.rounded_rectangle([url_x, url_y, url_x + url_box_w, url_y + url_box_h], radius=8, fill=(8, 14, 25, 240), outline=(0, 210, 255, 140), width=1)
    
    # Terminal header tab
    d.text((url_x + 14, url_y + 10), "root@davidson:~$ ./init_project", font=micro_mono, fill=(0, 180, 255, 220))
    # Domain with blinking block cursor
    d.text((url_x + 14, url_y + 28), "davidsondigitaldesign.com", font=url_font, fill=(255, 255, 255, 255))
    
    # Blinking cursor block
    cur_x = url_x + 14 + int(len("davidsondigitaldesign.com") * 13.2)
    d.rectangle([cur_x, url_y + 32, cur_x + 10, url_y + 50], fill=(0, 220, 255, 255))

    # Composite all layers
    final_img = Image.alpha_composite(base, content_img)
    
    # Save to all target paths
    out_paths = [
        r"C:\Users\Total\.gemini\antigravity\scratch\fb-cover-sizer\assets\davidson_digital_design_facebook_cover.png",
        r"C:\Users\Total\.gemini\antigravity\scratch\DDD_Codex\assets\davidson_digital_design_facebook_cover.png",
        r"C:\Users\Total\.gemini\antigravity\brain\6e796110-7b75-43aa-893a-eb77e73fdf78\davidson_digital_design_facebook_cover.png",
        r"C:\Users\Total\.gemini\antigravity\scratch\fb-cover-sizer\davidson-cover.png"
    ]
    
    for p in out_paths:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        final_img.save(p, "PNG")
        print(f"Saved tech-style banner to: {p}")

if __name__ == '__main__':
    create_tech_banner()
