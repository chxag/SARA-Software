import os

import cv2
import numpy as np
import math
import aprilTagPoints




# image_file = "chairs/chair.jpg"
# image_bboxes = [[(587, 183), (2198, 3175)]]
image_file = "chairs/chairs.jpg"
image_bboxes = [[(126, 100), (1252, 1788)], [(1604, 178), (2600, 1940)], [(2776, 260), (4109, 2040)]]

# Detect AprilTags in image
print("Detecting AprilTags in:", image_file)
coordinates = aprilTagPoints.detect_apriltag_cropped(image_file, image_bboxes[2])
print(coordinates)



# coordinates = aprilTagPoints.detect_apriltag(image_file)
# print(coordinates)
# height = abs(coordinates[0][1][0] + coordinates[0][2][0] - coordinates[0][0][0]- coordinates[0][3][0])/2
# width = abs(coordinates[0][3][1] + coordinates[0][2][1] - coordinates[0][0][1] - coordinates[0][1][1])/2
# ratio = height / width
# if(ratio >  1 and ratio < 1.2):
#     print("degree:", 0)
# else:
#     print("degree:", math.degrees(math.acos(height / width)))
