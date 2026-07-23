import os

# Define the path to the training folder
train_path = 'Fabric_data/train'

# Check if the folder exists and count images in each category
if os.path.exists(train_path):
    categories = os.listdir(train_path)
    print(f"Categories found: {categories}")

    # Loop through each category to count the images
    for category in categories:
        cat_path = os.path.join(train_path, category)
        num_images = len(os.listdir(cat_path))
        print(f"Category '{category}' has {num_images} images.")
else:
    print("Error: 'Fabric_data/train' folder not found. Please check the folder name.")