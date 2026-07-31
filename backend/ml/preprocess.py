import os
from PIL import Image
from torch.utils.data import Dataset

class FabricDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.transform = transform
        self.images = []
        self.labels = []

        folders = sorted(os.listdir(root_dir))

        for label, folder in enumerate(folders):
            folder_path = os.path.join(root_dir, folder)

            if not os.path.isdir(folder_path):
                continue

            for file in os.listdir(folder_path):
                if file.lower().endswith(".png"):
                    self.images.append(os.path.join(folder_path, file))
                    self.labels.append(label)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        image = Image.open(self.images[idx]).convert("RGB")

        if self.transform:
            image = self.transform(image)

        return image, self.labels[idx]