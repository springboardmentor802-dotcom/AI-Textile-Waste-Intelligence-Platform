import os
from PIL import Image

import torch
from torch.utils.data import Dataset
from torchvision import transforms


class DefectDataset(Dataset):

    def __init__(self, defect_dir, no_defect_dir, image_size=224):

        self.samples = []

        # ----------------------------
        # Defect Images (Label = 1)
        # ----------------------------
        for file in os.listdir(defect_dir):

            if file.lower().endswith((".png", ".jpg", ".jpeg")):

                self.samples.append(
                    (
                        os.path.join(defect_dir, file),
                        1
                    )
                )

        # ----------------------------
        # No Defect Images (Label = 0)
        # ----------------------------
        for root, dirs, files in os.walk(no_defect_dir):

            for file in files:

                if file.lower().endswith((".png", ".jpg", ".jpeg")):

                    self.samples.append(
                        (
                            os.path.join(root, file),
                            0
                        )
                    )

        self.transform = transforms.Compose([
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):

        image_path, label = self.samples[index]

        image = Image.open(image_path).convert("RGB")

        image = self.transform(image)

        return image, label