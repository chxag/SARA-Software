import cv2
import os

def extract_frames(video_path, output_folder):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    interval_frames = int(fps*5)
    current_frame = 0

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    while cap.isOpened():
        ret, frame = cap.read()
        if ret:
            if current_frame % interval_frames == 0:
                frame_path = os.path.join(output_folder, f'frame_{current_frame // interval_frames}.jpg')
                cv2.imwrite(frame_path, frame)
            current_frame += 1
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
        else:
            break

    cap.release()
def play_video(video_path):
    cap = cv2.VideoCapture(video_path)

    while cap.isOpened():
        ret, frame = cap.read()

        if not ret:
            break

        cv2.imshow('Video', frame)

        if cv2.waitKey(25) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()