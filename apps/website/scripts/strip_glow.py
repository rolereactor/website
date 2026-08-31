from PIL import Image
import numpy as np
import os

def strip_outer_glow(input_path, output_path, cutoff=90):
    if not os.path.exists(input_path):
        print(f"File not found: {input_path}")
        return
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.float32)
    
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    max_rgb = np.maximum(np.maximum(r, g), b)
    
    bg_color = np.mean(arr[:10, :10, :3], axis=(0,1))
    dist = np.linalg.norm(arr[:, :, :3] - bg_color, axis=2)
    
    # Strict mask to eliminate outer fuzzy aura/glow
    mask = (max_rgb >= cutoff) & (dist >= cutoff)
    arr[:, :, 3] = np.where(mask, 255.0, 0.0)
    
    cleaned = Image.fromarray(arr.astype(np.uint8), 'RGBA')
    
    bbox = cleaned.getbbox()
    if bbox:
        cropped = cleaned.crop(bbox)
        max_dim = max(cropped.width, cropped.height)
        square_img = Image.new('RGBA', (max_dim, max_dim), (0, 0, 0, 0))
        offset = ((max_dim - cropped.width) // 2, (max_dim - cropped.height) // 2)
        square_img.paste(cropped, offset)
        square_img.save(output_path, 'PNG')
    else:
        cleaned.save(output_path, 'PNG')
    print(f"Stripped outer glow: {output_path}")

base_dir = os.path.abspath(os.path.dirname(__file__))
public_cores_dir = os.path.join(base_dir, "..", "public", "images", "cores")
artifact_dir = "/Users/tyecode/.gemini/antigravity-ide/brain/a03e5e71-76b1-4458-8ddc-212b3f3ab5c9"

raw_spark = os.path.join(artifact_dir, "reward_sparks_25d_icon_1788082678941.png")
raw_core = os.path.join(artifact_dir, "paid_cores_25d_icon_1788082659628.png")

strip_outer_glow(raw_spark, os.path.join(public_cores_dir, "spark_icon.png"), cutoff=110)
strip_outer_glow(raw_core, os.path.join(public_cores_dir, "core_icon.png"), cutoff=90)
strip_outer_glow(raw_spark, os.path.join(public_cores_dir, "spark_icon_noglow.png"), cutoff=110)
strip_outer_glow(raw_core, os.path.join(public_cores_dir, "core_icon_noglow.png"), cutoff=90)
