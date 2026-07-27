import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status


class ImageService:
    """
    Handles image validation and storage for textile analysis.
    """

    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

    def __init__(self):
        self.upload_dir = Path("uploads/textile_images")
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_image(self, file: UploadFile) -> None:
        """
        Validate uploaded image.
        """

        extension = Path(file.filename).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPG, JPEG and PNG images are allowed."
            )

    async def save_image(self, file: UploadFile) -> str:
        """
        Save uploaded image and return its relative path.
        """

        self.validate_image(file)

        contents = await file.read()

        if len(contents) > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size cannot exceed 5 MB."
            )

        extension = Path(file.filename).suffix.lower()

        filename = f"{uuid.uuid4()}{extension}"

        file_path = self.upload_dir / filename

        with open(file_path, "wb") as image_file:
            image_file.write(contents)

        return str(file_path).replace("\\", "/")

    def delete_image(self, image_path: str) -> None:
        """
        Delete image from storage.
        """

        if image_path and os.path.exists(image_path):
            os.remove(image_path)


image_service = ImageService()