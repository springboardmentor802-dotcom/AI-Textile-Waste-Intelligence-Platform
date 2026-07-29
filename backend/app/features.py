"""
Shared feature extraction for material classification.

Kept in one place so the training script (train_material_classifier.py) and
the live inference path (material_classifier.py) can never drift apart.

Features are hand-crafted color + texture descriptors (color histogram in
HSV, GLCM texture stats, edge density) -- fast to compute with OpenCV/
scikit-image, no GPU needed, and expressive enough for a fabric-type
classifier trained with XGBoost/Scikit-learn per the project's stack.
"""
import cv2
import numpy as np
from skimage.feature import graycomatrix, graycoprops

FEATURE_NAMES = (
    [f"h_hist_{i}" for i in range(16)] +
    [f"s_hist_{i}" for i in range(8)] +
    [f"v_hist_{i}" for i in range(8)] +
    ["contrast", "homogeneity", "energy", "correlation", "dissimilarity",
     "edge_density", "mean_gray", "std_gray"]
)


def extract_features(img) -> np.ndarray:
    img = cv2.resize(img, (256, 256))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    h_hist = cv2.calcHist([hsv], [0], None, [16], [0, 180]).flatten()
    s_hist = cv2.calcHist([hsv], [1], None, [8], [0, 256]).flatten()
    v_hist = cv2.calcHist([hsv], [2], None, [8], [0, 256]).flatten()
    h_hist = h_hist / (h_hist.sum() + 1e-6)
    s_hist = s_hist / (s_hist.sum() + 1e-6)
    v_hist = v_hist / (v_hist.sum() + 1e-6)

    glcm = graycomatrix(gray, distances=[1], angles=[0, np.pi/4, np.pi/2, 3*np.pi/4],
                         levels=256, symmetric=True, normed=True)
    contrast = graycoprops(glcm, "contrast").mean()
    homogeneity = graycoprops(glcm, "homogeneity").mean()
    energy = graycoprops(glcm, "energy").mean()
    correlation = graycoprops(glcm, "correlation").mean()
    dissimilarity = graycoprops(glcm, "dissimilarity").mean()

    edges = cv2.Canny(gray, 60, 160)
    edge_density = edges.mean() / 255

    mean_gray = gray.mean()
    std_gray = gray.std()

    return np.concatenate([
        h_hist, s_hist, v_hist,
        [contrast, homogeneity, energy, correlation, dissimilarity,
         edge_density, mean_gray, std_gray],
    ]).astype(np.float32)
