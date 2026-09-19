from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.verification_service import verification_service
from app.schemas.verification import VerificationActionCreate, VerificationActionResponse
from app.schemas.complaint import ComplaintResponse
from typing import List

router = APIRouter(tags=["Human Verification"])

@router.get("/queue", response_model=List[ComplaintResponse])
async def get_verification_queue(db: AsyncSession = Depends(get_db)):
    return await verification_service.get_verification_queue(db)

@router.post("/decision", response_model=VerificationActionResponse)
async def submit_decision(
    action_data: VerificationActionCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        return await verification_service.submit_human_decision(db, action_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
