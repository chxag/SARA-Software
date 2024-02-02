import cv2
import numpy as np 

def load_map(pgm_filename):
    pgm_filename = 'Maps/map.pgm'
    return cv2.imread(pgm_filename, cv2.IMREAD_GRAYSCALE)

def process_map(map_image):
    _, binary_map = cv2.threshold(map_image, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(binary_map, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    grid_overlay = np.zeros_like(map_image)

    for contour in contours:
        cv2.drawContours(grid_overlay, [contour], -1, 255, 2)
    
    return grid_overlay

def display(image, window_name='Processed Image'):
    cv2.imshow(window_name, image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

def main():
    
    map_image = load_map(pgm_filename='Maps/maps.pgm')
    processed_map = process_map(map_image)

    display(processed_map)

if __name__ == "__main__":
    main()
    