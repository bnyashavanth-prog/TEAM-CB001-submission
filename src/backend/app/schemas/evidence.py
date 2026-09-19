from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EvidenceBase(BaseModel):
    type: str # BEFORE, AFTER, WORK_PROOF, FIELD_INSPECTION
    timestamp: datetime
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    device_id: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: int
    complaint_id: int
    file_path: str
    mime_type: Optional[str] = None
    quality_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
