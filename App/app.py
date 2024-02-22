from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from Grid_Creation import pgm_to_png, autocrop, png_to_grid
import os
import json
import subprocess
from GridJSON import Grid

app = Flask(__name__, template_folder=os.path.dirname(os.path.abspath(__file__)))
CORS(app)

# Serve static files from the 'App' folder
@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.dirname(os.path.abspath(__file__)), filename)

# Render the main page
@app.route('/')
def index():
    return render_template('index.html')

# Handle uploaded pgm file
@app.route('/', methods=['POST'])
def upload_pgm():
    try:
        # Extract PGM file data from the request
        #request_data = request.get_json()
        #pgm_file_data = request.files['pgmFileData']
        
        # Set up file paths
        script_dir = os.path.dirname(os.path.realpath(__file__))
        map_dir = os.path.join(script_dir, 'Maps')
        pgm_path = os.path.join(map_dir, 'map.pgm')
        png_path = os.path.join(map_dir, 'map.png')
        cropped_png_path = os.path.join(map_dir, 'map_cropped.png')
        grid_data_path = os.path.join(map_dir, 'grid_data.json')

        # Save PGM file data to a file
        #with open(pgm_path, 'wb') as pgm_file:
        #    pgm_file.write(pgm_file_data)

        # Convert the PGM file to a PNG file and crop it
        pgm_to_png.convert_pgm_to_png(pgm_path, png_path)
        autocrop.auto_cropper_png(png_path, cropped_png_path)

        # Create grid and save data to JSON file
        grid_data = png_to_grid.create_grid(cropped_png_path, grid_data_path)

        # Return relevant information
        return jsonify({
            'status': 'success',
            'message': 'Processing completed successfully',
            'result': {
                'pgm_path': pgm_path,
                'png_path': png_path,
                'cropped_png_path': cropped_png_path,
                'grid_data_path': grid_data_path
            }
        })
    except Exception as e:
        # Handle exceptions and return an error response
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/grid', method=['POST'])
def handle_post():
    post_data = request.data
    decoded_post_msg = post_data.decode('utf-8')
    if post_data:
            print("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                  str(request.path), str(request.headers), decoded_post_msg)
            
            # Convert received string to JSON object
            post_json = json.loads(decoded_post_msg)
            print("Converting JSON object...\n")
            # Convert the JSON object to an instance of Grid
            grid_data = Grid(**post_json)
            print("Conversion succeeded.\n")
            
            execute_sara(grid_data)
    else:
        print("No grid data was received.\n")
def execute_sara(grid_data):
    if grid_data.robot == None:
        print("The position of SARA has not been set yet!")
    else:
        print("SARA is on its way!\n")
        task_no = len(grid_data.stacks)
        center_x = grid_data.dimensions.columns // 2 + grid_data.dimensions.columns % 2
        center_y = grid_data.dimensions.rows // 2 + grid_data.dimensions.rows % 2
        
        robot_x = ord(grid_data.robot[0]) - ord('0')
        robot_y = ord(grid_data.robot[-1]) - ord('0')
        
        # Calculate the relative coordinates of robot position
        rel_robot_pos_x = robot_x - center_x
        rel_robot_pos_y = robot_y - center_y
        
        for i in range(task_no):
            goal_pose = grid_data.stacks[i]
            goal_pose_loc = goal_pose.location
            
            # Convert location indices from str to int
            goal_pose_x = ord(goal_pose_loc[0]) - ord('0')
            goal_pose_y = ord(goal_pose_loc[-1]) - ord('0')
            
            # Calculate the relative coordinates of goal positions
            rel_goal_pose_x = goal_pose_x - center_x
            rel_goal_pose_y = goal_pose_y - center_y
            
            to_goal = str(rel_goal_pose_x) + ' '+ str(rel_goal_pose_y)
            robot_goal = str(rel_robot_pos_x) + ' '+ str(rel_robot_pos_y)
            subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py"], input=to_goal.encode('utf-8'))
            subprocess.run(["python3", "../auto_nav/scripts/goal_pose.py"], input=robot_goal.encode('utf-8'))

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files['file']
    if file:
        filename = file.filename
        file.save(os.path.join('Maps', filename))
        return {'status': 'File saved successfully'}, 200
    else:
        return {'error': 'No file uploaded'}, 400

# Run the Flask app if this script is executed
if __name__ == "__main__":
    port = int(os.environ.get('PORT', 8082))
    app.run(host='0.0.0.0', port=port)
    #app.run(debug=True)
