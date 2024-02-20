import numpy as np
from PIL import Image

def convert_pgm_to_png(pgm_path, png_path):
    # Open the PGM image
    with open(pgm_path, 'rb') as f:
        # Read and parse the PGM header
        header = f.readline().decode('utf-8')
        assert header.strip() == 'P5', "Only binary PGM (P5) format is supported."

        # Skip comments
        while True:
            line = f.readline()
            if line[0] != ord('#'):
                break

        # Read width, height, and max pixel value
        width, height = map(int, line.split())
        max_value = int(f.readline())

        # Read image data
        image_data = np.fromfile(f, dtype=np.uint8, count=width*height)

    # Reshape the image data into a 2D array
    img_array = np.reshape(image_data, (height, width))

    # Create a Pillow image from the image data
    img = Image.fromarray(img_array)

    # Save the Pillow image as a PNG file
    img.save(png_path, 'PNG')