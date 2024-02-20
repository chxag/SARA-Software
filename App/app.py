from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from Grid_Creation import pgm_to_png, autocrop, png_to_grid
import os
import json

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
    app.run(debug=True)
