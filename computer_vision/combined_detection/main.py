import aprilTagPoints

import cv2
import numpy as np
import math

# TODO: Scalable parameters for visualisation

BLUE = (136, 68, 0)  # Paul Tol High Contrast Blue
YELLOW = (51, 170, 221)  # Paul Tol High Contrast Yellow
RED =  (85, 102, 187)  # Paul Tol High Contrast Red

def calculate_orientation(coordinates):
    """Calculate orientation of April tag using Leo's code."""
    height = abs(coordinates[0][1][0] + coordinates[0][2][0] - coordinates[0][0][0]- coordinates[0][3][0])/2
    width = abs(coordinates[0][3][1] + coordinates[0][2][1] - coordinates[0][0][1] - coordinates[0][1][1])/2
    ratio = height / width
    if(ratio >  1 and ratio < 1.2):
         degree = 0
    else:
         degree = math.degrees(math.acos(height / width))
    return degree


def _draw_bbox(image, bbox):
    cv2.rectangle(image, bbox[0], bbox[1], BLUE, 20)
 
def _highlight_tag(image, coordinates, angle):
    """
    Draws lines around April Tag and annotates below with the detected angle.
    Understood line syntax from Leo's work with contours and from GeeksForGeeks:
    https://www.geeksforgeeks.org/python-opencv-cv2-line-method/
    """
    for i in range(1,5):
        cv2.line(image, bounded_coordinates[i-1], bounded_coordinates[i%4], RED, 20)
    cv2.putText(image, _format_angle(angle), _label_pos(coordinates), cv2.FONT_HERSHEY_PLAIN, 10, RED, 10)
    
def _label_pos(coords, x_shift=-400, y_shift=700):
    mean_x = int(sum([coords[i][0] for i in range(4)]) / 4)
    mean_y = int(sum([coords[i][1] for i in range(4)]) / 4)
    return (mean_x + x_shift, mean_y + y_shift)

def _format_angle(angle):
    return str(angle)[:7]+"o"

image_file = "chairs/mixed_chairs.jpg"
image_bboxes = [[(181, 15), (1771, 2803)], [(1880, 182), (3481, 2926)]]
result_image = cv2.imread(image_file)

# Detect AprilTags in image
print("Detecting AprilTags in:", image_file)
for bbox in image_bboxes:
    _draw_bbox(result_image, bbox)
    coordinates = aprilTagPoints.detect_apriltag_cropped(image_file, bbox)
    
    if len(coordinates) == 0:
        continue
    else:
        orientation = calculate_orientation(coordinates)
        bounded_coordinates = [(coord[0] + bbox[0][0], coord[1] + bbox[0][1]) for coord in coordinates[0]]
        _highlight_tag(result_image, bounded_coordinates, orientation)
        cv2.imwrite("done.jpg", result_image)
        print("chair done")
