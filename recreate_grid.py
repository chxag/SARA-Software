import cv2
import numpy as np
import json

# Load the JSON data from the file
with open(r'C:\Maps\grid_data.json', 'r') as f:
    grid_data = json.load(f)

# Set parameters
pixel_size = 25
width = 900
height = 800

# Create a blank image
recreated_grid = np.zeros((height, width), dtype=np.uint8)

# Iterate over each cell in the grid
for y in range(0, height, pixel_size):
    for x in range(0, width, pixel_size):
        # Get the intensity value from the grid_data list
        cell_intensity = grid_data[y // pixel_size][x // pixel_size]
        # Fill the corresponding cell in the recreated grid
        recreated_grid[y:y + pixel_size, x:x + pixel_size] = cell_intensity

# Add dark grey gridlines
gridline_color = (50, 50, 50)  # RGB values for dark grey

for x in range(0, width, pixel_size):
    cv2.line(recreated_grid, (x, 0), (x, height), gridline_color, 1)

for y in range(0, height, pixel_size):
    cv2.line(recreated_grid, (0, y), (width, y), gridline_color, 1)

# Display the recreated grid with dark grey gridlines
cv2.imshow('Recreated Grid with Dark Grey Gridlines', recreated_grid)
cv2.waitKey(0)
cv2.destroyAllWindows()