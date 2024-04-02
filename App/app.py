from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from Grid_Creation import pgm_to_png, autocrop, png_to_grid
import os
from GridJSON import Grid # For JSON deserialisation
import subprocess
import math 
from PIL import Image

app = Flask(__name__, template_folder=os.path.dirname(os.path.abspath(__file__)))
CORS(app)

# Variable to store the last processed grid data filename
last_grid_data_filename = None

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), filename)

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     global last_grid_data_filename
#     file = request.files['file']

#     if file:
#         filename = file.filename
#         file_path = os.path.join('Maps', filename)
#         file.save(file_path)

#         # Convert PGM to PNG
#         png_path = file_path.replace('.pgm', '.png')
#         pgm_to_png.convert_pgm_to_png(file_path, png_path)

#         # Update last processed filename to the PNG path
#         last_grid_data_filename = png_path

#         # Return the path to the PNG file, without cropping
#         return jsonify({'status': 'success', 'filename': os.path.basename(png_path), 'pngPath': os.path.join('Maps', os.path.basename(png_path))}), 200
#     else:
#         return jsonify({'error': 'No file uploaded'}), 400

# @app.route('/process_and_generate_grid', methods=['POST'])
# def process_and_generate_grid():
#     global last_grid_data_filename
#     data = request.get_json()
#     pgmRows = int(data.get('pgmRows', 0))
#     pgmColumns = int(data.get('pgmColumns', 0))
#     rotationDegrees = int(data.get('rotationDegrees', 0))
#     filename = data.get('filename')

#     if not all([pgmRows, pgmColumns, filename]):
#         return jsonify({'error': 'Missing dimensions, rotation, or filename'}), 400

#     original_png_path = os.path.join('Maps', filename.replace('_cropped', ''))  # Use the original PNG before cropping

#     try:
#         # Rotate the original PNG, fill the background, and save as a new file
#         rotated_png_path = apply_rotation(original_png_path, rotationDegrees)

#         # Apply autocropping to the rotated and filled PNG
#         cropped_png_path = rotated_png_path.replace('.png', '_cropped.png')
#         autocrop.auto_cropper_png(rotated_png_path, cropped_png_path)

#         # Generate grid from the cropped image
#         grid_data_path = generate_grid_from_png(cropped_png_path, pgmRows, pgmColumns)
        
#         last_grid_data_filename = os.path.basename(grid_data_path)

#         return jsonify({'status': 'success', 'gridDataPath': os.path.join('Maps', last_grid_data_filename)}), 200
#     except Exception as e:
#         print(f'Error processing PNG file: {e}')
#         return jsonify({'error': 'Failed to process PNG file'}), 500

# @app.route('/rotate_and_crop', methods=['POST'])
# def rotate_and_crop():
#     data = request.get_json()
#     rotationDegrees = int(data.get('rotationDegrees', 0))
#     original_filename = data.get('originalFilename')

#     if original_filename:
#         original_path = os.path.join('Maps', original_filename)
#         rotated_png_path = apply_rotation(original_path, rotationDegrees)
#         cropped_png_path = rotated_png_path.replace('.png', '_cropped.png')
#         autocrop.auto_cropper_png(rotated_png_path, cropped_png_path)

#         return jsonify({'status': 'success', 'croppedPngPath': os.path.join('Maps', os.path.basename(cropped_png_path))}), 200
#     else:
#         return jsonify({'error': 'Missing original filename or rotation degrees'}), 400
    
# def apply_rotation(png_path, degrees, fill_color=(255, 255, 255)):
#     img = Image.open(png_path)
#     if img.mode != 'RGBA':
#         img = img.convert('RGBA')

#     # Rotate the image with expand=True to get the full rotated image without cropping
#     rotated_img = img.rotate(-degrees, expand=True)

#     # Calculate the size of the rotated image
#     rotated_width, rotated_height = rotated_img.size

#     # Create a new image with the size of the rotated image and a specified background color
#     background = Image.new('RGBA', (rotated_width, rotated_height), fill_color + (0,))

#     # Paste the rotated image onto the background
#     background.paste(rotated_img, (0, 0), rotated_img)

#     # Convert back to RGB to drop the alpha channel
#     background = background.convert('RGB')

#     rotated_path = png_path.replace('.png', '_rotated.png')
#     background.save(rotated_path)
#     background.close()  # Explicitly close the file

#     return rotated_path

@app.route('/upload', methods=['POST'])
def upload_file():
    global last_grid_data_filename
    file = request.files['file']

    if file:
        filename = file.filename
        original_path = os.path.join('Maps', filename)  # Save original file
        file.save(original_path)

        # Convert PGM to PNG
        png_path = original_path.replace('.pgm', '.png')
        pgm_to_png.convert_pgm_to_png(original_path, png_path)

        # Crop the converted PNG for initial display
        cropped_png_path = png_path.replace('.png', '_cropped.png')
        autocrop.auto_cropper_png(png_path, cropped_png_path)

        last_grid_data_filename = cropped_png_path  # Store cropped path for initial display

        return jsonify({'status': 'success', 'originalFilename': os.path.basename(png_path), 'croppedFilename': os.path.basename(cropped_png_path), 'croppedPngPath': os.path.join('Maps', os.path.basename(cropped_png_path))}), 200
    else:
        return jsonify({'error': 'No file uploaded'}), 400

