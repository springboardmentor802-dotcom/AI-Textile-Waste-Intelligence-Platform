def classify_textile(image_info):

    brightness = image_info["brightness"]

    if brightness > 150:
        return {
            "fabric": "Cotton",
            "recyclable": "Yes",
            "reuse": "Can be reused for bags, cleaning cloth, or recycled into yarn."
        }
    else:
        return {
            "fabric": "Polyester",
            "recyclable": "Yes",
            "reuse": "Can be recycled into polyester fiber or insulation material."
        }