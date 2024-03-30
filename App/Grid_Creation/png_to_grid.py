import numpy as np
import cv2
import matplotlib.pyplot as plt
import json

def create_grid(cropped_png_path, grid_data_path, pgmRows, pgmColumns):
    # Read the image in grayscale, then convert to BGR for color manipulation
    map_image_gray = cv2.imread(cropped_png_path, cv2.IMREAD_GRAYSCALE)
    map_image = cv2.cvtColor(map_image_gray, cv2.COLOR_GRAY2BGR)

    # Define the color to replace (light gray, #cdcdcd) and the replacement color (black)
    target_color = np.array([205, 205, 205])  # BGR format
    replacement_color = np.array([0, 0, 0])  # BGR format

    # Create a mask where the target color is present
    mask = cv2.inRange(map_image, target_color, target_color)
    
    # Replace the target color with the replacement color
    map_image[mask != 0] = replacement_color

    # Convert back to grayscale for further processing
    map_image = cv2.cvtColor(map_image, cv2.COLOR_BGR2GRAY)

    # Continue with your existing processing...
    cm_per_pixel_row = pgmRows / map_image.shape[0]  # cm per pixel in height
    cm_per_pixel_col = pgmColumns / map_image.shape[1]  # cm per pixel in width
    pixel_size_row = 50 / cm_per_pixel_row  # pixels per 50cm in height, now a float
    pixel_size_col = 50 / cm_per_pixel_col  # pixels per 50cm in width, now a float
    
    pixel_size = min(pixel_size_row, pixel_size_col)

    map_image = cv2.GaussianBlur(map_image, (5, 5), 0)
    map_image = cv2.addWeighted(map_image, 1.5, np.zeros(map_image.shape, map_image.dtype), 0, 0)

    image_with_grid = map_image.copy()

    # Use np.arange for floating point step sizes
    for x in np.arange(0, map_image.shape[1], pixel_size):
        cv2.line(image_with_grid, (int(x), 0), (int(x), map_image.shape[0]), (0, 255, 0), 1)
        
    for y in np.arange(0, map_image.shape[0], pixel_size):
        cv2.line(image_with_grid, (0, int(y)), (map_image.shape[1], int(y)), (0, 255, 0), 1)

    lower_bound = np.array([0])
    upper_bound = np.array([75])

    grid = []

    # Use np.arange for floating point step sizes and iterate over the grid
    for y in np.arange(0, map_image.shape[0], pixel_size):
        row = []
        for x in np.arange(0, map_image.shape[1], pixel_size):
            cell_x_start, cell_y_start = int(x), int(y)
            cell_x_end, cell_y_end = int(min(x + pixel_size, map_image.shape[1])), int(min(y + pixel_size, map_image.shape[0]))
            
            if cv2.inRange(map_image[cell_y_start:cell_y_end, cell_x_start:cell_x_end], lower_bound, upper_bound).any():
                cv2.rectangle(image_with_grid, (cell_x_start, cell_y_start), (cell_x_end, cell_y_end), (0, 0, 0), -1)

            cell_intensity = int(map_image[cell_y_start:cell_y_end, cell_x_start:cell_x_end].mean())
            if cell_intensity <= 254:
                cell_intensity = 0
            row.append(cell_intensity)
        grid.append(row)

    for row in grid:
        for i in range(len(row)):
            if i == 0 or i == len(row) - 1:
                row[i] = 0
    for i in range(len(grid)):
        if i == 0 or i == len(grid) - 1:
            for j in range(len(grid[i])):
                grid[i][j] = 0

    json_data = json.dumps(grid, indent=4)
    with open(grid_data_path, 'w') as f:
        f.write(json_data)

    # Optionally display the image with the grid
    # plt.imshow(cv2.cvtColor(image_with_grid, cv2.COLOR_BGR2RGB))
    # plt.show()
