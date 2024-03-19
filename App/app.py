from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from Grid_Creation import pgm_to_png, autocrop, png_to_grid
import os
from GridJSON import Grid # For JSON deserialisation
import subprocess
import math 

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

@app.route('/upload', methods=['POST'])
def upload_file():
    global last_grid_data_filename
    file = request.files['file']
    if file:
        filename = file.filename
        file_path = os.path.join('Maps', filename)
        file.save(file_path)

        # Process PGM to PNG, crop, and create grid data
        png_path, cropped_png_path, grid_data_path = process_pgm(file_path)
        
        # Store the grid data filename for future requests
        last_grid_data_filename = os.path.basename(grid_data_path)
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'error': 'No file uploaded'}), 400
    
def process_pgm(file_path):
    try:
        png_path = file_path.replace('.pgm', '.png')
        cropped_png_path = png_path.replace('.png', '_cropped.png')
        grid_data_path = png_path.replace('.png', '_grid_data.json')

        pgm_to_png.convert_pgm_to_png(file_path, png_path)
        autocrop.auto_cropper_png(png_path, cropped_png_path)
        png_to_grid.create_grid(cropped_png_path, grid_data_path)

        return png_path, cropped_png_path, grid_data_path
    except Exception as e:
        print(f'Error processing PGM file: {e}')
        return None, None, None

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
        rel_robot_pos_x = robot_x - center_x
        rel_robot_pos_y = robot_y - center_y

        for stack in grid_data.stacks:
            #Go to stack first
            stack_loc = stack.location
            stack_rot_str = stack.rotation

            print(stack_rot_str)

            stack_rot =  float(stack_rot_str)
            stack_rot_quat = degrees_to_quaternion(stack_rot)
            print(stack_rot)
            print(stack_rot_quat)
            stack_x = ord(stack_loc[0]) - ord('0')
            stack_y = ord(stack_loc[-1]) - ord('0')
            rel_stack_x = stack_x - center_x
            rel_stack_y = stack_y - center_y
            to_stack = str(rel_stack_x) + ' '+ str(rel_stack_y)
            to_stack_split = to_stack.split(' ')
            subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", to_stack_split[0], to_stack_split[1], "0"] + [str(j) for j in stack_rot_quat])#input=to_stack.encode('utf-8'))
            
            for chair in stack.chairs: 
                chair_loc = chair.location
                chair_rot_str = chair.rotation
            
                # Convert location indices from str to int
                chair_x = ord(chair_loc[0]) - ord('0')
                chair_y = ord(chair_loc[-1]) - ord('0')

                chair_rot = float(chair_rot_str)
                chair_rot_quat = degrees_to_quaternion(chair_rot)

                # Calculate the relative coordinates of goal positions
                rel_chair_x = chair_x - center_x
                rel_chair_y = chair_y - center_y
                
                to_chair = str(rel_chair_x) + ' '+ str(rel_chair_y)
                to_chair_split = to_chair.split(' ')
                robot_goal = str(rel_robot_pos_x) + ' '+ str(rel_robot_pos_y)
                robot_goal_split = robot_goal.split(' ')
                subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", to_chair_split[0], to_chair_split[1], "0"] + [str(q) for q in chair_rot_quat])#input=to_chair.encode('utf-8'))
                subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py", robot_goal_split[0], robot_goal_split[1], "0", "0", "0", "0.662", "0.750"])#input=robot_goal.encode('utf-8'))

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8082))
    app.run(host='0.0.0.0', port=port)
