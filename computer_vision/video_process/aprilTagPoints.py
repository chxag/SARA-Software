import apriltag
import cv2

def detect_and_draw_apriltag(image_path):
    # load the input image and convert it to grayscale
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # define the AprilTags detector options and then detect the AprilTags
    options = apriltag.DetectorOptions(families="tag36h11")
    detector = apriltag.Detector(options)
    results = detector.detect(gray)
    print("[INFO] {} total AprilTags detected".format(len(results)))
    if(results == None):
        raise SystemExit('no aprilTags detected!')

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

        # draw the bounding box of the AprilTag detection
        cv2.line(image, ptA, ptB, (0, 255, 0), 2)
        cv2.line(image, ptB, ptC, (0, 255, 0), 2)
        cv2.line(image, ptC, ptD, (0, 255, 0), 2)
        cv2.line(image, ptD, ptA, (0, 255, 0), 2)

        # add the coordinates to the list
        apriltag_coordinates.append((ptA, ptB, ptC, ptD))

    # save the output image with AprilTag detection bounding boxes
    cv2.imwrite('output_image.jpg', image)

    # return the coordinates of detected AprilTags
    return apriltag_coordinates