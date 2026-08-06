import sys
import os
import cv2
import numpy as np

def process(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: input file {input_path} missing")
        return False

    img = cv2.imread(input_path)
    if img is None:
        print(f"Error: unable to read image at {input_path}")
        return False

    # 1. Resize to target resolution (256x256)
    resized = cv2.resize(img, (256, 256), interpolation=cv2.INTER_AREA)

    # 2. Bilateral Filter Denoising
    denoised = cv2.bilateralFilter(resized, 9, 75, 75)

    # 3. Grayscale conversion & CLAHE Contrast Equalization
    gray = cv2.cvtColor(denoised, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    equalized = clahe.apply(gray)

    # 4. Canny Edge Contour Feature Detection
    edges = cv2.Canny(equalized, 50, 150)
    
    # 5. Create 3-channel green edge overlay matrix
    edge_overlay = np.zeros_like(resized)
    edge_overlay[edges > 0] = [0, 255, 100] # Green contours

    # 6. Convert equalized gray back to 3-channel BGR
    equalized_bgr = cv2.cvtColor(equalized, cv2.COLOR_GRAY2BGR)

    # 7. Blend OpenCV equalized matrix (70%) + green edge contours (30%)
    blended = cv2.addWeighted(equalized_bgr, 0.70, edge_overlay, 0.30, 0)

    # 8. Burn "OPENCV PREPROCESSED" overlay tag
    cv2.putText(blended, "OPENCV PREPROCESSED", (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 120), 1, cv2.LINE_AA)

    out_dir = os.path.dirname(output_path)
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)
    cv2.imwrite(output_path, blended)
    print(f"Successfully processed OpenCV visual: {input_path} -> {output_path}")
    return True

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        process(sys.argv[1], sys.argv[2])
