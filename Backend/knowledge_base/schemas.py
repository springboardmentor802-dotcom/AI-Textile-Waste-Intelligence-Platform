"""
Pydantic schemas for the Material Knowledge Base (v1.1).

DESIGN NOTE - why nested models instead of one flat model:
--------------------------------------------------------
The Material Knowledge Base JSON has two natural sub-objects: `scores`
(the four weighted-scoring-model inputs) and `recovery_metrics` (the
dashboard-facing environmental savings figures). We model these as their
own Pydantic classes (`Scores`, `RecoveryMetrics`) rather than flattening
everything into MaterialKnowledge, for four concrete reasons:

1. Mirrors the JSON exactly. The JSON already nests these as objects -
   a flat model would require flattening/re-nesting logic every time we
   serialize back to JSON or return an API response, which is wasted
   work and a source of bugs.
2. Reusability. `Scores` is the exact input shape the Waste Scoring
   Engine's weighted formula consumes, and `RecoveryMetrics` is the
   exact shape the Sustainability Dashboard renders. Both can be
   imported and reused directly by those modules instead of every
   consumer re-picking four fields out of a 20-field object.
3. Independent validation and evolution. Score bounds (0-100) and
   recovery-metric units are logically distinct concerns from the raw
   LCA production values. Keeping them in their own classes means we
   can add validators or new sub-fields to one group without touching
   the other, and IDE autocomplete on `material.scores.` only shows
   scoring fields instead of the entire 20-field object.
4. Readability at the call site. `material.scores.material_recyclability`
   and `material.recovery_metrics.estimated_co2_saved_kg` are
   self-documenting; a flat `material.material_recyclability_score`-style
   naming scheme gets unwieldy fast once you have two groups of four
   similarly-shaped fields.

PYDANTIC VERSION NOTE:
-----------------------
This project uses Pydantic v2 (confirmed: 2.13.x). We therefore use
`model_config = ConfigDict(...)` on every model instead of the old
Pydantic v1 `class Config:` inner class. Key differences if you're
coming from v1:
  - v1: `class Config: schema_extra = {...}`
    v2: `model_config = ConfigDict(json_schema_extra={...})`
  - v1: `class Config: orm_mode = True`
    v2: `model_config = ConfigDict(from_attributes=True)`
  - v1 config is a plain inner class; v2 config is a typed dict-like
    object (`ConfigDict`), which gives better static-typing support in
    editors and catches typo'd config keys earlier.
We don't need `from_attributes` here since we're always constructing
these models from plain dicts (`MaterialKnowledge(**entry)`), not ORM
objects - but it's noted above in case you later map these onto
SQLAlchemy rows.
"""

from typing import List, Optional
from typing_extensions import Literal

from pydantic import BaseModel, ConfigDict, Field

# ---------------------------------------------------------------------------
# Closed-vocabulary types
# ---------------------------------------------------------------------------
# These mirror the fixed vocabularies defined in the project document and
# validated during knowledge-base construction. Using Literal (rather than
# plain `str`) means FastAPI/OpenAPI docs show the exact allowed values,
# and a typo'd value anywhere upstream fails validation immediately instead
# of silently reaching the frontend.
#
# fabric_class is intentionally left as `str` rather than a Literal of the
# current 17 classes - if the Fabric Classification model is retrained
# with an 18th class, the knowledge base and this schema should not
# require a code change just to accept it (see "future-proofing" below).

RecyclabilityType = Literal["mechanical", "chemical", "limited", "unknown"]
ReusePotential = Literal["low", "medium", "high", "unknown"]
BlendComplexity = Literal["low", "medium", "high", "n/a", "unknown"]

MaterialType = Literal[
    "Natural Fiber",
    "Synthetic Fiber",
    "Semi-Synthetic Fiber",
    "Animal-Based Material",
    "Mixed Fiber",
    "Unknown",
]

WasteCategory = Literal[
    "Recyclable Textile Waste",
    "Reusable Textile Waste",
    "Repairable Textile Waste",
    "Upcyclable Textile Waste",
    "Compostable Textile Waste",
    "Hazardous Textile Waste",
    # Special case emitted only for the "Unclassified" fabric_class entry,
    # where no confident waste-category assignment can be made.
    "Unknown - Requires Manual Classification",
]

RecommendedAction = Literal[
    "Fiber Recycling",
    "Mechanical Recycling",
    "Chemical Recycling",
    "Fabric Reuse",
    "Upcycling",
    "Donation",
    "Industrial Recovery",
]


