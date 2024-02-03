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

# Define the threshold for "close to black" based on intensity
threshold_intensity = 254  # Adjust this value based on your needs

# Create an empty list to store the intensity values of each cell
cell_intensities = []

# Iterate over each cell in the grid
for x in range(0, map_image.shape[1], pixel_size):
    for y in range(0, map_image.shape[0], pixel_size):
        # Get the intensity value of the cell
        cell_intensity = int(map_image[y:y + pixel_size, x:x + pixel_size].mean())
        # Check if the cell is "close to black" based on the threshold
        if cell_intensity < threshold_intensity:
            # Set the intensity value to 0 for cells "close to black"
            cell_intensity = 0
        # Append the intensity value to the cell_intensities list
        cell_intensities.append(cell_intensity)

# Convert the cell_intensities list to a JSON string
json_data = json.dumps(cell_intensities, indent=4)

# Write the JSON string to a file
with open(r'C:\Maps\grid_data.json', 'w') as f: #change this so you can use the maps in the subdirectory
    f.write(json_data)

plt.imshow(cv2.cvtColor(image_with_grid, cv2.COLOR_BGR2RGB))
plt.show()