import React from "react";
import {
  Layers,
  FileText,
  Shirt,
  FlaskConical,
  Tag,
  FileCheck2,
} from "lucide-react";
import "./MaterialInformationCard.css";

const displayValue = (value, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

const splitCharacteristics = (characteristics) => {
  if (!characteristics) return [];
  if (Array.isArray(characteristics)) return characteristics;
  return String(characteristics)
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const getMaterialTypeClass = (materialType) => {
  if (!materialType) return "";
  const normalized = String(materialType).toLowerCase().replace(/\s+/g, "-");
  return `material-type-${normalized}`;
};

const MaterialInformationCard = ({ materialInformation }) => {
  const info = materialInformation || {};

  const fabricClass = info.fabric_class ?? info.fabricClass;
  const materialType = info.material_type ?? info.materialType;
  const description = info.material_description ?? info.description;
  const commonUses = info.common_uses ?? info.commonUses;

  const uses = Array.isArray(commonUses) ? commonUses : splitCharacteristics(commonUses || [])

  return (
    <section className="mic-card">
      <div className="mic-header">
        <div className="mic-header-icon">
          <Layers size={34} strokeWidth={2} />
        </div>
        <div className="mic-header-text">
          <h2 className="mic-title">Material Information</h2>
            
        </div>
      </div>

      <div className="mic-details-card">
        <div className="mic-section-heading mic-section-heading-green">
          <FileCheck2 size={22} strokeWidth={2} />
          <span>Material Details</span>
        </div>
        <div className="mic-details-grid">
          <div className="mic-details-col">
            <div className="mic-details-label">Fabric Class</div>
            <div className="mic-details-value">{displayValue(fabricClass)}</div>
          </div>
          <div className="mic-details-divider" />
          <div className="mic-details-col">
            <div className="mic-details-label">Material Type</div>
            <div className={`mic-badge ${getMaterialTypeClass(materialType)}`}>
              <FlaskConical size={18} strokeWidth={2} />
              <span>{displayValue(materialType)}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="mic-section">
        <div className="mic-section-heading mic-section-heading-blue-icon">
          <FileText size={22} strokeWidth={2} />
          <span>Description</span>
        </div>
        <div className="mic-content">
          <p className="mic-description">{displayValue(description)}</p>
        </div>
      </section>

      <section className="mic-section">
        <div className="mic-section-heading mic-section-heading-green-icon">
          <Shirt size={22} strokeWidth={2} />
          <span>Common Uses</span>
        </div>
        <div className="mic-content">
          <div className="mic-chips">
            {uses.length > 0 ? (
              uses.map((use, index) => (
                <div className="mic-chip" key={index}>
                  <Tag size={12} />
                  <span>{use}</span>
                </div>
              ))
            ) : (
              <p className="mic-empty">No common uses available.</p>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default MaterialInformationCard;