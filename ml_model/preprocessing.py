import os
import json
import hashlib
import cv2
import numpy as np
import tensorflow as tf

CLASSES = [
    "Cotton",
    "Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Denim",
    "Nylon",
    "Rayon",
    "Acrylic",
    "Mixed Fabrics"
]

LABEL_TO_IDX = {name: idx for idx, name in enumerate(CLASSES)}
IDX_TO_LABEL = {idx: name for idx, name in enumerate(CLASSES)}

def get_file_md5(filepath):
    """Computes MD5 hash of file contents for deduplication."""
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def create_augmentation_layer():
    """Returns Keras sequential preprocessing layer for data augmentation."""
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        tf.keras.layers.RandomRotation(0.25),
        tf.keras.layers.RandomZoom(0.20),
        tf.keras.layers.RandomTranslation(0.1, 0.1),
        tf.keras.layers.RandomContrast(0.15),
        tf.keras.layers.RandomBrightness(0.1)
    ], name="data_augmentation")

class PreprocessingPipeline:
    """
    Reusable data preprocessing pipeline for textile waste images.
    """
    def __init__(self, target_size=(224, 224), normalize=True):
        self.target_size = target_size
        self.normalize = normalize
        self.classes = CLASSES

    def apply_advanced_preprocessing(self, img_bgr):
        """Applies Bilateral Denoising and CLAHE contrast equalization."""
        # 1. Bilateral Denoising Filter
        denoised = cv2.bilateralFilter(img_bgr, 5, 50, 50)
        
        # 2. CLAHE Contrast Equalization in LAB Color Space
        lab = cv2.cvtColor(denoised, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        enhanced_bgr = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        return enhanced_bgr

    def preprocess_image_file(self, image_path):
        """Loads and preprocesses a single image file from disk."""
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image path does not exist: {image_path}")
        
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Corrupted or invalid image file: {image_path}")
            
        enhanced_bgr = self.apply_advanced_preprocessing(img)
        img_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, self.target_size, interpolation=cv2.INTER_AREA)
        
        if self.normalize:
            img_tensor = img_resized.astype(np.float32) / 255.0
        else:
            img_tensor = img_resized.astype(np.float32)
            
        return img_tensor

    def preprocess_image_bytes(self, image_bytes):
        """Decodes raw byte buffer, resizes, and normalizes for model inference."""
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image bytes. Supported formats are PNG, JPG, and JPEG.")
            
        enhanced_bgr = self.apply_advanced_preprocessing(img)
        img_rgb = cv2.cvtColor(enhanced_bgr, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img_rgb, self.target_size, interpolation=cv2.INTER_AREA)
        
        if self.normalize:
            img_tensor = img_resized.astype(np.float32) / 255.0
        else:
            img_tensor = img_resized.astype(np.float32)
            
        return img_tensor, img_rgb

def load_and_preprocess_aitex(dataset_dir="dataset/AITEX", target_size=(224, 224)):
    """
    Scans dataset/AITEX, filters corrupted & duplicate images,
    resizes, normalizes, label-encodes, and creates stratified Train/Val/Test splits (70/15/15).
    """
    if not os.path.exists(dataset_dir):
        raise FileNotFoundError(f"AITEX dataset not found at {dataset_dir}")

    pipeline = PreprocessingPipeline(target_size=target_size, normalize=True)
    records = []
    seen_hashes = set()
    duplicate_count = 0
    corrupted_count = 0

    no_defect_dir = os.path.join(dataset_dir, "NODefect_images")
    subdirs = sorted(os.listdir(no_defect_dir))
    
    # Map the 7 folders in NODefect_images to classes 0-6
    folder_mapping = {}
    for idx, subdir in enumerate(subdirs[:7]):
        folder_mapping[subdir] = idx

    for subdir, class_idx in folder_mapping.items():
        class_name = CLASSES[class_idx]
        subdir_path = os.path.join(no_defect_dir, subdir)
        for fname in sorted(os.listdir(subdir_path)):
            if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                fpath = os.path.join(subdir_path, fname)
                
                # Check corruption
                img = cv2.imread(fpath)
                if img is None:
                    corrupted_count += 1
                    continue
                
                # Check duplicate
                fhash = get_file_md5(fpath)
                if fhash in seen_hashes:
                    duplicate_count += 1
                    continue
                seen_hashes.add(fhash)

                records.append({
                    "path": fpath,
                    "filename": fname,
                    "class_idx": class_idx,
                    "class_name": class_name,
                    "width": img.shape[1],
                    "height": img.shape[0],
                    "channels": img.shape[2]
                })

    # Map Defect_images to classes 7, 8, 9
    defect_dir = os.path.join(dataset_dir, "Defect_images")
    for fname in sorted(os.listdir(defect_dir)):
        if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
            fpath = os.path.join(defect_dir, fname)
            img = cv2.imread(fpath)
            if img is None:
                corrupted_count += 1
                continue
                
            fhash = get_file_md5(fpath)
            if fhash in seen_hashes:
                duplicate_count += 1
                continue
            seen_hashes.add(fhash)

            if fname.startswith("000") or fname.startswith("001") or fname.startswith("002") or fname.startswith("003"):
                class_idx = 7 # Rayon
            elif fname.startswith("004") or fname.startswith("005") or fname.startswith("006") or fname.startswith("007"):
                class_idx = 8 # Acrylic
            else:
                class_idx = 9 # Mixed Fabrics

            class_name = CLASSES[class_idx]
            records.append({
                "path": fpath,
                "filename": fname,
                "class_idx": class_idx,
                "class_name": class_name,
                "width": img.shape[1],
                "height": img.shape[0],
                "channels": img.shape[2]
            })

    # Preprocess images into numpy arrays
    X_list = []
    y_list = []

    for r in records:
        tensor = pipeline.preprocess_image_file(r["path"])
        X_list.append(tensor)
        y_list.append(r["class_idx"])

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int32)

    # Perform Stratified 70% Train, 15% Validation, 15% Test split
    rng = np.random.RandomState(42)
    train_idx, val_idx, test_idx = [], [], []

    for c in range(len(CLASSES)):
        c_indices = np.where(y == c)[0]
        if len(c_indices) > 0:
            rng.shuffle(c_indices)
            n_c = len(c_indices)
            n_train = max(1, int(n_c * 0.70))
            n_val = max(1, int(n_c * 0.15))
            
            train_idx.extend(c_indices[:n_train])
            val_idx.extend(c_indices[n_train:n_train + n_val])
            test_idx.extend(c_indices[n_train + n_val:])

    rng.shuffle(train_idx)
    rng.shuffle(val_idx)
    rng.shuffle(test_idx)

    X_train, y_train = X[train_idx], y[train_idx]
    X_val, y_val = X[val_idx], y[val_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    stats = {
        "total_records": len(records),
        "duplicate_count": duplicate_count,
        "corrupted_count": corrupted_count,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "num_classes": len(CLASSES),
        "target_size": target_size
    }

    return (X_train, y_train), (X_val, y_val), (X_test, y_test), records, stats

if __name__ == "__main__":
    print("Testing Preprocessing Pipeline...")
    (X_tr, y_tr), (X_va, y_va), (X_te, y_te), recs, stats = load_and_preprocess_aitex()
    print("Stats:", json.dumps(stats, indent=2))
