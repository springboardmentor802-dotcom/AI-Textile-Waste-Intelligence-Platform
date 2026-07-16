import datetime
from sqlalchemy.orm import Session
from app import models, auth
from app.database import engine, Base, SessionLocal

def seed_database(db: Session):
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)

    # 1. Check if users already exist
    existing_users = db.query(models.User).count()
    if existing_users > 0:
        print("Database already seeded. Skipping.")
        return

    print("Seeding database...")

    # Create Users
    users_to_seed = [
        {
            "email": "admin@textile.com",
            "name": "Alex Admin",
            "organization": "Circular Waste HQ",
            "role": "Administrator",
            "password": "Password123!"
        },
        {
            "email": "operator@textile.com",
            "name": "Rita Recycler",
            "organization": "Green Cycle Recycling",
            "role": "Recycling Facility Operator",
            "password": "Password123!"
        },
        {
            "email": "manager@textile.com",
            "name": "Sam Sustainability",
            "organization": "EcoFashion Alliance",
            "role": "Sustainability Manager",
            "password": "Password123!"
        },
        {
            "email": "manufacturer@textile.com",
            "name": "Manny Manufacturer",
            "organization": "Apex Textiles Inc",
            "role": "Textile Manufacturer",
            "password": "Password123!"
        }
    ]

    db_users = {}
    for u in users_to_seed:
        db_user = models.User(
            email=u["email"],
            name=u["name"],
            organization=u["organization"],
            role=u["role"],
            hashed_password=auth.get_password_hash(u["password"])
        )
        db.add(db_user)
        db.flush()
        db_users[u["role"]] = db_user

    # 2. Seed Dataset Metadata & Sample Records
    datasets = [
        {
            "name": "TIPS (Textile Image Dataset)",
            "description": "High-resolution fabric samples for material classification and texture analysis.",
            "source_url": "https://example.com/datasets/tips",
            "format": "Images",
            "num_records": 1500,
            "status": "Seeded",
            "records": [
                {"label": "Cotton (100%)", "image_url_placeholder": "https://picsum.photos/id/101/400/300", "metadata_json": '{"weave": "plain", "thread_count": 200, "color_space": "RGB"}'},
                {"label": "Polyester Blend", "image_url_placeholder": "https://picsum.photos/id/102/400/300", "metadata_json": '{"weave": "twill", "polyester_percent": 60, "cotton_percent": 40}'}
            ]
        },
        {
            "name": "DeepFashion",
            "description": "Large-scale clothes database containing over 800,000 images with attribute annotations.",
            "source_url": "http://mmlab.ie.cuhk.edu.hk/projects/DeepFashion.html",
            "format": "Images/JSON",
            "num_records": 800000,
            "status": "Placeholder",
            "records": [
                {"label": "Denim Jacket", "image_url_placeholder": "https://picsum.photos/id/103/400/300", "metadata_json": '{"category": "Outwear", "style": "Casual", "fabric": "Denim"}'}
            ]
        },
        {
            "name": "Fashion-MNIST",
            "description": "Dataset of Zalando's article images consisting of a training set of 60,000 examples.",
            "source_url": "https://github.com/zalandoresearch/fashion-mnist",
            "format": "Numpy Arrays",
            "num_records": 70000,
            "status": "Placeholder",
            "records": []
        },
        {
            "name": "Fabric Image Dataset (Kaggle)",
            "description": "Images of fabric patterns and textures designed for classification tasks.",
            "source_url": "https://www.kaggle.com/datasets/fabric-texture",
            "format": "Images",
            "num_records": 3400,
            "status": "Seeded",
            "records": [
                {"label": "Woolen Weave", "image_url_placeholder": "https://picsum.photos/id/104/400/300", "metadata_json": '{"texture": "Coarse", "pattern": "Solid"}'}
            ]
        },
        {
            "name": "Sustainable Fashion Dataset",
            "description": "Environmental impact factors, recyclability indices, and resource usage of common textiles.",
            "source_url": "https://example.com/datasets/sustainable-fashion",
            "format": "CSV",
            "num_records": 500,
            "status": "Seeded",
            "records": [
                {"label": "Organic Linen", "image_url_placeholder": "https://picsum.photos/id/105/400/300", "metadata_json": '{"water_footprint_liters_per_kg": 2500, "co2_savings_kg_per_kg": 4.2, "recyclability_score": 92}'}
            ]
        }
    ]

    for ds in datasets:
        db_ds = models.DatasetMetadata(
            name=ds["name"],
            description=ds["description"],
            source_url=ds["source_url"],
            format=ds["format"],
            num_records=ds["num_records"],
            status=ds["status"]
        )
        db.add(db_ds)
        db.flush()

        for rec in ds["records"]:
            db_rec = models.SampleDatasetRecord(
                dataset_id=db_ds.id,
                label=rec["label"],
                image_url_placeholder=rec["image_url_placeholder"],
                metadata_json=rec["metadata_json"]
            )
            db.add(db_rec)

    # 3. Seed Waste Batches
    batches = [
        {
            "batch_id": "TXT-2026-0001",
            "fabric_type": "Cotton",
            "source": "Apex Textiles Inc",
            "quantity": 450.5,
            "unit": "kg",
            "color": "Off-White",
            "condition": "Clean",
            "collection_date": datetime.date(2026, 7, 5),
            "status": "Pending",
            "notes": "Industrial cotton cuttings, leftover from summer shirt collection.",
            "created_by_id": db_users["Textile Manufacturer"].id
        },
        {
            "batch_id": "TXT-2026-0002",
            "fabric_type": "Denim",
            "source": "Apex Textiles Inc",
            "quantity": 1200.0,
            "unit": "kg",
            "color": "Indigo",
            "condition": "Damaged",
            "collection_date": datetime.date(2026, 7, 8),
            "status": "Sorting",
            "notes": "Post-industrial denim scraps with minor rivets attached. Needs hardware removal.",
            "created_by_id": db_users["Textile Manufacturer"].id
        },
        {
            "batch_id": "TXT-2026-0003",
            "fabric_type": "Polyester",
            "source": "Modern Weaves Co.",
            "quantity": 850.0,
            "unit": "lbs",
            "color": "Neon Green",
            "condition": "Clean",
            "collection_date": datetime.date(2026, 7, 10),
            "status": "Processing",
            "notes": "100% polyester synthetic athletic fabric scraps. Suitable for mechanical chemical recycling.",
            "created_by_id": db_users["Textile Manufacturer"].id
        },
        {
            "batch_id": "TXT-2026-0004",
            "fabric_type": "Mixed Fabrics",
            "source": "EcoFashion Alliance Hub",
            "quantity": 3.2,
            "unit": "tons",
            "color": "Multi",
            "condition": "Contaminated",
            "collection_date": datetime.date(2026, 7, 1),
            "status": "Pending",
            "notes": "Post-consumer clothing donations that failed sorting guidelines. High synthetic composition, contains food stains.",
            "created_by_id": db_users["Administrator"].id
        },
        {
            "batch_id": "TXT-2026-0005",
            "fabric_type": "Wool",
            "source": "Apex Textiles Inc",
            "quantity": 250.0,
            "unit": "kg",
            "color": "Charcoal Grey",
            "condition": "Wet",
            "collection_date": datetime.date(2026, 7, 11),
            "status": "Pending",
            "notes": "Unused raw wool knit scrap batch. Got damp during warehouse transport, needs drying before processing.",
            "created_by_id": db_users["Textile Manufacturer"].id
        }
    ]

    for b in batches:
        db_batch = models.WasteBatch(
            batch_id=b["batch_id"],
            fabric_type=b["fabric_type"],
            source=b["source"],
            quantity=b["quantity"],
            unit=b["unit"],
            color=b["color"],
            condition=b["condition"],
            collection_date=b["collection_date"],
            status=b["status"],
            notes=b["notes"],
            created_by_id=b["created_by_id"]
        )
        db.add(db_batch)

    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
