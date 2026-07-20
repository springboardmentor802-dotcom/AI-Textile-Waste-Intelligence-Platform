import pandas as pd

# Load dataset
df = pd.read_csv("datasets/fabric_quality_dataset.csv")

print("Original Shape:", df.shape)

# Remove duplicate rows
df = df.drop_duplicates()

print("After Removing Duplicates:", df.shape)

# Fill missing values in numerical columns
numerical_columns = df.select_dtypes(include=["float64", "int64"]).columns

for column in numerical_columns:
    df[column] = df[column].fillna(df[column].median())

# Fill missing values in categorical columns
categorical_columns = df.select_dtypes(include=["object"]).columns

for column in categorical_columns:
    df[column] = df[column].fillna(df[column].mode()[0])

print("\nMissing Values After Cleaning:")
print(df.isnull().sum())

# Save cleaned dataset
df.to_csv("datasets/fabric_quality_dataset_cleaned.csv", index=False)

print("\n✅ Cleaned dataset saved successfully!")