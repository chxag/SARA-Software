import os

import cv2
import numpy as np
import math
# import cameraCalibration
import glob
import aprilTagPoints

# Get a list of file names of all image files in the folder
fileName = input("please enter the file name:\n")
image_files = glob.glob("./" + fileName +"/*.jpg")  # Modify file extension according to your actual situation
if not image_files:
    raise ValueError("No image files found in the specified folder. Try another folder.")
# 标定
# #Call the camera calibration function and get the calibration results
# calibrationResults = cameraCalibration.calibrateCamera()
# ret, mtx, dist, rvecs, tvecs = calibrationResults[0]
# u = calibrationResults[1]
# v = calibrationResults[2]
#
# newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (u, v), 0, (u, v))


# Detect AprilTags in each image
for image_file in image_files:
    print("Detecting AprilTags in:", image_file)
    # image = cv2.imread(image_file)
    # image_undistorted = cv2.undistort(image, mtx, dist, None, newcameramtx)
    # file_name = "undistorted_image.jpg"
    # cv2.imwrite(file_name, image_undistorted)
    coordinates = aprilTagPoints.detect_apriltag(image_file)
    # os.remove(file_name)
    print(coordinates)
    height = abs(coordinates[0][1][0] + coordinates[0][2][0] - coordinates[0][0][0]- coordinates[0][3][0])/2
    width = abs(coordinates[0][3][1] + coordinates[0][2][1] - coordinates[0][0][1] - coordinates[0][1][1])/2
    ratio = height / width
    if(ratio >  1 and ratio < 1.2):
        print("degree:", 0)
    else:
        print("degree:", math.degrees(math.acos(height / width)))
