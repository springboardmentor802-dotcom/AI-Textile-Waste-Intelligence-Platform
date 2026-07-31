from predict import predict_image
from predict_defect import predict_defect

print("=" * 60)
print("      AI TEXTILE WASTE ANALYSIS PLATFORM")
print("=" * 60)

image_path = input("Enter image path: ").strip().strip('"')

# -----------------------------
# Material Prediction
# -----------------------------
material_class, fabric, material_conf = predict_image(image_path)

# -----------------------------
# Defect Prediction
# -----------------------------
defect_result, defect_conf = predict_defect(image_path)

# -----------------------------
# Final Report
# -----------------------------
print("\n" + "=" * 60)
print("           TEXTILE ANALYSIS REPORT")
print("=" * 60)

print(f"Class ID             : {material_class}")
print(f"Surface Type         : {fabric['surface']}")
print(f"Estimated Material   : {fabric['material']}")

print()

print(f"Defect Status        : {defect_result}")
print(f"Defect Confidence    : {defect_conf:.2f}%")

print()

print(f"Recyclability        : {fabric['recyclability']}")
print(f"Recommended Reuse    : {fabric['reuse']}")

print()

print(f"Material Confidence  : {material_conf:.2f}%")

print("=" * 60)