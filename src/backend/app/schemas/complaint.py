from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintBase(BaseModel):
    issue_type: str
    description: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    authority: Optional[str] = None
    created_by: Optional[int] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintResponse(ComplaintBase):
    id: int
    complaint_number: str
    status: str
    assigned_worker_id: Optional[int] = None
    service_area: Optional[str] = None
    worker_acknowledged_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
