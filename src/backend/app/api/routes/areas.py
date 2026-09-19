import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models.models import User, WorkerArea, Complaint

router = APIRouter(tags=["Worker areas"])

class AreaRequest(BaseModel):
    worker_id: int
    name: str = Field(min_length=2, max_length=80)
    polygon: list[list[float]]

def contains(latitude: float, longitude: float, polygon: list[list[float]]) -> bool:
    inside = False; j = len(polygon) - 1
    for i in range(len(polygon)):
        lat_i, lng_i = polygon[i]; lat_j, lng_j = polygon[j]
        if ((lat_i > latitude) != (lat_j > latitude)) and (longitude < (lng_j - lng_i) * (latitude - lat_i) / ((lat_j - lat_i) or 1e-12) + lng_i): inside = not inside
        j = i
    return inside

def polygons_overlap(first: list[list[float]], second: list[list[float]]) -> bool:
    def orientation(a, b, c):
        return (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1])
    def on_segment(a, b, c):
        return min(a[0], c[0]) <= b[0] <= max(a[0], c[0]) and min(a[1], c[1]) <= b[1] <= max(a[1], c[1])
    def intersects(a, b, c, d):
        o1, o2, o3, o4 = orientation(a, b, c), orientation(a, b, d), orientation(c, d, a), orientation(c, d, b)
        if (o1 > 0) != (o2 > 0) and (o3 > 0) != (o4 > 0): return True
        return (o1 == 0 and on_segment(a, c, b)) or (o2 == 0 and on_segment(a, d, b)) or (o3 == 0 and on_segment(c, a, d)) or (o4 == 0 and on_segment(c, b, d))
    for index, point in enumerate(first):
        for other_index, other_point in enumerate(second):
            if intersects(point, first[(index + 1) % len(first)], other_point, second[(other_index + 1) % len(second)]): return True
    return any(contains(lat, lng, second) for lat, lng in first) or any(contains(lat, lng, first) for lat, lng in second)

async def assign_by_location(db: AsyncSession, complaint: Complaint) -> None:
    result = await db.execute(select(WorkerArea))
    for area in result.scalars().all():
        if contains(complaint.latitude, complaint.longitude, json.loads(area.polygon_json)):
            complaint.assigned_worker_id = area.worker_id; complaint.service_area = area.name; complaint.status = "ASSIGNED"; return
    complaint.assigned_worker_id = None; complaint.service_area = "UNASSIGNED"

@router.get("/workers")
async def workers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "WORKER"))
    return [{"id": w.id, "name": w.name, "email": w.email} for w in result.scalars().all()]

@router.get("/")
async def list_areas(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkerArea))
    return [{"id": a.id, "worker_id": a.worker_id, "name": a.name, "polygon": json.loads(a.polygon_json)} for a in result.scalars().all()]

@router.post("/")
async def save_area(payload: AreaRequest, db: AsyncSession = Depends(get_db)):
    if len(payload.polygon) < 3: raise HTTPException(400, "Draw an area with at least three points")
    worker = await db.get(User, payload.worker_id)
    if not worker or worker.role != "WORKER": raise HTTPException(400, "Select a valid worker")
    existing_areas = await db.execute(select(WorkerArea).where(WorkerArea.worker_id != worker.id))
    for existing in existing_areas.scalars().all():
        if polygons_overlap(payload.polygon, json.loads(existing.polygon_json)): raise HTTPException(409, f"This overlaps the existing {existing.name} allocation")
    existing = await db.execute(select(WorkerArea).where(WorkerArea.worker_id == worker.id)); area = existing.scalars().first()
    if area: area.name, area.polygon_json = payload.name, json.dumps(payload.polygon)
    else: area = WorkerArea(worker_id=worker.id, name=payload.name, polygon_json=json.dumps(payload.polygon)); db.add(area)
    # Immediately route any older, still-unassigned reports that fall in the new area.
    complaints = await db.execute(select(Complaint).where(Complaint.assigned_worker_id.is_(None)))
    for complaint in complaints.scalars().all():
        if contains(complaint.latitude, complaint.longitude, payload.polygon):
            complaint.assigned_worker_id = worker.id
            complaint.service_area = payload.name
            complaint.status = "ASSIGNED"
    await db.commit(); await db.refresh(area)
    return {"id": area.id, "name": area.name}

@router.delete("/{area_id}")
async def delete_area(area_id: int, db: AsyncSession = Depends(get_db)):
    area = await db.get(WorkerArea, area_id)
    if not area:
        raise HTTPException(404, "Worker area not found")
    assigned = await db.execute(
        select(Complaint).where(
            Complaint.assigned_worker_id == area.worker_id,
            Complaint.service_area == area.name,
        )
    )
    released = 0
    for complaint in assigned.scalars().all():
        complaint.assigned_worker_id = None
        complaint.service_area = "UNASSIGNED"
        complaint.status = "UNASSIGNED"
        released += 1
    await db.delete(area)
    await db.commit()
    return {"message": "Area allocation removed", "released_complaints": released}
