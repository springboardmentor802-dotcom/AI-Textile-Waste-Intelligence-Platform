import os

# Print current working directory to see where Python is looking
print("Python is currently looking in:", os.getcwd())

# List all folders in the current directory to see if 'Fabric_data' is there
print("Folders in current directory:", [d for d in os.listdir('.') if os.path.isdir(d)])

# Check the specific folder
train_path = 'Fabric_data/train'

if os.path.exists(train_path):
    print("Folder found!")
else:
    print("Still not found. Please look at the lists above to see where 'Fabric_data' really is.")