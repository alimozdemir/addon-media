#!/usr/bin/env python3
"""
Media Manager - A simple web application for managing media files.
"""
import os
import json
from flask import Flask, render_template, jsonify, request, send_from_directory
from pathlib import Path

app = Flask(__name__)

# Get configuration from environment variables
MEDIA_DIR = os.environ.get('MEDIA_DIR', '/media')
SHARE_DIR = os.environ.get('SHARE_DIR', '/share')

def get_directory_listing(directory):
    """Get a list of files and directories in the specified path."""
    try:
        path = Path(directory)
        if not path.exists():
            return {'error': f'Directory {directory} does not exist'}
        
        items = []
        for item in sorted(path.iterdir()):
            items.append({
                'name': item.name,
                'path': str(item),
                'type': 'directory' if item.is_dir() else 'file',
                'size': item.stat().st_size if item.is_file() else 0
            })
        return {'items': items, 'path': str(path)}
    except Exception as e:
        return {'error': str(e)}

@app.route('/')
def index():
    """Render the main page."""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Media Manager</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }
            h1 {
                color: #333;
            }
            .container {
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .directory-section {
                margin: 20px 0;
            }
            .file-list {
                list-style-type: none;
                padding: 0;
            }
            .file-item {
                padding: 10px;
                margin: 5px 0;
                background-color: #f9f9f9;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .file-item:hover {
                background-color: #e9e9e9;
            }
            .file-icon {
                margin-right: 10px;
            }
            .directory {
                color: #2196F3;
            }
            .file {
                color: #4CAF50;
            }
            .info {
                background-color: #e3f2fd;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Media Manager</h1>
            <div class="info">
                <p><strong>Media Directory:</strong> ''' + MEDIA_DIR + '''</p>
                <p><strong>Share Directory:</strong> ''' + SHARE_DIR + '''</p>
            </div>
            <div class="directory-section">
                <h2>Media Files</h2>
                <div id="media-files"></div>
            </div>
            <div class="directory-section">
                <h2>Shared Files</h2>
                <div id="share-files"></div>
            </div>
        </div>
        <script>
            function formatSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
            }
            
            function displayFiles(elementId, data) {
                const element = document.getElementById(elementId);
                if (data.error) {
                    element.innerHTML = '<p style="color: red;">Error: ' + data.error + '</p>';
                    return;
                }
                
                if (!data.items || data.items.length === 0) {
                    element.innerHTML = '<p>No files found</p>';
                    return;
                }
                
                let html = '<ul class="file-list">';
                data.items.forEach(item => {
                    const icon = item.type === 'directory' ? '📁' : '📄';
                    const className = item.type === 'directory' ? 'directory' : 'file';
                    const size = item.type === 'file' ? formatSize(item.size) : '';
                    html += '<li class="file-item">';
                    html += '<span class="' + className + '"><span class="file-icon">' + icon + '</span>' + item.name + '</span>';
                    html += '<span>' + size + '</span>';
                    html += '</li>';
                });
                html += '</ul>';
                element.innerHTML = html;
            }
            
            // Load media files
            fetch('/api/list?dir=media')
                .then(response => response.json())
                .then(data => displayFiles('media-files', data));
            
            // Load share files
            fetch('/api/list?dir=share')
                .then(response => response.json())
                .then(data => displayFiles('share-files', data));
        </script>
    </body>
    </html>
    '''

@app.route('/api/list')
def list_files():
    """API endpoint to list files in a directory."""
    dir_type = request.args.get('dir', 'media')
    
    if dir_type == 'media':
        directory = MEDIA_DIR
    elif dir_type == 'share':
        directory = SHARE_DIR
    else:
        return jsonify({'error': 'Invalid directory type'}), 400
    
    return jsonify(get_directory_listing(directory))

@app.route('/api/info')
def info():
    """API endpoint to get add-on information."""
    return jsonify({
        'name': 'Media Manager',
        'version': '1.0.0',
        'media_dir': MEDIA_DIR,
        'share_dir': SHARE_DIR
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
