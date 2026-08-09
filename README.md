# AI Textile Waste Intelligence Platform

An AI-powered web application for textile fabric classification, defect detection, and sustainability recommendations to support textile waste management, reuse, and recycling.

---

## Overview

The AI Textile Waste Intelligence Platform analyzes textile images using computer vision and provides intelligent insights for textile waste management.

The platform is designed to:

- Identify textile fabric types
- Detect fabric defects
- Assess reusability and recyclability
- Recommend suitable recycling or reuse methods
- Provide sustainability and environmental impact information
- Generate analysis reports

The system combines deep learning models with a recommendation engine to transform textile image analysis into actionable waste-management recommendations.

---

## Features

### Current Features

- User Authentication
- Inventory Management
- AI-based Fabric Classification
- AI-based Fabric Defect Classification
- Multiple Image Upload Support
- Fabric Analysis
- Confidence Score Generation
- Classification Reports and Confusion Matrix
- Sustainability Recommendation Framework
- Environmental Impact Information
- Recycling Method Suggestions
- Downloadable PDF Reports
- Responsive User Interface

### In Development

- FastAPI integration for AI models
- Combined fabric + defect prediction API
- Recommendation engine integration
- React frontend integration with AI services
- End-to-end textile analysis workflow

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
- TorchVision
- EfficientNet-B0
- Transfer Learning
- PIL (Pillow)
- NumPy
- Scikit-learn
- Matplotlib

---
### The planned end-to-end AI workflow is:
              Upload Fabric Image
                      │
                      ▼
             Image Preprocessing
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
 Fabric Classification      Defect Classification
          │                       │
          └───────────┬───────────┘
                      ▼
            Recommendation Engine
                      │
                      ▼
          Sustainability Analysis
                      │
                      ▼
               User Dashboard
                      │
                      ▼
                PDF Report
                
## Project Structure

```text
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
│   ├── datasets/
│   │   ├── fabric_defect/
│   │   ├── processed/
│   │   ├── raw/
│   │   └── split/
│   │
│   ├── models/
│   │   ├── fabric_classifier.pth
│   │   ├── material_classifier.pth
│   │   ├── fabric_defect_best.pth
│   │   ├── defect_classifier.pth
│   │   └── test_model.pth
│   │
│   ├── notebooks/
│   │   ├── 01_EDA.ipynb
│   │   ├── 02_Model_Training.ipynb
│   │   ├── 03_Defect_Classification.ipynb
│   │   └── model_evaluation.ipynb
│   │
│   ├── outputs/
│   ├── defect_classifier.py
│   └── requirements.txt
│
└── README.md

Supported Fabric Categories

The fabric classification module currently supports:

Cotton
Linen
Silk
Wool
Hessian
Abaca

The material classification model is trained on a biodegradable-fabric dataset. Further real-world image collection is planned to improve generalization to unseen images and mobile-phone photographs.

Fabric Defect Classification

A separate deep learning model has been developed for fabric defect classification.

Model
EfficientNet-B0
ImageNet pretrained weights
Transfer Learning
PyTorch
TorchVision
Input
Image size: 224 × 224
RGB images
Defect Classes

The current dataset contains 9 classes:

Broken stitch
Needle mark
Pinched fabric
Vertical
Defect free
Hole
Horizontal
Lines
Stain
Dataset Distribution
Class	Images
Broken stitch	112
Needle mark	108
Pinched fabric	108
Vertical	101
Defect free	1666
Hole	281
Horizontal	136
Lines	157
Stain	398
Total	3067

The dataset is class-imbalanced, with defect free containing substantially more samples than several defect categories. Class weighting was therefore incorporated during training.

Defect Classification Performance

The EfficientNet-B0 defect classifier achieved:

Test Accuracy: 90%
Macro F1-score: 0.82
Weighted F1-score: 0.90
Classification Results
Class	Precision	Recall	F1-Score
Broken stitch	0.76	0.94	0.84
Needle mark	0.93	0.88	0.90
Pinched fabric	0.88	0.88	0.88
Vertical	0.64	0.93	0.76
Defect free	1.00	0.96	0.98
Hole	0.95	0.43	0.59
Horizontal	0.52	0.81	0.63
Lines	0.77	0.96	0.85
Stain	0.92	0.98	0.95

The model currently performs particularly well on defect free, stain, lines, broken stitch, and needle mark. Performance on hole and horizontal requires further improvement.

Machine Learning
Material Classification
Model
EfficientNet-B0
ImageNet pretrained weights
Transfer Learning
Custom classification head
Training
Image Size: 224 × 224
Loss Function: CrossEntropyLoss
Optimizer: AdamW
Data Augmentation:
Random Horizontal Flip
Random Rotation
Color Jitter
Image Normalization using ImageNet statistics
Current Result
Validation Accuracy: 97.8%

Further real-world image collection is planned because performance on unseen images can differ significantly from validation performance.

Defect Classification
Model
EfficientNet-B0
ImageNet pretrained weights
Custom 9-class classification head
Training
Image Size: 224 × 224
Loss Function: CrossEntropyLoss
Optimizer: AdamW
Class-weighted training
Data Augmentation:
Random Horizontal Flip
Random Rotation
Color Jitter
ImageNet normalization
Result
Test Accuracy: 90%
Macro F1-score: 0.82
Weighted F1-score: 0.90
Model Inference

The trained defect classification model has been converted into a reusable Python inference module:
ai_models/
└── defect_classifier.py

Future Improvements
Collect more real-world fabric images
Improve material classification on unseen/mobile-phone images
Balance defect-class distribution
Improve hole and horizontal defect classification
Fine-tune models using additional real-world data
Add fabric region detection
Add defect localization using object detection
Integrate AI models with FastAPI
Integrate recommendation engine with prediction pipeline
Add sustainability analytics dashboard
Support additional textile categories
Improve report generation and visualization
Installation
Clone Repository
git clone <repository-url>
cd AI_textile_waste_management_system
AI Models
cd ai_models

pip install -r requirements.txt
Backend
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
Frontend
cd frontend

npm install

npm run dev
Hardware

The AI models were trained locally using NVIDIA GPU acceleration.

Current development environment:

GPU: NVIDIA GeForce RTX 3050 Laptop GPU
CUDA-enabled PyTorch
Python 3.13
Contributors
Anuja Sawant
License

Academic Project
