import sys
import os
import subprocess

def run_master_pipeline():
    print("==========================================================================")
    print("      AI TEXTILE WASTE INTELLIGENCE PLATFORM — MASTER ML PIPELINE")
    print("==========================================================================")

    # Step 1: Preprocessing
    print("\n[STEP 1/4] Executing Dataset Preprocessing Pipeline...")
    res_prep = subprocess.run([sys.executable, "ml_model/preprocessing.py"])
    if res_prep.returncode != 0:
        print("[ERROR] Preprocessing step failed.")
        sys.exit(1)

    # Step 2: Exploratory Data Analysis
    print("\n[STEP 2/4] Executing Exploratory Data Analysis (EDA)...")
    res_eda = subprocess.run([sys.executable, "ml_model/eda_analysis.py"])
    if res_eda.returncode != 0:
        print("[ERROR] EDA step failed.")
        sys.exit(1)

    # Step 3: Model Training & Auto-Selection
    print("\n[STEP 3/4] Executing Model Training & Architecture Benchmarking...")
    res_train = subprocess.run([sys.executable, "ml_model/train.py"])
    if res_train.returncode != 0:
        print("[ERROR] Model Training step failed.")
        sys.exit(1)

    # Step 4: Model Evaluation
    print("\n[STEP 4/4] Executing Model Evaluation & Metrics Generation...")
    res_eval = subprocess.run([sys.executable, "ml_model/evaluate.py"])
    if res_eval.returncode != 0:
        print("[ERROR] Model Evaluation step failed.")
        sys.exit(1)

    print("\n==========================================================================")
    print("  COMPLETE ML PIPELINE EXECUTED SUCCESSFULLY!")
    print("  - Models saved to: models/ & ml_model/")
    print("  - Reports saved to: docs/ & docs/eda/")
    print("==========================================================================")

if __name__ == "__main__":
    run_master_pipeline()
