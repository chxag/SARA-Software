"""
YOLOv8
Source: https://github.com/ultralytics/ultralytics
Starting code: https://docs.ultralytics.com/usage/python/
Aided installation: https://stackoverflow.com/questions/66322049/could-not-install-packages-due-to-an-oserror-winerror-2-no-such-file-or-direc
Chair class label (56): https://github.com/ultralytics/yolov5/blob/master/data/coco128.yaml
"""
from ultralytics import YOLO

# Training (using starting code)
# model = YOLO('yolov8n.yaml')  # Load pretrained model
# results = model.train(data='coco128.yaml', epochs=3)  # Train the model using the 'coco128.yaml' dataset for 3 epochs
# model("https://ultralytics.com/images/bus.jpg")

# model = YOLO("runs/detect/train/weights/best.pt")
# model("home_chair.jpg", save=True)

new_model = YOLO("best.pt")  # new YOLO
#results = new_model.track(source="video.mp4")
new_model.predict("images/chairs1.png",save=True,classes=[56])
new_model.predict("images/chairs2.png",save=True,classes=[56])
new_model.predict("images/chairs3.png",save=True,classes=[56])
new_model.predict("images/chairs4.png",save=True,classes=[56])
new_model.predict("images/new2.jpg",save=True,classes=[56])
new_model.predict("images/new3.png",save=True,classes=[56])
#new_model.train(data='coco128.yaml', epochs=10)
new_model.predict("home_chair.jpg",save=True, classes=[0])
#new_model.export("onnx", dynamic=True)
# new_model("home_chair.jpg", save=True)
