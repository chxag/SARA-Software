import apriltag
import cv2
import numpy as np

def crop_image(image, bbox):
    """Crop the supplied opencv image array to within the bounds of the supplied bounding box."""
    left, top = bbox[0]
    right, bottom = bbox[1]
    return np.array([image[row][left:right] for row in range(top, bottom)])

def detect_apriltag_cropped(image_path, bounding_box):
    """Modified version of Leo's April Tag detection. Crops image to bounding box and detects within."""
    # load the input image and crop to bounding boxes
    image = cv2.imread(image_path)
    cropped_image = crop_image(image, bounding_box)
    # set to grayscale
    gray = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2GRAY)
    # cv2.imwrite("gray_test.jpg", gray)

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

    return apriltag_coordinates
