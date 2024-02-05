import os
import sys
import http.server
import socketserver
from GridJSON import Grid # For JSON deserialisation
import json

PORT = 8082

class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # Headers to circumvent SOP
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE')
        self.send_header('Access-Control-Allow-Headers:x-requested-with', 'content-type')
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    # GET requests will be rejected
    def do_GET(self) -> None:
        self.send_response(201)

    # Grid JSON data will be sent via POST request
    def do_POST(self) -> None:
        content_length = int(self.headers.get('content-length', 0))
        post_data = self.rfile.read(content_length)
        # Decode grid data encoded by 'utf-8'
        decoded_post_msg = post_data.decode('utf-8')
        if content_length != 0:
            print("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                str(self.path), str(self.headers), decoded_post_msg)
            
            # Convert received string to JSON object
            post_json = json.loads(decoded_post_msg)
            print("Converting JSON object...\n")
            # Convert the JSON object to an instance of Grid
            grid_data = Grid(**post_json)
            print("Conversion succeeded.'n")
            
            execute_sara(grid_data)
        else:
            print("No grid data was received.\n")
           
def execute_sara(grid_data):
    if grid_data.robot == None:
    	print("The position of SARA has not been set yet!")
    else:
        print("SARA is on its way!\n")
        task_no = len(grid_data.stacks)
        robot_x = ord(grid_data.robot[0]) - ord('0')
        robot_y = ord(grid_data[-1]) - ord('0')
        
        for i in range(task_no):
            goal_pose = grid_data.stacks[i]
            goal_pose_loc = goal_pose.location
            
            # Convert location indices from str to int
            goal_pose_x = ord(goal_pose_loc[0]) - ord('0')
            goal_pose_y = ord(goal_pose_loc[-1]) - ord('0')
            

def server(port):
    httpd = socketserver.TCPServer(('', port), HTTPRequestHandler)
    return httpd

if __name__ == "__main__":
    port = PORT
    httpd = server(port)
    try:
        print("\nserving from build/ at localhost:" + str(port))
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n...shutting down http server")
        httpd.shutdown()
        sys.exit()
