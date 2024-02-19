from tiny_darknet.darknet import detect, load_net, load_meta

net = load_net("tiny_darknet/tiny.cfg", "tiny_darknet/tiny.weights", 0)