"""
Author: Jo Barnes
Based on sample app from https://pypi.org/project/yolo34py/. See CHANGELOG for details of expansions and modifications.
"""

from pydarknet import Detector, Image
import cv2

USING_YOLOv3 = True

if USING_YOLOv3:
    cfg_file = "cfg/yolov2-tiny.cfg"
    weights_file = "weights/yolov2-tiny.weights"
else:
    cfg_file = "cfg/yolov3.cfg"
    weights_file = "weights/yolov3.weights"      
training_data_file = "cfg/coco.data"

net = Detector(bytes(cfg_file, encoding="utf-8"), bytes(weights_file, encoding="utf-8"), 0, bytes(training_data_file, encoding="utf-8"))

img = cv2.imread('data/chair.jpg')
img_darknet = Image(img)

results = net.detect(img_darknet)
    
for category, score, bounds in results:
    x, y, w, h = bounds
    cv2.rectangle(img, (int(x - w / 2), int(y - h / 2)), (int(x + w / 2), int(y + h / 2)), (255, 0, 0), thickness=2)
    cv2.putText(img, category ,(int(x),int(y)),cv2.FONT_HERSHEY_COMPLEX,1,(255,255,0))

cv2.imwrite("detected.png", img)
