import cv2
import numpy as np
import uuid

from pathlib import Path



def analyze_condition(image_path):

    """
    OpenCV based textile condition,
    defect detection and contamination analysis.
    """


    image = cv2.imread(str(image_path))


    if image is None:

        return {

            "condition": "Unknown",
            "defect": "None Detected",
            "severity": "Low",
            "contamination": "Low",
            "affected_area": 0,
            "defect_regions": [],
            "visualization": None

        }



    original = image.copy()


    height, width = image.shape[:2]

    total_area = height * width



    # ==================================================
    # DEFECT / DAMAGE DETECTION
    # ==================================================


    gray = cv2.cvtColor(

        original,

        cv2.COLOR_BGR2GRAY

    )


    blur = cv2.GaussianBlur(

        gray,

        (7,7),

        0

    )



    # Edge detection

    edges = cv2.Canny(

        blur,

        50,

        150

    )



    # Remove small textile patterns

    kernel = np.ones(

        (5,5),

        np.uint8

    )


    edges = cv2.morphologyEx(

        edges,

        cv2.MORPH_CLOSE,

        kernel

    )


    edges = cv2.dilate(

        edges,

        kernel,

        iterations=1

    )



    contours,_ = cv2.findContours(

        edges,

        cv2.RETR_EXTERNAL,

        cv2.CHAIN_APPROX_SIMPLE

    )



    defect_area = 0

    defect_regions = []



    for contour in contours:


        area = cv2.contourArea(contour)


        x,y,w,h = cv2.boundingRect(contour)



        # Ignore normal fabric weave

        if (

            area > 300

            and

            w > 20

            and

            h > 20

        ):


            defect_area += area



            defect_regions.append({

                "x": int(x),

                "y": int(y),

                "width": int(w),

                "height": int(h)

            })



            cv2.rectangle(

                image,

                (x,y),

                (x+w,y+h),

                (0,0,255),

                2

            )





    defect_percentage = (

        defect_area /

        total_area

    ) * 100





    # Defect Classification


    if defect_percentage < 0.8:


        defect = "None Detected"

        severity = "Low"



    elif defect_percentage < 3:


        defect = "Minor Fabric Damage"

        severity = "Medium"



    else:


        defect = "Fabric Tear"

        severity = "High"





    # ==================================================
    # CONTAMINATION ANALYSIS
    # ==================================================


    hsv = cv2.cvtColor(

        original,

        cv2.COLOR_BGR2HSV

    )



    dark_mask = cv2.inRange(

        hsv,

        np.array([0,0,0]),

        np.array([180,100,70])

    )



    dark_pixels = np.sum(

        dark_mask > 0

    )



    dark_ratio = (

        dark_pixels /

        total_area

    ) * 100





    if dark_ratio < 10:


        contamination = "Low"



    elif dark_ratio < 25:


        contamination = "Medium"



    else:


        contamination = "High"







    # ==================================================
    # FINAL CONDITION DECISION
    # ==================================================


    if (

        defect == "None Detected"

        and

        contamination == "Low"

    ):


        condition = "Good"



    elif (

        defect == "Minor Fabric Damage"

        or

        contamination == "Medium"

    ):


        condition = "Average"



    else:


        condition = "Poor"







    # ==================================================
    # SAVE VISUALIZATION
    # ==================================================


    output_folder = Path(

        "temp_uploads"

    )


    output_folder.mkdir(

        exist_ok=True

    )



    filename = (

        f"defect_analysis_{uuid.uuid4().hex}.png"

    )



    output_path = (

        output_folder /

        filename

    )



    cv2.imwrite(

        str(output_path),

        image

    )







    return {


        "condition": condition,


        "defect": defect,


        "severity": severity,


        "contamination": contamination,


        "affected_area": round(

            defect_percentage,

            2

        ),


        "defect_regions": defect_regions,


        "visualization":

            "/" + str(output_path).replace("\\","/")

    }