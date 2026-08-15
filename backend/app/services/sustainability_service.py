"""
Business rules for Milestone 3
Sustainability and Circular Economy Intelligence
"""


def generate_sustainability(material: str, defect: str):

    material = (material or "").strip().lower()
    defect = (defect or "").strip().lower()

    # ---------------------------------------------------------
    # DEFAULT VALUES
    # ---------------------------------------------------------

    data = {
        "sustainability_score": 75,

        # Categorical values
        "environmental_impact": "Medium",
        "carbon_footprint": "Medium",
        "water_consumption": "Medium",

        # Numeric indices
        # Environmental Impact:
        # Higher = greater environmental burden
        "environmental_impact_score": 60,

        # Carbon Footprint:
        # Higher = greater carbon burden
        "carbon_footprint_score": 60,

        # Water Consumption:
        # Higher = greater water consumption
        "water_consumption_score": 60,

        # Recyclability:
        # Higher = better recyclability
        "recyclability_score": 50,

        "recycling_recommendation": "General Textile Recycling",
        "circular_economy": "Reuse whenever possible",
        "eco_rating": "★★★☆☆",

        # Circular Economy
        "circular_pathway": "Reuse → Textile Recycling",
        "reuse_potential": "Medium",
        "circular_score": 70,
        "processing_method": "Textile Recycling",
        "environmental_benefit": "Medium",

        "circular_reason": (
            "The textile can be reused or recycled depending on "
            "its material composition and physical condition."
        ),
    }

    # ---------------------------------------------------------
    # 001 - POLYESTER CANVAS
    # ---------------------------------------------------------

    if "polyester canvas" in material:

        data.update({
            "sustainability_score": 72,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "High",
            "carbon_footprint_score": 85,

            "water_consumption": "Low",
            "water_consumption_score": 25,

            "recyclability_score": 60,

            "recycling_recommendation": "Polyester Fiber Recovery",
            "circular_economy": "Industrial Reuse and Fiber Recovery",
            "eco_rating": "★★★☆☆",

            "circular_pathway": (
                "Industrial Reuse → Fiber Recovery → Recycled Polyester"
            ),

            "reuse_potential": "Medium",
            "circular_score": 76,
            "processing_method": "Polyester Fiber Recovery",
            "environmental_benefit": "Medium",

            "circular_reason": (
                "Polyester canvas can be reused for industrial products "
                "and processed for polyester fiber recovery."
            ),
        })

    # ---------------------------------------------------------
    # 002 - COTTON POPLIN
    # ---------------------------------------------------------

    elif "cotton poplin" in material:

        data.update({
            "sustainability_score": 92,

            "environmental_impact": "Low",
            "environmental_impact_score": 30,

            "carbon_footprint": "Low",
            "carbon_footprint_score": 35,

            "water_consumption": "High",
            "water_consumption_score": 85,

            "recyclability_score": 90,

            "recycling_recommendation": "Mechanical Cotton Recycling",
            "circular_economy": "Reuse and Recycled Yarn Production",
            "eco_rating": "★★★★★",

            "circular_pathway": (
                "Reuse → Mechanical Recycling → Recycled Cotton Yarn"
            ),

            "reuse_potential": "High",
            "circular_score": 91,
            "processing_method": "Mechanical Fiber Recovery",
            "environmental_benefit": "High",

            "circular_reason": (
                "Cotton poplin can be reused as cleaning material or "
                "processed into recycled cotton yarn and insulation."
            ),
        })

    # ---------------------------------------------------------
    # 003 - COTTON TWILL
    # ---------------------------------------------------------

    elif "cotton twill" in material:

        data.update({
            "sustainability_score": 92,

            "environmental_impact": "Low",
            "environmental_impact_score": 30,

            "carbon_footprint": "Low",
            "carbon_footprint_score": 35,

            "water_consumption": "High",
            "water_consumption_score": 85,

            "recyclability_score": 90,

            "recycling_recommendation": "Mechanical Cotton Recycling",
            "circular_economy": "Fiber Recovery and Recycled Yarn",
            "eco_rating": "★★★★★",

            "circular_pathway": (
                "Reuse → Fiber Recovery → Recycled Cotton Products"
            ),

            "reuse_potential": "High",
            "circular_score": 92,
            "processing_method": "Mechanical Fiber Recovery",
            "environmental_benefit": "High",

            "circular_reason": (
                "Cotton twill has strong reuse and recycling potential "
                "and can be converted into recycled yarn or insulation."
            ),
        })

    # ---------------------------------------------------------
    # 004 - POLYESTER TWILL
    # ---------------------------------------------------------

    elif "polyester twill" in material:

        data.update({
            "sustainability_score": 70,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "High",
            "carbon_footprint_score": 85,

            "water_consumption": "Low",
            "water_consumption_score": 25,

            "recyclability_score": 60,

            "recycling_recommendation": "Polyester Fiber Recovery",
            "circular_economy": "Fiber Recovery and Textile Reuse",
            "eco_rating": "★★★☆☆",

            "circular_pathway": (
                "Reuse → Polyester Recovery → Recycled Textile"
            ),

            "reuse_potential": "Medium",
            "circular_score": 78,
            "processing_method": "Polyester Fiber Recovery",
            "environmental_benefit": "Medium",

            "circular_reason": (
                "Polyester twill can be recovered into polyester fibers "
                "and reused in bags, upholstery and textile products."
            ),
        })

    # ---------------------------------------------------------
    # 005 - JACQUARD FABRIC
    # ---------------------------------------------------------

    elif material == "jacquard fabric":

        data.update({
            "sustainability_score": 78,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "Medium",
            "carbon_footprint_score": 60,

            "water_consumption": "Medium",
            "water_consumption_score": 60,

            "recyclability_score": 60,

            "recycling_recommendation": "Textile Upcycling",
            "circular_economy": "Home Furnishing Reuse and Upcycling",
            "eco_rating": "★★★☆☆",

            "circular_pathway": (
                "Reuse → Upcycling → Home Furnishing Products"
            ),

            "reuse_potential": "High",
            "circular_score": 82,
            "processing_method": "Upcycling / Textile Recovery",
            "environmental_benefit": "High",

            "circular_reason": (
                "Jacquard fabric can be repurposed for home furnishings, "
                "cushion covers and decorative textile products."
            ),
        })

    # ---------------------------------------------------------
    # 006 - COTTON SHIRTING FABRIC
    # ---------------------------------------------------------

    elif "cotton shirting" in material:

        data.update({
            "sustainability_score": 92,

            "environmental_impact": "Low",
            "environmental_impact_score": 30,

            "carbon_footprint": "Low",
            "carbon_footprint_score": 35,

            "water_consumption": "High",
            "water_consumption_score": 85,

            "recyclability_score": 90,

            "recycling_recommendation": "Cotton Textile Recycling",
            "circular_economy": "Reuse, Quilting and Recycled Yarn",
            "eco_rating": "★★★★★",

            "circular_pathway": (
                "Reuse → Upcycling → Recycled Cotton Yarn"
            ),

            "reuse_potential": "High",
            "circular_score": 90,
            "processing_method": "Mechanical Cotton Recycling",
            "environmental_benefit": "High",

            "circular_reason": (
                "Cotton shirting fabric can be reused as cleaning cloths, "
                "quilting material or converted into recycled yarn."
            ),
        })

    # ---------------------------------------------------------
    # 007 - DENIM HEAVY COTTON TWILL
    # ---------------------------------------------------------

    elif "denim" in material and "heavy cotton" in material:

        data.update({
            "sustainability_score": 88,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "Medium",
            "carbon_footprint_score": 60,

            "water_consumption": "High",
            "water_consumption_score": 85,

            "recyclability_score": 90,

            "recycling_recommendation": "Denim Upcycling",
            "circular_economy": "Denim Upcycling and Fiber Recovery",
            "eco_rating": "★★★★☆",

            "circular_pathway": (
                "Reuse → Denim Upcycling → Fiber Recovery"
            ),

            "reuse_potential": "High",
            "circular_score": 90,
            "processing_method": "Denim Upcycling / Fiber Recovery",
            "environmental_benefit": "High",

            "circular_reason": (
                "Heavy denim can be converted into bags, insulation "
                "and other recycled denim products."
            ),
        })

    # ---------------------------------------------------------
    # 008 - POLYESTER JERSEY KNIT
    # ---------------------------------------------------------

    elif "polyester jersey" in material:

        data.update({
            "sustainability_score": 70,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "High",
            "carbon_footprint_score": 85,

            "water_consumption": "Low",
            "water_consumption_score": 25,

            "recyclability_score": 60,

            "recycling_recommendation": "Polyester Fiber Recovery",
            "circular_economy": "Fiber Recovery and Recycled Textiles",
            "eco_rating": "★★★☆☆",

            "circular_pathway": (
                "Reuse → Fiber Recovery → Recycled Polyester Textile"
            ),

            "reuse_potential": "Medium",
            "circular_score": 80,
            "processing_method": "Polyester Fiber Recovery",
            "environmental_benefit": "Medium",

            "circular_reason": (
                "Polyester jersey can be recovered for sportswear fibers, "
                "stuffing and other recycled textile applications."
            ),
        })

    # ---------------------------------------------------------
    # 009 - DENIM INDIGO TWILL
    # ---------------------------------------------------------

    elif "denim" in material and "indigo" in material:

        data.update({
            "sustainability_score": 88,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "Medium",
            "carbon_footprint_score": 60,

            "water_consumption": "High",
            "water_consumption_score": 85,

            "recyclability_score": 90,

            "recycling_recommendation": "Denim Upcycling",
            "circular_economy": "Fashion Accessory Upcycling",
            "eco_rating": "★★★★☆",

            "circular_pathway": (
                "Reuse → Fashion Upcycling → Recycled Denim"
            ),

            "reuse_potential": "High",
            "circular_score": 89,
            "processing_method": "Denim Upcycling / Fiber Recovery",
            "environmental_benefit": "High",

            "circular_reason": (
                "Indigo denim can be transformed into fashion accessories, "
                "insulation and recycled denim products."
            ),
        })

    # ---------------------------------------------------------
    # 010 - JACQUARD UPHOLSTERY FABRIC
    # ---------------------------------------------------------

    elif "jacquard upholstery" in material:

        data.update({
            "sustainability_score": 80,

            "environmental_impact": "Medium",
            "environmental_impact_score": 60,

            "carbon_footprint": "Medium",
            "carbon_footprint_score": 60,

            "water_consumption": "Medium",
            "water_consumption_score": 60,

            "recyclability_score": 60,

            "recycling_recommendation": "Upholstery Reuse",
            "circular_economy": "Furniture and Decorative Product Reuse",
            "eco_rating": "★★★★☆",

            "circular_pathway": (
                "Reuse → Furniture Upholstery → Decorative Products"
            ),

            "reuse_potential": "High",
            "circular_score": 84,
            "processing_method": "Upholstery Reuse / Upcycling",
            "environmental_benefit": "High",

            "circular_reason": (
                "Jacquard upholstery fabric can be reused for furniture, "
                "cushions and decorative products, extending its material life."
            ),
        })

    # ---------------------------------------------------------
    # DEFECT IMPACT
    # ---------------------------------------------------------

    if "defect" in defect and "no" not in defect:

        # Defective material loses sustainability potential
        data["sustainability_score"] = max(
            50,
            data["sustainability_score"] - 10
        )

        data["circular_score"] = max(
            50,
            data["circular_score"] - 10
        )

        # Defect reduces direct reuse potential
        data["reuse_potential"] = "Medium"

        data["circular_economy"] = (
            "Secondary Product Recovery"
        )

        data["circular_pathway"] = (
            "Defective Textile → Secondary Product → Recycling"
        )

        data["environmental_benefit"] = "Medium"

        data["circular_reason"] = (
            "The detected textile has a defect, which may reduce its "
            "direct reuse potential. Secondary product recovery or "
            "recycling is therefore recommended."
        )

    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return data