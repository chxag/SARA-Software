import cv2
import numpy as np
import math
import cameraCalibration
import glob
import pickle

# Get a list of file names of all image files in the folder
fileName = input("please enter the file name:\n")
image_files = glob.glob("./" + fileName +"/*.jpg")  # Modify file extension according to your actual situation
if(image_files == None):
    raise ("wrong file name")

#Read in camera calibration results from binary file
calibrationResultsFile = open("calibrationResults.pickle", "rb")
calibrationResults = pickle.load(calibrationResultsFile)
ret, mtx, dist, rvecs, tvecs = calibrationResults[0]
u = calibrationResults[1]
v = calibrationResults[2]
newcameramtx, roi = cv2.getOptimalNewCameraMatrix(mtx, dist, (u, v), 0, (u, v))

# Process each image
for image_name in image_files:
    # Read the image
    image = cv2.imread(image_name)

    # Undistort the image
    image_undistorted = cv2.undistort(image, mtx, dist, None, newcameramtx)

    # Convert to HSV color space
    hsv = cv2.cvtColor(image_undistorted, cv2.COLOR_BGR2HSV)

    # Define the HSV range for red color
    lower_red1 = np.array([0, 46, 56])
    upper_red1 = np.array([10, 255, 255])
    lower_red2 = np.array([160, 46, 56])
    upper_red2 = np.array([179, 255, 255])

    # Create masks
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask_combined = cv2.bitwise_or(mask1, mask2)

    # Extract the red region
    red_block = cv2.bitwise_and(image_undistorted, image_undistorted, mask=mask_combined)

    # Convert to grayscale image
    gray = cv2.cvtColor(red_block, cv2.COLOR_BGR2GRAY)

    # Find contours and approximate trapezoids
    contours, _ = cv2.findContours(gray, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        epsilon = 0.02 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)

        if len(approx) == 4:
            distances = [np.linalg.norm(approx[i] - approx[(i + 1) % 4]) for i in range(4)]
            distances.sort()
            if sum(distances) <= 200:
                continue
            image_undistorted = cv2.drawContours(image_undistorted, [approx], -1, (0, 255, 0), 2)
            height = math.sqrt((-distances[0] + distances[1] + distances[2] + distances[3]) *
                               (-distances[0] + distances[1] - distances[2] + distances[3]) *
                               (-distances[0] + distances[1] + distances[2] - distances[3]) *
                               (distances[0] - distances[1] + distances[2] + distances[3]) / 16) * 2 / (distances[1] - distances[0])
            markRatio = 2.75 # ratio of nearFront mark
            print("degree:", math.degrees(math.acos((height / distances[0] / markRatio))))

    scaled_image = cv2.resize(image_undistorted, (0, 0), fx=0.5, fy=0.5)
    # Display the result
    cv2.imshow('Undistorted Image with Trapezoids', scaled_image)
    cv2.waitKey(0)

cv2.destroyAllWindows()
