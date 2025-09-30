# Developer Documentation

## Project Structure

```
addon-media/
├── config.json          # Add-on configuration and metadata
├── build.json           # Multi-architecture build configuration
├── Dockerfile           # Container image definition
├── run.sh               # Entry point script
├── apparmor.txt         # AppArmor security profile
├── app/
│   └── server.py        # Python Flask web application
├── README.md            # User documentation
├── CHANGELOG.md         # Version history
├── ICON.md              # Icon placeholder info
└── .gitignore           # Git ignore rules
```

## Key Components

### config.json
The main configuration file for the Home Assistant add-on. Defines:
- Add-on metadata (name, version, description)
- Supported architectures
- Port mappings (8080 for web interface)
- Directory mappings (media and share)
- Configuration options
- Web UI URL

### Dockerfile
Creates the container image with:
- Alpine Linux base (via Home Assistant base images)
- Python 3 and Flask
- Nginx (for potential future use)
- Application files

### run.sh
Entry point script that:
- Reads configuration from Home Assistant
- Sets environment variables
- Starts the Python web server

### app/server.py
Flask web application providing:
- Web UI for browsing files
- API endpoints for file listing
- File size formatting
- Responsive design

## Configuration Options

The add-on supports the following options in Home Assistant:

```yaml
media_dir: /media  # Path to media directory
share_dir: /share  # Path to share directory
```

## API Endpoints

- `GET /` - Main web interface
- `GET /api/list?dir={media|share}` - List files in directory
- `GET /api/info` - Get add-on information

## Security

The `apparmor.txt` file defines security policies for:
- File system access (limited to /media and /share)
- Network access (for web server)
- Process capabilities
- Python execution

## Building

The add-on supports multiple architectures:
- armhf
- armv7
- aarch64
- amd64
- i386

Build using Home Assistant's build system or manually with Docker.

## Testing Locally

To test the add-on locally:

1. Install Home Assistant
2. Add the repository to the add-on store
3. Install and start the add-on
4. Access via the Web UI button

## Future Enhancements

Possible improvements:
- File upload functionality
- File deletion/rename capabilities
- Video/audio playback
- Thumbnail generation for images
- Search functionality
- Directory navigation
- File download links
