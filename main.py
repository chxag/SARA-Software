from Grid_Creation import pgm_to_png, autocrop, recreate_grid, png_to_grid
import os

def main():
    # Get the current script's directory
    script_dir = os.path.dirname(os.path.realpath(__file__))
    map_dir = os.path.join(script_dir, 'Maps')

    pgm_path = os.path.join(map_dir, 'map.pgm')
    png_path = os.path.join(map_dir, 'map.png')
    cropped_png_path = os.path.join(map_dir, 'map_cropped.png')
    grid_data_path = os.path.join(map_dir, 'grid_data.json')

    # Convert the PGM file to a PNG file and crop it
    pgm_to_png.convert_pgm_to_png(pgm_path, png_path)
    autocrop.auto_cropper_png(png_path, cropped_png_path)
    
    png_to_grid.create_grid(cropped_png_path, grid_data_path)
    
    recreate_grid.recreateFromJson(grid_data_path)

if __name__ == "__main__":
    main()
