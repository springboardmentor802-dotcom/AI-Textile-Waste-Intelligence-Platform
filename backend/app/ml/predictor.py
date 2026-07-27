import torch

from .image_preprocessing import preprocess_image
from .response_builder import build_response
from .class_names import CLASS_NAMES


def predict(model, image):

    image = preprocess_image(image)

    with torch.no_grad():

        outputs = model(image)

        probabilities = torch.softmax(outputs, dim=1)

        # confidence, prediction = torch.max(probabilities, 1)
        top_probs, top_indices = torch.topk(probabilities, k=6)

        print("\nTop Predictions")
        print("-" * 40)

        for prob, idx in zip(top_probs[0], top_indices[0]):
            print(
                f"{CLASS_NAMES[idx]} : {prob.item()*100:.2f}%"
            )

        confidence, prediction = torch.max(probabilities, 1)

    fabric_type = CLASS_NAMES[prediction.item()]

    confidence = confidence.item() * 100

    return build_response(
        fabric_type,
        confidence
    )