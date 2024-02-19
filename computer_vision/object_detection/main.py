from tiny_darknet.darknet import detect, load_net, load_meta
import os

directory = os.getcwd() + "/computer_vision/object_detection/"
filepath_cfg = directory + "tiny_darknet/tiny.cfg"
filepath_weights = directory + "tiny_darknet/tiny.weights"
filepath_training_data = directory + "tiny_darknet/coco.data"

filepath_image = directory + "data/chair.jpg"

# Adapted from main method of Darknet
net = load_net(filepath_cfg, filepath_weights, 0)
meta = load_meta(filepath_training_data)
r = detect(net, meta, filepath_image)
print(r)
