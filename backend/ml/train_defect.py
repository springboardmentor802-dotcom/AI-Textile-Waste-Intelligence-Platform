import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import models

from defect_preprocess import DefectDataset
from ml.config import DEVICE

# -----------------------------
# Dataset Paths
# -----------------------------
DEFECT_DIR = "../../datasets/AITEX/Defect_images"
NO_DEFECT_DIR = "../../datasets/AITEX/NODefect_images"

# -----------------------------
# Hyperparameters
# -----------------------------
BATCH_SIZE = 16
EPOCHS = 10
LEARNING_RATE = 0.001
NUM_CLASSES = 2

# -----------------------------
# Load Dataset
# -----------------------------
dataset = DefectDataset(
    defect_dir=DEFECT_DIR,
    no_defect_dir=NO_DEFECT_DIR
)

print(f"Total Images : {len(dataset)}")

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size]
)

print(f"Training Images : {len(train_dataset)}")
print(f"Validation Images : {len(val_dataset)}")

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)

# -----------------------------
# Load ResNet18
# -----------------------------
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Linear(model.fc.in_features, NUM_CLASSES)

model = model.to(DEVICE)

# -----------------------------
# Loss & Optimizer
# -----------------------------
criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.fc.parameters(),
    lr=LEARNING_RATE
)

# -----------------------------
# Training
# -----------------------------
best_acc = 0

for epoch in range(EPOCHS):

    model.train()

    running_loss = 0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    train_acc = 100 * correct / total

    # -------------------------
    # Validation
    # -------------------------
    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)

            val_correct += (predicted == labels).sum().item()

    val_acc = 100 * val_correct / val_total

    print(
        f"Epoch [{epoch+1}/{EPOCHS}] | "
        f"Loss: {running_loss:.4f} | "
        f"Train Acc: {train_acc:.2f}% | "
        f"Val Acc: {val_acc:.2f}%"
    )

    if val_acc > best_acc:

        best_acc = val_acc

        torch.save(
            model.state_dict(),
            "../models/defect_model.pth"
        )

print("\nTraining Completed!")
print(f"Best Validation Accuracy : {best_acc:.2f}%")
print("Model saved as ../models/defect_model.pth")