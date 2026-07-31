from preprocess import FabricDataset

dataset = FabricDataset("../../datasets/TenFabrics")

print("Total Images :", len(dataset))
print("Total Classes:", len(set(dataset.labels)))

image, label = dataset[0]

print("Image Size:", image.size)
print("Label:", label)