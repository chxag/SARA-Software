import os
import sys
import http.server
import socketserver

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
            target_pose_x, target_pose_y, target_pose_z = compute_target_pose(decoded_post_msg)
            target_orient_x, target_orient_y, target_orient_z, target_orient_w = compute_target_orient(decoded_post_msg)
            
            execute_sara(target_pose_x, target_pose_y, target_pose_z, target_orient_x, target_orient_y, target_orient_z, target_orient_w)
        else:
            print("No grid data was received.\n")
        
def compute_target_pose(decoded_post_msg):
	return 0, 1, 2
	
def compute_target_orient(decoded_post_msg):
	return 0, 1, 2, 3
           
def execute_sara(t_p_x, t_p_y, t_p_z, t_o_x, t_o_y, t_o_z, t_o_w):
    print("SARA is on its way!\n")

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
