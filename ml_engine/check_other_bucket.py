import json
from pathlib import Path
from collections import Counter

BASE_DIR = Path(__file__).resolve().parent
root = BASE_DIR / "datasets" / "deepfashion"
cat_cloth_path = root / "Anno" / "list_category_cloth.txt"
cat_img_path = root / "Anno" / "list_category_img.txt"

with open(BASE_DIR / "taxonomy.json") as f:
    taxonomy = json.load(f)
valid_labels = taxonomy["garment_type"]

from data_preprocessing import _closest_label

id_to_name = {}
with open(cat_cloth_path, "r") as f:
    lines = f.readlines()[2:]
    for idx, line in enumerate(lines, start=1):
        id_to_name[idx] = line.split()[0]

raw_counts = Counter()
with open(cat_img_path, "r") as f:
    for line in f.readlines()[2:]:
        img_name, cat_id = line.split()
        name = id_to_name.get(int(cat_id), "Unknown")
        if _closest_label(name, valid_labels) == "Other":
            raw_counts[name] += 1

print("=== 'Other'-bucket raw categories, by image count ===")
for name, count in raw_counts.most_common():
    print(f"{count:>8}  {name}")