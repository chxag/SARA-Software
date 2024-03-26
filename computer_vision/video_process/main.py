import cv2
import os
import numpy as np
import math
import glob
import time
import aprilTagPoints
import video_process

def extract_frames_and_detect_tags(video_path, output_folder):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval = 1 / fps
    current_frame = 0

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            frame_path = os.path.join(output_folder, f'frame_{current_frame}.jpg')
            cv2.imwrite(frame_path, frame)
            coordinates = aprilTagPoints.detect_and_draw_apriltag(frame_path)

            for tag_coords in coordinates:
                height = abs(tag_coords[1][0] + tag_coords[2][0] - tag_coords[0][0] - tag_coords[3][0]) / 2
                width = abs(tag_coords[3][1] + tag_coords[2][1] - tag_coords[0][1] - tag_coords[1][1]) / 2
                ratio = height / width

                if ratio > 1 and ratio < 1.2:
                    angle = 0
                else:
                    angle = math.degrees(math.acos(height / width))

                print(f"Frame {current_frame}: Angle is {angle} degrees")

            cv2.imshow('Frame', frame)
            cv2.waitKey(int(interval * 1000))  # 等待interval秒
            current_frame += 1
        else:
            break

    cap.release()
    cv2.destroyAllWindows()

# 使用示例
video_path = 'video.mp4'
output_folder = 'frames'
extract_frames_and_detect_tags(video_path, output_folder)
