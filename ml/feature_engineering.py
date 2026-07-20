import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load cleaned dataset
df = pd.read_csv("datasets/fabric_quality_dataset_cleaned.csv")

print("Dataset Loaded Successfully!")
print("Shape:", df.shape)

# Find categorical columns
categorical_columns = df.select_dtypes(include=["object", "string"]).columns

print("\nCategorical Columns:")
print(categorical_columns)

# Label Encoding
label_encoders = {}

for column in categorical_columns:
    encoder = LabelEncoder()
    df[column] = encoder.fit_transform(df[column])
    label_encoders[column] = encoder

print("\nEncoding Completed Successfully!")

# Save encoded dataset
df.to_csv("datasets/fabric_quality_dataset_encoded.csv", index=False)

print("\nEncoded dataset saved successfully!")