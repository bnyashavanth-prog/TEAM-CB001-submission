import cv2
import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.ai.models.config import model_config
from app.core.config import settings

class DetectionResult(BaseModel):
    object_type: str
    confidence: float
    bbox: List[float] # [x1, y1, x2, y2]
    mask_path: Optional[str] = None
    area_pixels: float = 0.0

class DetectorInterface(ABC):
    @abstractmethod
    def detect(self, image_path: str) -> List[DetectionResult]:
        pass

class YOLODetector(DetectorInterface):
    def __init__(self):
        # In a real environment, we would do:
        # from ultralytics import YOLO
        # self.model = YOLO(model_config.DETECTOR_MODEL)
        self.model = None
        print(f"Initializing YOLO Detector with model: {model_config.DETECTOR_MODEL}")

    def detect(self, image_path: str) -> List[DetectionResult]:
        # Mock implementation of YOLO detection for structure
        # If self.model was initialized:
        # results = self.model(image_path)[0]
        # masks = results.masks
        # boxes = results.boxes
        # ...
        print(f"Real YOLO detection running on {image_path}...")
        return [] # In real mode, this would return detections

class DemoDetector(DetectorInterface):
    """
    Deterministic detector for demo purposes.
    Simulates detections based on filenames or fixed patterns.
    """
    def detect(self, image_path: str) -> List[DetectionResult]:
        print(f"Demo detector simulating analysis for {image_path}...")

        path_lower = image_path.lower()
        results = []

        # Get actual image dimensions to make simulated areas feel real
        try:
            img = cv2.imread(image_path)
            if img is not None:
                h, w = img.shape[:2]
                total_pixels = h * w
            else:
                total_pixels = 1000000 # Default
        except:
            total_pixels = 1000000

        # Logic for simulated Demo results
        if "fixed" in path_lower or "after" in path_lower:
            # Simulate a cleaned area (e.g., 0.1% to 1% of image)
            results.append(DetectionResult(
                object_type="garbage", confidence=0.85,
                bbox=[100, 100, 120, 120], area_pixels=total_pixels * 0.005
            ))
        elif "not_fixed" in path_lower or "before" in path_lower:
            # Simulate a heavily polluted area
            # We return multiple detections to simulate a real garbage pile
            for i in range(5):
                results.append(DetectionResult(
                    object_type="garbage", confidence=0.98,
                    bbox=[100*i, 100*i, 600+100*i, 600+100*i], area_pixels=total_pixels * 0.05
                ))
        elif "partial" in path_lower:
            # Simulate some remaining garbage
            for i in range(2):
                results.append(DetectionResult(
                    object_type="garbage", confidence=0.92,
                    bbox=[200*i, 200*i, 400+200*i, 400+200*i], area_pixels=total_pixels * 0.02
                ))
        else:
            # Default fallback
            results.append(DetectionResult(
                object_type="garbage", confidence=0.70,
                bbox=[100, 100, 300, 300], area_pixels=total_pixels * 0.1
            ))

        return results

class DetectorFactory:
    @staticmethod
    def get_detector() -> DetectorInterface:
        if settings.AI_MODE == "demo":
            return DemoDetector()
        return YOLODetector()

detector = DetectorFactory.get_detector()
