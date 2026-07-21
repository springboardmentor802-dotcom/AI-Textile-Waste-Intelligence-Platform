# AI-Textile-Waste-Intelligence-Platform
Infosys Springboard Internship Project - AI Textile Waste Intelligence Platform

## Day 1 - Project Setup
- Understood project requirements and Milestone 1 objectives.
- Accepted GitHub repository invitation from mentor.
- Cloned the project repository.
- Created personal branch: 24A31A05IZ.
- Set up project folder structure.
- Explored project documentation and architecture.

## Day 2 - Frontend Development
- Created React frontend using Vite.
- Developed Login Module UI.
- Developed Registration Module UI.
- Added Role Selection field.
- Developed Waste Inventory Management form.
- Added fields:
  - Batch ID
  - Fabric Type
  - Source
  - Quantity
  - Color
  - Condition
  - Collection Date
- Tested frontend locally.

## Day 3 - Backend & Database Setup
- Installed Flask.
- Created backend structure.
- Created SQLite database.
- Designed waste_inventory table.
- Added sample textile waste dataset.
- Developed Flask backend application.
- Created Inventory API endpoint (/inventory).
- Successfully connected backend with SQLite database.

## Day 4 - Authentication Development
- Created users table in SQLite database.
- Installed bcrypt library for password hashing.
- Implemented User Registration API (/register).
- Added secure password encryption using bcrypt.
- Successfully stored user details in database.
- Tested registration API successfully.

## Day 5 - Integration & Documentation
- Verified frontend, backend, and database integration.
- Tested inventory data retrieval through API.
- Updated project documentation.
- Maintained GitHub branch with latest commits.
- Pushed authentication updates to GitHub.
- Started preparation for Login API and Role-Based Access Control.

## Day 6 - Frontend Backend Integration

- Connected React frontend with Flask backend APIs.
- Implemented User Registration functionality from frontend.
- Implemented Login functionality from frontend.
- Integrated Waste Inventory Management module with backend.
- Successfully stored inventory records in SQLite database.
- Verified data retrieval through Inventory API endpoint.
- Tested complete frontend → backend → database workflow.
- Fixed CORS issues for React-Flask communication.

## Day 7 - Dashboard Development

- Added Dashboard section to frontend.
- Displayed Total Inventory Records.
- Displayed Total Waste Quantity.
- Displayed Unique Fabric Types.
- Connected dashboard statistics with live inventory data.
- Verified automatic updates when new inventory records are added.
## Day 8 - Inventory Record Deletion

- Implemented Delete Inventory API in Flask.
- Added Delete button for each inventory record.
- Added confirmation popup before deletion.
- Successfully removed records from SQLite database.
- Updated inventory table automatically after deletion.
- Verified dashboard statistics update after record deletion.
## Day 9 - JWT Authentication

- Installed PyJWT library.
- Implemented JWT token generation during login.
- Added token payload with user email and role.
- Configured token expiration.
- Verified JWT token generation successfully.
- Integrated authentication workflow with backend APIs.

## Day 10 - Milestone 2: Dataset Analysis & Data Preprocessing

- Selected the Textile Fabric Quality Classification Dataset.
- Added dataset to the project under the datasets folder.
- Performed Exploratory Data Analysis (EDA) using Pandas.
- Analyzed dataset containing 25,750 records and 23 columns.
- Examined dataset structure, data types, and statistical summary.
- Identified missing values across numerical and categorical features.
- Detected 750 duplicate records in the dataset.
- Analyzed the distribution of the target column (fabric_quality).
- Removed duplicate records from the dataset.
- Filled missing numerical values using the median.
- Filled missing categorical values using the mode.
- Generated a cleaned dataset (`fabric_quality_dataset_cleaned.csv`) for machine learning.
- Created reusable Python scripts:
  - `ml/eda.py`
  - `ml/preprocessing.py`

## Day 11 - Machine Learning Model Development

- Loaded the encoded dataset for machine learning.
- Split the dataset into training (80%) and testing (20%) sets.
- Trained a Random Forest Classifier.
- Evaluated model performance using:
  - Accuracy
  - Classification Report
  - Confusion Matrix
- Achieved approximately **87.70% accuracy** on the test dataset.
- Saved the trained model as `fabric_quality_model.pkl` for backend integration.

## Day 12 - Machine Learning Integration

- Improved the feature engineering pipeline by saving Label Encoders for all categorical features.
- Retrained the Random Forest model using the updated encoded dataset.
- Verified the model performance with approximately **87.70% accuracy**.
- Integrated the trained Machine Learning model into the Flask backend.
- Loaded the saved Label Encoders into the backend.
- Created the initial Prediction API (`/predict`).
- Successfully verified JSON request handling for prediction requests.
- Started backend integration for AI-based fabric quality prediction.
---

## Technologies Used

- React.js
- Vite
- Python
- Flask
- SQLite
- Pandas
- Scikit-learn
- Joblib
- Git
- GitHub
- bcrypt

## Current Progress

Completed:
- Frontend UI Development
- Backend Setup
- SQLite Database Integration
- Waste Inventory API
- User Registration API
- Login API
- Password Hashing (bcrypt)
- JWT Authentication
- Role-Based Authentication
- Frontend Authentication Integration
- Frontend ↔ Backend Integration
- Backend ↔ Database Integration
- Inventory Records Dashboard
- Inventory Records Table
- Inventory Record Deletion
- Dataset Selection
- Exploratory Data Analysis (EDA)
- Data Cleaning & Preprocessing
- Duplicate Record Removal
- Missing Value Handling
- Feature Engineering
- Train-Test Split
- Random Forest Model Training
- Model Evaluation
- Trained Model Generation

Next Phase:
- Implement Prediction Logic
- Connect Prediction API with React Frontend
- End-to-End Testing
- Final Project Integration

## GitHub Branch
24A31A05IZ

## Status

✅ Milestone 1 Completed Successfully

🚀 Milestone 2 Approximately 90% Completed

Completed:
- Dataset Selection
- Exploratory Data Analysis (EDA)
- Data Cleaning & Preprocessing
- Feature Engineering
- Label Encoding
- Saved Label Encoders
- Train-Test Split
- Random Forest Model Training
- Model Evaluation (87.70% Accuracy)
- Trained Model Generation
- Flask Model Integration
- Initial Prediction API

Current Task:
- Implement Prediction Logic
- Connect Prediction API with React Frontend
- End-to-End Testing