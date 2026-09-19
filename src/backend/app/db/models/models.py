from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, Text, LargeBinary
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False) # ADMIN, OPERATOR, FIELD_INSPECTOR, VIEWER
    password_hash = Column(String, nullable=True)
    service_area = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String, unique=True, nullable=False, index=True)
    issue_type = Column(String, nullable=False) # garbage_accumulation, overflowing_bin, construction_debris, pothole
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    claimed_resolved_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="OPEN") # OPEN, ASSIGNED, IN_PROGRESS, CLAIMED_RESOLVED, AI_VERIFICATION, HUMAN_REVIEW, VERIFIED_RESOLVED, PARTIALLY_RESOLVED, NOT_RESOLVED, INSUFFICIENT_EVIDENCE, REOPENED
    authority = Column(String, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_worker_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_area = Column(String, nullable=True)
    worker_acknowledged_at = Column(DateTime(timezone=True), nullable=True)

    evidence = relationship("Evidence", back_populates="complaint")
    comparisons = relationship("Comparison", back_populates="complaint")

class WorkerArea(Base):
    __tablename__ = "worker_areas"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String, nullable=False)
    polygon_json = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    type = Column(String, nullable=False) # BEFORE, AFTER, WORK_PROOF, FIELD_INSPECTION
    file_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=True)
    # Render's local filesystem is ephemeral, so original photo bytes are kept
    # with the evidence record for durable dashboard display.
    file_data = Column(LargeBinary, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    device_id = Column(String, nullable=True)
    sha256 = Column(String, nullable=True)
    quality_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="evidence")
    detections = relationship("Detection", back_populates="evidence")

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    object_type = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    bbox_x1 = Column(Float, nullable=False)
    bbox_y1 = Column(Float, nullable=False)
    bbox_x2 = Column(Float, nullable=False)
    bbox_y2 = Column(Float, nullable=False)
    mask_path = Column(String, nullable=True)
    area_pixels = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evidence = relationship("Evidence", back_populates="detections")

class Comparison(Base):
    __tablename__ = "comparisons"
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    before_evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=True)
    after_evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=True)
    location_match_score = Column(Float, nullable=True)
    landmark_match_score = Column(Float, nullable=True)
    image_quality_score = Column(Float, nullable=True)
    issue_match_score = Column(Float, nullable=True)
    affected_area_before = Column(Float, nullable=True)
    affected_area_after = Column(Float, nullable=True)
    affected_area_change = Column(Float, nullable=True)
    relocation_score = Column(Float, nullable=True)
    temporal_consistency_score = Column(Float, nullable=True)
    positive_evidence_score = Column(Float, nullable=True)
    negative_evidence_score = Column(Float, nullable=True)
    overall_evidence_score = Column(Float, nullable=True)
    result = Column(String, nullable=True)
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    complaint = relationship("Complaint", back_populates="comparisons")
    verification_actions = relationship("VerificationAction", back_populates="comparison")

class VerificationAction(Base):
    __tablename__ = "verification_actions"
    id = Column(Integer, primary_key=True, index=True)
    comparison_id = Column(Integer, ForeignKey("comparisons.id"), nullable=False)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String, nullable=False) # CONFIRM_FIX, PARTIAL_FIX, NOT_FIXED, REQUEST_FIELD_INSPECTION, INSUFFICIENT_EVIDENCE
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    comparison = relationship("Comparison", back_populates="verification_actions")

class RecurringIncident(Base):
    __tablename__ = "recurring_incidents"
    id = Column(Integer, primary_key=True, index=True)
    location_hash = Column(String, unique=True, nullable=False, index=True)
    issue_type = Column(String, nullable=False)
    incident_count = Column(Integer, default=0)
    resolution_count = Column(Integer, default=0)
    recurrence_count = Column(Integer, default=0)
    last_incident_at = Column(DateTime(timezone=True), nullable=True)
    average_recurrence_days = Column(Float, nullable=True)
