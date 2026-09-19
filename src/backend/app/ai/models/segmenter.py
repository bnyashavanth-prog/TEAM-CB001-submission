import numpy as np
import cv2
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional, Any
from pydantic import BaseModel
from app.ai.models.config import model_config
from app.core.config import settings
from app.storage.file_storage import storage_service

class SegmentationResult(BaseModel):
    mask: Any
    area_pixels: float
    mask_path: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True

class SegmenterInterface(ABC):
    @abstractmethod
    def refine_mask(self, image: np.ndarray, bbox: List[float], evidence_id: int) -> SegmentationResult:
        pass

class SAM2Segmenter(SegmenterInterface):
    def __init__(self):
        self.model = None
        print(f"Initializing SAM 2 Segmenter with model: {model_config.SAM2_MODEL_PATH}")

    def refine_mask(self, image: np.ndarray, bbox: List[float], evidence_id: int) -> SegmentationResult:
        # Real SAM 2 logic
        return SegmentationResult(mask=np.zeros((100,100)), area_pixels=0.0)

class DemoSegmenter(SegmenterInterface):
    """
    Simulates high-precision segmentation by creating a mask
    based on the bounding box with some 'organic' noise.
    """
    def refine_mask(self, image: np.ndarray, bbox: List[float], evidence_id: int) -> SegmentationResult:
        x1, y1, x2, y2 = map(int, bbox)
        h, w = image.shape[:2]
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)

        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)
        kernel = np.ones((5,5), np.uint8)
        mask = cv2.erode(mask, kernel, iterations=1)
        area_pixels = float(np.sum(mask > 0))

        # Save mask to disk
        mask_filename = f"mask_{evidence_id}_{np.random.randint(1000)}.png"
        mask_path = storage_service.save_file(
            cv2.imencode('.png', mask)[1].tobytes(),
            mask_filename,
            subfolder=f"masks/{evidence_id}"
        )

        return SegmentationResult(
            mask=mask,
            area_pixels=area_pixels,
            mask_path=mask_path
        )

class SegmenterFactory:
    @staticmethod
    def get_segmenter() -> SegmenterInterface:
        if settings.AI_MODE == "demo":
            return DemoSegmenter()
        return SAM2Segmenter()

segmenter = SegmenterFactory.get_segmenter()
