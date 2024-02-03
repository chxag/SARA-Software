import numpy as np
import cv2
import matplotlib.pyplot as plt
import json

map_image = cv2.imread( r'C:\Maps\cropped_map.png', cv2.IMREAD_GRAYSCALE) #change this so you can use the maps in the subdirectory

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

# Create an empty list to store the color values of each cell
cell_colors = []

# Iterate over each cell in the grid
for x in range(0, map_image.shape[1], pixel_size):
    for y in range(0, map_image.shape[0], pixel_size):
        # Get the color values of the cell as a list
        cell_color = image_with_grid[y, x].tolist()
        # Append the list to the cell_colors list
        cell_colors.append(cell_color)

# Convert the cell_colors list to a JSON string
json_data = json.dumps(cell_colors, indent=4)

# Write the JSON string to a file
with open(r'C:\Maps\grid_data.json', 'w') as f: #change this so you can use the maps in the subdirectory
    f.write(json_data)

plt.imshow(cv2.cvtColor(image_with_grid, cv2.COLOR_BGR2RGB))
plt.show()