# ---------------------------------------------------------------------------
# Nested model: Scores
# ---------------------------------------------------------------------------
class Scores(BaseModel):
    """
    The four weighted inputs to the project's Circularity Score formula
    (Waste Scoring Engine, Milestone 3 Module 9):

        circularity_score =
            material_recyclability * 0.35 +
            material_condition     * 0.20 +   # (from defect detection, not here)
            reuse_score             * 0.20 +
            environmental_benefit   * 0.15 +
            processing_feasibility  * 0.10

    All four fields are on a common 0-100 scale so they can be combined
    directly by the scoring formula without extra normalization.

    All fields are Optional[int] because the "Unclassified" fabric_class
    entry deliberately carries null scores - assigning a numeric
    sustainability score to a material the classifier couldn't identify
    would be misleading, so downstream engines must explicitly check for
    None here and route the item to manual review instead of scoring it.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "material_recyclability": 85,
                "reuse_score": 75,
                "environmental_benefit": 62,
                "processing_feasibility": 85,
            }
        }
    )

    material_recyclability: Optional[int] = Field(
        default=None, ge=0, le=100,
        description="How readily this material can be recycled with existing infrastructure (0-100).",
    )
    reuse_score: Optional[int] = Field(
        default=None, ge=0, le=100,
        description="How suitable this material is for direct reuse/resale as-is (0-100).",
    )
    environmental_benefit: Optional[int] = Field(
        default=None, ge=0, le=100,
        description="Relative avoided-impact benefit of recovering this material vs. producing it new (0-100).",
    )
    processing_feasibility: Optional[int] = Field(
        default=None, ge=0, le=100,
        description="Practical ease of processing this material with current recycling infrastructure (0-100).",
    )


# ---------------------------------------------------------------------------
# Nested model: RecoveryMetrics
# ---------------------------------------------------------------------------
class RecoveryMetrics(BaseModel):
    """
    UI-facing, per-kilogram environmental savings estimates, shown on the
    Sustainability Dashboard and the Prediction page's Environmental
    Impact card.

    These are derived (in the knowledge base build step) from the raw
    production-stage LCA fields (`co2_per_kg`, `water_per_kg`,
    `energy_per_kg`) scaled by this material's recovery/processing
    scores - they represent what is realistically *recoverable*, not the
    full theoretical production footprint. See `sustainability_notes` on
    the parent `MaterialKnowledge` object for the reasoning behind a
    specific material's figures.

    All fields are Optional[float] for the same reason as `Scores`: the
    "Unclassified" entry has no reliable material identity to estimate
    savings from, so these are left null rather than guessed.
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "estimated_co2_saved_kg": 4.67,
                "estimated_water_saved_liters": 2295.0,
                "estimated_energy_saved_mj": 46.8,
                "estimated_landfill_diversion_kg": 0.93,
            }
        }
    )

    estimated_co2_saved_kg: Optional[float] = Field(
        default=None, ge=0,
        description="Estimated CO2-equivalent (kg) saved per kg of this material recovered rather than landfilled.",
    )
    estimated_water_saved_liters: Optional[float] = Field(
        default=None, ge=0,
        description="Estimated water (liters) saved per kg of this material recovered rather than landfilled.",
    )
    estimated_energy_saved_mj: Optional[float] = Field(
        default=None, ge=0,
        description="Estimated energy (MJ) saved per kg of this material recovered rather than landfilled.",
    )
    estimated_landfill_diversion_kg: Optional[float] = Field(
        default=None, ge=0,
        description="Estimated weight (kg) actually diverted from landfill per kg processed, adjusted for processing feasibility.",
    )


