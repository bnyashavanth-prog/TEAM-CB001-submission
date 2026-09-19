import cv2
import numpy as np
from typing import Tuple, Optional
from app.ai.alignment.feature_matching import feature_matcher

class HomographyAligner:
    """
    Aligns two images using homography and RANSAC.
    """
    def align(self, img_before: np.ndarray, img_after: np.ndarray) -> Tuple[Optional[np.ndarray], float, bool]:
        # 1. Match features
        kp1, kp2, matches = feature_matcher.match_features(img_before, img_after)

        if len(matches) < 10:
            # Too few matches to calculate a reliable homography
            return None, 0.0, False

        # 2. Extract location of good matches
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        # 3. Find Homography using RANSAC
        M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        if M is None:
            return None, 0.0, False

        # Calculate alignment score based on inliers
        inliers = np.sum(mask)
        alignment_score = inliers / len(matches)

        # 4. Warp image_before to align with image_after
        h, w = img_after.shape[:2]
        aligned_img = cv2.warpPerspective(img_before, M, (w, h))

        return aligned_img, float(alignment_score), True

homography_aligner = HomographyAligner()
