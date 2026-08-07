VERSION = "2026-07-v1"

EMISSION_FACTORS = {
    "Cotton":              {"co2e_avoided_per_kg": 5.5,  "water_saved_per_kg": 10000, "landfill_mass_factor": 1.0, "source": "PLACEHOLDER"},
    "Polyester":           {"co2e_avoided_per_kg": 3.8,  "water_saved_per_kg": 200,   "landfill_mass_factor": 1.0, "source": "PLACEHOLDER"},
    "Poly-Cotton Blend":   {"co2e_avoided_per_kg": 4.6,  "water_saved_per_kg": 5100,  "landfill_mass_factor": 1.0, "source": "PLACEHOLDER"},
    "Denim":               {"co2e_avoided_per_kg": 6.0,  "water_saved_per_kg": 11000, "landfill_mass_factor": 1.0, "source": "PLACEHOLDER"},
    "Wool":                {"co2e_avoided_per_kg": 11.0, "water_saved_per_kg": 6000,  "landfill_mass_factor": 0.9, "source": "PLACEHOLDER"},
    "Silk":                {"co2e_avoided_per_kg": 12.0, "water_saved_per_kg": 3000,  "landfill_mass_factor": 0.9, "source": "PLACEHOLDER"},
    "Linen":               {"co2e_avoided_per_kg": 3.0,  "water_saved_per_kg": 3500,  "landfill_mass_factor": 0.95, "source": "PLACEHOLDER"},
    "Viscose":             {"co2e_avoided_per_kg": 3.5,  "water_saved_per_kg": 4000,  "landfill_mass_factor": 0.9, "source": "PLACEHOLDER"},
    "Nylon":               {"co2e_avoided_per_kg": 7.0,  "water_saved_per_kg": 300,   "landfill_mass_factor": 1.0, "source": "PLACEHOLDER"},
    "Leather":             {"co2e_avoided_per_kg": 15.0, "water_saved_per_kg": 15000, "landfill_mass_factor": 0.85, "source": "PLACEHOLDER"},
    "Mixed/Unknown":       {"co2e_avoided_per_kg": 4.0,  "water_saved_per_kg": 3000,  "landfill_mass_factor": 0.95, "source": "PLACEHOLDER"},
}

DEFAULT_FACTOR = EMISSION_FACTORS["Mixed/Unknown"]

PATHWAY_MULTIPLIERS = {
    "Donation": 1.15,              
    "Fabric Reuse": 1.10,
    "Upcycling": 1.0,
    "Mechanical Recycling": 0.75,
    "Chemical Recycling": 0.65,
    "Fiber Recycling": 0.70,
    "Industrial Recovery": 0.30,  
}
DEFAULT_PATHWAY_MULTIPLIER = 0.6

def get_emission_factor(material_label: str) -> dict:
    return EMISSION_FACTORS.get(material_label, DEFAULT_FACTOR)

def get_pathway_multiplier(recycling_option: str) -> float:
    return PATHWAY_MULTIPLIERS.get(recycling_option, DEFAULT_PATHWAY_MULTIPLIER)