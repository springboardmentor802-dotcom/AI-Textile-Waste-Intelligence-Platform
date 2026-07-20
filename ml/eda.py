import pandas as pd

# Load dataset
df = pd.read_csv("datasets/fabric_quality_dataset.csv")

print("========== DATASET LOADED ==========")

# First 5 rows
print("\n1. First 5 Rows:")
print(df.head())

# Shape
print("\n2. Shape:")
print(df.shape)

# Column Names
print("\n3. Columns:")
print(df.columns)

# Dataset Information
print("\n4. Dataset Info:")
df.info()

# Statistical Summary
print("\n5. Statistical Summary:")
print(df.describe())

# Missing Values
print("\n6. Missing Values:")
print(df.isnull().sum())

# Duplicate Rows
print("\n7. Duplicate Rows:")
print(df.duplicated().sum())

# Target Column Distribution
print("\n8. Fabric Quality Distribution:")
print(df["fabric_quality"].value_counts())