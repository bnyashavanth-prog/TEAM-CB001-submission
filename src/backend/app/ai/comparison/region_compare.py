from typing import Dict, Any
from app.core.config import settings

class RegionComparator:
    """
    Compares the affected regions between Before and After evidence.
    """
    def compare(self, before_analysis: Dict[str, Any], after_analysis: Dict[str, Any]) -> Dict[str, Any]:
        before_area = before_analysis.get("affected_area_pixels", 0)
        after_area = after_analysis.get("affected_area_pixels", 0)

        if before_area == 0:
            # No issue was detected in the Before image, so we can't measure reduction
            return {
                "reduction_percent": 0.0,
                "area_change": 0.0,
                "status": "INSUFFICIENT_BEFORE_EVIDENCE"
            }

        reduction_percent = ((before_area - after_area) / before_area) * 100

        # Clamp reduction at 100% (cannot remove more than 100% of the issue)
        # But allow negative if the issue increased
        reduction_percent = min(100.0, reduction_percent)

        return {
            "before_area": before_area,
            "after_area": after_area,
            "reduction_percent": round(reduction_percent, 2),
            "area_change": after_area - before_area
        }

region_comparator = RegionComparator()
