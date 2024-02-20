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

# Create Object Detection System
net = Detector(bytes(cfg_file, encoding="utf-8"), bytes(weights_file, encoding="utf-8"), 0, bytes(training_data_file, encoding="utf-8"))

img = cv2.imread('data/chair.jpg')
if RESIZE:
    img = cv2.resize(img, (300, 300))  # Resize to 300*300 if desired
img_darknet = Image(img)

results = net.detect(img_darknet)
    
for category, score, bounds in results:
    if category == "chair":
        x, y, w, h = bounds

        # Visualise bounding box around chairs
        thickness = 5 if RESIZE else 10
        font_scale = w / 100
        font_thickness = 1 if RESIZE else 5
        cv2.rectangle(img, (int(x - w / 2), int(y - h / 2)), (int(x + w / 2), int(y + h / 2)), BLUE, thickness=thickness)
        cv2.putText(img, "chair", (int(x),int(y)), cv2.FONT_HERSHEY_PLAIN, font_scale, BLUE, font_thickness)

cv2.imwrite("detected.png", img)
