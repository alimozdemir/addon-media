# Media Manager Add-on for Home Assistant

A Home Assistant add-on for managing media files. This add-on provides a simple web interface to browse and manage your media and shared files.

## Features

- 📁 Browse media files in the `/media` directory
- 📁 Browse shared files in the `/share` directory
- 🌐 Clean web interface accessible from Home Assistant
- 📊 Display file sizes and types
- 🔒 Secure integration with Home Assistant

## Installation

1. Add this repository to your Home Assistant add-on store
2. Install the "Media Manager" add-on
3. Start the add-on
4. Access the web interface through the Home Assistant UI

## Configuration

The add-on provides the following configuration options:

```yaml
media_dir: /media
share_dir: /share
```

### Option: `media_dir`

The directory path for media files. Default is `/media`.

### Option: `share_dir`

The directory path for shared files. Default is `/share`.

## Usage

After starting the add-on:

1. Click "OPEN WEB UI" in the add-on page
2. Browse your media and shared files
3. View file information including name, type, and size

## Support

For issues and feature requests, please visit the [GitHub repository](https://github.com/alimozdemir/addon-media).

## License

MIT License