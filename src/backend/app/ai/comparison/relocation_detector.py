from typing import Dict, Any, List
from app.ai.detection.issue_detector import issue_detector
from app.core.config import settings

class RelocationDetector:
    """
    Detects if an issue was moved nearby rather than resolved.
    """
    def analyze(self, before_analysis: Dict[str, Any], after_analysis: Dict[str, Any], issue_type: str) -> Dict[str, Any]:
        # Relocation is only relevant if the original issue was significantly reduced
        reduction = 0.0
        if before_analysis.get("affected_area_pixels", 0) > 0:
            reduction = ((before_analysis["affected_area_pixels"] - after_analysis["affected_area_pixels"]) / before_analysis["affected_area_pixels"]) * 100

        if reduction < 30:
            # If it wasn't even partially resolved, we don't need to check for relocation
            # as it's already "NOT_RESOLVED"
            return {"relocation_possible": False, "relocation_score": 0.0, "explanation": ""}

        # Look for "shifted" waste: objects in the AFTER image that are NOT in the original area
        # For MVP, we compare the total number of relevant objects.
        # If the original area is clean but the total object count in the AFTER image is still high,
        # it suggests the material was moved.

        before_objs = before_analysis.get("object_count", 0)
        after_objs = after_analysis.get("object_count", 0)

        # If we have a high number of objects in the AFTER image despite a low 'affected_area'
        # (which usually counts the main cluster), this is a signal.

        relocation_risk = 0.0
        explanation = ""

        # Heuristic: If the total object count in AFTER is > 50% of BEFORE,
        # but the main affected area is reduced > 80%, it's a strong relocation signal.
        if reduction > 80 and after_objs > (before_objs * 0.5):
            relocation_risk = 0.8
            explanation = "The original affected region is substantially reduced, but similar waste is detected nearby."
        elif reduction > 50 and after_objs > (before_objs * 0.3):
            relocation_risk = 0.4
            explanation = "Possible issue relocation detected in surrounding area."

        return {
            "relocation_possible": relocation_risk > 0.5,
            "relocation_score": relocation_risk,
            "explanation": explanation
        }

relocation_detector = RelocationDetector()
