import pandas as pd
import joblib
import os
from sklearn.preprocessing import LabelEncoder

# Load cleaned dataset
df = pd.read_csv("datasets/fabric_quality_dataset_cleaned.csv")

print("Dataset Loaded Successfully!")
print("Shape:", df.shape)

# Find categorical columns
categorical_columns = df.select_dtypes(include=["object", "string"]).columns

print("\nCategorical Columns:")
print(categorical_columns)

# Create encoders folder
os.makedirs("ml/encoders", exist_ok=True)

# Label Encoding
for column in categorical_columns:
    encoder = LabelEncoder()

    df[column] = encoder.fit_transform(df[column])

    # Save each encoder
    joblib.dump(
        encoder,
        f"ml/encoders/{column}_encoder.pkl"
    )

print("\nEncoding Completed Successfully!")

# Save encoded dataset
df.to_csv(
    "datasets/fabric_quality_dataset_encoded.csv",
    index=False
)

print("\nEncoded dataset saved successfully!")
print("\nEncoders saved successfully!")