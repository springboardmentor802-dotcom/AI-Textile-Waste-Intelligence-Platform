import io
import pandas as pd

def generate_excel_report(records: list) -> io.BytesIO:
    """Generates an Excel spreadsheet report from inventory records."""
    output = io.BytesIO()
    if records:
        df = pd.DataFrame(records)
    else:
        df = pd.DataFrame([{"Message": "No inventory records available"}])
    
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name="Sustainability Report")
    
    output.seek(0)
    return output

def generate_pdf_text_summary(records: list) -> io.BytesIO:
    """Generates a simple text summary report from inventory records."""
    output = io.BytesIO()
    content = "=" * 60 + "\n"
    content += "        TEXTILE SUSTAINABILITY INVENTORY REPORT        \n"
    content += "=" * 60 + "\n\n"
    
    for idx, rec in enumerate(records, 1):
        content += f"{idx}. Batch ID: {rec.get('batch_id', 'N/A')}\n"
        content += f"   • Fabric Type: {rec.get('fabric_type', 'N/A')}\n"
        content += f"   • Quantity: {rec.get('quantity', 0)} Kg\n"
        content += f"   • Condition: {rec.get('condition', 'N/A')}\n"
        content += f"   • Status: {rec.get('status', 'Active')}\n\n"
        
    output.write(content.encode('utf-8'))
    output.seek(0)
    return output

def generate_multi_engine_pdf_report(batch_id: str, results: dict) -> io.BytesIO:
    """Generates a complete Multi-Engine Textile Intelligence Report."""
    output = io.BytesIO()
    
    header = "=" * 70 + "\n"
    header += "      AI TEXTILE WASTE INTELLIGENCE PLATFORM - COMPREHENSIVE REPORT    \n"
    header += "=" * 70 + "\n"
    header += f"Batch Reference ID: {batch_id}\n"
    header += "-" * 70 + "\n\n"
    
    content = header
    
    engines = [
        ("1. TEXTILE IMAGE ANALYSIS ENGINE", results.get("image_analysis_engine", {})),
        ("2. MATERIAL CLASSIFICATION ENGINE", results.get("material_classification_engine", {})),
        ("3. TEXTILE WASTE CLASSIFICATION ENGINE", results.get("waste_classification_engine", {})),
        ("4. RECYCLING RECOMMENDATION ENGINE", results.get("recycling_recommendation_engine", {})),
        ("5. SUSTAINABILITY INTELLIGENCE ENGINE", results.get("sustainability_intelligence_engine", {})),
        ("6. ENVIRONMENTAL IMPACT ASSESSMENT ENGINE", results.get("environmental_impact_engine", {})),
        ("7. WASTE SCORING ENGINE (5-TIER WEIGHTED MODEL)", results.get("waste_scoring_engine", {}))
    ]
    
    for title, engine_data in engines:
        content += f"[{title}]\n"
        if isinstance(engine_data, dict):
            for key, val in engine_data.items():
                formatted_key = key.replace("_", " ").title()
                content += f"  • {formatted_key}: {val}\n"
        content += "\n" + "-" * 70 + "\n\n"
        
    output.write(content.encode('utf-8'))
    output.seek(0)
    return output