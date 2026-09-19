from typing import List, Dict, Any, Optional
from app.ai.models.detector import detector, DetectionResult
from app.ai.models.segmenter import segmenter
import cv2
import numpy as np

class IssueDetector:
    """
    Translates raw object detections into civic issue analysis.
    """
    ISSUE_PROFILES = {
        "garbage_accumulation": {
            "relevant_objects": ["garbage", "garbage_pile", "plastic", "debris"],
            "primary_object": "garbage"
        },
        "overflowing_bin": {
            "relevant_objects": ["garbage_bin", "garbage"],
            "primary_object": "garbage_bin"
        },
        "construction_debris": {
            "relevant_objects": ["rubble", "concrete", "sand", "bricks", "construction_material"],
            "primary_object": "construction_material"
        },
        "pothole": {
            "relevant_objects": ["pothole", "damaged_road"],
            "primary_object": "pothole"
        }
    }

    def analyze_issue(self, image_path: str, issue_type: str, evidence_id: Optional[int] = None) -> Dict[str, Any]:
        detections = detector.detect(image_path)
        profile = self.ISSUE_PROFILES.get(issue_type, {})

        if not profile:
            return {"issue_present": False, "affected_area_pixels": 0, "objects": []}

        # Load image for refinement
        img = cv2.imread(image_path)
        if img is None:
            return {"issue_present": False, "affected_area_pixels": 0, "objects": []}

        # Filter for relevant objects and refine with SAM 2
        relevant = []
        total_area = 0.0

        for d in detections:
            if d.object_type in profile["relevant_objects"]:
                # Refine with SAM 2 for precise area if evidence_id is provided
                if evidence_id:
                    seg_result = segmenter.refine_mask(img, d.bbox, evidence_id)
                    d.area_pixels = seg_result.area_pixels
                    d.mask_path = seg_result.mask_path

                relevant.append(d)
                total_area += d.area_pixels

        return {
            "issue_present": len(relevant) > 0,
            "affected_area_pixels": total_area,
            "object_count": len(relevant),
            "detections": relevant
        }

issue_detector = IssueDetector()
