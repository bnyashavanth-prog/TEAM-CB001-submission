import cv2
import os
from pathlib import Path
from typing import List, Tuple
from app.storage.file_storage import storage_service
from app.core.config import settings

class VideoService:
    """
    Handles extraction of key-frames from civic evidence videos.
    """
    def __init__(self):
        # Configurable frame extraction rate (e.g., 1 frame per second)
        self.FRAME_INTERVAL = 1.0
        self.SUPPORTED_EXTENSIONS = {'.mp4', '.mov', '.avi', '.webm'}

    def extract_key_frames(self, video_path: str, evidence_id: int) -> List[str]:
        """
        Extracts critical frames from the video:
        - First frame (Initial state)
        - Last frame (Result state)
        - Mid-point (Activity)
        - And a few samples in between.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return []

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0

        extracted_paths = []

        # 1. Define critical timestamps to extract
        # [Start, Middle, End, and distributed samples]
        timestamps = [0, duration / 2, duration]

        # Add a few samples distributed across the video
        if duration > 2:
            for i in range(1, 4):
                timestamps.append((duration / 4) * i)

        # Sort and remove duplicates
        timestamps = sorted(list(set(timestamps)))

        for ts in timestamps:
            frame_id = int(ts * fps)
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_id)
            success, frame = cap.read()

            if success:
                # Save frame as an image
                frame_filename = f"frame_{evidence_id}_{int(ts)}.jpg"
                path = storage_service.save_file(
                    cv2.imencode('.jpg', frame)[1].tobytes(),
                    frame_filename,
                    subfolder=f"frames/{evidence_id}"
                )
                extracted_paths.append(path)

        cap.release()
        return extracted_paths

video_service = VideoService()