def apply_rotation(png_path, degrees, fill_color=(255, 255, 255)):
    img = Image.open(png_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    rotated_img = img.rotate(-degrees, expand=True)
    background = Image.new('RGBA', rotated_img.size, fill_color + (0,))
    background.paste(rotated_img, (0, 0), rotated_img)
    background = background.convert('RGB')

    rotated_path = png_path.replace('.png', '_rotated.png')
    background.save(rotated_path)
    img.close()  # Ensure the original image is closed
    background.close()  # Ensure the rotated image is closed

    return rotated_path

@app.route('/process_and_generate_grid', methods=['POST'])
def process_and_generate_grid():
    data = request.get_json()
    pgmRows = int(data['pgmRows'])
    pgmColumns = int(data['pgmColumns'])
    originalFilename = data['originalFilename']
    rotationDegrees = int(data['rotationDegrees'])

    originalPath = os.path.join('Maps', originalFilename)

    # Rotate the original image according to the rotation degrees
    rotatedPath = apply_rotation(originalPath, rotationDegrees)

    # Crop the rotated image
    croppedPath = rotatedPath.replace('.png', '_cropped.png')
    autocrop.auto_cropper_png(rotatedPath, croppedPath)

    # Generate grid from the cropped image
    gridDataPath = croppedPath.replace('.png', '_grid_data.json')
    png_to_grid.create_grid(croppedPath, gridDataPath, pgmRows, pgmColumns)

    global last_grid_data_filename
    last_grid_data_filename = os.path.basename(gridDataPath)

    return jsonify({'status': 'success', 'gridDataPath': os.path.join('Maps', last_grid_data_filename)}), 200


@app.route('/latest_grid_data')
def serve_latest_grid_data():
    global last_grid_data_filename
    if last_grid_data_filename:
        return send_from_directory('Maps', last_grid_data_filename)
    else:
        return jsonify({'error': 'No grid data available'}), 404
    
@app.route('/send', methods=['POST'])
def handle_send():
    try:
        grid_data = request.get_json()
        print("Converting JSON object...\n")
        grid_object = Grid(**grid_data)
        print("Conversion succeeded.\n")
        execute_sara(grid_object)
        return jsonify({'status': 'success'}), 201
    except Exception as e:
        print(f'Error handling /send request: {e}')
        return jsonify({'error': str(e)}), 400

def degrees_to_quaternion(rotation):
    radians = math.radians(rotation)
    sin_half = math.sin(radians / 2)
    return [0, 0, sin_half, math.cos(radians / 2)]
    
def execute_sara(grid_data):
    if grid_data.robot == None:
        print("The position of SARA has not been set yet!")
    else:
        print("SARA is on its way!\n")
        #task_no = len(grid_data.stacks)
        center_x = grid_data.dimensions.columns // 2 + grid_data.dimensions.columns % 2
        center_y = grid_data.dimensions.rows // 2 + grid_data.dimensions.rows % 2
        
        robot_x = ord(grid_data.robot[0]) - ord('0')
        robot_y = ord(grid_data.robot[-1]) - ord('0')

        # Calculate the relative coordinates of robot position
        #rel_robot_pos_x = robot_x - center_x
        #rel_robot_pos_y = robot_y - center_y
        rel_robot_pos_x = -2
        rel_robot_pos_y = -0.5

        for stack in grid_data.stacks:
            #Go to stack first
            stack_loc = stack.location
            stack_rot_str = stack.rotation

            print(stack_rot_str)

            stack_rot =  float(stack_rot_str)
            stack_rot_quat = degrees_to_quaternion(stack_rot)
            stack_x = ord(stack_loc[0]) - ord('0')
            stack_y = ord(stack_loc[-1]) - ord('0')
            print(stack_x)
            print(stack_y)
            rel_stack_x = rel_robot_pos_x - (stack_x - robot_x)
            rel_stack_y = rel_robot_pos_y - (stack_y - robot_y)
            print(rel_stack_x)
            print(rel_stack_y)
            to_stack = str(rel_stack_x) + ' '+ str(rel_stack_y) + ' 0'
            to_stack_split = to_stack.split(' ')
            stack_rot_quat = [str(j) for j in stack_rot_quat]
            subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", to_stack_split[0], to_stack_split[1], to_stack_split[2], stack_rot_quat[0], stack_rot_quat[1], stack_rot_quat[2], stack_rot_quat[3]])#input=to_stack.encode('utf-8'))
            
            for chair in stack.chairs: 
                chair_loc = chair.location
                chair_rot_str = chair.rotation
            
                # Convert location indices from str to int
                chair_x = ord(chair_loc[0]) - ord('0')
                chair_y = ord(chair_loc[-1]) - ord('0')

                chair_rot = float(chair_rot_str)
                chair_rot_quat = degrees_to_quaternion(chair_rot)

                # Calculate the relative coordinates of goal positions
                rel_chair_x = rel_robot_pos_x - (chair_x - robot_x)
                rel_chair_y = rel_robot_pos_y - (chair_y - robot_y)
                
                to_chair = str(rel_chair_x) + ' '+ str(rel_chair_y) + ' 0'
                to_chair_split = to_chair.split(' ')
                robot_goal = str(rel_robot_pos_x) + ' '+ str(rel_robot_pos_y)
                robot_goal_split = robot_goal.split(' ')
                chair_rot_quat = [str(q) for q in chair_rot_quat]
                subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", to_chair_split[0], to_chair_split[1], to_chair_split[2],  chair_rot_quat[0], chair_rot_quat[1], chair_rot_quat[2], chair_rot_quat[3]])#input=to_chair.encode('utf-8'))
                subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", robot_goal_split[0], robot_goal_split[1], "0", "0", "0", "0.662", "0.750"])#input=robot_goal.encode('utf-8'))

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8082))
    app.run(host='0.0.0.0', port=port)
