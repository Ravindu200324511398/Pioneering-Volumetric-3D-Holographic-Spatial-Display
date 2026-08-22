import math
import numpy as np
from PIL import Image
import os

def rgb_to_rgb565(r, g, b):
    # Compression from 24-bit RGB to 16-bit RGB565
    r5 = (r * 249 + 1014) >> 11
    g6 = (g * 253 + 505) >> 10
    b5 = (b * 249 + 1014) >> 11
    return (r5 << 11) + (g6 << 5) + b5

def process_media(file_path, angle_fan, out_dir, zoom=100.0, saturation=100.0):
    try:
        angle_fan = float(angle_fan)
        zoom = float(zoom)
        saturation = float(saturation)
    except ValueError:
        raise Exception("Invalid parameters")

    NUM_LEDS = 200
    HALF_LEDS = int(NUM_LEDS / 2) # 100
    resolution = 6 # degrees
    polar_rows = int(360 / resolution) # 60

    scale = 2.0
    w_px = int(NUM_LEDS * scale) # 400
    h_px = int(NUM_LEDS * scale) # 400

    try:
        img = Image.open(file_path).convert('RGB')
    except Exception as e:
        raise Exception(f"Failed to open image: {e}")

    # Crop and scale to 1:1 aspect ratio (square bounding box for single fan)
    img_ratio = img.width / img.height
    target_ratio = w_px / h_px # 1.0
    if img_ratio > target_ratio:
        # Image is wider, crop width
        new_w = img.height
        offset = (img.width - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, img.height))
    else:
        # Image is taller, crop height
        new_h = img.width
        offset = (img.height - new_h) // 2
        img = img.crop((0, offset, img.width, offset + new_h))

    # Apply size scaling (zoom percentage)
    size_scale = zoom / 100.0
    draw_w = int(w_px * size_scale)
    draw_h = int(h_px * size_scale)
    
    # Create black background canvas
    canvas = Image.new('RGB', (w_px, h_px), (0, 0, 0))
    # Resize the source image
    img_resized = img.resize((draw_w, draw_h), Image.Resampling.LANCZOS)
    
    # Paste centered on the canvas
    offset_x = (w_px - draw_w) // 2
    offset_y = (h_px - draw_h) // 2
    canvas.paste(img_resized, (offset_x, offset_y))
    
    center_x = int(w_px / 2) # 200
    center_y = int(h_px / 2) # 200

    img_converted = [[0 for _ in range(HALF_LEDS)] for _ in range(polar_rows)]
    degrees = 0
    
    for row in range(polar_rows):
        # Apply angle offset
        effective_deg = (degrees + angle_fan) % 360
        rad = math.radians(effective_deg)
        
        for j in range(HALF_LEDS):
            # j=0 is outer edge (r=100), j=99 is inner center (r=1)
            r = HALF_LEDS - j
            
            # polar to cartesian
            dx = r * math.sin(rad)
            dy = r * math.cos(rad)
            
            # Image coordinates
            px = int(center_x + dx * scale)
            py = int(center_y - dy * scale) # Y goes down in images
            
            if px < 0: px = 0
            if py < 0: py = 0
            if px >= w_px: px = w_px - 1
            if py >= h_px: py = h_px - 1
            
            r_val, g_val, b_val = canvas.getpixel((px, py))
            
            # Saturation adjustment
            if saturation != 100.0:
                factor = saturation / 100.0
                gray = 0.299 * r_val + 0.587 * g_val + 0.114 * b_val
                r_val = min(255, max(0, int(gray + (r_val - gray) * factor)))
                g_val = min(255, max(0, int(gray + (g_val - gray) * factor)))
                b_val = min(255, max(0, int(gray + (b_val - gray) * factor)))
            
            rgb565 = rgb_to_rgb565(r_val, g_val, b_val)
            img_converted[row][j] = rgb565
            
        degrees += resolution

    # Export to fan.bin with 4-byte header indicating 1 frame
    bin_path = os.path.join(out_dir, 'fan.bin')
    with open(bin_path, 'wb') as f:
        f.write((1).to_bytes(4, byteorder='little')) # frameCount = 1
        for row in range(polar_rows):
            for j in range(HALF_LEDS):
                val = img_converted[row][j]
                # Little-endian 16-bit
                f.write(val.to_bytes(2, byteorder='little'))
                
    return bin_path
