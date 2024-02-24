import cv2 as cv
import time
import numpy as np
import camera as ct
import frame_angle as fa
import detection as dt

def capture_frame():
    frame1 = left_camera.next()
    frame2 = right_camera.next()
    return frame1, frame2

def filter_objects(targets, target_obj):
    target = []
    for detected_obj in targets:
        if detected_obj[0] == target_obj:
            target.append(detected_obj)
    return target

# ------------------------------
# Global Variables
# ------------------------------
left_camera_source = "http://192.168.1.47"
right_camera_source = "http://192.168.1.231"

pixel_width = 1280 # Use SXGA
pixel_height = 1024
angle_width = 63 # Measured by hand
angle_height = 46 # Measured by hand
frame_rate = 20
camera_separation = 10.8 # Need to be set

# Two cameras
left_camera = None
right_camera = None

left_camera = ct.Camera_Thread(left_camera_source)
left_camera.start()
time.sleep(1)
right_camera = ct.Camera_Thread(right_camera_source)
right_camera.start()
time.sleep(1)

# Build the frame angler
angler = fa.Frame_Angle(pixel_width,pixel_height,angle_width,angle_height)
angler.build_frame()

# Get frames
frame1, frame2 = capture_frame()
target1 = dt.detection(frame1)
target2 = dt.detection(frame2)

# Filter for a specific object(Set to chair for final project)
filter_obj = 'bottle'
target1 = filter_objects(target1, filter_obj)
target2 = filter_objects(target2, filter_obj)

# Check 1: Both frames have some objects
# Check 2: Pick one object from 2 frames(Same y-axis, similar size)

x1m = (target1[0][3] - target1[0][1]) // 2 + target1[0][1]
y1m = (target1[0][4] - target1[0][2]) // 2 + target1[0][2]
# Compute x2m and y2m in a similar way
x2m = (target2[0][3] - target2[0][1]) // 2 + target2[0][1]
y2m = (target2[0][4] - target2[0][2]) // 2 + target2[0][2]

xlangle,ylangle = angler.angles_from_center(x1m,y1m,top_left=True,degrees=True)
xrangle,yrangle = angler.angles_from_center(x2m,y2m,top_left=True,degrees=True)

X,Y,Z,D = angler.location(camera_separation,(xlangle,ylangle),(xrangle,yrangle),center=True,degrees=True)
print("X:" + str(X))
print("Y:" + str(Y))
print("Z:" + str(Z))
print("D:" + str(D))