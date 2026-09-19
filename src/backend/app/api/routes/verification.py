from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.database import get_db
from app.services.verification_service import verification_service
from app.schemas.comparison import ComparisonResponse # Need to create this schema
from app.db.models.models import Comparison

router = APIRouter(tags=["Verification"])

@router.post("/complaints/{id}/verify", response_model=ComparisonResponse)
async def run_verification(id: int, db: AsyncSession = Depends(get_db)):
    try:
        return await verification_service.run_verification(db, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(e)}")

@router.get("/complaints/{id}/comparison", response_model=ComparisonResponse)
async def get_latest_comparison(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comparison)
        .where(Comparison.complaint_id == id)
        .order_by(desc(Comparison.created_at))
    )
    comparison = result.scalars().first()
    if not comparison:
        raise HTTPException(status_code=404, detail="No AI comparison has been run for this complaint")
    return comparison
