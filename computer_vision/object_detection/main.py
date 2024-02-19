from tiny_darknet.darknet import detect, load_net, load_meta

# Adapted from main method of Darknet
net = load_net("tiny_darknet/tiny.cfg", "tiny_darknet/tiny.weights", 0)
meta = load_meta("tiny_darknet/coco.data")
r = detect(net, meta, "data/chair.jpg")
print(r)
