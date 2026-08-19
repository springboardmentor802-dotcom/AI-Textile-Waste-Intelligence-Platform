import pandas as pd
df = pd.read_csv("datasets/waste_dataset.csv")
print(df["label"].value_counts())