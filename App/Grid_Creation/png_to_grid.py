import numpy as np
import cv2
import matplotlib.pyplot as plt
import json

def create_grid(cropped_png_path, grid_data_path):
    map_image = cv2.imread( cropped_png_path, cv2.IMREAD_GRAYSCALE) #change this so you can use the maps in the subdirectory

    map_image = cv2.resize(map_image, (1800, 1600))

    map_image = cv2.GaussianBlur(map_image, (5, 5), 0)
    map_image = cv2.addWeighted(map_image, 1.5, np.zeros(map_image.shape, map_image.dtype), 0, 0)

    pixel_size = 50

    image_with_grid = map_image.copy()

    for x in range(0, map_image.shape[1], pixel_size):
        cv2.line(image_with_grid, (x, 0), (x, map_image.shape[0]), (0, 255, 0), 1)
        
    for y in range(0, map_image.shape[0], pixel_size):
        cv2.line(image_with_grid, (0, y), (map_image.shape[1], y), (0, 255, 0), 1)

    # Define the lower and upper boundaries for "close to black" in grayscale
    lower_bound = np.array([0])
    upper_bound = np.array([75])  # Adjust this value to what you consider "close to black"

    # Iterate over each cell in the grid
    for x in range(0, map_image.shape[1], pixel_size):
        for y in range(0, map_image.shape[0], pixel_size):
            # Check if there are any pixels in the corresponding area of the original image that are "close to black"
            if cv2.inRange(map_image[y:y+pixel_size, x:x+pixel_size], lower_bound, upper_bound).any():
                # Draw a black rectangle on the corresponding cell in the grid image
                cv2.rectangle(image_with_grid, (x, y), (x+pixel_size, y+pixel_size), (0, 0, 0), -1)

    # Define the threshold for "close to black" based on intensity
    threshold_intensity = 254  # Adjust this value based on your needs

    # Create an empty list to store the rows
    grid = []

    # Iterate over each cell in the grid
    for y in range(0, map_image.shape[0], pixel_size):
        # Create an empty list for this row
        row = []
        for x in range(0, map_image.shape[1], pixel_size):
            # Get the intensity value of the cell
            cell_intensity = int(map_image[y:y + pixel_size, x:x + pixel_size].mean())
            # Check if the cell is "close to black" based on the threshold
            if cell_intensity <= threshold_intensity:
                # Set the intensity value to 0 for cells "close to black"
                cell_intensity = 0
            # Append the intensity value to the row list
            row.append(cell_intensity)
        
        # Create two pointers, one at the start and one at the end
        start, end = 0, len(row) - 1

        # Move the start pointer towards the right until it encounters a cell "close to black"
        while start < len(row) and row[start] != 0:
            row[start] = 0
            start += 1

        # Move the end pointer towards the left until it encounters a cell "close to black"
        while end >= 0 and row[end] != 0:
            row[end] = 0
            end -= 1

        # Append the row list to the grid list
        grid.append(row)
        
    # Iterate over each column in the grid
    for x in range(len(grid[0])):
    # Create two pointers, one at the top and one at the bottom
        top, bottom = 0, len(grid) - 1

        # Move the top pointer downwards until it encounters a cell "close to black"
        while top < len(grid) and grid[top][x] != 0:
            grid[top][x] = 0
            top += 1

        # Move the bottom pointer upwards until it encounters a cell "close to black"
        while bottom >= 0 and grid[bottom][x] != 0:
            grid[bottom][x] = 0
            bottom -= 1

    # Convert the grid list to a JSON string
    json_data = json.dumps(grid, indent=4)

    # Write the JSON string to a file
    with open(grid_data_path, 'w') as f: #change this so you can use the maps in the subdirectory
        f.write(json_data)

    # plt.imshow(cv2.cvtColor(image_with_grid, cv2.COLOR_BGR2RGB))
    # plt.show()
