import numpy as np
import cv2
import matplotlib.pyplot as plt

map_image = cv2.imread( r'C:\Maps\map.pgm', cv2.IMREAD_GRAYSCALE)

map_image = cv2.resize(map_image, (1800, 1600))

map_image = cv2.GaussianBlur(map_image, (5, 5), 0)
map_image = cv2.addWeighted(map_image, 1.5, np.zeros(map_image.shape, map_image.dtype), 0, 0)

pixel_size = 50

image_with_grid = map_image.copy()

for x in range(0, map_image.shape[1], pixel_size):
    cv2.line(image_with_grid, (x, 0), (x, map_image.shape[0]), (0, 255, 0), 1)
    
for y in range(0, map_image.shape[0], pixel_size):
    cv2.line(image_with_grid, (0, y), (map_image.shape[1], y), (0, 255, 0), 1)

plt.imshow(cv2.cvtColor(image_with_grid, cv2.COLOR_BGR2RGB))
plt.show()






