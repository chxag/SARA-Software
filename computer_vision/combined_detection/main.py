import os

import cv2
import numpy as np
import math
import aprilTagPoints

image_file = "chairs/detected_april_tagged_rubber.jpg"
# image_file = "chairs/detected_april_tagged_rubbers.jpg"

# Detect AprilTags in image
print("Detecting AprilTags in:", image_file)
coordinates = aprilTagPoints.detect_apriltag(image_file)
print(coordinates)
height = abs(coordinates[0][1][0] + coordinates[0][2][0] - coordinates[0][0][0]- coordinates[0][3][0])/2
width = abs(coordinates[0][3][1] + coordinates[0][2][1] - coordinates[0][0][1] - coordinates[0][1][1])/2
ratio = height / width
if(ratio >  1 and ratio < 1.2):
    print("degree:", 0)
else:
    print("degree:", math.degrees(math.acos(height / width)))
