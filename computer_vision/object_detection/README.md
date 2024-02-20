# Using yolov3
YOLO v3 is a stronger object detector than Tiny YOLO (yolov2-tiny), however uses a large weights file that is too big to upload to a GitHub repository.
To circumvent this, if using YOLO v3 simply download this file and place it in yolo/weights:
https://pjreddie.com/media/files/yolov3.weights

# Known issues
Tiny YOLO does not work well on resized images, only those in the original size. For resized images and for better performance in general use YOLO v3.