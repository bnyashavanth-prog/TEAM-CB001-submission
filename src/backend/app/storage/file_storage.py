import os
import shutil
from pathlib import Path
from app.core.config import settings

class FileStorage:
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        if not self.upload_dir.is_absolute():
            self.upload_dir = Path(__file__).resolve().parents[3] / self.upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, filename: str, subfolder: str = "") -> str:
        folder = self.upload_dir / subfolder
        folder.mkdir(parents=True, exist_ok=True)
        file_path = folder / filename
        with open(file_path, "wb") as f:
            f.write(file_content)
        return str(file_path)

    def get_path(self, relative_path: str) -> str:
        path = Path(relative_path)
        if path.is_absolute() or path.is_file():
            return str(path)
        legacy_path = Path(__file__).resolve().parents[2] / path
        if legacy_path.is_file():
            return str(legacy_path)
        return str(self.upload_dir / path.name)

    def delete_file(self, file_path: str) -> None:
        path = Path(file_path).resolve()
        uploads_root = self.upload_dir.resolve()
        if uploads_root not in path.parents:
            raise ValueError("Refusing to delete a file outside the upload directory")
        if path.is_file():
            path.unlink()

storage_service = FileStorage()
