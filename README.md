# AI Textile Waste Intelligence Platform

This project is my take on modernizing the textile recycling industry using AI. My goal is to move away from manual sorting and create an automated system that can accurately identify and classify textile waste.

## 🏁 Milestone 1: The Foundation [COMPLETED]
Over the past two weeks, I’ve laid the groundwork for this platform. Here’s what I’ve accomplished so far:

* **Defining the Roadmap:** I started by clearly defining the project's objectives and mapping out how our textile waste intelligence workflows should function.
* **System Design:** I designed the system architecture and database schema to ensure everything is structured and scalable from the start.
* **Environment & Planning:** I have the frontend and backend environments set up and ready, along with the initial UI wireframes for our inventory management system.
* **Data Foundation:** I’ve curated a specialized dataset—focusing on Cotton, Silk, and Wool—and integrated it into the system after verifying that everything loads correctly.

## 🚀 Milestone 2: AI Core & Platform Integration [COMPLETED]
I have successfully built out the core intelligence pipeline and connected the full-stack architecture:

* **AI Model Integration & Classification (100%):** Integrated the YOLO deep learning model to accurately classify fabrics (e.g., Cotton) and output high-precision confidence metrics (up to 99.91%).
* **AI Inspection & Assessment Reporting (100%):** Developed an end-to-end processing pipeline that extracts image attributes (dimensions, channels, brightness) and compiles a detailed inspection report on the frontend dashboard.
* **Recyclability & Reuse Recommendation System (100%):** Automated material recyclability evaluations, providing actionable reuse paths and sustainability guidance based on identified textile types.
* **Platform Optimization & Final Integration (100%):** Established seamless, asynchronous communication between the FastAPI backend and React frontend for an intuitive user experience.
* **AI Validation & Error Handling (40%):** Confidence tracking is operational; active development is underway for strict non-textile image rejection and unknown input boundary checks.

## 🛠️ Tech Stack
* **Language:** Python, JavaScript
* **Backend Framework:** FastAPI
* **Frontend Library:** React
* **AI/ML Core:** YOLO, Deep Learning Pipelines
* **Environment:** VS Code
* **Data Management:** Roboflow Universe & Custom Datasets
* **Version Control:** Git & GitHub
*
