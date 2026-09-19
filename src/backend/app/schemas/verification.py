from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VerificationActionCreate(BaseModel):
    comparison_id: int
    reviewer_id: int
    decision: str # CONFIRM_FIX, PARTIAL_FIX, NOT_FIXED, REQUEST_FIELD_INSPECTION, INSUFFICIENT_EVIDENCE
    reason: Optional[str] = None

class VerificationActionResponse(BaseModel):
    id: int
    comparison_id: int
    reviewer_id: int
    decision: str
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
