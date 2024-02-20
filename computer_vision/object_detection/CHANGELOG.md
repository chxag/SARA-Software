# Initial Commit
- Took Sample App from https://pypi.org/project/yolo34py/
- Added requisite weight, cfg and data files for yolov3 and coco, from previous Darknet work, as well as a chair photo
- Added weight and cfg files for an alternative lightweight option, Tiny YOLO, from previous Darknet work
- Writing to image files instead of displaying

# Further Additions
- Refactor to cleanly toggle between YOLOv3 and Tiny YOLO by changing boolean constant
- Colourblind friendly bounding box colouration
- Option to resize image to Xinxian's desired dimensions
- Method to return a 2D array of coordinates of the top left and bottom right corners of the bounding boxes
