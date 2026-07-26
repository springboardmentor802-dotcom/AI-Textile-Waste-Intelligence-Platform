export const MATERIAL_TYPE_INFO = {
  Cotton: {
    type: "Natural",
    commonUses: "T-shirts, bedsheets, casual wear",
    description: "A soft, breathable natural fiber harvested from the cotton plant.",
  },
  Blended: {
    type: "Mixed (Natural + Synthetic)",
    commonUses: "Everyday apparel, uniforms",
    description: "A combination of two or more fibers, balancing durability and comfort.",
  },
  Polyester: {
    type: "Synthetic",
    commonUses: "Activewear, outerwear, upholstery",
    description: "A durable synthetic fiber valued for wrinkle resistance and quick drying.",
  },
  Denim: {
    type: "Natural (Cotton Twill)",
    commonUses: "Jeans, jackets, workwear",
    description: "A rugged cotton twill fabric known for its strength and durability.",
  },
  Wool: {
    type: "Natural (Animal Fiber)",
    commonUses: "Sweaters, coats, blankets",
    description: "A warm, insulating fiber sourced from sheep and other animals.",
  },
  Nylon: {
    type: "Synthetic",
    commonUses: "Hosiery, sportswear, outdoor gear",
    description: "A strong, elastic synthetic fiber resistant to abrasion.",
  },
  Silk: {
    type: "Natural (Protein Fiber)",
    commonUses: "Eveningwear, scarves, linings",
    description: "A lustrous natural fiber produced by silkworms, prized for its sheen.",
  },
  Viscose: {
    type: "Semi-Synthetic",
    commonUses: "Dresses, linings, blouses",
    description: "A plant-derived fiber with a soft, silk-like drape.",
  },
  Fleece: {
    type: "Synthetic",
    commonUses: "Jackets, hoodies, blankets",
    description: "A soft, insulating fabric typically made from polyester.",
  },
  Terrycloth: {
    type: "Natural (Cotton Loop Pile)",
    commonUses: "Towels, robes, bath mats",
    description: "An absorbent cotton fabric with a distinctive looped pile texture.",
  },
};

export function getMaterialTypeInfo(material) {
  return (
    MATERIAL_TYPE_INFO[material] || {
      type: "Unknown",
      commonUses: "Not available",
      description: "No description available for this material yet.",
    }
  );
}