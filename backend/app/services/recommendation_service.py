import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[3]

MATERIAL_PATH = BASE_DIR / "models" / "material_properties.json"


with open(MATERIAL_PATH, "r") as file:
    material_properties = json.load(file)



def get_recommendation(predicted_class):

    """
    Fetch recyclability recommendation
    based on predicted fabric class.
    """


    # Convert prediction to string
    predicted_class = str(predicted_class).strip()


    # Handle cases like:
    # class_001
    # 1
    # 001.png

    if "_" in predicted_class:

        predicted_class = predicted_class.split("_")[-1]


    if "." in predicted_class:

        predicted_class = predicted_class.split(".")[0]


    # Convert 1 -> 001

    if predicted_class.isdigit():

        predicted_class = predicted_class.zfill(3)



    print("FINAL CLASS USED:", predicted_class)



    material = material_properties.get(predicted_class)



    if material is None:

        return {

            "material": "Unknown",

            "type": "Unknown",

            "recyclable_method": "Not Available",

            "environmental_impact": "Unknown",

            "biodegradable": False,

            "reusable": False

        }



    return {


        "material": material["material"],


        "type": material["material_type"],


        "recyclable_method": material["recycling_method"],


        "environmental_impact": material["environmental_impact"],


        "biodegradable": material["biodegradable"],


        "reusable": material["reusable"]

    }