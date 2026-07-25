# AI Textile Waste Intelligence Platform (SorTex)

This project is a comprehensive, AI-powered platform designed to revolutionize textile recycling. By integrating computer vision and data analytics, the platform automates textile sorting, tracks waste diversion, and facilitates a circular economy between recycling facilitators and manufacturers.

## Project Status: Milestone 2 Completed

## Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup

The foundational architecture, database schemas, role-based access control (RBAC), and dataset integrations have been successfully established.

Completed Tasks & Features:

Define Project Objectives & Workflows: Outlined the core user journeys for textile waste intelligence, from sorting to reporting.

Design System Architecture & Database Schema: Designed a highly scalable NoSQL schema (MongoDB) optimized for embedded role details and flexible textile composition arrays.

UI Wireframes & Workflow Planning: Mapped out the user experience for various stakeholders.

Environment Setup: Successfully initialized the Next.js frontend and FastAPI backend environments.

Authentication & Role-Based Access (RBAC): Implemented secure JWT authentication with dedicated, dynamic dashboard views for Admins, Recycling Facilitators, Sustainability Managers, and Manufacturers.

Textile Inventory Management: Built a fully functional REST API (FastAPI + MongoDB) and React UI to track, add, and manage textile waste batches.

Dataset Integration & Mapping: Core datasets have been identified, mapped, and integrated to power the upcoming Computer Vision engine:

DeepFashion & Fashion-MNIST: Garment recognition and clothing classification.

TIPS & Fabric Image Dataset (Kaggle): Fabric texture recognition and material composition classification.

Sustainable Fashion Dataset: Waste categorization and recycling recommendation logic.

## Milestone 2: Week 3 & 4 — Material Recognition & Waste Classification

The computer vision engine was brought online, turning the datasets integrated in Milestone 1 into working classification and recyclability-scoring pipelines, and surfaced through a dedicated Recycling Facility Dashboard.

Completed Tasks & Features:

Implement Textile Image Analysis Engine: Built the core computer vision pipeline for processing uploaded garment/fabric images, including garment type, material type, color, texture, and pattern analysis.

Build Material Classification Workflows: Developed end-to-end workflows to classify fabric composition (e.g. Cotton, Polyester, Denim, Wool, Silk, Nylon, etc.) from image input, both for single scans and batch uploads.

Develop Waste Categorization Models: Implemented waste condition classification (Reusable, Repairable, Upcyclable, Recyclable, Compostable, Hazardous, Degraded) to drive downstream sorting decisions.

Create Recyclability Assessment Systems: Built a weighted circularity scoring system (recyclability, condition, reuse, sustainability, and material recovery scores) that outputs a circularity score, category, and recommended recycling pathway (e.g. Donation, Mechanical Recycling, Chemical Recycling, Fiber Recycling, Upcycling, Industrial Recovery) for every batch.

Generate Waste Classification Reports: Added exportable PDF and Excel reporting for individual scans, batches, and full scan history.

Outcomes:

Material classification engine operational, supporting both single-image and multi-image (up to 30 files) batch analysis.

Waste categorization workflows functional, with condition-aware recycling pathway recommendations.

Recyclability assessment completed, with a component-level score breakdown (recyclability, reuse, sustainability, material recovery) and an overall circularity score/category per batch.

Recycling Facility Dashboard delivered, including:

- Waste Inventory — register, search, filter, and manage textile waste batches.
- Recycling Opportunities — AI-powered image analysis for new and existing batches, with detailed per-scan breakdowns.
- Processing Analytics — recommended recycling process and recyclability score per registered batch.
- Recovery Statistics — circularity outlook, recovered weight by pathway, and per-batch sustainability/material recovery metrics.

Scan history and batch/individual PDF & Excel report exports.

## Tech Stack

Frontend: React, Next.js, Tailwind CSS, Lucide Icons

Backend: Python, FastAPI, Motor (Async MongoDB), JWT/Bcrypt

Database: MongoDB Atlas

### Local Development Setup
Prerequisites

Node.js (v18+)

Python (3.10+)

MongoDB Atlas Account

1. Backend Setup (FastAPI)

Navigate to the backend directory and set up your Python environment:

cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn motor pydantic bcrypt pyjwt python-dotenv certifi

Create a .env file in the backend directory:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_here

Start the backend server:
uvicorn main:app --reload
The API will be available at http://localhost:8000

2. Frontend Setup (Next.js)

Navigate to the frontend directory:

cd frontend/sortex
npm install

Create a .env.local file in the frontend/sortex directory:
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

Start the development server:
npm run dev
The dashboard will be available at http://localhost:3000