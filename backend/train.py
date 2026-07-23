from ultralytics import YOLO

model = YOLO("yolov8n-cls.pt")

model.train(
    data="datasets/Fabric_data-LAPTOP-3QGF9V05",
    epochs=20,
    imgsz=224,
    batch=16,
    name="fabric_classifier"
)