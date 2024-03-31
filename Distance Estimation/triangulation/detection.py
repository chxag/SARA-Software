import cv2 as cv
import numpy as np
import sys

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

            prediction_text = f"{classes[class_index]}: {confidence:.2f}%"
            cv.rectangle(image, (upper_left_x, upper_left_y), (lower_right_x, lower_right_y), colours[class_index], 3)
            cv.putText(image, prediction_text, (upper_left_x, upper_left_y - 15 if upper_left_y > 30 else upper_left_y + 15), cv.FONT_HERSHEY_SIMPLEX, 0.6, colours[class_index], 2)

            # Add the box to the target list
            targets.append([classes[class_index], upper_left_x, upper_left_y, lower_right_x, lower_right_y])

    cv.imshow("Detected Image", image)
    cv.waitKey(5)

cap = cv.VideoCapture('http://192.168.1.231:81/stream')

while True:
    ret, img = cap.read()
    detection(img)