# ---------------------------------------------------------------------------
# Top-level model: MaterialKnowledge
# ---------------------------------------------------------------------------
class MaterialKnowledge(BaseModel):
    """
    Full Material Knowledge Base entry for a single fabric class.

    This is the schema returned by `knowledge_base.loader.get_material()`
    and mirrors `material_knowledge_seed.json` (v1.1) field-for-field:
    the original v1.0 production-stage LCA fields, plus every Milestone 3
    enrichment field (material_type, waste_category, common_uses,
    recommended_actions, scores, material_description,
    sustainability_notes, recovery_metrics).

    Usage:
        material = get_material("Cotton")
        material.material_type                          # "Natural Fiber"
        material.scores.material_recyclability           # 85
        material.recovery_metrics.estimated_co2_saved_kg # 4.67
        material.recommended_actions                     # [...]
        material.common_uses                              # [...]
    """

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "fabric_class": "Cotton",
                "material_type": "Natural Fiber",
                "waste_category": "Recyclable Textile Waste",
                "biodegradable": True,
                "decompose_time_years": "0.2-0.5",
                "co2_per_kg": 5.5,
                "water_per_kg": 2700,
                "energy_per_kg": 55,
                "recyclability_type": "mechanical",
                "recycling_method": "Shred and reprocess into new yarn (mechanical recycling).",
                "reuse_potential": "high",
                "landfill_impact_score": 3,
                "blend_complexity": "low",
                "notes": "Natural fiber, compostable in undyed/untreated form.",
                "common_uses": ["T-Shirts", "Bedsheets", "Towels", "Casual Wear"],
                "recommended_actions": [
                    "Fiber Recycling", "Mechanical Recycling", "Fabric Reuse", "Donation"
                ],
                "scores": {
                    "material_recyclability": 85,
                    "reuse_score": 75,
                    "environmental_benefit": 62,
                    "processing_feasibility": 85,
                },
                "material_description": (
                    "Cotton is one of the most widely used natural fibers in the world, "
                    "valued for its softness, breathability, and versatility across "
                    "garments and home textiles. It has a mature, well-established "
                    "recycling and reuse ecosystem."
                ),
                "sustainability_notes": (
                    "Cotton scores high across all four metrics due to its natural "
                    "biodegradability, established mechanical recycling infrastructure, "
                    "and strong secondhand market. Its main environmental cost is high "
                    "water usage during cultivation, which recovery pathways help offset."
                ),
                "recovery_metrics": {
                    "estimated_co2_saved_kg": 4.67,
                    "estimated_water_saved_liters": 2295.0,
                    "estimated_energy_saved_mj": 46.8,
                    "estimated_landfill_diversion_kg": 0.93,
                },
            }
        }
    )

    # --- Identity ---
    fabric_class: str = Field(
        description="The fabric class name as predicted by the Fabric Classification model "
        "(currently one of 17 classes; left as `str` rather than a closed Literal so a "
        "retrained classifier can introduce new classes without a schema change)."
    )
    material_type: MaterialType = Field(
        description="Broad material family, e.g. Natural Fiber, Synthetic Fiber, Animal-Based Material."
    )
    waste_category: WasteCategory = Field(
        description="Primary end-of-life waste category from the project's 6-category taxonomy."
    )

    # --- Original v1.0 production-stage LCA fields (unchanged) ---
    biodegradable: Optional[bool] = Field(
        default=None,
        description="Whether the material biodegrades naturally. Null for Unclassified.",
    )
    decompose_time_years: str = Field(
        description="Approximate natural decomposition time range, in years (or 'unknown')."
    )
    co2_per_kg: Optional[float] = Field(
        default=None, ge=0,
        description="kg CO2-equivalent emitted per kg of fabric produced. Null for Unclassified.",
    )
    water_per_kg: Optional[float] = Field(
        default=None, ge=0,
        description="Liters of water consumed per kg of fabric produced. Null for Unclassified.",
    )
    energy_per_kg: Optional[float] = Field(
        default=None, ge=0,
        description="MJ of energy consumed per kg of fabric produced. Null for Unclassified.",
    )
    recyclability_type: RecyclabilityType = Field(
        description="Dominant recycling pathway: mechanical, chemical, limited, or unknown."
    )
    recycling_method: str = Field(
        description="Human-readable description of how this material is typically recycled/recovered."
    )
    reuse_potential: ReusePotential = Field(
        description="Qualitative suitability for direct reuse: low, medium, high, or unknown."
    )
    landfill_impact_score: int = Field(
        ge=1, le=10,
        description="Relative landfill impact severity if not recovered (1 = low impact, 10 = high impact).",
    )
    blend_complexity: BlendComplexity = Field(
        description="How much fiber-blending complicates recycling: low, medium, high, n/a, or unknown."
    )
    notes: str = Field(
        description="Original free-text assumptions/caveats recorded when this entry was built."
    )

    # --- Milestone 3 enrichment fields ---
    common_uses: List[str] = Field(
        description="3-5 common real-world applications of this material, for frontend display."
    )
    recommended_actions: List[RecommendedAction] = Field(
        default_factory=list,
        description="Recommended recycling/recovery actions, drawn only from the project's "
        "7-option recycling taxonomy. Empty for Unclassified.",
    )
    scores: Scores = Field(
        description="Nested 0-100 scoring inputs consumed by the Waste Scoring Engine's "
        "circularity-score formula."
    )
    material_description: str = Field(
        description="Short 2-3 sentence description of the material, suitable for the "
        "React frontend's material info panel."
    )
    sustainability_notes: str = Field(
        description="Short explanation of why this material received its particular scores."
    )
    recovery_metrics: RecoveryMetrics = Field(
        description="Nested UI-facing environmental recovery estimates for the Sustainability Dashboard."
    )