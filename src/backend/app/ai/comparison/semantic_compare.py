from typing import Dict, Any
from app.ai.comparison.region_compare import region_comparator
from app.core.config import settings

class SemanticComparator:
    """
    Combines multiple signals to determine the resolution status.
    """
    def compare(self, before_analysis: Dict[str, Any], after_analysis: Dict[str, Any]) -> Dict[str, Any]:
        # 1. Calculate Area Reduction
        region_metrics = region_comparator.compare(before_analysis, after_analysis)
        reduction = region_metrics["reduction_percent"]

        # 2. Apply Resolution Rules (Configurable thresholds)
        # RESOLVED: >= 80% reduction
        # PARTIALLY_RESOLVED: >= 30% reduction
        # NOT_RESOLVED: < 30% reduction

        res_threshold = settings.RESOLUTION_THRESHOLD # 80
        part_threshold = settings.PARTIAL_RESOLUTION_THRESHOLD # 30

        if region_metrics.get("status") == "INSUFFICIENT_BEFORE_EVIDENCE":
            result = "INSUFFICIENT_EVIDENCE"
            explanation = "No significant issue was detected in the BEFORE evidence to compare against."
        elif reduction >= res_threshold:
            result = "RESOLVED"
            explanation = f"Visual evidence supports resolution. Affected area reduced by {reduction}%."
        elif reduction >= part_threshold:
            result = "PARTIALLY_RESOLVED"
            explanation = f"Issue partially resolved. Affected area reduced by {reduction}%."
        else:
            result = "NOT_RESOLVED"
            explanation = f"Issue persists. Only {reduction}% reduction detected."

        return {
            "result": result,
            "explanation": explanation,
            "metrics": region_metrics
        }

semantic_comparator = SemanticComparator()
