import time
import threading
import queue
import math
import numpy as np
import cv2 as cv

class Camera_Thread:
    camera_width = 1280
    camera_height = 1024
    camera_frame_rate = 20
    camera_source = None
    camera_fourcc = cv.VideoWriter_fourcc(*"MJPG")

    # buffer setup
    buffer_length = 5
    buffer_all = False # If buffer is initialised

    # System variables
    camera = None # Wait to be set when start() is called
    camera_init = 0.5 # Time used to smooth capture
    buffer = None # Buffer to store the frames

    # Control states
    frame_grab_run = False
    frame_grab_on = False

    # counts and amounts
    frame_count = 0
    frames_returned = 0
    current_frame_rate = 0
    loop_start_time = 0

    # Constructors to initialize the camera
    def __init__(self, camera_source, camera_width=1280, camera_height = 1024, camera_frame_rate=20):
        self.camera_source = camera_source
        self.camera_width = camera_width
        self.camera_height = camera_height
        self.camera_frame_rate = camera_frame_rate
        self.camera = cv.VideoCapture(self.camera_source + ":81/stream")

    # Start the camera
    def start(self):
        self.camera.set(3,self.camera_width)
        self.camera.set(4,self.camera_height)
        self.camera.set(5,self.camera_frame_rate)
        self.camera.set(6,self.camera_fourcc)
        time.sleep(0.5)

        """
        # Initialise buffer if have not done so
        if self.buffer_all:
            self.buffer = queue.Queue(self.buffer_length)
        else:
            # Only retain the last frame
            self.buffer = queue.Queue(1)

        # Camera setup
        self.camera = cv.VideoCapture(self.camera_source + ":81/stream") # Video stream is posted at IP address:81/stream
        self.camera.set(3,self.camera_width)
        self.camera.set(4,self.camera_height)
        self.camera.set(5,self.camera_frame_rate)
        self.camera.set(6,self.camera_fourcc)
        time.sleep(self.camera_init)

        # Camera image vars
        self.camera_width  = int(self.camera.get(3))
        self.camera_height = int(self.camera.get(4))
        self.camera_frame_rate = int(self.camera.get(5))
        self.camera_mode = int(self.camera.get(6))
        self.camera_area = self.camera_width*self.camera_height

        # Black frame (filler)
        self.black_frame = np.zeros((self.camera_height,self.camera_width,3),np.uint8)

        # set run state
        self.frame_grab_run = True
        
        # start thread
        #self.thread = threading.Thread(target=self.loop)
        #self.thread.start()
        """

    def loop(self):
        # Load the start frame
        frame = self.black_frame
        if not self.buffer.full():
            self.buffer.put(frame,False)

        # Status
        self.frame_grab_on = True
        self.loop_start_time = time.time()

        # Frame rate
        fc = 0
        t1 = time.time()

        while 1:
            if self.camera.isOpened():
                # Shut down the program if external shutdown occurs
                if not self.frame_grab_run:
                    break

                # True buffered mode (for files, no loss)
                if self.buffer_all:
                    # Buffer is full, pause and loop
                    if self.buffer.full():
                        time.sleep(1/self.camera_frame_rate)
                    # or load buffer with next frame
                    else:
                        grabbed,frame = self.camera.read()
                        # Break if no frame is grabbed
                        if grabbed:
                            self.buffer.put(frame,False)
                            self.frame_count += 1
                            fc += 1

                # False buffered mode (for camera, loss allowed)
                else:
                    grabbed,frame = self.camera.read()
                    if not grabbed:
                        break
                    # open a spot in the buffer
                    if self.buffer.full():
                        self.buffer.get()
                    self.buffer.put(frame,False)
                    self.frame_count += 1
                    fc += 1

                # Update frame read rate
                if fc >= 10:
                    self.current_frame_rate = round(fc/(time.time()-t1),2)
                    fc = 0
                    t1 = time.time()

        # Shut down
        self.loop_start_time = 0
        self.frame_grab_on = False
        self.stop()

    def stop(self):
        # Set loop kill state
        self.frame_grab_run = False
        
        # Let loop stop
        while self.frame_grab_on:
            time.sleep(0.1)

        # Stop camera if not already stopped
        if self.camera:
            try:
                self.camera.release()
            except:
                pass
        self.camera = None

        # drop buffer
        self.buffer = None

    def next(self,black=True,wait=0):
        while True:
            if self.camera.isOpened():
                ret_l, frame_l = self.camera.read()
                if ret_l:
                    return frame_l
                else:
                    print("no")
                    continue
        return frame
        
    # Print camera parameters
    def print_camera_parameters(self):
        print("Source:" + self.camera_source)
        print("Wdith:" + str(self.camera_width))
        print("Height:" + str(self.camera_height))
        print("Frame Rate:" + str(self.camera_frame_rate))