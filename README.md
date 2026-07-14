###AI Textile Waste Intelligence Platform (SorTex)

This project is a comprehensive, AI-powered platform designed to revolutionize textile recycling. By integrating computer vision and data analytics, the platform automates textile sorting, tracks waste diversion, and facilitates a circular economy between recycling facilitators and manufacturers.

##Project Status: Milestone 1 Completed
##Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup

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

##Tech Stack

Frontend: React, Next.js, Tailwind CSS, Lucide Icons

Backend: Python, FastAPI, Motor (Async MongoDB), JWT/Bcrypt

Database: MongoDB Atlas

##Local Development Setup
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

