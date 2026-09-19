import cv2
import numpy as np
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings

class ImageQualityResult(BaseModel):
    quality_score: float
    resolution_score: float
    brightness_score: float
    blur_score: float
    contrast_score: float
    occlusion_score: float = 1.0
    usable: bool
    warnings: List[str] = []

class ImageQualityEngine:
    def __init__(self):
        # Thresholds for quality assessment
        self.MIN_RESOLUTION = (640, 480)
        self.BLUR_THRESHOLD = 100.0  # Variance of Laplacian
        self.BRIGHTNESS_RANGE = (40, 220) # Min, Max mean intensity
        self.CONTRAST_THRESHOLD = 20.0 # Min standard deviation

    def analyze(self, image_path: str) -> ImageQualityResult:
        img = cv2.imread(image_path)
        if img is None:
            return ImageQualityResult(
                quality_score=0, resolution_score=0, brightness_score=0,
                blur_score=0, contrast_score=0, usable=False, warnings=["Could not read image"]
            )

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        h, w = gray.shape

        # 1. Resolution Score
        res_score = 1.0 if (w >= self.MIN_RESOLUTION[0] and h >= self.MIN_RESOLUTION[1]) else 0.5
        res_warning = None if res_score == 1.0 else "low_resolution"

        # 2. Blur Score (Laplacian Variance)
        blur_val = cv2.Laplacian(gray, cv2.CV_64F).var()
        blur_score = min(1.0, blur_val / 500.0) # Normalize approx 500 as "very sharp"
        blur_warning = None if blur_val > self.BLUR_THRESHOLD else "heavy_blur"

        # 3. Brightness Score
        brightness = np.mean(gray)
        if self.BRIGHTNESS_RANGE[0] <= brightness <= self.BRIGHTNESS_RANGE[1]:
            brightness_score = 1.0
            brightness_warning = None
        else:
            # Penalize distance from range
            dist = min(abs(brightness - self.BRIGHTNESS_RANGE[0]), abs(brightness - self.BRIGHTNESS_RANGE[1]))
            brightness_score = max(0.0, 1.0 - (dist / 100.0))
            brightness_warning = "too_dark" if brightness < self.BRIGHTNESS_RANGE[0] else "too_bright"

        # 4. Contrast Score
        contrast = np.std(gray)
        contrast_score = min(1.0, contrast / 70.0) # Normalize approx 70 as "high contrast"
        contrast_warning = None if contrast > self.CONTRAST_THRESHOLD else "low_contrast"

        # Weighted Overall Score
        # Priority: Resolution and Blur are critical
        weights = {
            "resolution": 0.2,
            "blur": 0.4,
            "brightness": 0.2,
            "contrast": 0.2
        }

        overall_score = (
            res_score * weights["resolution"] +
            blur_score * weights["blur"] +
            brightness_score * weights["brightness"] +
            contrast_score * weights["contrast"]
        ) * 100

        warnings = []
        if res_warning: warnings.append(res_warning)
        if blur_warning: warnings.append(blur_warning)
        if brightness_warning: warnings.append(brightness_warning)
        if contrast_warning: warnings.append(contrast_warning)

        return ImageQualityResult(
            quality_score=round(overall_score, 2),
            resolution_score=round(res_score, 2),
            brightness_score=round(brightness_score, 2),
            blur_score=round(blur_score, 2),
            contrast_score=round(contrast_score, 2),
            usable=overall_score > 40, # Configurable threshold
            warnings=warnings
        )

quality_engine = ImageQualityEngine()
