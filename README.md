# AI Textile Waste Intelligence Platform

## Infosys Springboard Internship Project

### Individual Contribution - Sreevarshini-140

---

# Project Overview

The AI Textile Waste Intelligence Platform is a smart waste management system designed to analyze, classify, and manage textile waste using web technologies and AI-based solutions.

The platform enables textile industries, recyclers, NGOs, and administrators to manage textile inventory, upload waste information, and generate future AI-driven recommendations.

---

# Work Completed

# Frontend Development

- Set up frontend development environment using React and Vite.
- Created scalable application structure with reusable components.
- Implemented:
  - Navbar
  - Sidebar
  - Dashboard Cards
  - Tables
  - Layout components

## Developed Frontend Pages

- Login
- Dashboard
- Inventory
- Upload Waste
- Analytics
- Recommendations
- Profile
- Settings

## Frontend Features

- Implemented React Router navigation.
- Created protected routes.
- Designed responsive dashboard layout.
- Developed authentication workflow.
- Integrated application navigation structure.

---

# Backend Development

## FastAPI Backend Setup

- Created backend architecture using Python FastAPI.
- Configured backend dependencies and requirements.
- Implemented SQLAlchemy ORM integration.
- Connected backend with MySQL database.

---

# Database Implementation

Implemented database structure for:

- Users
- Textile Inventory
- Waste Uploads
- Recommendations

Created SQLAlchemy models for managing application data.

---

# Authentication and Security

Implemented secure JWT-based authentication system.

Features:

- User login authentication.
- Password hashing using bcrypt.
- Password verification.
- JWT token generation.
- OAuth2 password flow integration.
- Protected backend APIs using Bearer token authentication.

Secured APIs:

- Inventory APIs
- Waste Upload APIs
- Recommendation APIs

Authentication flow:
React Login Page
|
↓
FastAPI Authentication API
|
↓
User Verification
|
↓
JWT Token Generation
|
↓
Protected API Access


---

# AI / Machine Learning Development

# Milestone 1: Dataset Preparation and Exploratory Data Analysis

The Ten Fabrics Dataset (TFD) was selected for textile material recognition and classification.

## Dataset Details

- Dataset Name: Ten Fabrics Dataset (TFD)
- Dataset Type: Image Classification Dataset
- Total Images: 2969
- Number of Classes: 10
- Image Format: PNG
- Image Type: RGB Images

## Fabric Classes
001
002
003
004
005
006
007
008
009
010


## Exploratory Data Analysis Completed

- Verified dataset folder structure.
- Analyzed class distribution.
- Checked image dimensions.
- Verified missing values.
- Checked duplicate images.
- Prepared dataset for machine learning development.

---

# Milestone 2: Material Recognition and Waste Classification

## Image Preprocessing Pipeline

Implemented an image preprocessing pipeline using TensorFlow.

## Completed Preprocessing Steps

- Loaded textile image dataset.
- Converted images into RGB format.
- Resized images to 224 × 224 pixels.
- Normalized pixel values between 0 and 1.
- Encoded fabric class labels.
- Split dataset into training, validation, and testing sets.
- Created TensorFlow data pipelines.

## Dataset Split

| Dataset | Images |
|---------|--------|
| Training | 2078 |
| Validation | 445 |
| Testing | 446 |

## Preprocessing Configuration

json
{
    "image_size": [224, 224],
    "normalization": "pixel values scaled between 0 and 1",
    "batch_size": 32
}
CNN-Based Fabric Classification Model

Developed a Convolutional Neural Network (CNN) model for textile material recognition.

Model Architecture
Input Image
(224 × 224 × 3)

        ↓

Conv2D Layers

        ↓

Max Pooling Layers

        ↓

Feature Extraction

        ↓

Dense Classification Layer

        ↓

Softmax Output

        ↓

10 Fabric Classes
Model Configuration
Framework: TensorFlow / Keras
Input Size: 224 × 224 RGB Images
Number of Classes: 10
Total Parameters: 11.17 Million
Model Format: Keras (.keras)
Model Performance Evaluation

The trained CNN model was evaluated using the unseen test dataset.

Performance Results
Metric	Score
Test Accuracy	100%
Precision	1.00
Recall	1.00
F1-Score	1.00
Test Images Evaluated	446
Evaluation Methods
Training accuracy and loss curves.
Classification report.
Confusion matrix analysis.

The confusion matrix showed no misclassification between the ten fabric categories.

Model Artifacts

Generated AI model files:

models/

├── preprocessing_config.json
├── fabric_classifier.keras
└── fabric_classifier_best.keras

Large model files are managed using Git Large File Storage (Git LFS).
