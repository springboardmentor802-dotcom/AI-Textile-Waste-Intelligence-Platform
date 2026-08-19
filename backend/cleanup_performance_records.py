from dotenv import load_dotenv
load_dotenv(".env")
from app.database import SessionLocal
from app.models.waste_upload import WasteUpload
from app.models.notification import Notification

TARGET_IDS = [207, 208, 209]

db = SessionLocal()

try:
    uploads = (
        db.query(WasteUpload)
        .filter(WasteUpload.upload_id.in_(TARGET_IDS))
        .all()
    )

    notifications = (
        db.query(Notification)
        .filter(
            Notification.related_entity_type == "analysis",
            Notification.related_entity_id.in_(TARGET_IDS),
        )
        .all()
    )

    print("Uploads found:", [u.upload_id for u in uploads])
    print("Notifications found:", len(notifications))

    for notification in notifications:
        db.delete(notification)

    for upload in uploads:
        db.delete(upload)

    db.commit()

    print("Deleted upload IDs:", [u.upload_id for u in uploads])
    print("Deleted notifications:", len(notifications))

except Exception as exc:
    db.rollback()
    print("Cleanup failed:", exc)
    raise

finally:
    db.close()

