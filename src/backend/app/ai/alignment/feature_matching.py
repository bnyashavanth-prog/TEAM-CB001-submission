import cv2
import numpy as np
from typing import Tuple, Optional, List

class FeatureMatcher:
    """
    Handles feature detection and matching between two images.
    """
    def __init__(self):
        # Using ORB as it is fast and patent-free
        self.orb = cv2.ORB_create(nfeatures=2000)
        self.bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)

    def match_features(self, img1: np.ndarray, img2: np.ndarray) -> Tuple[List[cv2.KeyPoint], List[cv2.KeyPoint], List[cv2.DMatch]]:
        # Convert to grayscale
        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY) if len(img1.shape) == 3 else img1
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY) if len(img2.shape) == 3 else img2

        # Detect and compute keypoints
        kp1, des1 = self.orb.detectAndCompute(gray1, None)
        kp2, des2 = self.orb.detectAndCompute(gray2, None)

        if des1 is None or des2 is None:
            return [], [], []

        # Match features
        matches = self.bf.match(des1, des2)
        # Sort matches by distance (lower is better)
        matches = sorted(matches, key=lambda x: x.distance)

        return kp1, kp2, matches

feature_matcher = FeatureMatcher()
