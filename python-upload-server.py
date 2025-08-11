#!/usr/bin/env python3
import os
import json
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import cgi

class UploadHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.endswith('.html') or self.path.endswith('.js') or self.path.endswith('.css'):
            try:
                file_path = self.path[1:]  # Remove leading slash
                if not file_path:
                    file_path = 'index.html'
                
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                # Set content type
                if file_path.endswith('.html'):
                    content_type = 'text/html'
                elif file_path.endswith('.js'):
                    content_type = 'application/javascript'
                elif file_path.endswith('.css'):
                    content_type = 'text/css'
                else:
                    content_type = 'text/plain'
                
                self.send_response(200)
                self.send_header('Content-type', content_type)
                self.end_headers()
                self.wfile.write(content)
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'File not found')
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == '/upload-handler.php':
            self.handle_upload()
        else:
            self.send_response(404)
            self.end_headers()
    
    def handle_upload(self):
        response = {'success': False, 'message': '', 'fileName': ''}
        
        try:
            # Create uploads directory if it doesn't exist
            upload_dir = 'uploads'
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir, mode=0o755)
            
            # Parse the multipart form data
            content_type = self.headers.get('Content-Type', '')
            if not content_type.startswith('multipart/form-data'):
                raise Exception('Invalid content type')
            
            # Get content length
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                raise Exception('No content received')
            
            # Parse form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST'}
            )
            
            # Get the uploaded file
            if 'file' not in form:
                raise Exception('No file field found')
            
            file_item = form['file']
            if not file_item.filename:
                raise Exception('No file selected')
            
            # Validate file type
            filename = file_item.filename
            file_data = file_item.file.read()
            file_size = len(file_data)
            
            # Check file size (50MB limit)
            max_size = 50 * 1024 * 1024
            if file_size > max_size:
                raise Exception(f'File too large. Maximum size is {max_size // 1024 // 1024}MB')
            
            # Generate unique filename
            file_ext = os.path.splitext(filename)[1].lower()
            unique_filename = f"{int(time.time())}_{uuid.uuid4().hex[:8]}{file_ext}"
            file_path = os.path.join(upload_dir, unique_filename)
            
            # Save file
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            response['success'] = True
            response['message'] = 'File uploaded successfully'
            response['fileName'] = unique_filename
            response['fileSize'] = file_size
            response['fileType'] = 'video' if file_ext in ['.mp4', '.webm', '.mov', '.avi'] else 'image'
            
        except Exception as e:
            response['message'] = str(e)
        
        # Send JSON response
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        json_response = json.dumps(response)
        self.wfile.write(json_response.encode())

def run_server(port=8080):
    server_address = ('', port)
    httpd = HTTPServer(server_address, UploadHandler)
    print(f"🚀 Python upload server running on http://localhost:{port}")
    print("📁 Upload directory: uploads/")
    print("🛑 Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_server()
