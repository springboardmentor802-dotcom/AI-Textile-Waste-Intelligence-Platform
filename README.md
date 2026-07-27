# AI Textile Waste Intelligence Platform

An AI-powered web application that classifies textile fabrics and provides sustainability recommendations to promote textile waste management and recycling.

## Overview

The AI Textile Waste Intelligence Platform helps users identify different fabric types using computer vision and generates intelligent recommendations for reuse, recycling, and environmental impact. The platform supports multi-image analysis and downloadable PDF reports, making it useful for textile industries, recycling centres, researchers, and sustainability initiatives.

---

## Features

- User Authentication
- Inventory Management
- AI-based Fabric Classification
- Multiple Image Upload Support
- Fabric Analysis Report Generation
- Sustainability Recommendations
- Environmental Impact Information
- Recycling Method Suggestions
- Downloadable PDF Reports
- Responsive User Interface

---

## Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- jsPDF

### Backend

- FastAPI
- Python
- MongoDB

### Artificial Intelligence

- PyTorch
- EfficientNet-B0
- TorchVision
- PIL (Pillow)

---

## Project Structure

```
AI_Textile_Waste_Management_System/

│
├── frontend/
│
├── backend/
│   ├── app/
│   ├── api/
│   ├── ml/
│   └── models/
│
├── ai_models/
│   ├── notebooks/
│   ├── datasets/
│   └── models/
│
└── README.md
```

---

## AI Workflow

1. Upload one or multiple fabric images.
2. Images are preprocessed.
3. EfficientNet-B0 predicts the fabric category.
4. AI generates:
   - Fabric Type
   - Confidence Score
   - Quality
   - Reusability
   - Recyclability
   - Recycling Method
   - Environmental Impact
   - Recommended Products
5. Reports are displayed.
6. Reports can be downloaded as PDF.

---

## Supported Fabric Categories

- Cotton
- Linen
- Silk
- Wool
- Hessian
- Abaca

---

## Machine Learning

Model Used:

- EfficientNet-B0 (Transfer Learning)

Training Framework:

- PyTorch

Image Size:

- 224 × 224

Loss Function:

- CrossEntropyLoss

Optimizer:

- AdamW

Transfer Learning Strategy:

- ImageNet Pretrained Weights
- Fine-tuning of the final EfficientNet feature block
- Custom classification head

---

## Current Performance

- Validation Accuracy: **97.8%**
- Multi-image prediction supported
- Real-time inference using FastAPI
- Individual PDF report generation

---

## Future Improvements

- Train using larger real-world textile datasets (e.g. TextileNet)
- Improve performance on unconstrained mobile-phone images
- Support additional fabric categories
- Fabric region detection before classification
- AI-powered defect detection
- Sustainability analytics dashboard

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Contributors

- Anuja Sawant

---

## License

Academic Project
