import numpy as np
from PIL import Image

def auto_cropper_png(png_path, cropped_png_path):
    # Open the PNG image
    img = Image.open(png_path)

    # Convert the image to grayscale
    img_gray = img.convert('L')

    # Convert the grayscale image to a NumPy array
    img_array = np.array(img_gray)

    # Find the bounding box of the black region
    black_coords = np.argwhere(img_array <= 50)
    y0, x0 = black_coords.min(axis=0)
    y1, x1 = black_coords.max(axis=0) + 1

    # Crop the image to the bounding box
    cropped_img = img.crop((x0, y0, x1, y1))

    # Save the cropped image
    cropped_img.save(cropped_png_path, 'PNG')
