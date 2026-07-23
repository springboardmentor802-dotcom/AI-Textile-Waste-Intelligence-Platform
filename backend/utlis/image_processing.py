import cv2

# Disable OpenCV internal multithreading to avoid GIL/thread pool deadlocks with FastAPI/Uvicorn
cv2.setNumThreads(0)

def read_image(image_path):
    image = cv2.imread(image_path)

    if image is None:
        return None

    height, width, channels = image.shape

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    mean_brightness = gray.mean()

    return {
        "width": width,
        "height": height,
        "channels": channels,
        "brightness": round(float(mean_brightness), 2)
    }