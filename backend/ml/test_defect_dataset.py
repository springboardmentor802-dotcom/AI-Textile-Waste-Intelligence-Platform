from defect_preprocess import DefectDataset

dataset = DefectDataset(
    defect_dir="../../datasets/AITEX/Defect_images",
    no_defect_dir="../../datasets/AITEX/NODefect_images"
)

print("Total Images :", len(dataset))

image, label = dataset[0]

print("Image Shape :", image.shape)
print("Label :", label)

# Count labels
defect = 0
no_defect = 0

for _, label in dataset:
    if label == 1:
        defect += 1
    else:
        no_defect += 1

print("Defect Images :", defect)
print("No Defect Images :", no_defect)