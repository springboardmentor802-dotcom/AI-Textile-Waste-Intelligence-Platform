import os
import sys
import cv2

# Ye line encoding issues ko handle karegi
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# 1. Path setup
current_dir = os.getcwd()
data_folder = 'Fabric_data-LAPTOP-3QGF9V05'
train_path = os.path.join(current_dir, data_folder, 'train')

# 2. Path dhoondhne ka logic
if not os.path.exists(train_path):
    for root, dirs, files in os.walk(current_dir):
        if data_folder in dirs:
            train_path = os.path.join(root, data_folder, 'train')
            break

# 3. Processing function
def prepare_data_for_ai(base_path):
    print("\n--- Analysing and Preparing Images for AI ---")
    categories = ['cotton', 'silk', 'wool']
    
    for category in categories:
        cat_path = os.path.join(base_path, category)
        if os.path.exists(cat_path):
            count = 0
            for img_name in os.listdir(cat_path):
                img_path = os.path.join(cat_path, img_name)
                
                # Image read aur resize
                img = cv2.imread(img_path)
                if img is not None:
                    processed_img = cv2.resize(img, (128, 128))
                    count += 1
            print(f"Class: {category} | Processed: {count} images")
    print("--- Preparation Complete! ---")

# 4. Execute
if os.path.exists(train_path):
    print(f"\n--- SUCCESS: Data Path Mil Gaya! ---")
    prepare_data_for_ai(train_path)
else:
    print("\n[!] ERROR: Data folder nahi mila!")