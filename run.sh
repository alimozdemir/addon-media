#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Add-on: Media Manager
# Runs the Media Manager application
# ==============================================================================

bashio::log.info "Starting Media Manager..."

# Get configuration options
MEDIA_DIR=$(bashio::config 'media_dir')
SHARE_DIR=$(bashio::config 'share_dir')

bashio::log.info "Media directory: ${MEDIA_DIR}"
bashio::log.info "Share directory: ${SHARE_DIR}"

# Export environment variables for the application
export MEDIA_DIR
export SHARE_DIR

# Start the application
bashio::log.info "Starting web server on port 8080..."
cd /app || exit 1
exec python3 server.py
