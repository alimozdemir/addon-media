ARG BUILD_FROM
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install requirements
RUN apk add --no-cache \
    python3 \
    py3-pip \
    nginx

# Copy data
COPY run.sh /
RUN chmod a+x /run.sh

# Set working directory
WORKDIR /app

# Copy application files
COPY app/ /app/

# Install Python dependencies
RUN pip3 install --no-cache-dir flask

# Expose port
EXPOSE 8080

CMD [ "/run.sh" ]
