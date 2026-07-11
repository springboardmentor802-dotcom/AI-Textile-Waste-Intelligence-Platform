# Database Design

## 1. Users Table

| Field | Type |
|--------|------|
| id | Integer (PK) |
| name | VARCHAR(100) |
| email | VARCHAR(100) |
| password | VARCHAR(255) |
| role | VARCHAR(50) |
| phone | VARCHAR(20) |
| organization | VARCHAR(100) |
| created_at | TIMESTAMP |

## 2. Textile Inventory

| Field | Type |
|--------|------|
| inventory_id | Integer (PK) |
| user_id | Integer (FK) |
| batch_id | VARCHAR(50) |
| fabric_type | VARCHAR(100) |
| source | VARCHAR(100) |
| quantity | FLOAT |
| color | VARCHAR(50) |
| condition | VARCHAR(50) |
| collection_date | DATE |

## 3. Textile Images

| Field | Type |
|--------|------|
| image_id | Integer (PK) |
| inventory_id | Integer (FK) |
| image_path | TEXT |
| uploaded_at | TIMESTAMP |

## 4. Material Classification

| Field | Type |
|--------|------|
| classification_id | Integer (PK) |
| image_id | Integer (FK) |
| predicted_material | VARCHAR(100) |
| confidence | FLOAT |

## 5. Waste Classification

| Field | Type |
|--------|------|
| waste_id | Integer (PK) |
| image_id | Integer (FK) |
| waste_category | VARCHAR(100) |
| recyclability | VARCHAR(50) |
| reuse_potential | VARCHAR(50) |

## 6. Recommendations

| Field | Type |
|--------|------|
| recommendation_id | Integer (PK) |
| waste_id | Integer (FK) |
| recommendation | TEXT |
| recycling_method | VARCHAR(100) |

## 7. Sustainability Metrics

| Field | Type |
|--------|------|
| metric_id | Integer (PK) |
| waste_id | Integer (FK) |
| carbon_saved | FLOAT |
| water_saved | FLOAT |
| circularity_score | FLOAT |

