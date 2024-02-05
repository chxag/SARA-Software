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

    def do_POST(self) -> None:
        content_length = int(self.headers.get('content-length', 0))
        post_data = self.rfile.read(content_length)
        decoded_post_msg = post_data.decode('utf-8')
        print(decoded_post_msg)

        #print("POST request,\nPath: %s\nHeaders:\n%s\n\nBody:\n%s\n",
                #str(self.path), str(self.headers), post_data.decode('utf-8'))
            
        

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
