import cv2 as cv
import numpy as np
import sys
import math
# import cameraCalibration
import glob
import apriltag

# Specify paths for the ML models
prototxt_path = 'models/MobileNetSSD_deploy.prototxt'
model_path = 'models/MobileNetSSD_deploy.caffemodel'
# Minimum confidence to accept the detection result
min_confidence = 0.2
# The objects that will be detected
classes = ['background',
           'aeroplane', 'bicycle', 'bird', 'boat',
           'bottle', 'bus', 'car', 'cat', 'chair',
           'cow', 'diningtable', 'dog', 'horse',
           'motorbike', 'person', 'pottedplant',
           'sheep', 'sofa', 'train', 'tvmonitor']

# Set the randomizer for ML model
np.random.seed(543210)
colours = np.random.uniform(0, 255, size=(len(classes), 3))

# Initialise variables for ML
net = cv.dnn.readNetFromCaffe(prototxt_path, model_path)

def detection(image):
    targets = []
    height, width = image.shape[0], image.shape[1]

    # Resize the image to fit ML model
    blob_img = cv.dnn.blobFromImage(cv.resize(image, (300, 300)), 0.007, (300, 300), 130)

    # Detection in progress
    net.setInput(blob_img)
    detected_objects = net.forward()
    

    for i in range(detected_objects.shape[2]):
        confidence = detected_objects[0][0][i][2]
        if confidence > min_confidence:
            class_index = int(detected_objects[0, 0, i, 1])

            # Box coordinates
            upper_left_x = int(detected_objects[0, 0, i ,3] * width)
            upper_left_y = int(detected_objects[0, 0, i ,4] * height)
            lower_right_x = int(detected_objects[0, 0, i ,5] * width)
            lower_right_y = int(detected_objects[0, 0, i ,6] * height)

        if classes[class_index] == 56:
            prediction_text = f"{classes[class_index]}: {confidence * 100:.1f}%"
            cv.rectangle(image, (upper_left_x, upper_left_y), (lower_right_x, lower_right_y), colours[class_index], 3)
        #cv.rectangle(image, (1214, 1456), (1814, 2056), (180,11,30), 3)
            cv.putText(image, prediction_text, (upper_left_x, upper_left_y), cv.FONT_HERSHEY_SIMPLEX, 6, colours[class_index], 2)
        #cv.putText(image, 'No April Tag Detected!', (714, 1056), cv.FONT_HERSHEY_SIMPLEX, 6, (180,11,30), 2)

        # Add the box to the target list
            targets.append(['chair', upper_left_x, upper_left_y, lower_right_x, lower_right_y])

def detect_apriltag(image):
    # load the input image and convert it to grayscale
    gray = cv.cvtColor(image, cv.COLOR_BGR2GRAY)

    # define the AprilTags detector options and then detect the AprilTags
    options = apriltag.DetectorOptions(families="tag36h11")
    detector = apriltag.Detector(options)
    results = detector.detect(gray)
    print("[INFO] {} total AprilTags detected".format(len(results)))

    # list to store coordinates of detected AprilTags
    apriltag_coordinates = []

    # loop over the AprilTag detection results
    for r in results:
        # extract the bounding box (x, y)-coordinates for the AprilTag
        # and convert each of the (x, y)-coordinate pairs to integers
        (ptA, ptB, ptC, ptD) = r.corners
        ptB = (int(ptB[0]), int(ptB[1]))
        ptC = (int(ptC[0]), int(ptC[1]))
        ptD = (int(ptD[0]), int(ptD[1]))
        ptA = (int(ptA[0]), int(ptA[1]))

        # add the coordinates to the list
        apriltag_coordinates.append((ptA, ptB, ptC, ptD))

    if (len(apriltag_coordinates) > 0):
        height = abs(apriltag_coordinates[0][1][0] + apriltag_coordinates[0][2][0] - apriltag_coordinates[0][0][0]- apriltag_coordinates[0][3][0])/2
        width = abs(apriltag_coordinates[0][3][1] + apriltag_coordinates[0][2][1] - apriltag_coordinates[0][0][1] - apriltag_coordinates[0][1][1])/2
        ratio = height / width
        if(ratio >  1 and ratio < 1.2):
            deg = 0
        else:
            deg = math.degrees(math.acos(height / width))
        for i in range(1, 5):
            cv.line(image, apriltag_coordinates[0][i-1], apriltag_coordinates[0][i%4], (0, 183, 24), 3)
        #cv.rectangle(img, (apriltag_coordinates[0][1][0], apriltag_coordinates[0][3][0]), (apriltag_coordinates[0][1][1], apriltag_coordinates[0][3][1]), (0, 183, 24), 3)
        cv.putText(img, str(deg)[:7]+"o", (apriltag_coordinates[0][1][0], apriltag_coordinates[0][3][0]), cv.FONT_HERSHEY_SIMPLEX, 4, (0, 183, 24), 2)

cap = cv.VideoCapture('http://192.168.1.231:81/stream')
# cap = cv.VideoCapture('http://192.168.1.47:81/stream')

while True:
    try:
        ret, img = cap.read()
        detection(img)
        detect_apriltag(img)
        cv.imshow("Captured:", img)
        cv.waitKey(5)
    except:
        pass
