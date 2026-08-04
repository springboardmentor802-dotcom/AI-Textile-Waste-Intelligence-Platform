import os
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "fabric_quality_model.pkl")
ENCODER_DIR = os.path.join(BASE_DIR, "..", "ml", "encoders")

files = [
    MODEL_PATH,
    os.path.join(ENCODER_DIR, "fabric_type_encoder.pkl"),
    os.path.join(ENCODER_DIR, "weave_type_encoder.pkl"),
    os.path.join(ENCODER_DIR, "finish_type_encoder.pkl"),
    os.path.join(ENCODER_DIR, "production_method_encoder.pkl"),
    os.path.join(ENCODER_DIR, "warehouse_id_encoder.pkl"),
    os.path.join(ENCODER_DIR, "operator_name_encoder.pkl"),
    os.path.join(ENCODER_DIR, "inspection_shift_encoder.pkl"),
    os.path.join(ENCODER_DIR, "inspection_notes_encoder.pkl"),
    os.path.join(ENCODER_DIR, "fabric_quality_encoder.pkl"),
]

for file in files:
    print(f"\nLoading: {file}")
    try:
        joblib.load(file)
        print("✅ Loaded successfully")
    except Exception as e:
        print("❌ ERROR:", e)