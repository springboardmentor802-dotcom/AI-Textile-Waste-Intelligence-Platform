import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent
DATASETS_DIR = BASE_DIR / "datasets"
OUTPUT_DIR = BASE_DIR / "eda_outputs"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

DATASETS = [
    "garment_dataset.csv",
    "material_dataset.csv",
    "waste_dataset.csv"
]

def perform_eda():
    print("="*50)
    print("STARTING EXPLORATORY DATA ANALYSIS (EDA)")
    print("="*50)

    for csv_file in DATASETS:
        csv_path = DATASETS_DIR / csv_file
        
        if not csv_path.exists():
            print(f"Skipping {csv_file} - File not found.")
            continue
            
        print(f"\nAnalyzing: {csv_file}")
        print("-" * 30)
        
        df = pd.read_csv(csv_path)
        
        total_images = len(df)
        print(f"Total Images: {total_images}")
        print(f"Missing Values:\n{df.isnull().sum().to_string()}")
        
        split_counts = df['split'].value_counts()
        print(f"\nData Split Distribution:")
        for split, count in split_counts.items():
            print(f" - {split}: {count} images ({(count/total_images)*100:.1f}%)")
            
        plt.figure(figsize=(10, 6))
        sns.set_theme(style="whitegrid")
        
        ax = sns.countplot(
            data=df, 
            y="label", 
            hue="split", 
            order=df['label'].value_counts().index,
            palette="Set2"
        )
        
        task_name = csv_file.split('_')[0].title()
        plt.title(f"Class Distribution: {task_name} Dataset", fontsize=16, fontweight='bold')
        plt.xlabel("Number of Images", fontsize=12)
        plt.ylabel("Categories", fontsize=12)
        plt.tight_layout()
        
        save_path = OUTPUT_DIR / f"{task_name}_EDA_Distribution.png"
        plt.savefig(save_path, dpi=300)
        plt.close()
        
        print(f"Saved distribution chart to: {save_path.name}")

    print("\n" + "="*50)
    print("EDA COMPLETE! Check the 'eda_outputs' folder for your graphs.")
    print("="*50)

if __name__ == "__main__":
    perform_eda()