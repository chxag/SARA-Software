from pydarknet import Detector, Image
import cv2

# Based on sample app from https://pypi.org/project/yolo34py/. See changelog for details of expansions and modifications
net = Detector(bytes("cfg/yolov3.cfg", encoding="utf-8"), bytes("weights/yolov3.weights", encoding="utf-8"), 0, bytes("cfg/coco_chairs.data",encoding="utf-8"))
#net = Detector(bytes("cfg/yolov2-tiny.cfg", encoding="utf-8"), bytes("weights/yolov2-tiny.weights", encoding="utf-8"), 0, bytes("cfg/coco.data",encoding="utf-8"))

img = cv2.imread('data/chair.jpg')
img_darknet = Image(img)

results = net.detect(img_darknet)
    
for category, score, bounds in results:
    x, y, w, h = bounds
    cv2.rectangle(img, (int(x - w / 2), int(y - h / 2)), (int(x + w / 2), int(y + h / 2)), (255, 0, 0), thickness=2)
    cv2.putText(img, category ,(int(x),int(y)),cv2.FONT_HERSHEY_COMPLEX,1,(255,255,0))

cv2.imwrite("detected.png", img)
#cv2.imwrite("detected-tiny2.png", img)
#cv2.imshow("output", img)
#cv2.waitKey(0)