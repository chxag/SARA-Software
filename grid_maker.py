import cv2
import numpy as np

def read_png(file_path):
    # Read PNG file
    img = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    return img

def overlay_grid(image, grid_size):
    # Add an empty grid to the image
    grid_color = 255  # You can adjust this based on your image content
    for i in range(0, image.shape[1], grid_size):
        cv2.line(image, (i, 0), (i, image.shape[0]), grid_color, 1)
    for j in range(0, image.shape[0], grid_size):
        cv2.line(image, (0, j), (image.shape[1], j), grid_color, 1)

def extract_colors(image, grid_size):
    colors = []

    for i in range(0, image.shape[1], grid_size):
        for j in range(0, image.shape[0], grid_size):
            # Extract color from each grid cell (mean intensity for grayscale)
            color = int(image[j:j+grid_size, i:i+grid_size].mean())
            colors.append((i, j, color))

    return colors

def display_detected_colors(image, colors, grid_size):
    color_display = np.zeros_like(image)

    for color in colors:
        i, j, detected_color = color
        cv2.rectangle(color_display, (i, j), (i + grid_size, j + grid_size), detected_color, -1)

    cv2.imshow('Detected Colors', color_display)
    cv2.waitKey(0)

def main():
    # Read the PNG file
    png_path = r'C:\Maps\cropped_map.png'  # Use raw string or double backslashes
    img = read_png(png_path)

    # Set the grid size
    grid_size = 3

    # Overlay the grid
    overlay_grid(img, grid_size)

    # Display the image with the grid overlay
    cv2.imshow('Image with Grid Overlay', img)
    cv2.waitKey(0)

    # Extract colors from the PNG image
    colors = extract_colors(img, grid_size)

    # Sort colors based on intensity or any other criteria
    sorted_colors = sorted(colors, key=lambda x: x[2])

    # Display the detected colors
    display_detected_colors(img, sorted_colors, grid_size)

    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
