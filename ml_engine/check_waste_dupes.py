import hashlib
from pathlib import Path
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parent
root = BASE_DIR / "datasets" / "sustainable_fashion"

def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.md5(f.read()).hexdigest()

hashes = defaultdict(list)
for folder in ("reusable", "trash"):
    folder_path = root / folder
    if not folder_path.exists():
        continue
    for img_path in folder_path.rglob("*.*"):
        if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png", ".bmp"):
            continue
        h = file_hash(img_path)
        hashes[h].append(str(img_path))

dupes = {h: paths for h, paths in hashes.items() if len(paths) > 1}
print(f"Total images: {sum(len(v) for v in hashes.values())}")
print(f"Unique images: {len(hashes)}")
print(f"Exact duplicate groups: {len(dupes)}")
for h, paths in list(dupes.items())[:10]:
    print(paths)