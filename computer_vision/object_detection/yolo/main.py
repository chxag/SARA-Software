"""
Based on sample app from https://pypi.org/project/yolo34py/. See CHANGELOG for details of expansions and modifications.

Other sources:
- YOLOv3 and Tiny YOLO (https://pjreddie.com/darknet/yolo/)
- Paul Tol's Colour Schemes (https://cran.r-project.org/web/packages/khroma/vignettes/tol.html)
"""

from pydarknet import Detector, Image
import cv2

USING_YOLOv3 = True
RESIZE = True

BLUE = (136, 68, 0)  # Paul Tol High Contrast Blue
YELLOW = (51, 170, 221)  # Paul Tol High Contrast Yellow

if USING_YOLOv3:
    cfg_file = "cfg/yolov3.cfg"
    weights_file = "weights/yolov3.weights"      
else:
    cfg_file = "cfg/yolov2-tiny.cfg"
    weights_file = "weights/yolov2-tiny.weights"
training_data_file = "cfg/coco.data"

net = Detector(bytes(cfg_file, encoding="utf-8"), bytes(weights_file, encoding="utf-8"), 0, bytes(training_data_file, encoding="utf-8"))

def prepare_image(filepath="data/chair.jpg"):
    """Reads in the image at the supplied filepath as a cv2 image."""
    img = cv2.imread(filepath)
    if RESIZE:
        img = cv2.resize(img, (300, 300))  # Resize to 300*300 if desired
    return img

def detect_chairs(filepath="data/chair.jpg"):
    """Detects chairs in the image at the supplied filepath in a returned list of bounding boxes."""
    img = prepare_image(filepath)
    results = net.detect(Image(img))
    boxes = []
    for category, score, bounds in results:
        if category == "chair":
            x, y, w, h = bounds  # Midpoint x and y coordinates, width and height
            boxes.append([x, y, w, h])
    return boxes

def visualisation(filepath="data/chair.jpg", writeto="detected.jpg"):
    """Produces an object detection visualisation and stores the result to an external file."""
    img = prepare_image(filepath)
    boxes = detect_chairs(filepath)
    for box in boxes:
        # Calculate parameters for visualisation
        x, y, w, h = box
        thickness = 5 if RESIZE else 10
        font_scale = w / 100
        font_thickness = 1 if RESIZE else 5
        # Draw bounding box and "chair" label on image
        cv2.rectangle(img, _corners(box)[0], _corners(box)[1], BLUE, thickness=thickness)
        cv2.putText(img, "chair", (int(x), int(y)), cv2.FONT_HERSHEY_PLAIN, font_scale, BLUE, font_thickness)
    cv2.imwrite(writeto, img)

def get_box_corners(filepath="data/chair.jpg"):
    """Returns a list of coordinates of the top left and bottom right corners of bounding boxes for an image."""
    boxes = detect_chairs(filepath)
    return [_corners(box) for box in boxes]

def _corners(box):
    """Helper method that finds the top left and bottom right corners of a supplied bounding box."""
    x, y, w, h = box
    upper_left_x = int(x - (w / 2))
    upper_left_y = int(y - (h / 2))
    lower_right_x = int(x + (w / 2))
    lower_right_y = int(y + (h / 2))
    return [(upper_left_x, upper_left_y), (lower_right_x, lower_right_y)]


# Test Outputs
visualisation()
print(get_box_corners())
visualisation("data/chairs.jpg", "detected_multiple.jpg")
print(get_box_corners("data/chairs.jpg"))
