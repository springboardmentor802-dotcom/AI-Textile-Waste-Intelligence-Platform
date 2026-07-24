def assess_textile_condition(
    material,
    condition,
    defect,
    contamination
):


    # Contamination priority
    if contamination == "High":

        return {

            "condition": condition,

            "final_decision":
            "Specialized Processing",

            "reason":
            "High contamination requires controlled treatment"

        }




    # Delicate materials

    if material in ["Silk", "Wool"]:

        if condition == "Poor":

            return {

                "condition":condition,

                "final_decision":
                "Specialized Processing",

                "reason":
                "Delicate fiber with poor condition requires specialized recovery"

            }





    # Reuse case

    if (
        condition=="Good"
        and
        defect=="None Detected"
    ):

        return {

            "condition":condition,

            "final_decision":
            "Reuse",

            "reason":
            "Good quality textile suitable for direct reuse"

        }





    # Recycling case

    if defect in [
        "Fabric Tear",
        "Minor Fabric Damage"
    ]:

        return {

            "condition":condition,

            "final_decision":
            "Recycle",

            "reason":
            "Fabric damage prevents direct reuse, recycling recommended"

        }






    # Blended fabrics

    if material=="Blended Fabric":

        return {

            "condition":condition,

            "final_decision":
            "Recycle",

            "reason":
            "Mixed fiber composition requires recycling separation"

        }





    return {

        "condition":condition,

        "final_decision":
        "Recycle",

        "reason":
        "Material recovery recommended"

    }