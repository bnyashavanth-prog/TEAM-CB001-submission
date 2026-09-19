from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComparisonResponse(BaseModel):
    id: int
    complaint_id: int
    before_evidence_id: Optional[int]
    after_evidence_id: Optional[int]
    landmark_match_score: Optional[float]
    overall_evidence_score: Optional[float]
    affected_area_before: Optional[float]
    affected_area_after: Optional[float]
    affected_area_change: Optional[float]
    result: Optional[str]
    explanation: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
