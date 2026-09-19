import yaml
from pathlib import Path
from typing import Dict, Any
from pydantic import BaseModel
from app.core.config import settings

class EvidenceVector(BaseModel):
    quality: float = 0.0
    alignment: float = 0.0
    issue_before: float = 0.0
    reduction: float = 0.0
    temporal: float = 0.0
    relocation_risk: float = 0.0 # Negative signal (0.0 = safe, 1.0 = highly likely)

class EvidenceScoringEngine:
    def __init__(self):
        # Load weights from YAML
        config_path = Path("before-after-ai/backend/app/ai/scoring/scoring_config.yaml")
        try:
            with open(config_path, "r") as f:
                self.config = yaml.safe_load(f)
        except Exception:
            # Fallback defaults
            self.config = {
                "weights": {
                    "quality": 0.15,
                    "alignment": 0.20,
                    "issue_before": 0.10,
                    "reduction": 0.40,
                    "temporal": 0.15
                },
                "thresholds": {
                    "resolved": 80,
                    "partially_resolved": 40,
                    "insufficient": 20
                }
            }

    def calculate_score(self, vector: EvidenceVector) -> float:
        weights = self.config["weights"]

        # Weighted sum of positive signals
        score = (
            vector.quality * weights["quality"] +
            vector.alignment * weights["alignment"] +
            vector.issue_before * weights["issue_before"] +
            vector.reduction * weights["reduction"] +
            vector.temporal * weights["temporal"]
        ) * 100

        # Apply negative signals (e.g., relocation risk reduces score)
        # If relocation risk is 0.5, we penalize the total score by 50% of the risk
        score -= (vector.relocation_risk * 20) # Max 20 point penalty for relocation

        return max(0.0, min(100.0, round(score, 2)))

    def get_verdict(self, score: float) -> str:
        thresholds = self.config["thresholds"]
        if score >= thresholds["resolved"]:
            return "RESOLUTION_SUPPORTED"
        elif score >= thresholds["partially_resolved"]:
            return "PARTIALLY_RESOLVED"
        elif score >= thresholds["insufficient"]:
            return "NEEDS_HUMAN_REVIEW"
        else:
            return "INSUFFICIENT_EVIDENCE"

scoring_engine = EvidenceScoringEngine()
