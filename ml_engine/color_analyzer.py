import cv2
import numpy as np
from collections import Counter

def get_color_name(rgb):
    r, g, b = rgb
    
    rgb_normalized = np.uint8([[[r, g, b]]])
    hsv = cv2.cvtColor(rgb_normalized, cv2.COLOR_RGB2HSV)[0][0]
    h, s, v = hsv[0], hsv[1], hsv[2]

    if v < 40:
        return "Black"
    if v > 200 and s < 25:
        return "White"
    if s < 25: 
        if v > 140:
            return "Light Gray"
        else:
            return "Dark Gray"

    if h < 10 or h > 165:
        if v < 120 or (10 <= s <= 120 and v < 180):
            return "Brown"
        return "Red"
    elif 10 <= h < 22:
        if v < 120:
            return "Brown"
        return "Orange"
    elif 22 <= h < 35:
        return "Yellow"
    elif 35 <= h < 85:
        return "Green"
    elif 85 <= h < 132: 
        return "Blue"
    elif 132 <= h < 165:
        return "Purple"
    
    return "Gray"

def analyze_colors(image_bytes: bytes, k=3) -> dict:
    image_np = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    if img is None:
        return {"primary_color": "Unknown", "dominant_palette": []}

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    img_resized = cv2.resize(img, (150, 150), interpolation=cv2.INTER_AREA)
    pixels = img_resized.reshape((-1, 3))
    
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    _, labels, centers = cv2.kmeans(np.float32(pixels), k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    counts = Counter(labels.flatten())
    total_pixels = len(pixels)
    
    dominant_colors = []
    for i, center in enumerate(centers):
        percentage = round((counts[i] / total_pixels) * 100, 2)
        rgb = [int(c) for c in center]
        dominant_colors.append({
            "rgb": rgb,
            "percentage": percentage,
            "color_name": get_color_name(rgb)
        })
        
    dominant_colors = sorted(dominant_colors, key=lambda x: x["percentage"], reverse=True)
    
    return {
        "primary_color": dominant_colors[0]["color_name"],
        "dominant_palette": dominant_colors
    }