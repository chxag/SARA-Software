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

def main():
    # Convert the PGM file to a PNG file
    pgm_path = r'C:\Maps\map.pgm'  # #change this so you can use the maps in the subdirectory
    png_path = r'C:\Maps\map.png'  # #change this so you can use the maps in the subdirectory
    cropped_png_path = r'C:\Maps\cropped_map.png'  # #change this so you can use the maps in the subdirectory
    convert_pgm_to_png(pgm_path, png_path)
    auto_cropper_png(png_path, cropped_png_path)

if __name__ == "__main__":
    main()