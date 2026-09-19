from pydantic import BaseModel
from app.core.config import settings

class ModelConfig(BaseModel):
    # The primary segmentation model for civic issues
    # Possible values: 'yolo11n-seg.pt', 'yolo11s-seg.pt', 'yolo11m-seg.pt'
    DETECTOR_MODEL: str = settings.MODEL_NAME

    # SAM 2 for region refinement
    SAM2_MODEL_PATH: str = settings.SAM2_MODEL_PATH

    # VLM for reasoning
    VLM_MODEL: str = settings.VLM_MODEL

model_config = ModelConfig()
