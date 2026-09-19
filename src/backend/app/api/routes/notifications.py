from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import current_user
from app.db.database import get_db
from app.db.models.models import Notification, User

router = APIRouter(tags=["Notifications"])

@router.get("/mine")
async def my_notifications(user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(20))
    return [{"id": item.id, "complaint_id": item.complaint_id, "title": item.title, "message": item.message, "kind": item.kind, "is_read": item.is_read, "created_at": item.created_at} for item in result.scalars().all()]

@router.post("/{notification_id}/read")
async def mark_read(notification_id: int, user: User = Depends(current_user), db: AsyncSession = Depends(get_db)):
    notification = await db.get(Notification, notification_id)
    if notification and notification.user_id == user.id:
        notification.is_read = True
        await db.commit()
    return {"ok": True}
